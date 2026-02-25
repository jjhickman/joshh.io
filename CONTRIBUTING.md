# Contributing to joshh.io

This is a personal website, so external contributions are generally not expected. However, if you spot a bug or have a suggestion, feel free to open an issue.

## Development

```bash
npm install
npm run dev
```

### Local Prerequisite: gitleaks

Secret scanning is required by pre-commit hooks and `npm run check`.

Bootstrap local security workflow with:

```bash
npm run setup:security
```

- macOS (Homebrew): `brew install gitleaks`
- Windows (winget): `winget install gitleaks`
- Linux/manual: https://github.com/gitleaks/gitleaks#installing

## Before Submitting

Ensure all checks pass:

```bash
npm run check
```

This runs secret scanning, TypeScript type checking, ESLint, and the test suite.

You can also run targeted secret scans:

```bash
npm run audit:secrets
npm run audit:secrets:staged
```

## Branching and PR Policy

- Create a branch from `main` for all changes (`feature/*`, `fix/*`, `chore/*`)
- Open a pull request for review
- Do not push directly to `main`

## Conventions

See [AGENTS.md](AGENTS.md) for coding conventions and project standards.
