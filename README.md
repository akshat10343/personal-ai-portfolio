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
  lib/story.ts            ← scroll timeline + shape list shared with the 3D scene
  lib/live.ts             ← state the interactive demos publish for the 3D to mirror
  lib/detect.ts           ← simulated detector scores + metrics (shared by demo and 3D)
  lib/theme.ts            ← dark/light switch (saved in localStorage)
  components/
    story/Stage           ← fixed 3D layer behind the whole page; measures chapters
    story/EngineScene     ← three.js scene (lazy-loaded): 1,408 instanced blocks, 15 shapes
    story/EngineStory     ← the pinned opening story: hero, captions, chapter rail
    play/                 ← BatchingPlayground, QuantizeLab, DetectorLab
    sections/             ← Hero, Play, Research, Projects, Experience, Contact
    ui/StageChapter       ← a chapter after the story: content left, `shape` for the 3D
    layout/               ← Header, Footer
  hooks/                  ← useActiveSection, useInView, useReducedMotion
```

### How the 3D stage works

One fixed canvas sits behind the whole page. The opening story is a tall
pinned section with fixed keyframes (in viewport heights, `lib/story.ts`).
After it, every element with `data-shape` is a chapter: `measureTimeline()`
turns each one's position into keyframes, so the model morphs to that
chapter's shape as it crosses the middle of the screen. It re-measures on
resize, font load, and any layout change (like a post expanding), so adding or
reordering chapters needs no timeline edits.

Every frame, `EngineScene` finds the two shapes it sits between, blends every
block's position, scale, color, and glow in one InstancedMesh (one draw call),
and eases each block toward its target so live changes glide.

Three shapes are live: the scheduler wall mirrors `BatchingPlayground`, the
3D bar chart mirrors `QuantizeLab`, and the detector histogram mirrors
`DetectorLab`. Each demo writes its state into `lib/live.ts`, and the scene
reads it every frame.

**Nav jumps:** `Stage` intercepts in-page link clicks. The page still scrolls,
but the scene is locked to the destination, so the model morphs straight from
its current shape to the target's instead of replaying every chapter between.
The lock releases when the scroll lands or the reader scrolls themselves.

The scene is code-split, so the text renders first, and if WebGL isn't
available the page keeps working without it.

## Interactive pieces

- **Continuous-batching simulator**: a toy scheduler with the real loop shape,
  labeled as a simulation, with pause and slot controls; the 3D wall is its
  four cache slots.
- **Quantize a weight matrix**: real symmetric quantization on an 8×8 matrix,
  2–8 bits, per-row vs. one scale, with live error stats; the 3D bars show
  kept vs. lost value.
- **Detector threshold + leak** (Bell Labs): ~1,400 simulated flows stacked by
  attack score. Drag the alert threshold, apply the 95%-recall rule, or leak
  the testbed columns back in and watch PR-AUC hit a suspicious 1.000. Metrics
  are computed live from the same counts the 3D draws.
- **Projects**: one chapter each, with the model forming each project's icon.
- **Posts**: expand inline, and `#post-<slug>` links open a post directly.

## Accessibility

Text meets 4.5:1 contrast, every control is keyboard-reachable with a visible
focus ring, there's a skip link, and captions stay in the DOM for screen
readers. `prefers-reduced-motion` turns off idle animation, drift, and slide-ins,
starts the simulator paused, and keeps the story strictly scroll-driven.
