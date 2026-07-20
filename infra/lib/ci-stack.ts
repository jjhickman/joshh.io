import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";
import type { InfraConfig } from "./config.js";

export interface CiStackProps extends cdk.StackProps {
  readonly config: InfraConfig;
}

const GITHUB_OIDC_ISSUER = "token.actions.githubusercontent.com";

export class CiStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, props: CiStackProps) {
    super(scope, id, props);

    const { config } = props;
    const provider = config.githubOidcProvider === "create"
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

    const subject = `repo:${config.githubOwner}/${config.githubRepository}:environment:${config.githubEnvironment}`;
    const deployRole = new iam.Role(this, "GithubDeployRole", {
      roleName: "joshh-io-github-deploy",
      description: "Allows the joshh.io production GitHub environment to assume CDK bootstrap roles.",
      assumedBy: new iam.OpenIdConnectPrincipal(provider, {
        StringEquals: {
          [`${GITHUB_OIDC_ISSUER}:aud`]: "sts.amazonaws.com",
          [`${GITHUB_OIDC_ISSUER}:sub`]: subject,
        },
      }),
      maxSessionDuration: cdk.Duration.hours(1),
    });

    deployRole.addToPolicy(new iam.PolicyStatement({
      sid: "AssumeCdkBootstrapRoles",
      actions: ["sts:AssumeRole"],
      resources: [
        `arn:${cdk.Aws.PARTITION}:iam::${config.account}:role/cdk-*-deploy-role-${config.account}-${config.region}`,
        `arn:${cdk.Aws.PARTITION}:iam::${config.account}:role/cdk-*-file-publishing-role-${config.account}-${config.region}`,
        `arn:${cdk.Aws.PARTITION}:iam::${config.account}:role/cdk-*-image-publishing-role-${config.account}-${config.region}`,
        `arn:${cdk.Aws.PARTITION}:iam::${config.account}:role/cdk-*-lookup-role-${config.account}-${config.region}`,
      ],
    }));

    cdk.Tags.of(this).add("app", "joshh.io");
    cdk.Tags.of(this).add("env", "production");
    cdk.Tags.of(this).add("repo", `${config.githubOwner}/${config.githubRepository}`);
    cdk.Tags.of(this).add("managed-by", "aws-cdk");

    new cdk.CfnOutput(this, "GithubDeployRoleArn", {
      description: "Set this ARN as the production environment variable AWS_DEPLOY_ROLE_ARN.",
      value: deployRole.roleArn,
    });
  }
}
