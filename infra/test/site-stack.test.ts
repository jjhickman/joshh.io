import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { beforeAll, describe, expect, it } from "vitest";
import { getInfraConfig } from "../lib/config.js";
import { SiteStack } from "../lib/site-stack.js";

const APPROVED_FRAME_SOURCES =
  "frame-src https://open.spotify.com https://www.youtube-nocookie.com";
const APPROVED_CONNECT_SOURCES =
  "connect-src 'self' https://api.joshh.io https://joshh-io-admin.auth.us-east-1.amazoncognito.com";

// aws-cdk-lib/assertions types raw Properties as `any`; these shapes cover
// exactly the fragments the deep assertions below inspect.
interface BehaviorShape {
  FunctionAssociations?: { EventType: string }[];
}
interface DistributionConfigShape {
  DefaultCacheBehavior: BehaviorShape;
  CacheBehaviors?: BehaviorShape[];
  Origins: {
    S3OriginConfig?: { OriginAccessIdentity?: string };
    OriginAccessControlId?: unknown;
  }[];
}
interface HeadersPolicyShape {
  SecurityHeadersConfig: {
    ContentSecurityPolicy: { ContentSecurityPolicy: string };
    StrictTransportSecurity: {
      AccessControlMaxAgeSec: number;
      IncludeSubdomains: boolean;
      Preload: boolean;
    };
    FrameOptions: { FrameOption: string };
  };
}

function distributionConfig(template: Template): DistributionConfigShape {
  const resource = Object.values(
    template.findResources("AWS::CloudFront::Distribution"),
  )[0]!;
  return (resource.Properties as { DistributionConfig: DistributionConfigShape })
    .DistributionConfig;
}

function buildStack(context: "test" | "deploy" = "test"): SiteStack {
  // Deploy context deliberately has no placeholder account, so tests that
  // exercise it must supply one explicitly.
  const config = getInfraConfig({ context, account: "111111111111" });
  const app = new cdk.App();
  return new SiteStack(app, "JoshhIo-Site", {
    config,
    env: { account: config.account, region: config.region },
  });
}

