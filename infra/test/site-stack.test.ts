import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { getInfraConfig } from "../lib/config.js";
import { SiteStack } from "../lib/site-stack.js";

const ACCOUNT = "111111111111";

interface DistributionConfig {
  readonly CacheBehaviors?: Array<{
    readonly FunctionAssociations?: Array<{
      readonly EventType?: string;
      readonly FunctionARN?: unknown;
    }>;
  }>;
  readonly DefaultCacheBehavior?: {
    readonly FunctionAssociations?: Array<{
      readonly EventType?: string;
      readonly FunctionARN?: unknown;
    }>;
  };
}

interface DistributionResource {
  readonly Properties?: {
    readonly DistributionConfig?: DistributionConfig;
  };
}

interface ResponseHeadersPolicyResource {
  readonly Properties?: {
    readonly ResponseHeadersPolicyConfig?: {
      readonly SecurityHeadersConfig?: {
        readonly ContentSecurityPolicy?: {
          readonly ContentSecurityPolicy?: string;
        };
      };
    };
  };
}

function synthesizeSite(): { stack: SiteStack; template: Template } {
  const app = new cdk.App();
  const config = getInfraConfig({ account: ACCOUNT, context: "test" });
  const stack = new SiteStack(app, "TestSite", {
    config,
    env: { account: config.account, region: config.region },
  });

  return { stack, template: Template.fromStack(stack) };
}

