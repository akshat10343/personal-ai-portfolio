# personal-ai-portfolio

Akshat Kansal's personal portfolio — a dark, glassmorphic single-page site
built with React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, and
Lucide icons.

## Quick start

```bash
npm install
npm run dev      # local dev server (http://localhost:5173)
npm run build    # typecheck + production bundle in dist/
npm run preview  # serve the production build locally
```

## Editing content

**All copy lives in [`src/content/site.ts`](src/content/site.ts).** Edit that
one file to change your name, links, projects, experiments, skills, goals,
and contact info — no component changes needed.

Content conventions used there:

- ⚠️ **Before deploying publicly:** the Nokia Bell Labs project is described
  in intentionally generalized terms (no internal dataset names), but the
  headline metrics (99.999% detection / 0.979 PR-AUC) still need manager
  sign-off. Remove them from `site.ts` if that sign-off doesn't come through.
- Unverified resume items (SQL, TypeScript, XGBoost, RAG, etc.) are
  deliberately excluded from the skills list until confirmed.
- The About card uses an "AK" monogram — swap in a real photo when ready.

## Interactive features

- **⌘K command palette** — fuzzy-search navigation, copy email, external links.
- **Interactive terminal** (hero) — after the intro types itself, visitors can
  run `help`, `whoami`, `projects`, `skills`, `contact`, `nids all`, `clear`,
  and `sudo hire akshat`. Commands live in `src/components/fx/Terminal.tsx`.
- **Detection playground** (Projects section) — a clearly-labeled simulation:
  synthetic flows stream past and "deploying the detector" classifies them
  live. Tune rates via the constants in `DetectionPlayground.tsx`.
- **Case-study modals** — click any project card; long-form content comes from
  each project's `details` block in `site.ts`.
- **Live GitHub card** (About) — fetches public repo/language data client-side,
  cached in sessionStorage for an hour; degrades to a plain link if the API
  is unreachable.

## Architecture

```
src/
  content/site.ts        ← every word on the site
  components/
    sections/            ← Hero, About, Projects, Experiments, Skills, Goals, Contact
    layout/              ← Navbar (glass pill + mobile overlay), Footer
    fx/                  ← Backdrop (aurora), NetworkGraph (canvas), Terminal, ScrollProgress
    ui/                  ← Section, Reveal, TiltCard, MagneticButton, Chip, BrandIcons
  hooks/useActiveSection ← IntersectionObserver-driven nav highlight
  lib/utils              ← cn() class joiner
```

Design system tokens (colors, fonts) are defined in `src/index.css` under
`@theme` — Tailwind v4 generates utilities from them (`text-bright`,
`bg-accent`, `font-display`, …).

## Accessibility & motion

Every animation respects `prefers-reduced-motion`: reveals render instantly,
the terminal prints without typing, and the network graph draws a single
static frame. Keyboard focus gets a visible cyan outline.
