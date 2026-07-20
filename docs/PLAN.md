# joshh.io implementation plan

## 1. Overview & goals

joshh.io will be a music-first personal site for Josh Hickman, led by his work as guitarist for IN CASE OF EMERGENCY. It should feel like entering the visual world of a post-rock record: a full-bleed performance image, sparse language, patient pacing, and small pulses of light and motion. The engineering biography exists, but it is intentionally quiet and isolated under `/tech` rather than competing with the band.

### Goals

- Make IN CASE OF EMERGENCY, its releases, shows, performance footage, and photography the dominant story.
- Give visitors one-step paths to listen, watch, see the next show, and follow external music links.
- Create a distinctive dark, cinematic presentation without sacrificing legibility, keyboard use, reduced-motion support, or mobile performance.
- Keep all launch content in typed repository modules so updates are reviewable and deploy with the site.
- Deliver a static React SPA from a private S3 bucket through CloudFront at `https://joshh.io`.
- Keep launch operations small: no backend, database, CMS, runtime secrets, or client-side API dependency.

### Repository context

`joshh.io` is an independent git repository (`github.com/jjhickman/joshh.io`, default branch `main`) that happens to be checked out inside `~/projects`. It is not part of the `projects` monorepo's git history, CI, or deploy scripts, and nothing in this plan couples to monorepo tooling. It will carry its own `AGENTS.md`, workflows, and check pipeline (created in Phase 1), mirroring the monorepo's conventions (ESM, strict TypeScript, Node 20+, Vitest, gitleaks) without depending on them.

### Non-goals at launch

- A general-purpose portfolio, résumé site, blog, mailing-list system, shop, or fan account system.
- A live show-management integration, Spotify API integration, image DAM, or CMS.
- Automatically mirrored content from social platforms.
- A separate server-rendered application solely for route metadata.

### Success measures

- The home page identifies Josh as the guitarist of IN CASE OF EMERGENCY within the first viewport.
- Music, shows, video, and photos occupy the primary navigation; Tech is last and visually de-emphasized.
- Each release can be played through an explicit, accessible Spotify embed and can link to available external platforms.
- Shows can be updated by editing one typed content file, with upcoming and past sections derived from timestamps.
- The production site passes the launch accessibility and performance budgets in section 4.

## 2. Site architecture & information hierarchy

### Narrative hierarchy

The first viewport acts as a concert poster, not a résumé. The home page establishes the band and musicianship; subsequent sections move from listening to live performance to visual atmosphere. The engineering biography is available for people who deliberately seek it, receives no home-page feature grid, and gets one restrained footer link plus the final nav position.

### Shared shell

- A transparent-to-solid shared header overlays the home hero and becomes a quiet near-black bar after scrolling.
- Desktop navigation order: Music, Shows, Video, Photos, Tech. The band mark or `JH` wordmark returns home.
- Mobile navigation uses a full-height, keyboard-contained disclosure with the same order and no background scroll.
- The footer repeats music destinations and copyright information; Tech remains a small text link.
- Route changes restore focus to `<main>`, announce the page name, and reset scroll unless browser history restoration applies.

### Routes and page outlines

| Route | Purpose | Content order | Primary action |
| --- | --- | --- | --- |
| `/` | Immersive introduction | Full-bleed live hero; band identity; featured release; next show; one performance-film still; photo strip; streaming/follow links | Listen to the featured release |
| `/music` | Canonical catalog | Short band context; featured/latest release; all releases in reverse chronology; platform links | Play on Spotify |
| `/shows` | Live calendar and archive | Next show treatment; upcoming list; past-show archive; empty state when no dates are booked | Get tickets or venue details |
| `/video` | Performance and music video library | Featured video; remaining videos as poster-led rows; external YouTube links | Load and play a video |
| `/photos` | Atmospheric visual archive | Editorial gallery with varied image spans; captions/credits; optional accessible lightbox | Open a photograph |
| `/tech` | Deliberately understated engineering bio | Compact biography; present role at Liberty Mutual; selected areas of practice; minimal project links if approved | Follow a relevant professional link |
| `*` | Intentional not-found state | Short message over a quiet image; links to Music and Home | Return to Music |

### Home-page content plan

1. Hero: IN CASE OF EMERGENCY is the loudest text; “Josh Hickman — guitar” is supporting copy; one Listen action and one Shows text link.
2. Featured release: artwork, a short release note, and a click-to-load Spotify player.
3. Next show: venue, city, date, and tickets, or a non-apologetic “No dates announced” state with the past-show archive link.
4. Performance still: a wide video poster with an explicit play control.
5. Photo sequence: two or three strong repository images that lead into the gallery.
6. Closing music links: streaming destinations and band social destinations once supplied.

No home section promotes Josh’s employer or presents engineering statistics. A single footer sentence may link to `/tech` without an image, glow, or prominent call to action.

## 3. Design system

### Creative direction

**Visual thesis:** Live-performance photography emerges from blue-black negative space, with soft grain and one cold afterglow accent making the site feel like a slow-building post-rock set.

