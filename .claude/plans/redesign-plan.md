# Landing page redesign — "Digital business card" handoff

## Context

The handoff bundle from `claude.ai/design` redesigns the existing landing page as a premium digital business card. The current page is structured as three vertically stacked full-height sections (animated "Max Kachimov" header → `HireMeImpact` metrics cards → `ResumePreview` PDF embed). The new design replaces all of that with a single dense layout: topbar, animated wordmark in a hero, a Resume CTA card next to a Contact card, and a footer.

The chat transcript in the bundle confirms the intent — a recruiter-facing digital business card. The user has explicitly opted to:

- **Skip Selected Work.** The design's `work.jsx` section is not implemented.
- **Keep the wordmark font.** "Max Kachimov" stays in `Skyer Monolite` (current font) and the existing `.title-gradient` colors — do NOT switch to the design's "Skyer / Sora / Instrument Serif" stack on the wordmark itself.
- **Repurpose the existing intro animation.** Today the wordmark animates from screen-center (scale 1.4) into a fixed top-left header. The new behavior: the wordmark stays on the main page — it animates from its current centered/scaled start into its in-flow hero position (i.e., it stays in the hero, never docks to a header). Once that finishes, the rest of the page (topbar, kicker, tagline, CTA + Contact cards, footer) fades in.
- **Remove both `HireMeImpact` and `ResumePreview`** entirely — the design replaces them.
- **Add three new env vars** for the additional contact links.

## Files to modify / add

### `src/Hero.tsx` (rename of `src/Header.tsx`)

- Rename the file's exported component to `Hero` and reflect what it represents.
- Keep the same Framer Motion entrance pattern (initial center/scale 1.4 → final settled), but the **final state is the hero's in-flow position**, not `position: fixed; top: 2%; left: 2%`. While animating, the wordmark is `position: fixed` and centered; on completion, switch to in-flow (`position: static` / remove fixed) inside the hero section so it occupies its natural place in the layout.
- Keep `fontFamily: "'Skyer Monolite', sans-serif"`, `.title-gradient` class, and the same gradient colors (`#702727 → #04717D → #17A370`).
- Remove the inline LinkedIn icon next to the wordmark — the design moves all social links into the Contact card.
- Add the new hero markup *around* the animated wordmark (rendered after the animation completes, via `showContent` parent state):
  - `.kicker` line above: *"Software engineer, building **quietly reliable** systems in fintech & medtech."* (`em` styled via Instrument Serif italic)
  - `.tagline` line below: `Software Engineer · Remote · EU/US · ` *Available Q3*
- `font-size` of the wordmark in the final state should be the responsive clamp from the design (`clamp(40px, 8.4vw, 124px)`) so it reads as the page centerpiece, not a 2rem header.

### `src/Topbar.tsx` (new)

- Plain functional component.
- Left: `M.K — 2026` (mono, uppercase, letter-spaced — use existing Skyer Monolite font with `letter-spacing: 0.18em`).
- Right: pulsing green dot + `Open to opportunities` (`.dot-status` with `pulse` keyframes from design CSS).
- Right-meta hidden under 720px breakpoint.

### `src/Contact.tsx` (new)

Contains the CTA row that replaces both removed sections:

- `ResumeCard`: heading "Resume / CV", body copy from design, two buttons — primary `Download CV (PDF)` (link to `import.meta.env.VITE_PDF_URL`, with `download` attribute) and ghost `View online` (same `VITE_PDF_URL`, `target="_blank"`). Inline SVG icons (`IconDownload`, `IconArrow`) ported verbatim from `contact.jsx`.
- `ContactCard`: "Elsewhere" label, list of links. Build the list dynamically from env vars — render an item only if its env var is defined:
  - `VITE_EMAIL` → `mailto:` link, label "Email"
  - `VITE_LINKEDIN_URL` → label "LinkedIn"
  - `VITE_GITHUB_URL` → label "GitHub"
  - `VITE_X_URL` → label "X"
- Inline SVG icons (`IconMail`, `IconLinkedIn`, `IconGithub`, `IconX`, `IconArrow`) ported from `contact.jsx`.
- Mobile: cards stack at `max-width: 720px` (handled in CSS).

### `src/Footer.tsx` (new, inline in `App.tsx` is fine too)

- Left: `Kachimov.com` (mono).
- Right: `© <year> Max Kachimov`.
- Top border, mono small-caps style per design `.footer`.

### `src/App.tsx`

