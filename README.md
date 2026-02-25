# joshh.io

Personal website for Josh Hickman.

Lab, notes, and studio work-in-progress built with React, TypeScript, and Tailwind CSS. Deployed on AWS Amplify.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite** — build tooling
- **Tailwind CSS v4** — utility-first styling
- **React Router v7** — client-side routing
- **Framer Motion** — page transitions and animations
- **Lucide React** — icons
- **Vitest** + **Testing Library** — testing

## Route Map

- `/` — Home
- `/about` — About
- `/lab` — Projects and experiments
- `/blog` — Writing index
- `/blog/:slug` — Individual post
- `/studio` — Music work-in-progress
- `/contact` — Contact links + non-functional form mock

Legacy redirects:

- `/portfolio` -> `/lab`
- `/music` -> `/studio`

## Scripts

| Command                        | Description                                       |
| ------------------------------ | ------------------------------------------------- |
| `npm run dev`                  | Start development server                          |
| `npm run build`                | Production build                                  |
| `npm run preview`              | Preview production build                          |
| `npm run typecheck`            | TypeScript type checking                          |
| `npm run lint`                 | ESLint                                            |
| `npm run test`                 | Run tests                                         |
| `npm run setup:security`       | Install hooks and verify gitleaks                 |
| `npm run audit:secrets`        | Scan repo for hardcoded secrets (gitleaks)        |
| `npm run audit:secrets:staged` | Scan staged files for secrets (gitleaks)          |
| `npm run check`                | Full CI check (secrets + typecheck + lint + test) |

## Project Structure

```
src/
├── components/
│   ├── layout/      # Header, Footer, Layout
│   ├── ui/          # Button, Card, Badge, Section
│   └── shared/      # ProjectCard, ExperienceTimeline, etc.
├── pages/           # Route page components
├── hooks/           # Custom React hooks
├── lib/             # Utilities, types, constants
├── styles/          # Global CSS (Tailwind)
└── data/            # Structured data (experience, projects, skills)
```

## Deployment

Deployed via AWS Amplify. Merge a pull request to `main` to trigger auto-build and deploy.

- Never push directly to `main`
- Use a branch + pull request for all changes

- Domain: [joshh.io](https://joshh.io)
- DNS: AWS Route 53
- SSL: Provisioned by Amplify

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for details.

## Planned Features

- Contact form backend pipeline (API Gateway + Lambda + validation + email delivery)
- See [docs/CONTACT_FORM_FEATURE_PLAN.md](docs/CONTACT_FORM_FEATURE_PLAN.md)

## License

[Apache-2.0](LICENSE)
