# Repository instructions

- Read `docs/PLAN.md` before changing architecture, content, dependencies, or routes.
- Keep the site music-first; `/tech` stays visually quiet and absent from home-page promotion.
- Keep mutable copy and records in `src/content`; keep replaceable imagery in `src/assets/images`.
- Mark invented content with an adjacent `// PLACEHOLDER` comment and never add unapproved dependencies.
- Use strict TypeScript, accessible semantic HTML, click-to-load third-party embeds, and reduced-motion-safe CSS.
- Do not add infrastructure or workflows until Phase 5 is explicitly requested.
- Before handoff, run `npm run check`, `npm run build`, `npm run check:bundle`, and `git diff --check`.
