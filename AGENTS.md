# joshh.io

Personal website for Joshua Hickman — portfolio, blog, and creative landing page.

## Core Commands

- `npm run dev` — Start Vite dev server (localhost:5173)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally
- `npm run typecheck` — TypeScript strict-mode check
- `npm run lint` — ESLint (flat config)
- `npm run lint:fix` — Auto-fix lint issues
- `npm run test` — Vitest test suite
- `npm run setup:security` — Install hooks + verify gitleaks
- `npm run audit:secrets` — gitleaks scan for hardcoded secrets
- `npm run audit:secrets:staged` — gitleaks scan for staged files only
- `npm run check` — Full pre-commit: secrets audit + typecheck + lint + test

## Agent + MCP Tooling Protocol

- Unless Joshua explicitly overrides in chat, follow this protocol exactly.
- `arxiv`: use for whitepaper and technical research.
- `aws`: use for AWS infrastructure visibility only; do not touch infrastructure unless explicitly requested.
- `chrome-devtools`: use for browser debugging whenever possible.
- `context7`: use for framework/library documentation lookup.
- `filesystem`: use for local filesystem access when appropriate.
- `firecrawl`: use for all online web search and fact checking; use to troubleshoot when stuck.
- `github`: use for repository access and GitHub workflows.
- `playwright`: use for debugging and end-to-end testing as much as appropriate.
- `sequential-thinking`: always use this for planning and problem solving.
- `supermemory`: use for long-term memory retention/retrieval; always use when a push is approved and when needed context is not obvious from session history.

## Design Authenticity Protocol (Mandatory)

- Unless Joshua explicitly overrides in chat, apply `docs/DESIGN_REVIEW_FILTER.md` to every UI/UX change.
- Every iteration must ask: `Is this visually generic?`, `Is this uninspired/utilitarian?`, and `Does this look AI-generated?`.
- If the answer is `yes` to any one of those checks, redesign and re-evaluate before presenting for review.
- Treat identity as a hard requirement: the site must read as both engineer and musician, not a generic developer template.
- Color direction priority is mandatory unless overridden: lavender first, light amber second, white third, gray/black foundation.
- Balance expression with UX fundamentals: maintain accessibility, clarity, responsive behavior, and trust signals while increasing distinctiveness.

## Writing Authenticity Protocol (Mandatory)

- Unless Joshua explicitly overrides in chat, apply `docs/WRITING_REVIEW_FILTER.md` to every user-facing text change.
- Every copy iteration must ask: `Is this generic?`, `Is this cheesy or over-written?`, and `Does this sound AI-generated?`.
- If the answer is `yes` to any one of those checks, rewrite and re-evaluate before presenting for review.
- Truthfulness is mandatory: do not add claims unless they are user-provided, visible in the repo, or verifiable from a reliable source right now.
- If a fact is uncertain or unverified, omit it instead of filling with plausible-sounding copy.
- Prefer specificity over slogans: use concrete nouns, explicit actions, and real constraints/results.
- Avoid interchangeable startup copy and vague claims; write in Joshua's real voice as an engineer and musician.
- Avoid LinkedIn/SEO sales tone unless Joshua explicitly asks for it; prioritize grounded identity over self-promotion.
- Keep high-visibility pages privacy-aware: avoid naming current employer/work details on homepage unless Joshua explicitly requests it.
- Show, don't tell: prefer demonstrating identity through work and artifacts over self-descriptive branding language.
- Preserve accessibility and comprehension: plain language, scannable structure, descriptive links, and concise CTAs.

## Architecture

- **SPA** deployed to AWS Amplify Hosting (static site, no SSR)
- **React Router v7** handles client-side navigation
- **Content** lives in `/content/` as markdown/MDX, loaded at build time
- **Tailwind CSS v4** for styling — no CSS modules, no styled-components
- **Structured data** in `/src/data/` as typed TypeScript objects (experience, projects, skills)

## Development Principles

### Use existing tools first

Before implementing new features or utilities, prefer reliable existing tools/libraries over custom code.

Process:

1. **Research first** — Check maintained OSS tools/packages/APIs.
2. **Evaluate fit** — Maintenance cadence, license, dependency footprint, trust.
3. **Propose before adding dependencies** — Share tradeoffs and get approval.
4. **Build custom only when justified** — No suitable maintained option, or dependency cost is too high.

This policy applies to human contributors and AI agents.

### Security: Credential Audit

All changes are scanned for secrets before commit/push.

1. **Pre-commit hook** — Runs `npm run audit:secrets:staged`.
2. **`npm run check`** — Runs full repo secret scan + typecheck + lint + tests.
3. **Manual audit** — Run `npm run audit:secrets` any time config/env values are added.

Configuration: `.gitleaks.toml` at project root.

If gitleaks flags findings:

- Move credentials to `.env` (gitignored)
- Reference via `import.meta.env` for client-safe vars only (prefixed with `VITE_`)
- Use obvious fake placeholders in tests/docs (`test_key_xxx`, `example_token`)
- Add targeted allowlist entries only for confirmed false positives

## Conventions

- Functional components only. No class components.
- Named exports for components. Default exports only for pages (React Router lazy loading).
- Props interfaces named `{ComponentName}Props`.
- File naming: PascalCase for components (`ProjectCard.tsx`), camelCase for utilities (`content.ts`).
- All components must have TypeScript props interfaces — no `any`.
- Use `cn()` utility (clsx + tailwind-merge) for conditional class composition.
- Prefer Tailwind utility classes. Extract to component-level abstractions when a pattern repeats 3+ times.
- Zod schemas for any external data or form validation.
- Semantic HTML elements (`<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`).
- All images must have alt text.
- Dark mode: use Tailwind `dark:` variant with system preference detection + manual toggle.
- No direct `console.log` in committed app code — prefer structured/intentional logging patterns.

## Testing

- Vitest + @testing-library/react
- Test component rendering and user interactions
- Minimum: every page component has a render test
- `npm run check` must pass before any PR

## Git Workflow

- Branch from `main` for all work (`feature/*`, `fix/*`, `chore/*`)
- Commit format: `type: short description` (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`)
- **Never push directly to `main`**
- Open PRs for all changes and merge through branch protection rules

## Content Workflow

- Blog posts: add `.md` or `.mdx` to `content/blog/` with frontmatter (title, date, tags, description)
- Projects: add to `content/projects/` with frontmatter (title, tech, links, description, featured)
- Content is statically imported at build time — no runtime fetching

## Deployment

- Merge PR to `main` → Amplify auto-builds and deploys
- Custom domain: `joshh.io` via Route 53
- Amplify handles SSL certificate provisioning
- Build command: `npm run build`
- Output directory: `dist`

## Three-Tier Boundaries

### Always Do

- Run `npm run typecheck` after TypeScript edits
- Run `npm run audit:secrets` after adding config/env-like values
- Run `npm run check` before pushing a branch or opening a PR
- Keep changes scoped and consistent with existing architecture/design language

### Ask First

- Adding new npm dependencies
- Changing routing architecture or deployment behavior
- Modifying CI/CD or branch protection expectations
- Introducing new third-party runtime services

### Never Do

- Never push directly to `main`
- Never commit secrets, tokens, API keys, credentials, or private files
- Never bypass secret scanning or pre-commit checks
- Never add backend/API routes (site is static SPA)
- Never add CSS-in-JS or CSS modules

## Do Not

- Do not add a backend or API routes — this is a static SPA
- Do not use CSS-in-JS or CSS modules
- Do not use `any` type
- Do not add heavyweight animation libraries beyond Framer Motion
- Do not auto-generate content — all content is author-written