**Content plan:** Poster-like hero, immediate listening proof, live date, performance footage, visual archive, then a quiet final set of outbound links.

**Interaction thesis:** The hero resolves from haze into focus, sections reveal with a short stagger as they enter the viewport, and media surfaces gain subtle depth or light on hover without continuous ornamental motion.

### Palette

Use OKLCH tokens so lightness and contrast can be tuned predictably. One cyan/teal hue supplies all glow and active-state color; status colors appear only where semantically required.

| Token | Proposed value | Use |
| --- | --- | --- |
| `ink-1000` | `oklch(0.09 0.012 255)` | Page background |
| `ink-950` | `oklch(0.13 0.014 255)` | Header and raised dark planes |
| `ink-900` | `oklch(0.18 0.016 255)` | Dividers and hover surfaces |
| `fog-100` | `oklch(0.94 0.012 230)` | Primary text |
| `fog-300` | `oklch(0.76 0.016 230)` | Secondary text |
| `fog-500` | `oklch(0.56 0.018 230)` | Metadata and disabled text |
| `afterglow-400` | `oklch(0.78 0.12 198)` | Links, focus rings, active details |
| `afterglow-500` | `oklch(0.68 0.13 198)` | Hover and pressed states |

Text and interactive combinations must be checked to WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text and focus/graphical boundaries. Glows are decoration, never the only carrier of state.

### Typography

- Display: self-hosted Cormorant Garamond variable WOFF2 for band names and major editorial headings. Its high contrast supplies the cinematic, album-editorial character.
- Text/UI: self-hosted IBM Plex Sans variable WOFF2 for navigation, body copy, dates, and controls.
- Preload only the normal roman subsets used above the fold. Use `font-display: swap`, size-adjusted fallbacks, and no third-party font requests.
- Use fluid type with `clamp()`: hero approximately `3.5rem–8.5rem`, page titles `2.5rem–5rem`, body `1rem–1.125rem`; preserve readable line lengths of 55–70 characters.

### Layout and composition

- The home hero is edge-to-edge and occupies `calc(100svh - header overlap)`; text sits in a calm crop area and remains within the first viewport on common phones.
- Use a 12-column desktop grid, six columns on tablet, and four on mobile. Editorial content can break the text measure, but controls and copy share clear alignment lines.
- Standard page gutter: `clamp(1rem, 4vw, 4.5rem)`. Text measure: `70ch`. Section spacing: `clamp(5rem, 11vw, 10rem)`.
- Prefer open editorial rows, dividers, and media planes over card grids. Release art is treated as artwork, not as a generic card thumbnail.
- Use a subtle CSS grain overlay and image color treatment; do not ship a large decorative texture asset.

### Tailwind CSS v4 theme

`src/styles/index.css` is the CSS-first entry point. It imports Tailwind and publishes project tokens through `@theme`, which creates matching utilities while retaining CSS variables for custom rules.

```css
@import "tailwindcss";

@theme {
  --color-ink-1000: oklch(0.09 0.012 255);
  --color-ink-950: oklch(0.13 0.014 255);
  --color-ink-900: oklch(0.18 0.016 255);
  --color-fog-100: oklch(0.94 0.012 230);
  --color-fog-300: oklch(0.76 0.016 230);
  --color-fog-500: oklch(0.56 0.018 230);
  --color-afterglow-400: oklch(0.78 0.12 198);
  --color-afterglow-500: oklch(0.68 0.13 198);

  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  --ease-cinematic: cubic-bezier(0.22, 1, 0.36, 1);
  --animate-reveal: reveal 700ms var(--ease-cinematic) both;

  @keyframes reveal {
    from { opacity: 0; transform: translateY(1.25rem); }
    to { opacity: 1; transform: translateY(0); }
  }
}
```

Global CSS defines selection, focus-visible, grain, media overlays, and the reduced-motion override. Components use utilities for normal layout rather than creating a second token system.

### Motion

- Hero entrance: image opacity/scale settles once over 900 ms; band name and action enter in a two-step stagger.
- Section reveal: a shared `Reveal` component uses one `IntersectionObserver`, adds a data state once, and never hides content before JavaScript initializes.
- Media interaction: artwork and video posters translate no more than 4 px while the accent edge brightens over 180–240 ms.
- Route transition: progressive enhancement with the View Transitions API when available; normal navigation remains immediate.
- Avoid a motion-library dependency at launch. CSS and a small hook cover the required interactions.
- Under `prefers-reduced-motion: reduce`, disable smooth scrolling, parallax, scale, stagger, and route transitions; render all content fully visible and retain only instant state changes.

## 4. Frontend implementation

### Proposed repository tree

