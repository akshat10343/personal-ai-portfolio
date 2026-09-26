/**
 * Shared state for the scroll-driven 3D stage.
 *
 * Positions are measured in viewport heights (vh) scrolled from the top of the
 * page, so the timeline behaves the same on any screen. The scroll handler
 * writes `story.vh`; the 3D scene reads it every frame, which keeps React out
 * of the per-frame path.
 */
export const story = {
  vh: 0,
  /** Pointer position in [-1, 1], for a little parallax. */
  px: 0,
  py: 0,
  /**
   * Set while a nav click scrolls the page: the scene shows this position
   * straight away instead of following the scroll through every chapter.
   */
  lock: null as number | null,
  /** When the last nav jump started (performance.now()), for a softer morph. */
  jumpAt: -1e9,
};

/** Scroll length of the pinned engine story, in vh (plus one screen of stick). */
export const STORY_LENGTH = 620;

export type Key = { at: number; shape: number };

/*
 * Shapes:
 *  0 stacked model        5 live scheduler wall     10 sun (SolarSave)
 *  1 exploded layers      6 live quantized bars     11 apple (Calorie Counter)
 *  2 KV-cache wall        7 detector histogram      12 double helix (experience)
 *  3 batching lanes       8 shield (Tomshield)      13 "AK" monogram (contact)
 *  4 INT8 stack           9 chat bubble (NLP)       14 throughput towers
 */

/** The pinned story's keyframes: hold each shape, then morph to the next. */
const STORY_KEYS: Key[] = [
  { at: 0, shape: 0 },
  { at: 70, shape: 0 },
  { at: 135, shape: 1 },
  { at: 225, shape: 1 },
  { at: 270, shape: 2 },
  { at: 345, shape: 2 },
  { at: 380, shape: 3 },
  { at: 460, shape: 3 },
  { at: 500, shape: 4 },
];

/** Where each story shape's own animation (pulse, fill, compression) runs. */
const STORY_RANGES: Record<number, [number, number]> = {
  1: [135, 225],
  2: [270, 345],
  3: [380, 460],
  4: [500, 575],
};

export const timeline = {
  keys: [...STORY_KEYS, { at: 1e9, shape: 4 }] as Key[],
  ranges: { ...STORY_RANGES } as Record<number, [number, number]>,
};

/**
 * After the story, every element marked `data-shape` becomes a chapter of the
 * stage: its shape holds while the element crosses the middle of the screen,
 * and morphs in from the previous chapter's shape around its top edge.
 * Re-run whenever layout changes (resize, fonts, a post expanding).
 */
export function measureTimeline() {
  const vh = window.innerHeight / 100;
  const keys: Key[] = [...STORY_KEYS];
  const ranges = { ...STORY_RANGES };
  let prev = 4;
  for (const el of document.querySelectorAll<HTMLElement>("[data-shape]")) {
    const r = el.getBoundingClientRect();
    const start = (r.top + window.scrollY) / vh - 50;
    const end = (r.bottom + window.scrollY) / vh - 50;
    const shape = Number(el.dataset.shape);
    if (shape !== prev) {
      keys.push({ at: start - 22, shape: prev }, { at: start + 14, shape });
    }
    const [s0] = ranges[shape] ?? [start];
    ranges[shape] = [Math.min(s0, start), end];
    prev = shape;
  }
  keys.push({ at: 1e9, shape: prev });
  keys.sort((a, b) => a.at - b.at);
  timeline.keys = keys;
  timeline.ranges = ranges;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** 0 → 1 as `v` moves from `a` to `b`. */
export const ramp = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
