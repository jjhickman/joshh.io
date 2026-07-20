import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";
import type { InfraConfig } from "./config.js";

export interface CiStackProps extends cdk.StackProps {
  readonly config: InfraConfig;
}

const GITHUB_OIDC_ISSUER = "token.actions.githubusercontent.com";

// Deployed once from a trusted local session, never from CI — the trust it
// creates is what CI runs on, so CI must not be able to rewrite it.
export class CiStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, props: CiStackProps) {
    super(scope, id, props);
    const { config } = props;

    // IAM permits one provider per issuer URL per account; whether this
    // account already has it is recorded in config during bootstrap, so
    // synthesis never needs an AWS lookup.
    const provider =
      config.githubOidcProvider === "create"
        ? new iam.OidcProviderNative(this, "GithubOidcProvider", {
            url: `https://${GITHUB_OIDC_ISSUER}`,
            clientIds: ["sts.amazonaws.com"],
            removalPolicy: cdk.RemovalPolicy.RETAIN,
          })
        : iam.OidcProviderNative.fromOidcProviderArn(
            this,
            "GithubOidcProvider",
            config.githubOidcProvider.importArn,
          );

    // The subject uses the environment form because the deploy job declares
    // `environment: production`; GitHub's branch policy on that environment
    // supplies the main-only gate. No branch, tag, PR, or wildcard subjects.
    const subject = [
      "repo",
      `${config.githubOwner}/${config.githubRepository}`,
      "environment",
      config.githubEnvironment,
    ].join(":");

    const deployRole = new iam.Role(this, "GithubDeployRole", {
      roleName: "joshh-io-github-deploy",
      description:
        "Lets the joshh.io GitHub production environment assume the CDK bootstrap roles.",
      assumedBy: new iam.OpenIdConnectPrincipal(provider, {
        StringEquals: {
          [`${GITHUB_OIDC_ISSUER}:aud`]: "sts.amazonaws.com",
          [`${GITHUB_OIDC_ISSUER}:sub`]: subject,
        },
      }),
      maxSessionDuration: cdk.Duration.hours(1),
    });

    // The role holds no service permissions of its own — everything flows
    // through the account's CDK bootstrap roles, scoped to this region.
    const bootstrapRole = (purpose: string): string =>
      `arn:${cdk.Aws.PARTITION}:iam::${config.account}:role/cdk-*-${purpose}-${config.account}-${config.region}`;
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "AssumeCdkBootstrapRoles",
        actions: ["sts:AssumeRole"],
        resources: [
          bootstrapRole("deploy-role"),
          bootstrapRole("file-publishing-role"),
          bootstrapRole("image-publishing-role"),
          bootstrapRole("lookup-role"),
        ],
      }),
    );

    cdk.Tags.of(this).add("app", "joshh.io");
    cdk.Tags.of(this).add("env", "production");
    cdk.Tags.of(this).add("repo", `${config.githubOwner}/${config.githubRepository}`);
    cdk.Tags.of(this).add("managed-by", "aws-cdk");

    new cdk.CfnOutput(this, "GithubDeployRoleArn", {
      description: "Set as the production environment variable AWS_DEPLOY_ROLE_ARN.",
      value: deployRole.roleArn,
    });
  }
}
