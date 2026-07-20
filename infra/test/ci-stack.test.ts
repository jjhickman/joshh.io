import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { CiStack } from "../lib/ci-stack.js";
import { getInfraConfig, type GithubOidcProviderConfig } from "../lib/config.js";

const EXPECTED_SUBJECT = "repo:jjhickman/joshh.io:environment:production";

function buildTemplate(githubOidcProvider?: GithubOidcProviderConfig): Template {
  const config = getInfraConfig({ context: "test", githubOidcProvider });
  const app = new cdk.App();
  return Template.fromStack(
    new CiStack(app, "JoshhIo-Ci", {
      config,
      env: { account: config.account, region: config.region },
    }),
  );
}

describe("JoshhIo-Ci", () => {
  it("imports the recorded provider without creating a duplicate", () => {
    const template = buildTemplate();
    template.resourceCountIs("AWS::IAM::OIDCProvider", 0);
    template.resourceCountIs("Custom::AWSCDKOpenIdConnectProvider", 0);
    template.hasResourceProperties("AWS::IAM::Role", {
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: [
          Match.objectLike({
            Principal: {
              Federated:
                "arn:aws:iam::580028686392:oidc-provider/token.actions.githubusercontent.com",
            },
          }),
        ],
      }),
    });
  });

  it("can create the provider in a fresh account, retained on teardown", () => {
    const template = buildTemplate("create");
    template.resourceCountIs("AWS::IAM::OIDCProvider", 1);
    template.hasResource("AWS::IAM::OIDCProvider", { DeletionPolicy: "Retain" });
    template.hasResourceProperties("AWS::IAM::OIDCProvider", {
      Url: "https://token.actions.githubusercontent.com",
      ClientIdList: ["sts.amazonaws.com"],
    });
  });

  it("trusts exactly the production environment subject", () => {
    const template = buildTemplate();
    template.hasResourceProperties("AWS::IAM::Role", {
      RoleName: "joshh-io-github-deploy",
      MaxSessionDuration: 3600,
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: [
          Match.objectLike({
            Action: "sts:AssumeRoleWithWebIdentity",
            Condition: {
              StringEquals: {
                "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                "token.actions.githubusercontent.com:sub": EXPECTED_SUBJECT,
              },
            },
          }),
        ],
      }),
    });
    // No branch, tag, pull-request, or wildcard-repository trust anywhere.
    const rendered = JSON.stringify(template.toJSON());
    expect(rendered).toContain(EXPECTED_SUBJECT);
    expect(rendered).not.toContain("repo:jjhickman/joshh.io:*");
    expect(rendered).not.toContain(":ref:");
    expect(rendered).not.toContain(":pull_request");
  });

  it("grants only assumption of the four CDK bootstrap roles", () => {
    const template = buildTemplate();
    const policies = template.findResources("AWS::IAM::Policy");
    expect(Object.keys(policies)).toHaveLength(1);
    const { Statement: statements } = (
      Object.values(policies)[0]!.Properties as {
        PolicyDocument: { Statement: { Action: string; Resource: unknown }[] };
      }
    ).PolicyDocument;
    expect(statements).toHaveLength(1);
    expect(statements[0]!.Action).toBe("sts:AssumeRole");
    const resources = JSON.stringify(statements[0]!.Resource);
    for (const purpose of [
      "deploy-role",
      "file-publishing-role",
      "image-publishing-role",
      "lookup-role",
    ]) {
      expect(resources).toContain(purpose);
    }
  });
});
