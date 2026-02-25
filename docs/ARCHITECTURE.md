# Architecture

## Overview

joshh.io is a single-page application (SPA) built with React and TypeScript. It is deployed as a static site on AWS Amplify — there is no server-side rendering or backend API.

## Component Tree

```
App
└── BrowserRouter
    └── Routes
        └── Layout
            ├── Header (navigation, theme toggle)
            ├── Outlet (page content)
            │   ├── Home
            │   ├── About
            │   ├── Portfolio
            │   ├── Blog
            │   ├── BlogPost
            │   ├── Music
            │   └── Contact
            └── Footer (social links, copyright)
```

## Routing

React Router v7 with `BrowserRouter`. All routes are defined in `src/App.tsx`.

| Path          | Page      | Description                        |
| ------------- | --------- | ---------------------------------- |
| `/`           | Home      | Hero, featured projects, what I do |
| `/about`      | About     | Bio, experience timeline, skills   |
| `/portfolio`  | Portfolio | Project cards with tag filtering   |
| `/blog`       | Blog      | Post listing                       |
| `/blog/:slug` | BlogPost  | Individual post render             |
| `/music`      | Music     | Music work-in-progress page        |
| `/contact`    | Contact   | Social links and contact info      |

## Data Flow

- **Structured data** lives in `src/data/` as typed TypeScript objects (experience, projects, skills)
- **Content** (blog posts, project writeups) lives in `content/` as markdown files
- All data is imported at build time — no runtime API calls
- Components receive data via props from page components

## Styling

- Tailwind CSS v4 via the `@tailwindcss/vite` plugin
- Custom theme defined in `src/styles/globals.css` using `@theme` directive
- Dark mode uses the `class` strategy with `dark:` variants
- `cn()` utility (clsx + tailwind-merge) for conditional class composition

## Directory Convention

- `src/components/ui/` — Generic, reusable UI primitives (Button, Card, Badge, Section)
- `src/components/shared/` — Domain-specific shared components (ProjectCard, ExperienceTimeline)
- `src/components/layout/` — Layout structure (Header, Footer, Layout)
- `src/pages/` — Route-level page components (default exports)
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utilities, types, constants
- `src/data/` — Structured data
