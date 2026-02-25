# Writing Review Filter

Reusable filter for rejecting generic, cheesy, AI-sounding copy and preserving a specific, human voice.

## Why this exists

Design quality is not enough if the text sounds interchangeable. This site should read like a real engineer and musician wrote it, with concrete details and clear intent.

## Research Basis (authoritative sources)

- NN/g (2024-2025): AI web copy often becomes verbose, generic, and hard to scan without strict constraints.
- NN/g: UX writing quality depends on context-specific labels, clear microcontent, and descriptive links.
- GOV.UK Style Guide (updated 2026): prefer active voice, plain English, and concrete wording.
- PlainLanguage.gov / Digital.gov (2025): audience-first writing, short sentences, and iterative comprehension testing.
- Microsoft writing guidance (updated 2025): clear, warm, concise UI text; avoid robotic or boastful tone.
- W3C WCAG Understanding Readable: readability and clear language are accessibility requirements.
- Stanford HAI + arXiv evidence: AI detectors are unreliable and can be biased; use editorial review, not detector scores, to judge authenticity.
- Pattern mining from AI-site ecosystems (Wix AI examples, Framer AI starter copy, AI portfolio generators) shows strong template language repetition in personal sites.

Reference URLs:

- https://www.nngroup.com/articles/genai-write-for-the-web/
- https://www.nngroup.com/articles/ux-writing-study-guide/
- https://www.nngroup.com/articles/microcontent-how-to-write-headlines-page-titles-and-subject-lines/
- https://www.nngroup.com/articles/writing-links/
- https://www.gov.uk/guidance/style-guide/a-to-z
- https://digital.gov/guides/plain-language-guide-series/
- https://learn.microsoft.com/en-us/windows/apps/design/style/writing-style
- https://learn.microsoft.com/en-us/windows/win32/uxguide/text-style-tone
- https://www.w3.org/WAI/WCAG22/Understanding/readable
- https://hai.stanford.edu/news/ai-detectors-biased-against-non-native-english-writers
- https://arxiv.org/abs/2303.11156
- https://www.wix.com/blog/best-ai-website-examples
- https://www.framer.com/ai/

## Non-Negotiable Gate

Ask all three on every copy iteration:

1. Is this generic?
2. Is this cheesy or over-written?
3. Does this sound AI-generated?
4. Can every factual claim be verified right now from user-provided info, the repo, or a reliable source?
5. Is this saying more than needed?
6. Does this expose private/work details that do not need to be public on this page?

If the answer is yes to any of 1,2,3,5,6, or no to 4, fail the iteration and rewrite.

## Auto-Fail Signals

- Interchangeable startup language (`innovative`, `cutting-edge`, `passionate`, `solutions`).
- Abstract claims with no evidence (`high quality`, `world class`, `seamless`) and no concrete nouns.
- Long, clause-heavy sentences where the main point arrives late.
- Repetitive sentence templates and rhythm across sections.
- Vague CTAs or links (`learn more`, `click here`, `read more`) without destination clarity.
- Empty emotional posturing that does not map to real work, constraints, or outcomes.
- Unverified claims, future-state statements presented as current fact, or invented details.
- Resume-first or salesy voice that reads like LinkedIn optimization instead of a grounded personal identity.
- Sloganized identity equations (`X. Y. Z.`) or taglines that feel like ad copy.
- Explaining identity at length instead of letting project evidence carry it.

Portfolio-specific AI-copy fingerprints (auto-fail):

- Starter-portfolio phrasing like `Welcome to my portfolio`, `Here you can view my work`, `Get to know my skills and experience`.
- Template praise loops: `sleek`, `modern`, `innovative`, `professional`, `user-friendly` used without concrete evidence.
- Generic identity lines that could describe anyone (`passionate builder`, `driven engineer`, `creating impactful solutions`).
- CTA vagueness or template CTA reuse (`Learn more`, `Explore`, `Discover`) with no destination intent.
- Symmetrical sentence rhythm across sections that feels generated rather than authored.

## Linguistic Red Flags (Soft Signals)

These do not prove AI on their own, but repeated appearance should trigger rewrite.

- Transition padding: repeated `furthermore`, `moreover`, `in addition`, `additionally`.
- Empty intensifiers: `very`, `really`, `highly`, `world-class`, `cutting-edge`.
- Abstract noun stacks: `innovation`, `excellence`, `impact`, `transformation` without artifacts.
- Intro-heavy paragraphs where the answer arrives in the final sentence.
- Repetitive three-part slogan cadence across multiple sections.
- Sentence patterns that sound performative (`not X, but Y`) when plain phrasing would do.
- Over-corrected clipped cadence that reads robotic or passive-aggressive.

## De-AI Rewrite Method (Required)

1. Replace adjectives with artifacts (`robust platform` -> `shared API used by X teams`).
2. Lead with the point in sentence one; move context after it.
3. Collapse one paragraph by at least 30% word count.
4. Replace at least one generic noun per block (`work`, `solutions`, `projects`) with a specific noun.
5. Ensure each section has one concrete detail that could not belong to a random template.
6. Re-run gates and score before presenting.
7. Delete one sentence per section if the meaning still survives.
8. Read each block out loud; if it sounds staged, rewrite it plain.

## Scoring Rubric (0-2 each, 24 max)

1. Voice Authenticity (sounds like Joshua, not a template)
2. Specificity (real nouns, tools, domains, outputs)
3. Concreteness (claims tied to evidence or examples)
4. Clarity (main point obvious on first read)
5. Brevity (tight sentence length, no filler)
6. Scanability (short blocks, meaningful headings, list clarity)
7. Tone Control (confident, grounded, not hypey)
8. Distinctiveness (not interchangeable with generic portfolio copy)
9. Accessibility (plain language, explained terms, no jargon dump)
10. CTA Quality (clear action with destination intent)
11. Consistency (terminology and voice consistent across sections)
12. User Value (helps visitor decide what to do next)
13. Non-Template Voice (cannot be mistaken for AI starter portfolio copy)
14. Restraint (copy is minimal, private, and not over-explained)

Truthfulness precondition:

- Any unverified factual claim => fail

Thresholds:

- Any auto-fail signal => fail
- Score < 20 => fail
- Score 20-24 => iterate once more before review
- Score >= 25 with no auto-fail => ready for human review

## Iteration Loop (Required)

1. Draft with concrete nouns first (tools, artifacts, outcomes, constraints).
2. Remove slogan language and unsupported adjectives.
3. Replace vague links/CTAs with destination-specific wording.
4. Shorten sentence structure and front-load the point.
5. Run the non-negotiable gate and scoring rubric.
6. Rework until it passes, then review in context on desktop and mobile.

## Front-Page Limits

- No employer names in homepage hero/body unless explicitly requested.
- Hero supporting copy max: 2 short sentences.
- Primary CTA labels: 1-2 words preferred.
- If work cards already prove a point, remove explanatory paragraph text.

## joshh.io Voice Constraints

- Keep both identities visible: engineer and musician.
- Prefer exact language over polished hype.
- Use plain, direct wording; keep lyricism controlled and intentional.
- Show process, tradeoffs, and real outputs whenever possible.
- Do not optimize for sales or SEO voice unless explicitly requested.
