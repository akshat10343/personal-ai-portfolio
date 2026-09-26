# personal-ai-portfolio

Akshat Kansal's personal site: a product-page-style portfolio where a 3D
model of his LLM inference engine takes itself apart as you scroll. Built with
React 19, Vite, TypeScript, Tailwind CSS v4, three.js / React Three Fiber, and
Lucide icons. Live at [akshat-kansal.vercel.app](https://akshat-kansal.vercel.app/).

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
  content/site.ts         ← every word and number on the site, including story chapters
  lib/story.ts            ← scroll timeline (in viewport heights) shared with the 3D scene
  components/
    story/EngineStory     ← pinned scroll section: hero, captions, chapter rail
    story/EngineScene     ← three.js scene (lazy-loaded): 1,408 instanced blocks
    play/                 ← BatchingPlayground, QuantizeLab, SwapDemo
    sections/             ← Hero, Play, Research, Projects, Experience, Contact
    layout/               ← Header, Footer
    ui/                   ← Chapter (section shell), BarChart, BrandIcons
  hooks/                  ← useActiveSection, useInView, useReducedMotion
```

### How the scroll story works

`EngineStory` is a tall section (`STORY_LENGTH` + 100 viewport heights) with a
sticky, full-screen stage. One rAF-throttled scroll handler writes the scroll
position into `story.vh` and fades captions directly through the DOM, so React
never re-renders while scrolling. `EngineScene` reads `story.vh` every frame,
finds the two formations it sits between in `FORMATION_KEYS`, and blends every
block's position, scale, color, and glow in a single InstancedMesh (one draw
call). Retune the timeline in `lib/story.ts` and the chapter ranges in
`site.ts` together.

The scene is code-split, so the text renders first. It stops rendering when the
story is off screen, and if WebGL isn't available the page keeps working
without it.

## Interactive pieces

- **Continuous-batching simulator**: a toy scheduler with the real loop shape,
  labeled as a simulation, with pause and slot controls.
- **Quantize a weight matrix**: real symmetric quantization on an 8×8 matrix,
  2–8 bits, per-row vs. one scale, with live error stats.
- **Spot the swapped dataset**: a replay of the row-count check from the post.
- **Project cards**: a swipeable rail with pointer-following tilt.
- **Posts**: expand inline, and `#post-<slug>` links open a post directly.

## Accessibility

Text meets 4.5:1 contrast, every control is keyboard-reachable with a visible
focus ring, there's a skip link, and captions stay in the DOM for screen
readers. `prefers-reduced-motion` turns off idle animation, drift, and slide-ins,
starts the simulator paused, and keeps the story strictly scroll-driven.