describe("JoshhIo-Site", () => {
  it("keeps the private site bucket encrypted, publicly blocked, and TLS-only", () => {
    const { template } = synthesizeSite();

    template.resourceCountIs("AWS::S3::Bucket", 1);
    template.hasResourceProperties("AWS::S3::Bucket", {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [{
          ServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" },
        }],
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
    template.hasResourceProperties("AWS::S3::BucketPolicy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "s3:*",
            Condition: { Bool: { "aws:SecureTransport": "false" } },
            Effect: "Deny",
          }),
        ]),
      },
    });

    const buckets = Object.values(template.findResources("AWS::S3::Bucket"));
    expect(buckets[0]?.Properties).not.toHaveProperty("WebsiteConfiguration");
    expect(buckets[0]?.DeletionPolicy).toBe("Retain");
  });

  it("creates a retained DNS-validated apex and www certificate in us-east-1", () => {
    const { stack, template } = synthesizeSite();

    expect(stack.region).toBe("us-east-1");
    template.hasResource("AWS::CertificateManager::Certificate", {
      DeletionPolicy: "Retain",
      Properties: {
        DomainName: "joshh.io",
        DomainValidationOptions: Match.arrayWith([
          { DomainName: "joshh.io", HostedZoneId: "Z09072841QGFCMDWIMTZ5" },
          { DomainName: "www.joshh.io", HostedZoneId: "Z09072841QGFCMDWIMTZ5" },
        ]),
        SubjectAlternativeNames: ["www.joshh.io"],
        ValidationMethod: "DNS",
      },
    });
  });

  it("configures the OAC distribution, aliases, SPA fallbacks, and caching", () => {
    const { template } = synthesizeSite();

    template.resourceCountIs("AWS::CloudFront::OriginAccessControl", 1);
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: Match.objectLike({
        Aliases: ["joshh.io", "www.joshh.io"],
        CustomErrorResponses: [
          {
            ErrorCachingMinTTL: 0,
            ErrorCode: 403,
            ResponseCode: 200,
            ResponsePagePath: "/index.html",
          },
          {
            ErrorCachingMinTTL: 0,
            ErrorCode: 404,
            ResponseCode: 200,
            ResponsePagePath: "/index.html",
          },
        ],
        DefaultCacheBehavior: Match.objectLike({
          Compress: true,
          ViewerProtocolPolicy: "redirect-to-https",
        }),
        DefaultRootObject: "index.html",
        HttpVersion: "http2and3",
        IPV6Enabled: true,
        Origins: Match.arrayWith([
          Match.objectLike({
            OriginAccessControlId: Match.anyValue(),
            S3OriginConfig: { OriginAccessIdentity: "" },
          }),
        ]),
        PriceClass: "PriceClass_100",
        ViewerCertificate: Match.objectLike({ MinimumProtocolVersion: "TLSv1.2_2021" }),
      }),
    });
    template.hasResourceProperties("AWS::CloudFront::CachePolicy", {
      CachePolicyConfig: Match.objectLike({
        DefaultTTL: 31_536_000,
        MaxTTL: 31_536_000,
        MinTTL: 31_536_000,
      }),
    });
  });

  it("creates A and AAAA aliases for both apex and www", () => {
    const { template } = synthesizeSite();

    for (const name of ["joshh.io.", "www.joshh.io."]) {
      for (const type of ["A", "AAAA"]) {
        template.hasResourceProperties("AWS::Route53::RecordSet", {
          AliasTarget: Match.anyValue(),
          HostedZoneId: "Z09072841QGFCMDWIMTZ5",
          Name: name,
          Type: type,
        });
      }
    }
  });

  it("attaches the www redirect function to every cache behavior", () => {
    const { template } = synthesizeSite();
    const distributions = Object.values(
      template.findResources("AWS::CloudFront::Distribution"),
    ) as unknown as DistributionResource[];
    const config = distributions[0]?.Properties?.DistributionConfig;

    expect(config).toBeDefined();
    if (!config) {
      throw new Error("DistributionConfig was not synthesized");
    }
    const behaviors = [config.DefaultCacheBehavior, ...(config.CacheBehaviors ?? [])];

    expect(behaviors).toHaveLength(2);
    for (const behavior of behaviors) {
      expect(behavior?.FunctionAssociations).toHaveLength(1);
      expect(behavior?.FunctionAssociations?.[0]?.EventType).toBe("viewer-request");
      expect(behavior?.FunctionAssociations?.[0]?.FunctionARN).toBeDefined();
    }

    template.hasResourceProperties("AWS::CloudFront::Function", {
      FunctionCode: Match.stringLikeRegexp("https://joshh\\.io.*request\\.uri"),
      FunctionConfig: { Runtime: "cloudfront-js-2.0", Comment: Match.anyValue() },
    });
  });

  it("applies the exact approved frame sources without wildcards", () => {
    const { template } = synthesizeSite();
    const policies = Object.values(
      template.findResources("AWS::CloudFront::ResponseHeadersPolicy"),
    ) as unknown as ResponseHeadersPolicyResource[];

    expect(policies).toHaveLength(2);
    for (const policy of policies) {
      const csp = policy.Properties?.ResponseHeadersPolicyConfig?.SecurityHeadersConfig
        ?.ContentSecurityPolicy?.ContentSecurityPolicy;
      expect(csp).toBeDefined();
      if (!csp) {
        throw new Error("Content-Security-Policy was not synthesized");
      }
      expect(csp).toContain(
        "frame-src https://open.spotify.com https://www.youtube-nocookie.com",
      );
      expect(csp).not.toMatch(/frame-src[^;]*\*/u);
      expect(csp).toContain("style-src 'self'");
      expect(csp).not.toContain("unsafe-inline");
    }
  });

  it("deploys with pruning and a full distribution invalidation", () => {
    const { template } = synthesizeSite();

    template.hasResourceProperties("Custom::CDKBucketDeployment", {
      DistributionPaths: ["/*"],
      Prune: true,
      WaitForDistributionInvalidation: true,
    });
  });

  it("emits operational alarm and site identifiers", () => {
    const { template } = synthesizeSite();

    template.hasResourceProperties("AWS::CloudWatch::Alarm", {
      MetricName: "5xxErrorRate",
      Namespace: "AWS/CloudFront",
      Period: 300,
      TreatMissingData: "notBreaching",
    });
    for (const output of [
      "CanonicalUrl",
      "SiteBucketName",
      "DistributionId",
      "DistributionDomainName",
      "CertificateArn",
    ]) {
      template.hasOutput(output, {});
    }
  });
});
