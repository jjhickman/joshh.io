import { z } from "zod";

// Synth and tests never contact AWS, so they run against a placeholder
// account. A real deployment must supply the genuine account via
// CDK_DEFAULT_ACCOUNT; getInfraConfig throws if it is missing then.
const SYNTH_PLACEHOLDER_ACCOUNT = "111111111111";

const oidcProviderSetting = z.union([
  z.literal("create"),
  z.object({
    importArn: z
      .string()
      .regex(
        /^arn:[^:]+:iam::\d{12}:oidc-provider\/token\.actions\.githubusercontent\.com$/,
        "must be the account's GitHub OIDC provider ARN",
      ),
  }),
]);

const environmentSchema = z.object({
  CDK_DEFAULT_ACCOUNT: z
    .string()
    .regex(/^\d{12}$/, "must be a 12-digit AWS account ID")
    .optional(),
  JOSHH_IO_CDK_CONTEXT: z.enum(["deploy", "synth", "test"]).default("deploy"),
});

export type GithubOidcProviderConfig = z.infer<typeof oidcProviderSetting>;

export interface InfraConfig {
  readonly account: string;
  readonly context: "deploy" | "synth" | "test";
  readonly region: "us-east-1";
  readonly domain: "joshh.io";
  readonly hostedZoneId: "Z09072841QGFCMDWIMTZ5";
  readonly githubOwner: "jjhickman";
  readonly githubRepository: "joshh.io";
  readonly deployBranch: "main";
  readonly githubEnvironment: "production";
  readonly githubOidcProvider: GithubOidcProviderConfig;
}

export interface InfraConfigOverrides {
  readonly account?: string;
  readonly context?: "deploy" | "synth" | "test";
  readonly githubOidcProvider?: GithubOidcProviderConfig;
}

// Everything below is deliberate, reviewed configuration — never derived at
// runtime, so synthesis stays credential-free and deterministic.
const constants = {
  region: "us-east-1",
  domain: "joshh.io",
  hostedZoneId: "Z09072841QGFCMDWIMTZ5",
  githubOwner: "jjhickman",
  githubRepository: "joshh.io",
  deployBranch: "main",
  githubEnvironment: "production",
  // Recorded during bootstrap 2026-07-19: account 580028686392 already has
  // the GitHub OIDC provider, and IAM allows one per issuer per account, so
  // JoshhIo-Ci imports it rather than creating a duplicate.
  githubOidcProvider: {
    importArn:
      "arn:aws:iam::580028686392:oidc-provider/token.actions.githubusercontent.com",
  },
} as const satisfies Omit<InfraConfig, "account" | "context">;

export function getInfraConfig(overrides: InfraConfigOverrides = {}): InfraConfig {
  const environment = environmentSchema.parse({
    CDK_DEFAULT_ACCOUNT: overrides.account ?? process.env.CDK_DEFAULT_ACCOUNT,
    JOSHH_IO_CDK_CONTEXT: overrides.context ?? process.env.JOSHH_IO_CDK_CONTEXT,
  });

  const context = environment.JOSHH_IO_CDK_CONTEXT;
  const account =
    environment.CDK_DEFAULT_ACCOUNT ??
    (context === "deploy" ? undefined : SYNTH_PLACEHOLDER_ACCOUNT);
  if (!account) {
    throw new Error("CDK_DEFAULT_ACCOUNT is required for deployment");
  }

  return {
    ...constants,
    account,
    context,
    githubOidcProvider: oidcProviderSetting.parse(
      overrides.githubOidcProvider ?? constants.githubOidcProvider,
    ),
  };
}
