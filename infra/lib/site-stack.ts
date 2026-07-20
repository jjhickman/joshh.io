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
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

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

const redirectFunctionCode = (domain: string, wwwDomain: string): string => `
function handler(event) {
  var request = event.request;
  var host = request.headers.host && request.headers.host.value;

  if (host !== "${wwwDomain}") {
    return request;
  }

  var parts = [];
  var querystring = request.querystring || {};
  Object.keys(querystring).forEach(function (key) {
    var parameter = querystring[key];
    var values = parameter.multiValue || [parameter];
    values.forEach(function (entry) {
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(entry.value));
    });
  });

  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      location: { value: "https://${domain}" + request.uri + (parts.length ? "?" + parts.join("&") : "") },
    },
  };
}
`;

export class SiteStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const { config } = props;
    const wwwDomain = `www.${config.domain}`;
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: config.hostedZoneId,
      zoneName: config.domain,
    });

    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: config.domain,
      subjectAlternativeNames: [wwwDomain],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });
    certificate.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const redirectFunction = new cloudfront.Function(this, "WwwRedirectFunction", {
      code: cloudfront.FunctionCode.fromInline(redirectFunctionCode(config.domain, wwwDomain)),
      comment: "Permanently redirect www.joshh.io to the canonical apex host.",
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });
    const functionAssociations: cloudfront.FunctionAssociation[] = [{
      eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
      function: redirectFunction,
    }];

    const defaultHeaders = this.createResponseHeadersPolicy(
      "DefaultResponseHeaders",
      "no-cache, no-store, must-revalidate",
    );
    const assetHeaders = this.createResponseHeadersPolicy(
      "AssetResponseHeaders",
      "public, max-age=31536000, immutable",
    );

    // CloudFront rejects a policy that both disables caching (all TTLs zero)
    // and sets EnableAcceptEncoding*; the managed CACHING_DISABLED policy is
    // the supported way to always revalidate HTML and SPA fallbacks.
    const noCachePolicy = cloudfront.CachePolicy.CACHING_DISABLED;
    const assetCachePolicy = new cloudfront.CachePolicy(this, "AssetCachePolicy", {
      cachePolicyName: "joshh-io-assets-immutable",
      comment: "Cache Vite content-hashed assets for one year.",
      defaultTtl: cdk.Duration.days(365),
      minTtl: cdk.Duration.days(365),
      maxTtl: cdk.Duration.days(365),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true,
    });

    const origin = origins.S3BucketOrigin.withOriginAccessControl(siteBucket);
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      certificate,
      domainNames: [config.domain, wwwDomain],
      defaultRootObject: "index.html",
      enableIpv6: true,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: noCachePolicy,
        compress: true,
        functionAssociations,
        responseHeadersPolicy: defaultHeaders,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        "/assets/*": {
          origin,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
          cachePolicy: assetCachePolicy,
          compress: true,
          functionAssociations,
          responseHeadersPolicy: assetHeaders,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
        ttl: cdk.Duration.seconds(0),
      })),
    });

    for (const [idSuffix, recordName] of [["Apex", config.domain], ["Www", wwwDomain]] as const) {
      new route53.ARecord(this, `${idSuffix}AliasA`, {
        recordName,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        zone: hostedZone,
      });
      new route53.AaaaRecord(this, `${idSuffix}AliasAaaa`, {
        recordName,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        zone: hostedZone,
      });
    }

    new s3deploy.BucketDeployment(this, "DeploySite", {
      sources: [s3deploy.Source.asset(fileURLToPath(new URL("../../dist", import.meta.url)))],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
      prune: true,
    });

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

    new cdk.CfnOutput(this, "CanonicalUrl", { value: `https://${config.domain}` });
    new cdk.CfnOutput(this, "SiteBucketName", { value: siteBucket.bucketName });
    new cdk.CfnOutput(this, "DistributionId", { value: distribution.distributionId });
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, "CertificateArn", { value: certificate.certificateArn });
  }

  private createResponseHeadersPolicy(
    id: string,
    cacheControl: string,
  ): cloudfront.ResponseHeadersPolicy {
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
        frameOptions: {
          frameOption: cloudfront.HeadersFrameOption.DENY,
          override: true,
        },
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
