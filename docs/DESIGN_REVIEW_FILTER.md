# Design Review Filter

Reusable filter for rejecting generic, AI-looking UI and preserving a distinctive, human identity.

For copy and messaging quality, pair this with `docs/WRITING_REVIEW_FILTER.md`.

## Why this exists

This project should never ship design that is merely "fine." The target is memorable, trustworthy, and clearly authored by a specific person with two identities: software engineer and musician.

## Research Basis (authoritative sources)

- NN/g: AI prototyping and vague prompting produce generic, low-context outputs unless constraints and references are specific.
- NN/g: homepage clarity, hierarchy, and explicit value communication are mandatory.
- W3C WCAG 2.2: accessibility remains a non-negotiable quality gate.
- GOV.UK Service Manual: design must start from user needs, not internal assumptions.
- Baymard: trust and friction reduction are required at key decision points.
- Figma (2025-2026): teams using AI effectively keep strong handoff discipline and human quality judgment.
- Awwwards (2025): current UI direction favors stronger art direction, typography, and expressive interaction, but only when purposeful.

Reference URLs:

- https://www.nngroup.com/articles/vague-prototyping/
- https://www.nngroup.com/articles/ai-prototyping/
- https://www.nngroup.com/articles/homepage-design-principles/
- https://www.w3.org/WAI/WCAG22/quickref/
- https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs
- https://baymard.com/learn/ux-audit
- https://www.figma.com/blog/state-of-the-designer-2026/
- https://www.figma.com/blog/the-designers-handbook-for-developer-handoff/
- https://www.awwwards.com/blog/design-trends-2025/

## Non-Negotiable Gate

Ask all three on every UI iteration:

1. Is this visually generic?
2. Is this uninspired and utilitarian?
3. Does this look AI-generated?

If the answer is yes to any question, fail the iteration and redesign.

## Auto-Fail Signals

- Template-shaped hero + two CTA + card grid with no distinctive art direction.
- Generic startup copy ("build better", "innovative solutions", "passionate developer") without concrete proof.
- Same visual tone as common Tailwind starter sites (neutral dark + single accent + default typography).
- Motion that is either absent everywhere or decorative everywhere.
- Music identity reduced to a single icon/section instead of influencing the whole experience.
- No trust proof near claims (selected work outcomes, collaborators, artifacts, process receipts).

## Scoring Rubric (0-2 each, 24 max)

1. Identity Specificity (engineer + musician both visible)
2. Narrative Clarity (who, what, why, next action in first viewport)
3. Visual Distinctiveness (non-template composition and hierarchy)
4. Typography Character (purposeful type pairing/scale/rhythm)
5. Color Intentionality (lavender/amber direction used deliberately)
6. Motion Purpose (guides attention, respects reduced motion)
7. Interaction Personality (micro-interactions feel authored, not stock)
8. Proof and Trust (evidence near claims)
9. Accessibility Baseline (WCAG contrast, keyboard, semantics, labels)
10. Responsive Quality (mobile-first readability and touch targets)
11. Content Specificity (concrete language, no generic filler)
12. System Consistency (tokens/components coherent across pages)

Thresholds:

- Any auto-fail signal => fail
- Score < 18 => fail
- Score 18-20 => iterate once more before review
- Score >= 21 with no auto-fail => ready for human review

## Iteration Loop (Required)

1. Define intent in one sentence: emotional tone + user job.
2. Pick 3 references (at least one expressive site, one UX-strong system, one typography-led example).
3. Build one focused pass (layout, type, color, motion) using project tokens/components.
4. Run the non-negotiable gate and scoring rubric.
5. If failed, change structure first (not just colors), then rerun.
6. Validate desktop + mobile + reduced-motion before presenting.

## joshh.io Directional Constraints

- Identity: engineering rigor + musical expression in equal weight.
- Color priority: lavender first, light amber second, white third, gray/black foundation.
- Avoid sterile minimalism; keep readability and trust high.
- Prefer distinctive typography and composition over heavy effects.
- Use motion as rhythm and emphasis, not decoration.