```text
joshh.io/
├── .github/
│   └── workflows/
│       ├── checks.yml
│       └── deploy.yml
├── .githooks/
│   └── pre-commit
├── docs/
│   └── PLAN.md
├── infra/
│   ├── bin/
│   │   └── app.ts
│   ├── lib/
│   │   ├── ci-stack.ts
│   │   ├── config.ts
│   │   └── site-stack.ts
│   ├── test/
│   │   ├── ci-stack.test.ts
│   │   └── site-stack.test.ts
│   ├── cdk.json
│   ├── package.json
│   └── tsconfig.json
├── public/
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── og-default.jpg
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── assets/
│   │   ├── fonts/
│   │   └── images/
│   │       ├── gallery/
│   │       ├── hero/
│   │       └── releases/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── RouteAnnouncer.tsx
│   │   │   └── SiteLayout.tsx
│   │   ├── media/
│   │   │   ├── PhotoGallery.tsx
│   │   │   ├── SpotifyEmbed.tsx
│   │   │   └── YouTubeEmbed.tsx
│   │   └── ui/
│   │       ├── ExternalLink.tsx
│   │       ├── Reveal.tsx
│   │       └── SkipLink.tsx
│   ├── content/
│   │   ├── photos.ts
│   │   ├── releases.ts
│   │   ├── shows.ts
│   │   ├── site.ts
│   │   ├── tech.ts
│   │   ├── types.ts
│   │   └── videos.ts
│   ├── hooks/
│   │   ├── useReducedMotion.ts
│   │   └── useRouteFocus.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── MusicPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── PhotosPage.tsx
│   │   ├── ShowsPage.tsx
│   │   ├── TechPage.tsx
│   │   └── VideoPage.tsx
│   ├── router/
│   │   └── router.tsx
│   ├── styles/
│   │   └── index.css
│   ├── test/
│   │   ├── content.test.ts
│   │   ├── routing.test.tsx
│   │   └── setup.ts
│   ├── App.tsx
│   └── main.tsx
├── AGENTS.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

Images imported by TypeScript are processed and content-hashed by Vite. `public/` is reserved for stable-name crawl and platform files. The optional later S3 image evolution should be considered only if repository size or editorial frequency becomes a demonstrated problem.

### Content model

Use TypeScript modules rather than raw JSON at launch so imported images, URL template types, and `satisfies` checks remain available. Keep data plain and serializable.

```ts
export type AbsoluteUrl = `https://${string}`;
export type IsoDateTime = string;

export interface PlatformLinks {
  appleMusic?: AbsoluteUrl;
  bandcamp?: AbsoluteUrl;
}

export interface Release {
  slug: string;
  title: string;
  releaseDate: `${number}-${number}-${number}`;
  spotifyAlbumId: string;
  artwork: ImageAsset;
  summary?: string;
  links?: PlatformLinks;
  featured?: boolean;
}

// Derived, never stored — keeps the embed/link invariant by construction:
export const spotifyEmbedUrl = (albumId: string): AbsoluteUrl =>
  `https://open.spotify.com/embed/album/${albumId}`;
export const spotifyAlbumUrl = (albumId: string): AbsoluteUrl =>
  `https://open.spotify.com/album/${albumId}`;

export interface Show {
  id: string;
  startAt: IsoDateTime;
  endAt?: IsoDateTime;
  venue: string;
  city: string;
  region: string;
  billing?: string[];
  ticketUrl?: AbsoluteUrl;
  venueUrl?: AbsoluteUrl;
  status: "scheduled" | "sold-out" | "cancelled";
}