describe("JoshhIo-Site", () => {
  let stack: SiteStack;
  let template: Template;

  beforeAll(() => {
    stack = buildStack();
    template = Template.fromStack(stack);
  });

  it("is pinned to us-east-1 so the certificate can front CloudFront", () => {
    // Region is stack-environment metadata, not a certificate property.
    expect(stack.region).toBe("us-east-1");
    template.hasResourceProperties("AWS::CertificateManager::Certificate", {
      DomainName: "joshh.io",
      SubjectAlternativeNames: ["www.joshh.io"],
      ValidationMethod: "DNS",
    });
    template.hasResource("AWS::CertificateManager::Certificate", {
      DeletionPolicy: "Retain",
    });
  });

  it("keeps the site bucket private, encrypted, TLS-only, and retained", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          { ServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } },
        ],
      },
    });
    template.hasResource("AWS::S3::Bucket", { DeletionPolicy: "Retain" });
    template.hasResourceProperties("AWS::S3::BucketPolicy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: "Deny",
            Condition: { Bool: { "aws:SecureTransport": "false" } },
          }),
        ]),
      },
    });
  });

  it("serves both hostnames over modern TLS with the SPA fallback", () => {
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: Match.objectLike({
        Aliases: ["joshh.io", "www.joshh.io"],
        DefaultRootObject: "index.html",
        HttpVersion: "http2and3",
        IPV6Enabled: true,
        PriceClass: "PriceClass_100",
        ViewerCertificate: Match.objectLike({
          MinimumProtocolVersion: "TLSv1.2_2021",
        }),
        CustomErrorResponses: [403, 404].map((code) => ({
          ErrorCachingMinTTL: 0,
          ErrorCode: code,
          ResponseCode: 200,
          ResponsePagePath: "/index.html",
        })),
      }),
    });
  });

  it("uses Origin Access Control, never public bucket reads", () => {
    template.resourceCountIs("AWS::CloudFront::OriginAccessControl", 1);
    for (const origin of distributionConfig(template).Origins) {
      expect(origin.S3OriginConfig?.OriginAccessIdentity ?? "").toBe("");
      expect(origin.OriginAccessControlId).toBeDefined();
    }
  });

  it("attaches the www redirect function to every behavior", () => {
    const config = distributionConfig(template);
    const behaviors = [config.DefaultCacheBehavior, ...(config.CacheBehaviors ?? [])];
    expect(behaviors.length).toBe(2);
    for (const entry of behaviors) {
      expect(entry.FunctionAssociations).toHaveLength(1);
      expect(entry.FunctionAssociations?.[0]?.EventType).toBe("viewer-request");
    }
    template.hasResourceProperties("AWS::CloudFront::Function", {
      FunctionConfig: Match.objectLike({ Runtime: "cloudfront-js-2.0" }),
    });
  });

  it("applies the full security header set with exact frame sources", () => {
    const policies = Object.values(
      template.findResources("AWS::CloudFront::ResponseHeadersPolicy"),
    ).map(
      (resource) =>
        (resource.Properties as { ResponseHeadersPolicyConfig: HeadersPolicyShape })
          .ResponseHeadersPolicyConfig,
    );
    expect(policies).toHaveLength(2);
    for (const policy of policies) {
      const security = policy.SecurityHeadersConfig;
      const csp = security.ContentSecurityPolicy.ContentSecurityPolicy;
      expect(csp).toContain(APPROVED_FRAME_SOURCES);
      expect(csp).not.toMatch(/frame-src[^;]*\*/);
      expect(security.StrictTransportSecurity).toMatchObject({
        AccessControlMaxAgeSec: 63072000,
        IncludeSubdomains: true,
        Preload: true,
      });
      expect(security.FrameOptions.FrameOption).toBe("DENY");
    }
  });

  it("allows exactly the admin API and Cognito hosted UI as connect-src", () => {
    const policies = Object.values(
      template.findResources("AWS::CloudFront::ResponseHeadersPolicy"),
    ).map(
      (resource) =>
        (resource.Properties as { ResponseHeadersPolicyConfig: HeadersPolicyShape })
          .ResponseHeadersPolicyConfig,
    );
    expect(policies).toHaveLength(2);
    for (const policy of policies) {
      const csp = policy.SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy;
      // Exact directive: 'self', the admin API, and the Cognito hosted UI —
      // and no other connect-src source may creep in.
      const connectDirective = csp
        .split("; ")
        .find((directive) => directive.startsWith("connect-src"));
      expect(connectDirective).toBe(APPROVED_CONNECT_SOURCES);
    }
  });

  it("creates A and AAAA aliases for both apex and www", () => {
    template.resourceCountIs("AWS::Route53::RecordSet", 4);
    for (const name of ["joshh.io.", "www.joshh.io."]) {
      for (const type of ["A", "AAAA"]) {
        template.hasResourceProperties("AWS::Route53::RecordSet", {
          Name: name,
          Type: type,
          AliasTarget: Match.anyValue(),
        });
      }
    }
  });

  it("deploys with pruning and a full distribution invalidation", () => {
    template.hasResourceProperties("Custom::CDKBucketDeployment", {
      DistributionPaths: ["/*"],
      Prune: true,
    });
  });

  it("alarms on 5xx rate only, tolerating missing data", () => {
    template.hasResourceProperties("AWS::CloudWatch::Alarm", {
      AlarmName: "joshh-io-cloudfront-5xx-rate",
      MetricName: "5xxErrorRate",
      Threshold: 1,
      TreatMissingData: "notBreaching",
    });
  });

  it("emits the operational identifiers as outputs", () => {
    const outputs = template.findOutputs("*");
    for (const key of [
      "CanonicalUrl",
      "SiteBucketName",
      "DistributionId",
      "DistributionDomainName",
      "CertificateArn",
    ]) {
      expect(outputs[key], `missing output ${key}`).toBeDefined();
    }
  });
});

describe("frontend build coupling", () => {
  const hasDist = existsSync(fileURLToPath(new URL("../../dist", import.meta.url)));

  it.runIf(!hasDist)("refuses a real deployment without a frontend build", () => {
    expect(() => buildStack("deploy")).toThrow(/run the frontend build/);
  });

  it.runIf(!hasDist)("synthesizes a placeholder source for tests without a build", () => {
    const template = Template.fromStack(buildStack());
    template.resourceCountIs("Custom::CDKBucketDeployment", 1);
  });

  it.runIf(hasDist)("ships the built dist assets in deploy context", () => {
    const template = Template.fromStack(buildStack("deploy"));
    template.resourceCountIs("Custom::CDKBucketDeployment", 1);
  });
});