- Drop imports of `HireMeImpact`, `ResumePreview`, and the metrics/resume `ref` + `scrollToNext` logic + the scroll-arrow `motion.div`. The whole page is one screen now, no scroll target.
- Drop the `useScroll` / `headerOpacity` transform (no more shrinking header).
- New layout, wrapped in a `<main className="page">` per the design:
  1. `<Background />` (kept as-is — already renders behind everything with z-index 0).
  2. `<main className="page">` (z-index 1) containing:
     - `<Topbar />` (only after `showContent`)
     - `<Hero onAnimationComplete={...} />` — always rendered; renders kicker + tagline only when `showContent` is true
     - `<Contact />` (only after `showContent`)
     - `<Footer />` (only after `showContent`)
- `showContent` is set true via the hero's `onAnimationComplete`, same hook point as today.
- Background should render from the start (today it waits for `showContent`) so the animated gradient is visible during the wordmark animation — matches the design's intent that the background is part of the page DNA. **Decision: render `<Background />` immediately**, not gated behind `showContent`.

### `src/App.css`

- Keep `@font-face` for Skyer Monolite and the `.title-gradient` rule unchanged.
- Remove the `.page.animation-in-progress { overflow: hidden; height: 100vh }` rule — no longer needed since the wordmark doesn't dock to a fixed header.
- Add the design's layout styles (from `styles.css` in the bundle): `.page`, `.topbar`, `.dot-status`, `.dot`, `@keyframes pulse`, `.hero`, `.kicker`, `.wordmark` (but **without** the design's `font-family` / `background: var(--grad-text)` rules — our wordmark keeps Skyer Monolite + `.title-gradient`), `.tagline`, `.cta-row`, `.cta-card`, `.cta-card .glow`, `.btn`, `.btn-primary`, `.btn-ghost`, `.contact-card`, `.contact-link`, `.footer`, and the `@media (max-width: 720px)` block.
- Add CSS custom properties from the design (`--c-ink`, `--c-ink-dim`, `--c-ink-faint`, `--c-line`, `--c-line-strong`, etc.) on `:root`.
- The `body` background stays `#0c0202` (existing) — the design uses `#050505`; close enough that I'll leave the existing color for visual continuity with the gradient background unless it clashes.

### `index.html`

- Add Google Fonts link for `Instrument Serif` (italic) — used by the kicker's `em` and the tagline's `em`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  ```
- Title can stay as-is.

### `.env.example`

Add three new keys:
```
VITE_EMAIL=
VITE_GITHUB_URL=
VITE_X_URL=
```
(Don't touch `.env` — that's user-owned with real values.)

### Files to delete

- `src/HireMeImpact.tsx`
- `src/ResumePreview.tsx`
- `src/Header.tsx` (replaced by `src/Hero.tsx`)

(Their imports are removed from `App.tsx` in the change above.)

### Files to keep untouched

- `src/Background.tsx`, `src/Background.css` — gradient animation stays exactly as today.
- `src/constants/iconPaths.ts` — `LINKEDIN_LOGO` still useful as a data URL alternative, but we're switching to inline SVGs from the design for visual consistency across all five icons. It becomes unused — delete the file too.
- `src/main.tsx` — entry point doesn't change.
- `public/`, `vite.config.js`, `tsconfig.json` — no changes.

## Reused existing utilities

- `Background` component — drop in unchanged.
- `.title-gradient` CSS class — applied to the wordmark to preserve the existing color treatment.
- `Skyer Monolite` `@font-face` and `.logo-font` rule — kept.
- Framer Motion `motion.div` animation hooks — pattern reused, just retargeted.

## Verification

1. Start the dev server (`npm run dev`) and load the page in the preview tool.
2. On first load, confirm the gradient background renders behind the wordmark, the wordmark starts centered and scaled, then settles into its hero position. The wordmark stays in the hero (not docked to top-left).
3. After the animation completes, confirm the topbar, kicker line, tagline, Resume CTA card, Contact card, and footer all fade/appear in their correct positions.
4. Confirm the wordmark renders in **Skyer Monolite** with the existing red/blue/teal gradient (not the design's font).
5. With all four env vars set, confirm Email / LinkedIn / GitHub / X links appear in the Contact card with correct hrefs. With only `VITE_LINKEDIN_URL` set, confirm only LinkedIn appears.
6. Click `Download CV (PDF)` — it should download `VITE_PDF_URL`. Click `View online` — opens the PDF in a new tab.
7. Resize the preview to 720px wide: the CTA row stacks, the topbar's right meta hides, the footer wraps. Wordmark scales down via the responsive `clamp`.
8. No "Selected Work" section anywhere on the page.
9. No leftover `HireMeImpact` metrics or `ResumePreview` PDF embed.
10. Console has no errors (use `preview_console_logs`).
