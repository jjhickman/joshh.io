# Design System

## Philosophy

Distinctive, expressive, and trustworthy. The design must feel authored, not template-generated. It should communicate engineering rigor and musical identity at the same time.

Review requirement: every UI iteration must pass `docs/DESIGN_REVIEW_FILTER.md` before review.

## Color Palette

### Foundation

| Token                 | Hex       | Usage                   |
| --------------------- | --------- | ----------------------- |
| `background-ink`      | `#111217` | Primary dark background |
| `background-ink-soft` | `#1a1c24` | Elevated dark surfaces  |
| `text-ink`            | `#f5f6fb` | Light text on dark      |
| `text-ink-muted`      | `#bcc0cf` | Secondary light text    |

### Light Surfaces

| Token                        | Hex       | Usage                    |
| ---------------------------- | --------- | ------------------------ |
| `background-light`           | `#f8f8fb` | Primary light background |
| `background-light-secondary` | `#ffffff` | Elevated light surfaces  |
| `text-light`                 | `#1a1c24` | Primary text on light    |
| `text-light-muted`           | `#5a6072` | Secondary text on light  |

### Priority Palette

Use in this order unless explicitly overridden: lavender first, light amber second, white third, gray/black foundation.

| Token          | Hex       | Usage                            |
| -------------- | --------- | -------------------------------- |
| `lavender-500` | `#b79cff` | Primary accent and focus moments |
| `lavender-300` | `#d5c6ff` | Soft surfaces/highlights         |
| `amber-300`    | `#ffdca8` | Secondary accent and warmth      |
| `amber-400`    | `#ffc97a` | CTA emphasis/support accents     |
| `white`        | `#ffffff` | High-contrast surfaces           |
| `gray-900`     | `#111217` | Structure/depth                  |

Avoid default teal-centric palettes and interchangeable startup color systems.

## Typography

| Context  | Font                 | Weight  |
| -------- | -------------------- | ------- |
| Headings | Inter                | 600–700 |
| Body     | Inter / system stack | 400     |
| Code     | JetBrains Mono       | 400–500 |

Use fonts that reinforce personality and clarity. Avoid generic default stacks as the primary brand voice.

## Layout

- **Max prose width:** 720px — for readable text content
- **Max content width:** 1200px — for grid layouts
- **Spacing:** Generous whitespace, 16px base padding
- **Breakpoints:** Mobile-first, responsive at `sm` (640px), `md` (768px), `lg` (1024px)

## Components

### Button

Variants: `primary`, `secondary`, `ghost`
Sizes: `sm`, `md`, `lg`

### Card

Optional `hover` prop for interactive cards with border highlight and shadow.

### Badge

Variants: `default`, `accent`, `outline`
Used for skill tags, technology labels.

### Section

Page section wrapper with consistent padding. `wide` prop for grid layouts (max-w-content vs max-w-prose).

## Animations

Framer Motion for:

- Page entrance fade-in-up transitions
- Scroll-triggered reveals (`whileInView`)
- Music page icon entrance animation

Principles: subtle, purposeful, never blocks content visibility.

Motion must follow content rhythm and narrative emphasis. Respect reduced-motion preferences.

## Dark Mode

- Strategy: CSS class (`dark`) on `<html>`
- Detection: System preference (`prefers-color-scheme`) on first visit
- Persistence: `localStorage` for manual toggle
- Toggle: Sun/Moon icon in header
