import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { CiStack } from "../lib/ci-stack.js";
import { getInfraConfig, type GithubOidcProviderConfig } from "../lib/config.js";

const ACCOUNT = "111111111111";
const SUBJECT = "repo:jjhickman/joshh.io:environment:production";

interface PolicyResource {
  readonly Properties?: {
    readonly PolicyDocument?: {
      readonly Statement?: Array<{
        readonly Action?: string;
        readonly Effect?: string;
        readonly Resource?: unknown[];
      }>;
    };
  };
}

interface RoleResource {
  readonly Properties?: {
    readonly AssumeRolePolicyDocument?: unknown;
  };
}

function synthesizeCi(githubOidcProvider: GithubOidcProviderConfig): Template {
  const app = new cdk.App();
  const config = getInfraConfig({
    account: ACCOUNT,
    context: "test",
    githubOidcProvider,
  });
  const stack = new CiStack(app, "TestCi", {
    config,
    env: { account: config.account, region: config.region },
  });

  return Template.fromStack(stack);
}

describe("JoshhIo-Ci", () => {
  it("creates the GitHub provider when explicitly configured", () => {
    const template = synthesizeCi("create");

    template.hasResourceProperties("AWS::IAM::OIDCProvider", {
      ClientIdList: ["sts.amazonaws.com"],
      Url: "https://token.actions.githubusercontent.com",
    });
    assertExactTrust(template);
  });

  it("imports an existing GitHub provider without creating another", () => {
    const template = synthesizeCi({
      importArn: `arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com`,
    });

    template.resourceCountIs("AWS::IAM::OIDCProvider", 0);
    assertExactTrust(template);
  });

  it("only permits assuming the standard CDK bootstrap roles", () => {
    const template = synthesizeCi("create");
    const policies = Object.values(
      template.findResources("AWS::IAM::Policy"),
    ) as unknown as PolicyResource[];
    const statement = policies[0]?.Properties?.PolicyDocument?.Statement?.[0];

    expect(policies).toHaveLength(1);
    expect(statement?.Action).toBe("sts:AssumeRole");
    expect(statement?.Effect).toBe("Allow");
    expect(statement?.Resource).toHaveLength(4);

    const resources = JSON.stringify(statement?.Resource);
    for (const role of ["deploy", "file-publishing", "image-publishing", "lookup"]) {
      expect(resources).toContain(
        `:iam::${ACCOUNT}:role/cdk-*-${role}-role-${ACCOUNT}-us-east-1`,
      );
    }
    template.hasOutput("GithubDeployRoleArn", {});
  });
});

function assertExactTrust(template: Template): void {
  const roles = Object.values(
    template.findResources("AWS::IAM::Role"),
  ) as unknown as RoleResource[];
  expect(roles).toHaveLength(1);

  const trust = JSON.stringify(roles[0]?.Properties?.AssumeRolePolicyDocument);
  expect(trust).toContain("sts.amazonaws.com");
  expect(trust).toContain(SUBJECT);
  expect(trust).not.toContain("repo:*");
  expect(trust).not.toContain("jjhickman/*");
  expect(trust).not.toContain("pull_request");

  template.hasResourceProperties("AWS::IAM::Role", {
    AssumeRolePolicyDocument: {
      Statement: [
        Match.objectLike({
          Action: "sts:AssumeRoleWithWebIdentity",
          Condition: {
            StringEquals: {
              "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
              "token.actions.githubusercontent.com:sub": SUBJECT,
            },
          },
          Effect: "Allow",
        }),
      ],
    },
  });
}
