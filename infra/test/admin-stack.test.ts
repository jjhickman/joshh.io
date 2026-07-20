import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { beforeAll, describe, expect, it } from "vitest";
import { AdminStack } from "../lib/admin-stack.js";
import { getInfraConfig } from "../lib/config.js";

const EXPECTED_SSM_ARN =
  "arn:aws:ssm:us-east-1:111111111111:parameter/joshh-io/admin/github-token";

// aws-cdk-lib/assertions types raw Properties as `any`; these shapes cover
// exactly the fragments the assertions below inspect.
interface RouteShape {
  AuthorizationType?: string;
  AuthorizerId?: unknown;
}
interface PolicyStatementShape {
  Action: unknown;
  Effect: string;
  Resource: unknown;
}

function buildTemplate(): Template {
  const config = getInfraConfig({ context: "test" });
  const app = new cdk.App();
  return Template.fromStack(
    new AdminStack(app, "JoshhIo-Admin", {
      config,
      env: { account: config.account, region: config.region },
    }),
  );
}

describe("JoshhIo-Admin", () => {
  let template: Template;

  beforeAll(() => {
    template = buildTemplate();
  });

  it("guards every API route behind the Cognito JWT authorizer", () => {
    const authorizers = template.findResources("AWS::ApiGatewayV2::Authorizer");
    expect(Object.keys(authorizers)).toHaveLength(1);
    const [authorizer] = Object.values(authorizers);
    expect(
      (authorizer!.Properties as { AuthorizerType: string }).AuthorizerType,
    ).toBe("JWT");

    const routes = template.findResources("AWS::ApiGatewayV2::Route");
    const routeProps = Object.values(routes).map((route) => route.Properties as RouteShape);
    // Exactly the three declared routes, and not one of them is unauthenticated.
    expect(routeProps).toHaveLength(3);
    for (const route of routeProps) {
      expect(route.AuthorizationType).toBe("JWT");
      expect(route.AuthorizerId).toBeDefined();
    }
  });

  it("declares the three admin routes and nothing else", () => {
    const routeKeys = Object.values(template.findResources("AWS::ApiGatewayV2::Route")).map(
      (route) => (route.Properties as { RouteKey: string }).RouteKey,
    );
    expect(new Set(routeKeys)).toEqual(
      new Set([
        "GET /content/{collection}",
        "PUT /content/{collection}",
        "POST /photos",
      ]),
    );
  });

  it("restricts CORS to exactly the admin site and its dev server", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
      CorsConfiguration: Match.objectLike({
        AllowOrigins: ["https://joshh.io", "http://localhost:5173"],
        AllowHeaders: ["authorization", "content-type"],
        AllowMethods: ["GET", "PUT", "POST"],
        MaxAge: 3600,
      }),
    });
  });

  it("passes the token parameter name to the function but no secret material", () => {
    const functions = template.findResources("AWS::Lambda::Function");
    // The frontend BucketDeployment helper is not part of this stack, so the
    // only function here is the admin API itself.
    const apiFunctions = Object.values(functions).filter((fn) => {
      const variables =
        (fn.Properties as { Environment?: { Variables?: Record<string, unknown> } }).Environment
          ?.Variables ?? {};
      return "GITHUB_TOKEN_PARAM" in variables;
    });
    expect(apiFunctions).toHaveLength(1);
    const variables = (
      apiFunctions[0]!.Properties as {
        Environment: { Variables: Record<string, string> };
      }
    ).Environment.Variables;
    expect(variables.GITHUB_TOKEN_PARAM).toBe("/joshh-io/admin/github-token");
    expect(variables.GITHUB_REPO).toBe("jjhickman/joshh.io");
    expect(variables.GITHUB_BRANCH).toBe("main");
    // No environment value carries a decrypted token or other secret-looking blob.
    const serialized = JSON.stringify(variables);
    expect(serialized).not.toMatch(/gh[posru]_[A-Za-z0-9]/);
    expect(serialized).not.toMatch(/ssm:GetParameter/);
    // Only the three known keys — nothing snuck a secret into the environment.
    expect(Object.keys(variables).sort()).toEqual([
      "GITHUB_BRANCH",
      "GITHUB_REPO",
      "GITHUB_TOKEN_PARAM",
    ]);
  });

  it("grants GetParameter on exactly the one github-token parameter", () => {
    const policies = template.findResources("AWS::IAM::Policy");
    const statements = Object.values(policies).flatMap(
      (policy) =>
        (policy.Properties as { PolicyDocument: { Statement: PolicyStatementShape[] } })
          .PolicyDocument.Statement,
    );
    const ssmStatements = statements.filter((statement) =>
      JSON.stringify(statement.Action).includes("ssm:GetParameter"),
    );
    expect(ssmStatements).toHaveLength(1);
    expect(ssmStatements[0]!.Action).toBe("ssm:GetParameter");
    expect(ssmStatements[0]!.Effect).toBe("Allow");
    expect(ssmStatements[0]!.Resource).toBe(EXPECTED_SSM_ARN);
  });

  it("issues a DNS-validated certificate covering api.joshh.io", () => {
    template.hasResourceProperties("AWS::CertificateManager::Certificate", {
      DomainName: "api.joshh.io",
      ValidationMethod: "DNS",
    });
  });

  it("aliases api.joshh.io with both A and AAAA records", () => {
    for (const type of ["A", "AAAA"]) {
      template.hasResourceProperties("AWS::Route53::RecordSet", {
        Name: "api.joshh.io.",
        Type: type,
        AliasTarget: Match.anyValue(),
      });
    }
  });

  it("configures a public PKCE code-flow client with exact redirects", () => {
    template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
      // A public client (no generated secret) forces PKCE on the code flow.
      GenerateSecret: false,
      AllowedOAuthFlows: ["code"],
      AllowedOAuthFlowsUserPoolClient: true,
      AllowedOAuthScopes: Match.arrayWith(["openid", "email"]),
      CallbackURLs: ["https://joshh.io/admin", "http://localhost:5173/admin"],
      LogoutURLs: ["https://joshh.io/admin", "http://localhost:5173/admin"],
    });
    // Implicit grant is never offered.
    const clients = template.findResources("AWS::Cognito::UserPoolClient");
    for (const client of Object.values(clients)) {
      const flows = (client.Properties as { AllowedOAuthFlows: string[] }).AllowedOAuthFlows;
      expect(flows).not.toContain("implicit");
    }
  });

  it("keeps the user pool closed to self-signup", () => {
    template.hasResourceProperties("AWS::Cognito::UserPool", {
      AdminCreateUserConfig: { AllowAdminCreateUserOnly: true },
    });
    // No CDK-managed users; the single account is created out of band.
    template.resourceCountIs("AWS::Cognito::UserPoolUser", 0);
  });

  it("publishes the operational identifiers as outputs", () => {
    const outputs = template.findOutputs("*");
    for (const key of ["AdminApiUrl", "UserPoolId", "UserPoolClientId", "HostedUiDomain"]) {
      expect(outputs[key], `missing output ${key}`).toBeDefined();
    }
    expect(outputs.AdminApiUrl!.Value).toBe("https://api.joshh.io");
    expect(outputs.HostedUiDomain!.Value).toBe(
      "https://joshh-io-admin.auth.us-east-1.amazoncognito.com",
    );
  });
});
