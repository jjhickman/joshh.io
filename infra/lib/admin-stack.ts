import { fileURLToPath } from "node:url";
import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as authorizers from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import type { Construct } from "constructs";
import type { InfraConfig } from "./config.js";

export interface AdminStackProps extends cdk.StackProps {
  readonly config: InfraConfig;
}

// The SecureString holding the GitHub token is provisioned manually after
// deploy; the stack only grants read access to this exact parameter and never
// creates it.
const GITHUB_TOKEN_PARAM = "/joshh-io/admin/github-token";

// A single Cognito user signs in at the hosted UI; this prefix fixes the
// issuer/hosted-UI hostname the frontend and the JWT authorizer both rely on.
const COGNITO_DOMAIN_PREFIX = "joshh-io-admin";

// The admin SPA and its local dev server are the only origins allowed to call
// the API or complete the OAuth redirect.
const ADMIN_ORIGINS = ["https://joshh.io", "http://localhost:5173"] as const;
const ADMIN_REDIRECTS = ["https://joshh.io/admin", "http://localhost:5173/admin"] as const;

export class AdminStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, props: AdminStackProps) {
    super(scope, id, props);
    const { config } = props;
    const apiDomainName = `api.${config.domain}`;

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: config.hostedZoneId,
      zoneName: config.domain,
    });

    // Single-user admin: self-signup stays off and the one user is created out
    // of band. Retained so a stack teardown can never strand the identity.
    const userPool = new cognito.UserPool(this, "AdminUserPool", {
      userPoolName: "joshh-io-admin",
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      mfa: cognito.Mfa.OPTIONAL,
      // TOTP only — avoids provisioning an SMS delivery role for a single user.
      mfaSecondFactor: { otp: true, sms: false },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    userPool.addDomain("AdminUserPoolDomain", {
      cognitoDomain: { domainPrefix: COGNITO_DOMAIN_PREFIX },
    });

    // Public SPA client: no secret means the authorization-code flow is forced
    // to use PKCE. Only OpenID + email scopes, and only the admin redirects.
    const userPoolClient = userPool.addClient("AdminUserPoolClient", {
      userPoolClientName: "joshh-io-admin",
      generateSecret: false,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
          clientCredentials: false,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL],
        callbackUrls: [...ADMIN_REDIRECTS],
        logoutUrls: [...ADMIN_REDIRECTS],
      },
    });

    // API Gateway custom domains require the certificate in the API's own
    // region; the whole stack is pinned to us-east-1 by config.
    const certificate = new acm.Certificate(this, "ApiCertificate", {
      domainName: apiDomainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const entry = fileURLToPath(new URL("../lambda/admin-api/handler.ts", import.meta.url));
    const apiFunction = new lambdaNodejs.NodejsFunction(this, "AdminApiFunction", {
      entry,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        GITHUB_REPO: `${config.githubOwner}/${config.githubRepository}`,
        GITHUB_BRANCH: config.deployBranch,
        GITHUB_TOKEN_PARAM,
      },
      bundling: {
        // The Node 20 runtime ships the AWS SDK v3; keep it out of the bundle.
        externalModules: ["@aws-sdk/*"],
      },
    });

    // Least privilege: read only the one SecureString, decrypted by the SDK.
    apiFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: [
          `arn:aws:ssm:${config.region}:${config.account}:parameter${GITHUB_TOKEN_PARAM}`,
        ],
      }),
    );

    const authorizer = new authorizers.HttpJwtAuthorizer(
      "AdminJwtAuthorizer",
      `https://cognito-idp.${config.region}.amazonaws.com/${userPool.userPoolId}`,
      {
        authorizerName: "joshh-io-admin-jwt",
        jwtAudience: [userPoolClient.userPoolClientId],
      },
    );

    const apiDomain = new apigwv2.DomainName(this, "ApiDomainName", {
      domainName: apiDomainName,
      certificate,
    });

    // Default authorizer applies to every route below, so no route is ever
    // reachable without a valid Cognito JWT.
    const httpApi = new apigwv2.HttpApi(this, "AdminHttpApi", {
      apiName: "joshh-io-admin",
      defaultAuthorizer: authorizer,
      corsPreflight: {
        allowOrigins: [...ADMIN_ORIGINS],
        allowHeaders: ["authorization", "content-type"],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.POST,
        ],
        maxAge: cdk.Duration.hours(1),
      },
      defaultDomainMapping: { domainName: apiDomain },
    });

    const integration = new integrations.HttpLambdaIntegration(
      "AdminApiIntegration",
      apiFunction,
    );
    httpApi.addRoutes({
      path: "/content/{collection}",
      methods: [apigwv2.HttpMethod.GET],
      integration,
    });
    httpApi.addRoutes({
      path: "/content/{collection}",
      methods: [apigwv2.HttpMethod.PUT],
      integration,
    });
    httpApi.addRoutes({
      path: "/photos",
      methods: [apigwv2.HttpMethod.POST],
      integration,
    });

    const apiAliasTarget = route53.RecordTarget.fromAlias(
      new targets.ApiGatewayv2DomainProperties(
        apiDomain.regionalDomainName,
        apiDomain.regionalHostedZoneId,
      ),
    );
    new route53.ARecord(this, "ApiAliasA", {
      recordName: apiDomainName,
      target: apiAliasTarget,
      zone: hostedZone,
    });
    new route53.AaaaRecord(this, "ApiAliasAaaa", {
      recordName: apiDomainName,
      target: apiAliasTarget,
      zone: hostedZone,
    });

    cdk.Tags.of(this).add("app", "joshh.io");
    cdk.Tags.of(this).add("env", "production");
    cdk.Tags.of(this).add("repo", `${config.githubOwner}/${config.githubRepository}`);
    cdk.Tags.of(this).add("managed-by", "aws-cdk");

    new cdk.CfnOutput(this, "AdminApiUrl", { value: `https://${apiDomainName}` });
    new cdk.CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new cdk.CfnOutput(this, "UserPoolClientId", { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, "HostedUiDomain", {
      value: `https://${COGNITO_DOMAIN_PREFIX}.auth.${config.region}.amazoncognito.com`,
    });
  }
}
