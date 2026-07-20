# Infrastructure Implementation Report

Date: 2026-07-19

## Outcome

Implemented the AWS CDK infrastructure package and GitHub Actions checks/deployment workflows described by `docs/PLAN.md` sections 5 through 7.

No AWS CLI command, credentialed AWS operation, deployment, git commit, push, or change under `src/`, `public/`, or `scripts/` was performed.

## Built

- `infra/bin/app.ts` composes `JoshhIo-Site` and `JoshhIo-Ci` in `us-east-1`.
- `infra/lib/config.ts` Zod-validates the account and explicit create/import GitHub OIDC configuration while pinning domain, hosted zone, repository, branch, environment, and region.
- `infra/lib/site-stack.ts` creates:
  - a retained DNS-validated apex and `www` ACM certificate;
  - a retained, encrypted, public-blocked, TLS-only S3 bucket;
  - a CloudFront OAC distribution with apex/`www` aliases, TLS 1.2 2021, IPv6, HTTP/2+3, SPA fallbacks, explicit price class, no-cache default behavior, and immutable `/assets/*` behavior;
  - strict response security headers and the approved Spotify/YouTube Privacy-Enhanced CSP frame sources;
  - a viewer-request `www` redirect on every behavior, preserving path and query;
  - apex and `www` A/AAAA records, pruned bucket deployment with `/*` invalidation, a five-minute 5xx alarm, outputs, and `app`/`env`/`repo`/`managed-by` tags.
- `infra/lib/ci-stack.ts` creates or imports the GitHub OIDC provider and creates a deploy role with exact production-environment audience/subject trust and only four CDK bootstrap-role AssumeRole patterns.
- `infra/test/` contains 11 passing CDK assertion tests covering the section 7 infrastructure inventory, both OIDC paths, trust scope, redirect associations, OAC, DNS, caching, security headers, invalidation, retention, alarm, and outputs.
- `.github/workflows/checks.yml` and `deploy.yml` use verified full-SHA action pins, checksum-verified gitleaks 8.30.1, Node 20, root/infra checks, infra dependency audit, build-artifact secret scanning, credential-free synth, bundle checks, production OIDC deploy, bounded smoke retries, and deployment summary output.
- Root integration adds only the requested `infra:check` and `infra:synth` convenience scripts, required ignore entries, and narrow generated-infra exclusions/test ownership in the existing lint, Vitest, and gitleaks configurations.

## Verified action pins

- `actions/checkout` v7.0.0: `9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0`
- `actions/setup-node` v7.0.0: `820762786026740c76f36085b0efc47a31fe5020`
- `actions/upload-artifact` v7.0.1: `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`
- `aws-actions/configure-aws-credentials` v6.2.2: `517a711dbcd0e402f90c77e7e2f81e849156e31d`

## Gate results

All completion gates passed:

| Gate | Result |
| --- | --- |
| `cd infra && npm install` | PASS — 181 packages audited, 0 vulnerabilities |
| `npm --prefix infra run check` | PASS — typecheck, lint, 2 test files, 11 tests |
| `env -u CDK_DEFAULT_ACCOUNT npm --prefix infra run cdk:synth` | PASS — both stacks synthesized with dummy account `111111111111`; no configured account appeared |
| `npm run check` | PASS — secret scan, production dependency audit, typecheck, lint, 3 test files, 15 tests |
| `npm run build` | PASS — Vite transformed 81 modules |
| `npm run check:bundle` | PASS — JS 100.6 KiB gzip / 160 KiB; CSS 7.0 KiB gzip / 30 KiB |
| Infra dependency audit | PASS — 0 vulnerabilities |
| Built `dist/` gitleaks scan | PASS — 356.94 KB scanned, no leaks |
| Workflow YAML and shell validation | PASS — both YAML files parsed; 11 checks and 13 deploy run blocks passed `bash -n` |
| Secure review | PASS — no critical/high findings; OIDC, action pins, checksum, OAC/S3, and CSP verified |
| `git diff --check` | PASS |

## Model/runtime record

- Requested `gpt-5.6-sol` code runtime: invoked first, but returned no usable result.
- Authorized `gpt-5.5` fallback: attempted with `codex-cli 0.145.0-alpha.24`, but the in-process app-server initialization was blocked by the workspace permission profile before execution.
- Implementation and verification therefore ran in the active GPT-5 Codex code session; a more specific internal model suffix was not exposed.

## Deviations and integration decisions

- CDK CLI 2.1132.0 reports `--all` as an unknown option. The `cdk:synth` script uses current valid `cdk synth` syntax; with no stack argument it synthesized both stacks.
- The checks workflow builds before synthesis because `BucketDeployment` fingerprints `../dist` during synth. This preserves clean-checkout CI correctness; deploy already had this order in the plan.
- Credential-free synthesis also isolates the AWS shared config/credentials files and disables metadata access. This was necessary because CDK otherwise replaced the dummy account with the locally configured account.
- Root ESLint, Vitest, and gitleaks configuration received narrow exclusions/ownership rules so generated `infra/cdk.out` is not linted or treated as secret material and infra tests run only under the infra Vitest configuration.
- The secure review's main-only manual-deploy finding was fixed with an explicit `github.ref == 'refs/heads/main'` job guard. Infra dependency audit and post-build gitleaks scanning were also added.
- Residual design trade-off: `id-token: write` remains job-wide during repeated production checks because section 6 specifies one self-contained deployment job. Splitting validation/build from a minimal privileged deploy job would be a separate CI architecture change.

## Required before first deployment

1. In the target AWS account, check whether `token.actions.githubusercontent.com` already exists. Keep `githubOidcProvider: "create"` only when absent; otherwise set the validated `importArn` configuration.
2. Set the real `CDK_DEFAULT_ACCOUNT` locally and bootstrap that account in `us-east-1` with reviewed CloudFormation execution policies.
3. Build the site, then deploy `JoshhIo-Site` once from the trusted local session. Allow ACM DNS validation and CloudFront/DNS propagation to settle.
4. Deploy `JoshhIo-Ci` once from the trusted local session. Do not add it to routine GitHub deployment commands.
5. Add the `GithubDeployRoleArn` output as the non-secret `AWS_DEPLOY_ROLE_ARN` variable on the GitHub `production` environment.
6. Restrict the GitHub `production` environment to the `main` branch and optionally require approval for the first launch. The workflow also enforces `main` as defense in depth.
7. Protect `main` with the Checks workflow, then perform the first deployment and verify apex, deep-route, `www` redirect path/query preservation, and real Spotify/YouTube embeds under the deployed CSP.
