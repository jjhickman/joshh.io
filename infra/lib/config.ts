import { z } from "zod";

const DUMMY_ACCOUNT = "111111111111";

const accountSchema = z.string().regex(/^\d{12}$/, "must be a 12-digit AWS account ID");
const githubOidcProviderSchema = z.union([
  z.literal("create"),
  z.object({
    importArn: z
      .string()
      .regex(/^arn:[^:]+:iam::\d{12}:oidc-provider\/token\.actions\.githubusercontent\.com$/),
  }),
]);

const environmentSchema = z.object({
  CDK_DEFAULT_ACCOUNT: accountSchema.optional(),
  JOSHH_IO_CDK_CONTEXT: z.enum(["deploy", "synth", "test"]).default("deploy"),
});

export type GithubOidcProviderConfig = z.infer<typeof githubOidcProviderSchema>;

export interface InfraConfig {
  readonly account: string;
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

const explicitConfig = {
  region: "us-east-1",
  domain: "joshh.io",
  hostedZoneId: "Z09072841QGFCMDWIMTZ5",
  githubOwner: "jjhickman",
  githubRepository: "joshh.io",
  deployBranch: "main",
  githubEnvironment: "production",
  githubOidcProvider: "create",
} as const satisfies Omit<InfraConfig, "account">;

export function getInfraConfig(overrides: InfraConfigOverrides = {}): InfraConfig {
  const environment = environmentSchema.parse({
    CDK_DEFAULT_ACCOUNT: overrides.account ?? process.env.CDK_DEFAULT_ACCOUNT,
    JOSHH_IO_CDK_CONTEXT: overrides.context ?? process.env.JOSHH_IO_CDK_CONTEXT,
  });
  const account = environment.CDK_DEFAULT_ACCOUNT ??
    (environment.JOSHH_IO_CDK_CONTEXT === "deploy" ? undefined : DUMMY_ACCOUNT);

  if (!account) {
    throw new Error("CDK_DEFAULT_ACCOUNT is required for deployment");
  }

  return {
    ...explicitConfig,
    account,
    githubOidcProvider: githubOidcProviderSchema.parse(
      overrides.githubOidcProvider ?? explicitConfig.githubOidcProvider,
    ),
  };
}
