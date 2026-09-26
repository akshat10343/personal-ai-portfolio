# personal-ai-portfolio

Akshat Kansal's personal site: a fast, single-page portfolio built with
React 19, Vite, TypeScript, Tailwind CSS v4, and Lucide icons. Live at
[akshat-kansal.vercel.app](https://akshat-kansal.vercel.app/).

## Quick start

```bash
npm install
npm run dev      # local dev server (http://localhost:5173)
npm run build    # typecheck + production bundle in dist/
npm run preview  # serve the production build locally
```

## Editing content

**All copy lives in [`src/content/site.ts`](src/content/site.ts).** Edit that
one file to change your name, links, projects, experience, posts, toolbox,
and contact info. No component changes needed.

To add a résumé button, put the PDF in `public/` and set `identity.resumeUrl`
(for example `"/Akshat_Kansal_Resume.pdf"`). The hero and contact section pick
it up automatically.

## Architecture

```
src/
  content/site.ts         ← every word and number on the site
  components/
    layout/               ← Header (nav + theme toggle), Footer
    sections/             ← Hero, Work, BatchingPlayground, Experience, Writing, Toolbox, Contact
    ui/                   ← Section (numbered layout), BarChart, BrandIcons
  hooks/                  ← useActiveSection (nav highlight), useInView
  lib/                    ← theme toggle, cn() class joiner
```

Design tokens (colors, fonts) live in `src/index.css` under `@theme`. Light is
the default token set and `:root[data-theme="dark"]` overrides it; Tailwind v4
generates utilities from them (`bg-bg`, `text-muted`, `text-accent`, …).

## Interactive pieces

- **Continuous-batching simulator** (Work section): a toy scheduler with the
  same loop shape as the real engine. It's labeled as a simulation, runs only
  while on screen, and has a pause control.
- **Benchmark charts**: horizontal bars with the value printed beside each
  one, drawn from the numbers in `site.ts`.
- **Posts**: expand inline, and `#post-<slug>` links open a post directly.

## Accessibility

Text meets 4.5:1 contrast in both themes, every control is keyboard-reachable
with a visible focus ring, there's a skip link, and `prefers-reduced-motion`
disables transitions and starts the simulator paused.
