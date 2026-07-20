import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import type { Construct } from "constructs";
import type { InfraConfig } from "./config.js";

export interface SiteStackProps extends cdk.StackProps {
  readonly config: InfraConfig;
}

// One launch-reviewed policy string, shared by every behavior. The only
// third-party origins the site may frame are the two embed players; the site
// itself may never be framed. No inline styles or scripts exist, so both
// stay 'self'-only (docs/PLAN.md records this as a deliberate decision).
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data:",
  "frame-src https://open.spotify.com https://www.youtube-nocookie.com",
  "connect-src 'self' https://api.joshh.io https://joshh-io-admin.auth.us-east-1.amazoncognito.com",
  "upgrade-insecure-requests",
].join("; ");

// Deny every sensor/media capability; nothing on the site uses them, and the
// embeds run in cross-origin iframes with their own permissions.
const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "ambient-light-sensor=()",
  "camera=()",
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  "payment=()",
  "usb=()",
].join(", ");

// CloudFront Functions runtime (cloudfront-js-2.0): the querystring arrives
// parsed and decoded, so serialize it back with encodeURIComponent, keeping
// duplicate keys intact via multiValue.
const wwwRedirectCode = (apex: string, www: string): string => `
function handler(event) {
  var request = event.request;
  var host = request.headers.host && request.headers.host.value;
  if (host !== "${www}") {
    return request;
  }
  var parts = [];
  for (var key in request.querystring) {
    var entry = request.querystring[key];
    var values = entry.multiValue || [entry];
    for (var i = 0; i < values.length; i++) {
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(values[i].value));
    }
  }
  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      location: {
        value: "https://${apex}" + request.uri + (parts.length ? "?" + parts.join("&") : ""),
      },
    },
  };
}
`;