export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  poster: ImageAsset;
  publishedAt?: `${number}-${number}-${number}`;
  featured?: boolean;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  credit?: string;
}
```

Every show timestamp includes an explicit UTC offset, for example `2026-10-17T20:00:00-04:00`. A pure `partitionShows(shows, now)` function sorts scheduled future shows ascending and completed past shows descending. Passing `now` makes boundary behavior deterministic in tests. Cancelled shows remain visible with an explicit status until intentionally archived.

Release seed data starts from these verified identifiers:

```ts
export const releases = [
  { slug: "feathers", title: "Feathers", spotifyAlbumId: "6UfhFkIHodlG0kNF8I1TXC" },
  { slug: "partially-blind", title: "PARTIALLY BLIND", spotifyAlbumId: "2EWkRLlezZ5RuB5xw3Z2Bs" },
  {
    slug: "the-least-of-my-concerns",
    title: "The Least of My Concerns",
    spotifyAlbumId: "2a2Dz8i6AayYmmNvKAokTX",
  },
] satisfies Array<Omit<Release, "releaseDate" | "artwork">>;
```

Optional fields (`appleMusic`, `bandcamp`, `links`) are omitted, never set to `undefined` — the strict tsconfig enables `exactOptionalPropertyTypes`, under which an explicit `undefined` assignment is a type error. No Spotify URL is stored anywhere: the listen link and embed URL are both computed from `spotifyAlbumId`, so no stored/derived pair exists to drift; `PlatformLinks` holds only genuinely external, non-derivable destinations. The seed deliberately satisfies `Omit<Release, "releaseDate" | "artwork">` — it does not become `Release[]` until verified release dates and artwork land in Phase 3, and those fields must come only from verified source material, never invented. A content test must assert each `releaseDate`, once present, parses as a real `YYYY-MM-DD` calendar date, because the template-literal type alone also accepts values like `1e3-2-3`.

### Routing and component responsibilities

- Use `createBrowserRouter` with `SiteLayout` as the root route, explicit child routes, route-level lazy imports, and `NotFoundPage` as `path: "*"`.
- Register a root `errorElement` sharing the not-found page's quiet visual treatment, so a render error or failed lazy-chunk load (for example, a stale chunk right after a deployment) never yields a blank page. Cover it with a routing test.
- Keep shared navigation and footer mounted between route changes. Route modules own their visible content and metadata.
- `SpotifyEmbed` and `YouTubeEmbed` render a poster/consent control first. The iframe is created only after user activation, uses `loading="lazy"`, has a descriptive `title`, and provides a normal external link as fallback.
- Use `https://www.youtube-nocookie.com/embed/<id>` for embedded video. Do not autoplay audio or video.
- `PhotoGallery` uses native image dimensions to reserve space and an optional native-dialog lightbox only if it is fully keyboard and focus tested. Responsive `srcset` width variants and AVIF/WebP conversion are NOT something vanilla Vite provides (it only content-hashes imported files) — plan on `vite-imagetools` for build-time variants (a new dependency requiring Josh's approval before Phase 2) or, if declined, a committed pre-build image script. The hero and page-weight budgets in this section assume one of these mechanisms exists.
- `Reveal` is presentation-only. Semantic structure and reading order must remain correct without JavaScript or animation.
- External links visibly indicate that they leave the site and use safe `rel` values when opening a new tab. Do not force new tabs for normal navigation.

### SEO and metadata

- `index.html` carries only metadata React does not manage per route: theme color, default Open Graph/Twitter card fields, and icon links. It contains no `<title>` and no `<meta name="description">` — React 19 hoists component-rendered metadata into `<head>` but does not remove pre-existing static tags, so static copies would duplicate the route values and can mask them.
- `<title>`, `<meta name="description">`, and canonical `<link>` are rendered exclusively through React 19 document metadata from a typed route metadata object, without a head-management dependency. `SiteLayout` renders site defaults so every route — including not-found — always has exactly one title and description; route modules override them. Phase 2 acceptance includes verifying `document.title` changes per route.
- Canonical URLs always use the apex origin, for example `https://joshh.io/music`; query strings and `www` are excluded.
- Commit `robots.txt` and `sitemap.xml` for the six public routes. Update their tests when routes change.
- Use `MusicGroup`, `MusicAlbum`, `MusicEvent`, `VideoObject`, and `Person` JSON-LD only where verified content supports each field. Do not invent release dates, venues, employers’ claims, or social profiles.
- A static SPA cannot guarantee route-specific Open Graph previews for crawlers that do not execute JavaScript. Launch with a strong global OG image; treat build-time prerendering of route shells as a follow-up only if route-specific sharing is required.

### Accessibility

- Meet WCAG 2.2 AA for contrast, visible focus, keyboard order, labels, target size, and status communication.
- Provide a skip link, semantic headings/landmarks, `aria-current` navigation state, route-change focus management, and a polite route announcer.
- Require useful alt text for editorial images; use empty alt text for purely decorative crops. Display photographer credit when supplied.
- Caption video when a captioned source exists and provide clear external access to YouTube controls.
- Never rely on hover, color, glow, animation, or audio alone to communicate meaning.
- Test at 200% and 400% zoom, narrow reflow, forced colors, keyboard only, VoiceOver/Safari, and reduced-motion mode.

### Performance budget

Measure against a mid-tier mobile profile and production CloudFront build:

- Lab-measured targets using the Core Web Vitals thresholds: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.10. These are lab gates — no field/RUM collection exists at launch (see the analytics decision in section 9).
- Initial route JavaScript ≤ 160 KiB gzip; initial CSS ≤ 30 KiB gzip.
- Mobile hero source ≤ 250 KiB and desktop hero source ≤ 450 KiB, with AVIF/WebP plus a compatible fallback.
- Initial page transfer before user-requested embeds ≤ 900 KiB.
- Lighthouse launch targets: Performance ≥ 90 and Accessibility/Best Practices/SEO ≥ 95 on representative Home and Music builds.
- Preload only the LCP image and required font subset. Lazy-load below-fold route modules, images, and all third-party iframes.

## 5. Infrastructure

### CDK shape and stack boundaries

Follow the reference organization in `/Users/josh/projects/headchart/infra`: `bin/app.ts` composes stacks, `lib/config.ts` validates environment-derived configuration, and each stack lives in `lib/*-stack.ts`. Do not copy Headchart’s application-specific resources.

`infra/bin/app.ts` creates:

1. `JoshhIo-Site` in `us-east-1`: certificate, private site bucket, CloudFront distribution, DNS records, deployment custom resource, and operational alarm.
2. `JoshhIo-Ci` in the AWS account’s IAM region context: GitHub OIDC provider import/create decision and deployment role. This stack is deployed once from a trusted local session and is not included in routine GitHub `cdk deploy` commands.

`lib/config.ts` validates `CDK_DEFAULT_ACCOUNT`, fixes the region to `us-east-1`, and contains non-secret constants for domain, hosted zone ID, GitHub owner/repository, deployment branch, and GitHub environment. Use Zod as the repository convention requires; do not accept silent region drift. It also makes the OIDC-provider decision explicit configuration rather than a runtime lookup: a validated `githubOidcProvider` setting that is either `"create"` or `{ importArn: string }` (non-secret). IAM permits only one provider per issuer URL per account and synthesis must stay credential-free, so the create-vs-import choice cannot be discovered at synth time — check the account once during the local bootstrap session and record the result here. Infra tests cover both synthesis paths.

### `JoshhIo-Site` resources

- Import `route53.IHostedZone` with zone ID `Z09072841QGFCMDWIMTZ5` and zone name `joshh.io`.
- Create `acm.Certificate` in `us-east-1` with primary name `joshh.io`, subject alternative name `www.joshh.io`, and `CertificateValidation.fromDns(hostedZone)`.
- Create one S3 site bucket with S3-managed encryption, `BlockPublicAccess.BLOCK_ALL`, `enforceSSL: true`, no website endpoint, no public ACLs, and a production `RemovalPolicy.RETAIN`. Do not enable `autoDeleteObjects` in production.
- Use `origins.S3BucketOrigin.withOriginAccessControl(siteBucket)` so CloudFront signs origin requests through Origin Access Control. No bucket policy grants anonymous reads.
- Create a `cloudfront.Function` on `VIEWER_REQUEST` that returns a permanent redirect from host `www.joshh.io` to `https://joshh.io`, preserving path and query string. Apex is the canonical serving hostname. CloudFront Functions associate per cache behavior, so attach this function to every behavior (default and `/assets/*`) — otherwise `www.joshh.io/assets/...` would serve content without redirecting.
- Create a `cloudfront.Distribution` with both custom domain names, the ACM certificate, `defaultRootObject: "index.html"`, IPv6 enabled, HTTP/2 and HTTP/3, `ViewerProtocolPolicy.REDIRECT_TO_HTTPS`, `SecurityPolicyProtocol.TLS_V1_2_2021`, compressed responses, and a price class selected explicitly for expected audience geography.
- Add Route 53 `ARecord` and `AaaaRecord` aliases for both apex and `www`, all targeting the CloudFront distribution. `www` reaches CloudFront only to receive the canonical redirect.
- Add 403 and 404 custom error responses that return `/index.html` with status 200 and `errorCachingMinTtl`/TTL of zero (template tests assert the configured value; any small platform-enforced effective error-caching minimum is acceptable). This enables direct React Router navigation. The trade-off is that unknown direct paths receive HTTP 200 before the client renders `NotFoundPage`; route-specific server status and crawler-perfect metadata require later prerendering or edge routing.
- Add `BucketDeployment` from the built `dist/` directory with pruning enabled and `distributionPaths: ["/*"]`. This is the selected site artifact deployment path.
- Emit stack outputs for canonical URL, bucket name, distribution ID, distribution domain, and certificate ARN.

### Response headers and content security policy

Create custom `ResponseHeadersPolicy` resources rather than using a permissive managed CORS policy. Apply the same security posture to default and asset behaviors:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy` with a launch baseline equivalent to: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; frame-src https://open.spotify.com https://www.youtube-nocookie.com; connect-src 'self'; upgrade-insecure-requests`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` as defense in depth with `frame-ancestors 'none'`
- A restrictive `Permissions-Policy` that disables unused sensors/camera/microphone and allows only capabilities proven necessary for the selected Spotify/YouTube embeds.

Validate the final CSP against real Spotify and privacy-enhanced YouTube embeds before launch. Do not add `unsafe-eval`, wildcard frame origins, cross-origin isolation headers, or a permissive CORS policy. Cross-origin isolation can break third-party players.

**Inline-style caveat:** `style-src 'self'` blocks React inline `style` attributes (governed by `style-src-attr`), which the reveal-stagger pattern typically uses (`style={{ transitionDelay }}`). Decide this deliberately in Phase 2: either (a) implement staggers with CSS custom properties set via classes/data attributes and keep the strict policy, or (b) add `style-src-attr 'unsafe-inline'` (attribute-level only — far narrower than relaxing `style-src` for `<style>` elements) and record the exception. Do not discover this at launch verification.

### Caching

The selected `BucketDeployment` path keeps site files and infrastructure in one CloudFormation release, mirrors the Headchart stack shape, prunes stale hashed files, and lets CDK wait for invalidation. This is preferable at launch to scripting bucket/distribution discovery and coordinating a separate `aws s3 sync` release. The trade-off is a CloudFormation deployment for content-only changes, which is acceptable for this small, low-frequency site.

- Vite-generated `/assets/*` filenames are content hashed. Give that CloudFront behavior a one-year minimum/default/maximum TTL and return `Cache-Control: public, max-age=31536000, immutable`.
- The default behavior covers `index.html`, stable public files, and SPA fallbacks. Disable or sharply limit caching and override with `Cache-Control: no-cache, no-store, must-revalidate` so a deployment cannot strand clients on an old asset graph.
- `BucketDeployment` invalidates `/*` after upload. This is deliberately broad for launch correctness; revisit narrower invalidation only if deployment frequency or invalidation cost warrants it.
- Keep repository photos imported through Vite so they use the immutable `/assets/*` path. Stable OG and crawler files may revalidate through the default behavior.

### Observability and lifecycle

- Create a CloudWatch alarm on CloudFront 5xx error rate over a five-minute window with missing data treated as not breaching. Do not alarm on 4xx origin responses because SPA deep links intentionally cause an origin miss before fallback.
- Use standard CloudFront metrics at launch. Defer access logs until retention, privacy, and analysis ownership are decided; if enabled later, use a dedicated encrypted log bucket with a short lifecycle.
- Retain the site bucket and certificate on stack deletion. Distribution and DNS removal remain intentional infrastructure operations.
- Add tags for application, environment, repository, and managed-by to all taggable resources.

### `JoshhIo-Ci` and one-time bootstrap

The OIDC trust cannot be created by a workflow that already needs that trust. Perform these one-time steps from a trusted local AWS session:

1. Bootstrap CDK in account/`us-east-1` with a named qualifier or the standard modern bootstrap template.
2. Deploy `JoshhIo-Site` once so the certificate can validate and the distribution/DNS resources can settle.
3. Deploy `JoshhIo-Ci`, creating or importing the account-level `token.actions.githubusercontent.com` provider and creating the GitHub deployment role.
4. Record the role ARN as the non-secret GitHub environment variable `AWS_DEPLOY_ROLE_ARN`; record account/region as non-secret variables.
5. Configure the GitHub `production` environment to allow deployment only from `main` and optionally require manual approval for the first launch.

Before deploying `JoshhIo-Ci`, check once during the local bootstrap session whether the account already has the `token.actions.githubusercontent.com` provider, and record the outcome as the explicit `githubOidcProvider` setting in `lib/config.ts` — import by ARN if present, because IAM permits only one provider for the same issuer per account.

The role trust policy requires:

- Provider: `token.actions.githubusercontent.com`.
- Audience condition: `token.actions.githubusercontent.com:aud = sts.amazonaws.com`.
- Subject condition: `token.actions.githubusercontent.com:sub = repo:jjhickman/joshh.io:environment:production` (repository verified against the actual `origin` remote, `https://github.com/jjhickman/joshh.io.git`).
- No pull-request, tag, fork, or wildcard-repository subject.

The GitHub environment restriction supplies the `main` branch gate because GitHub’s OIDC subject uses the environment form when a job declares an environment. The role receives only the permissions needed to assume the specific CDK bootstrap lookup, file-publishing, and deployment roles. The CloudFormation execution role receives a reviewed policy for S3, CloudFront, ACM, Route 53 records in the known zone, IAM resources in `JoshhIo-Ci`, Lambda/custom-resource support required by `BucketDeployment`, CloudWatch alarms, and CloudFormation. Avoid permanent administrator policy after the initial policy is proven.

## 6. CI/CD

### Pull-request checks: `.github/workflows/checks.yml`

```yaml
name: Checks
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
concurrency:
  group: checks-${{ github.ref }}
  cancel-in-progress: true
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - checkout pinned to a full commit SHA, with fetch-depth 0 so gitleaks can scan the configured history/diff range
      - setup Node 20 with npm cache for root and infra lockfiles
      - run npm ci
      - run npm run check
      - run npm --prefix infra ci
      - run npm --prefix infra run check
      - run npm --prefix infra run cdk:synth
      - run npm run build
      - run npm run check:bundle (asserts the section 4 gzip budgets against dist/)
      - upload dist as a short-retention artifact for inspection
```

Root `npm run check` executes `audit:secrets`, `audit:deps`, `typecheck`, `lint`, then `test` — matching the monorepo convention, including the dependency audit with a documented failure threshold; the infra package exposes the same ordering. `audit:secrets` invokes gitleaks with a repository config and no secrets in workflow arguments. CDK synthesis uses no live lookups: account, region, zone ID, and domain are explicit configuration, so PRs do not receive AWS credentials.

### Production deployment: `.github/workflows/deploy.yml`

```yaml
name: Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: production
  cancel-in-progress: false
jobs:
  deploy:
    environment: production
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - checkout pinned to a full commit SHA
      - setup Node 20 with npm caches for root and infra
      - npm ci and npm --prefix infra ci
      - npm run check and npm --prefix infra run check
      - npm run build
      - configure AWS credentials with OIDC role, us-east-1, and a short session
      - npm --prefix infra run cdk:synth
      - npm --prefix infra run cdk:deploy -- JoshhIo-Site --require-approval never
      - smoke-check https://joshh.io and a deep route with bounded retries
```

- Pin all third-party actions by full commit SHA, including checkout, Node setup, artifact upload, and AWS credential configuration.
- The workflow never stores AWS access-key secrets. Only `id-token: write` is added to the deploy job.
- `BucketDeployment` uploads `dist/`, prunes stale files, and requests the CloudFront `/*` invalidation as part of `cdk deploy`; there is no second manual invalidation command.
- Do not deploy `JoshhIo-Ci` from GitHub. Changes to its trust or permissions require an explicit, locally authenticated bootstrap review.
- Protect `main` with the Checks workflow. The deploy job repeats checks because a production action should be self-contained and should not depend on timing between two workflows.
- Concurrency group `production` with `cancel-in-progress: false` protects an in-flight deployment, but GitHub retains only the newest pending run — rapid successive merges deploy only the latest commit. That is intentional here: every deployment ships the full current tree, so intermediate commits need no individual deployment.
- Retain CDK and CloudFormation outputs as the deployment record. Add a GitHub deployment summary containing commit SHA, stack ID, and canonical URL, but no credential material.

## 7. Testing strategy

### Static and unit tests

- Strict `tsc --noEmit` for frontend and infra projects.
- ESLint for React hooks, accessibility-sensitive JSX patterns, TypeScript, and ESM imports.
- Gitleaks on the full staged diff in the local pre-commit hook and on CI history/diff as configured.
- Vitest content tests for unique slugs/IDs, valid HTTPS links, release-date calendar validity, exactly one featured release/video, image dimensions/alt rules, complete-offset show timestamps, and stable show sorting around a supplied `now`.
- Vitest component tests with a DOM environment for navigation state, mobile menu keyboard behavior, route focus, reduced-motion visibility, embed consent/load behavior, external fallback links, and not-found routing.
- Route inventory tests keep the router, sitemap, nav, and canonical metadata map synchronized.

### Infrastructure tests

Use Vitest with `aws-cdk-lib/assertions` against synthesized templates. Assert:

- The S3 bucket blocks all public access, requires TLS, and is not a website bucket.
- The certificate covers apex plus `www` and uses DNS validation; the `us-east-1` requirement is asserted on the stack's environment, because region is stack metadata rather than a certificate template property.
- The distribution uses OAC, redirects HTTP, uses the required TLS policy, has both aliases, enables IPv6, and maps 403/404 to `/index.html` with zero error TTL.
- Apex and `www` each receive A and AAAA aliases.
- The `www`→apex viewer-request function is associated with every cache behavior.
- Security response headers include the exact Spotify and YouTube frame hosts without wildcard sources.
- `BucketDeployment` invalidates `/*` and the output set includes bucket/distribution identifiers.
- OIDC trust matches only the production environment subject and correct audience; no wildcard repository trust is synthesized.

### Build and browser verification

- Run a production Vite build in CI, then `npm run check:bundle` — a small repository script (no heavy tooling) that measures the gzipped entry chunks in `dist/` and fails the build when a section 4 budget is exceeded. Vite does not enforce budgets on its own.
- Inspect generated `dist/` for source maps, accidental environment files, missing stable crawl files, broken local asset references, and unexpected third-party origins.
- Before launch, run automated browser smoke tests against the deployed site for all routes, direct deep-link refresh, `www` redirect path/query preservation, iframe opt-in, keyboard navigation, and a missing route.
- Run accessibility checks with axe as a supplement, followed by manual VoiceOver, zoom/reflow, reduced-motion, and forced-colors checks. Automation is not the accessibility acceptance gate by itself.
- Test real Spotify and YouTube embeds in the deployed CSP. Do not mock these services in integration verification; when unavailable, report the external failure separately from site-shell behavior.

### Required local gates

Before merge or deployment:

1. `npm run check`
2. `npm run build`
3. `npm --prefix infra run check`
4. `npm --prefix infra run cdk:synth`
5. Review `git diff --check` and the synthesized infrastructure diff when AWS credentials are available.

## 8. Phased milestones

### Phase 1 — Repository scaffold

Work:

- Create the Vite React 19 strict TypeScript application, Tailwind v4 Vite integration, React Router shell, lint/test/build scripts, gitleaks hook, and repository `AGENTS.md`.
- Add placeholder routes and the two-package root/infra command layout.

Acceptance criteria:

- All seven route outcomes render through the shared layout and direct local URLs work.
- ESM and strict TypeScript are enabled; Node 20+ is enforced.
- `npm run check` and production build pass from a clean install.
- No page contains invented personal, band, release-date, show, or employer content.

### Phase 2 — Design foundation and home experience

Work:

- Implement tokens, self-hosted fonts, full-bleed hero, responsive shared nav/footer, reveal system, reduced-motion behavior, and base metadata.
- Stand up the responsive-image pipeline (`vite-imagetools` once the dependency is approved, or the committed pre-build image script).
- Add approved hero imagery and home section placeholders tied to typed content.

Acceptance criteria:

- Band identity and Josh’s guitarist role are unambiguous in the first viewport at desktop and mobile sizes.
- Header plus hero content fits common mobile heights without hiding the primary action.
- Keyboard, reduced-motion, contrast, and zoom checks pass.
- The hero meets its image and LCP budgets in a production build.
- `document.title` changes per route and no duplicate title/description tags exist.
- The stagger implementation is chosen (custom-property classes vs `style-src-attr 'unsafe-inline'`) and the resulting CSP decision is recorded in this plan.

### Phase 3 — Music and shows

Work:

- Add the three verified Spotify albums, click-to-load players, external link placeholders, typed show data, sorting, empty states, and the complete Music/Shows pages.

Acceptance criteria:

- All three exact album IDs produce the correct embed and outbound Spotify URL.
- Omitted Apple Music/Bandcamp links render no dead controls.
- Upcoming and past shows sort correctly across a fixed test clock and explicit offsets.
- Music remains usable when Spotify is blocked or declined because artwork, text, and external links remain present.

### Phase 4 — Video, photos, and quiet tech page

Work:

- Add approved YouTube IDs/posters, repository gallery images, captions/credits, responsive image output, and approved engineering copy.

Acceptance criteria:

- No YouTube request occurs before the visitor activates a player.
- Gallery images reserve layout space, have reviewed alt text, and stay within page-weight budgets.
- Tech appears last in navigation and receives no home-page visual treatment equal to a music section.
- All content and image usage rights are recorded or confirmed.

### Phase 5 — AWS infrastructure and CI

Work:

- Implement and test `JoshhIo-Site`, bootstrap CDK locally, deploy the initial certificate/distribution/DNS, implement `JoshhIo-Ci`, and add checks/deploy workflows.

Acceptance criteria:

- Certificate is issued in `us-east-1` for apex and `www` through hosted zone `Z09072841QGFCMDWIMTZ5`.
- S3 has no public path; CloudFront OAC can read it.
- Apex A/AAAA serve the SPA; `www` A/AAAA redirect to the equivalent apex path and query.
- A direct refresh on every route renders the SPA; an unknown route renders the application not-found state.
- GitHub can deploy from `main`/`production` through OIDC with no long-lived AWS keys.
- Synthesized infrastructure tests and workflow secret scans pass.

### Phase 6 — Content lock, hardening, and launch

Work:

- Replace remaining placeholders, validate CSP with live players, complete metadata/JSON-LD/sitemap and the full icon set (SVG + ICO favicons, apple-touch icon), run browser/accessibility/performance matrices, and execute the production deployment.

Acceptance criteria:

- No TBD link renders, and no unverified date, venue, credit, or biography claim ships.
- All route, accessibility, CSP, performance, security-header, redirect, and deep-link checks pass against CloudFront.
- The deployed commit, stack outputs, and smoke-test result are recorded in the workflow summary.
- Rollback is proven by redeploying the previous known-good Git commit through the same workflow.

## 9. Risks & open questions

### Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Strong imagery arrives late or lacks usage rights | The visual thesis cannot be achieved with decoration alone | Make hero/gallery selection and written permission a Phase 2 gate; ship fewer strong images rather than filler |
| Third-party embeds hurt privacy, CSP, and performance | Slower pages or blocked players | Click-to-load iframes, privacy-enhanced YouTube, explicit CSP hosts, external-link fallbacks, real deployed verification |
| SPA fallback returns HTTP 200 for unknown routes | Imperfect crawler semantics and social previews | Render an intentional client not-found page, maintain sitemap, use global OG at launch, evaluate prerendering only if route previews matter |
| Content timestamps drift or lack offsets | Shows move between upcoming and past at the wrong time | Require full offset timestamps and test partitioning with an injected clock |
| OIDC provider already exists in the AWS account | A second provider deployment fails | Detect and import the account-level provider before synthesizing `JoshhIo-Ci` |
| CDK execution permissions become broader than needed | Larger deployment blast radius | Separate CI and site stacks, scope OIDC subject, assume named bootstrap roles, review the CloudFormation execution policy, never deploy CI trust from CI |
| Broad `/*` invalidations become noisy | Slower or costlier frequent deployments | Accept for low-frequency launch updates; narrow only after measuring real deployment cadence |
| Large repository photos inflate clone/build size | Contributor and CI friction | Enforce image dimensions/weight, retain optimized masters elsewhere, consider S3 originals only after thresholds are exceeded |

### Content decisions required before launch

- Select and approve the hero performance photograph, its crop, photographer credit, and usage permission.
- Supply verified release dates, artwork, summaries, and the Apple Music/Bandcamp URLs that should become visible.
- Supply upcoming and representative past show records, including explicit time-zone offsets and ticket/venue URLs.
- Select YouTube videos, poster frames, titles, and any captions/transcripts to expose.
- Approve the short `/tech` biography and decide which professional/project links, if any, belong there.
- Decide which band social/streaming destinations appear in the nav/footer and whether any contact route is needed. No personal contact data should be added by default.
- Decide whether the site ships any analytics/RUM at launch. The default is none: the launch CSP (`connect-src 'self'`) permits no third-party collector, and no page-view or measurement code should exist until this decision changes.
- Decide whether one global social-share image is sufficient at launch. If route-specific link previews are required, add a build-time prerendering milestone before launch rather than pretending client metadata covers all crawlers.
- Confirm the GitHub `production` environment approval policy and the initial CloudFront price class based on the expected audience outside North America/Europe.

### Launch-evidence checklist

The implementation is ready to announce only when the production URL, apex/`www` behavior, certificate, CloudFront headers, all route refreshes, music/video embeds, keyboard/reduced-motion behavior, Core Web Vitals lab targets, OIDC deployment, and rollback path have each been verified against the deployed site rather than inferred from a green build.
