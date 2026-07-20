# Infrastructure report

Authored by Claude Fable 5 on 2026-07-20. This replaces the original
GPT-5-generated infrastructure, which was re-authored in full at Josh's
direction: implementation subagents are gpt-5.6-sol or the smartest Claude
models only.

## What exists

- `infra/lib/site-stack.ts` — `JoshhIo-Site` (us-east-1): DNS-validated ACM
  certificate for joshh.io + www (retained), private encrypted S3 bucket
  behind CloudFront Origin Access Control (retained), distribution with both
  aliases, TLS 1.2_2021, HTTP/2+3, IPv6, PriceClass 100, SPA fallbacks
  (403/404 → /index.html, zero error caching), a www→apex viewer-request
  function on every behavior, immutable one-year caching for `/assets/*`,
  always-revalidate managed policy for HTML, one shared security-header
  posture (CSP with exact embed frame sources, HSTS preload, DENY framing),
  hermetic BucketDeployment (placeholder without a build; deploy context
  requires `dist/`), a 5xx-rate alarm, and operational outputs.
- `infra/lib/ci-stack.ts` — `JoshhIo-Ci`: imports the account's existing
  GitHub OIDC provider (recorded in `config.ts` during bootstrap; IAM allows
  one per issuer) and defines `joshh-io-github-deploy`, trusting only
  `repo:jjhickman/joshh.io:environment:production`, granting only assumption
  of the four regional CDK bootstrap roles. Deployed locally, never from CI.
- `infra/lib/config.ts` — Zod-validated, lookup-free configuration; synth and
  tests run against a placeholder account with no AWS credentials.
- `infra/test/` — 16 assertion tests over the synthesized templates covering
  every security property above, both OIDC modes, and the build coupling in
  both directions.
- `.github/workflows/checks.yml` — PR/main gates: gitleaks (full history),
  dependency audit, typecheck, lint, tests (both packages), credential-free
  synth, production build, bundle budgets. All actions pinned to verified
  release SHAs.
- `.github/workflows/deploy.yml` — main-only, `environment: production`,
  keyless OIDC role assumption, self-contained gate re-run, `cdk deploy
  JoshhIo-Site`, retrying smoke checks, step summary.

## Deployed state (verified live)

Account 580028686392, us-east-1. Distribution `E3P8KIUEUP8I3O` serving
https://joshh.io (200, valid TLS, headers verified), www 301→apex with path
and query preserved, A/AAAA aliases on both names, CI green end-to-end via
OIDC with `AWS_DEPLOY_ROLE_ARN` set on the `production` environment
(restricted to `main`).

## Operating notes

- `JoshhIo-Ci` changes are deliberate local operations:
  `npm --prefix infra run cdk:deploy -- JoshhIo-Ci`.
- The certificate and bucket are retained on stack deletion by design.
- Widening PriceClass or adding origins/frame sources are conscious edits to
  `site-stack.ts` with matching test updates.