export class SiteStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);
    const { config } = props;
    const apexDomain = config.domain;
    const wwwDomain = `www.${apexDomain}`;

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: config.hostedZoneId,
      zoneName: apexDomain,
    });

    // CloudFront requires the certificate in us-east-1; the whole stack is
    // pinned there by config, and a test asserts it. Retained so a stack
    // teardown can never strand the domain without a valid certificate.
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: apexDomain,
      subjectAlternativeNames: [wwwDomain],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });
    certificate.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Serving www directly would split the canonical origin; every behavior
    // gets this viewer-request function so no path (HTML or hashed asset)
    // responds on the www host without redirecting.
    const wwwRedirect = new cloudfront.Function(this, "WwwRedirectFunction", {
      code: cloudfront.FunctionCode.fromInline(wwwRedirectCode(apexDomain, wwwDomain)),
      comment: `Redirect ${wwwDomain} permanently to ${apexDomain}, keeping path and query.`,
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    const htmlHeaders = this.responseHeaders(
      "DefaultResponseHeaders",
      "no-cache, no-store, must-revalidate",
    );
    const assetHeaders = this.responseHeaders(
      "AssetResponseHeaders",
      "public, max-age=31536000, immutable",
    );

    // index.html and stable public files must always revalidate so a deploy
    // can never strand clients on an old asset graph. A custom zero-TTL
    // policy cannot also enable Accept-Encoding normalization (CloudFront
    // rejects the combination), so the managed disabled policy is used.
    const htmlCachePolicy = cloudfront.CachePolicy.CACHING_DISABLED;
    const assetCachePolicy = new cloudfront.CachePolicy(this, "AssetCachePolicy", {
      cachePolicyName: "joshh-io-assets-immutable",
      comment: "Vite content-hashed assets are immutable for a year.",
      minTtl: cdk.Duration.days(365),
      defaultTtl: cdk.Duration.days(365),
      maxTtl: cdk.Duration.days(365),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true,
    });

    const origin = origins.S3BucketOrigin.withOriginAccessControl(siteBucket);
    const behavior = (
      cachePolicy: cloudfront.ICachePolicy,
      responseHeadersPolicy: cloudfront.IResponseHeadersPolicy,
    ): cloudfront.BehaviorOptions => ({
      origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
      cachePolicy,
      compress: true,
      functionAssociations: [
        { eventType: cloudfront.FunctionEventType.VIEWER_REQUEST, function: wwwRedirect },
      ],
      responseHeadersPolicy,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      certificate,
      domainNames: [apexDomain, wwwDomain],
      defaultRootObject: "index.html",
      enableIpv6: true,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      // North America + Europe covers the audience; widen deliberately, not
      // by default (docs/PLAN.md section 9).
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: behavior(htmlCachePolicy, htmlHeaders),
      additionalBehaviors: {
        "/assets/*": behavior(assetCachePolicy, assetHeaders),
      },
      // Direct deep links hit S3 misses (403/404); serve the SPA shell with
      // zero error caching so recovery after a bad deploy is immediate. The
      // client renders its own not-found state.
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
        ttl: cdk.Duration.seconds(0),
      })),
    });

    const aliasTarget = route53.RecordTarget.fromAlias(
      new targets.CloudFrontTarget(distribution),
    );
    for (const [prefix, recordName] of [
      ["Apex", apexDomain],
      ["Www", wwwDomain],
    ] as const) {
      new route53.ARecord(this, `${prefix}AliasA`, {
        recordName,
        target: aliasTarget,
        zone: hostedZone,
      });
      new route53.AaaaRecord(this, `${prefix}AliasAaaa`, {
        recordName,
        target: aliasTarget,
        zone: hostedZone,
      });
    }

    // Synthesis and tests run before any frontend build exists (CI checks,
    // PR synth), so they deploy a placeholder marker instead of requiring
    // dist/. A real deployment without a build is an error, never a silent
    // empty site.
    const distDir = fileURLToPath(new URL("../../dist", import.meta.url));
    const hasDist = existsSync(distDir);
    if (config.context === "deploy" && !hasDist) {
      throw new Error("dist/ not found — run the frontend build before deploying JoshhIo-Site");
    }
    new s3deploy.BucketDeployment(this, "DeploySite", {
      sources: [
        hasDist
          ? s3deploy.Source.asset(distDir)
          : s3deploy.Source.data("placeholder.txt", "frontend build pending"),
      ],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
      prune: true,
    });

    // 5xx only: SPA deep links intentionally 403/404 at the origin before
    // the fallback, so a 4xx alarm would be pure noise.
    new cloudwatch.Alarm(this, "Distribution5xxAlarm", {
      alarmName: "joshh-io-cloudfront-5xx-rate",
      alarmDescription: "CloudFront returned an elevated rate of 5xx responses.",
      metric: distribution.metric5xxErrorRate({
        period: cdk.Duration.minutes(5),
        statistic: "Average",
      }),
      threshold: 1,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    cdk.Tags.of(this).add("app", "joshh.io");
    cdk.Tags.of(this).add("env", "production");
    cdk.Tags.of(this).add("repo", `${config.githubOwner}/${config.githubRepository}`);
    cdk.Tags.of(this).add("managed-by", "aws-cdk");

    new cdk.CfnOutput(this, "CanonicalUrl", { value: `https://${apexDomain}` });
    new cdk.CfnOutput(this, "SiteBucketName", { value: siteBucket.bucketName });
    new cdk.CfnOutput(this, "DistributionId", { value: distribution.distributionId });
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, "CertificateArn", { value: certificate.certificateArn });
  }

  // Both behaviors share the identical security posture; only Cache-Control
  // differs, because CloudFront cannot vary a single policy's headers per
  // behavior.
  private responseHeaders(id: string, cacheControl: string): cloudfront.ResponseHeadersPolicy {
    return new cloudfront.ResponseHeadersPolicy(this, id, {
      customHeadersBehavior: {
        customHeaders: [
          { header: "Cache-Control", override: true, value: cacheControl },
          { header: "Permissions-Policy", override: true, value: PERMISSIONS_POLICY },
        ],
      },
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: CONTENT_SECURITY_POLICY,
          override: true,
        },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        referrerPolicy: {
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
        strictTransportSecurity: {
          accessControlMaxAge: cdk.Duration.seconds(63_072_000),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
      },
    });
  }
}
