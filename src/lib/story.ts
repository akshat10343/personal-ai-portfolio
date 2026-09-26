/**
 * Shared state for the scroll-driven engine story.
 *
 * Every position is measured in viewport heights (vh) scrolled past the top
 * of the story section, so the timeline behaves the same on any screen. The
 * scroll handler writes `story.vh`; the 3D scene reads it every frame, which
 * keeps React out of the per-frame path.
 */
export const story = {
  vh: 0,
  /** Pointer position in [-1, 1], for a little parallax. */
  px: 0,
  py: 0,
};

/** Total scroll length of the pinned section, in vh (plus one screen of stick). */
export const STORY_LENGTH = 620;

/** Formation keyframes: the scene holds each shape, then morphs to the next. */
export const FORMATION_KEYS = [
  { at: 0, shape: 0 }, // stacked model
  { at: 70, shape: 0 },
  { at: 135, shape: 1 }, // exploded layers
  { at: 225, shape: 1 },
  { at: 270, shape: 2 }, // KV-cache wall
  { at: 345, shape: 2 },
  { at: 380, shape: 3 }, // batching lanes (same wall, new coloring)
  { at: 460, shape: 3 },
  { at: 500, shape: 4 }, // INT8-compressed stack
  { at: 620, shape: 4 },
] as const;

/** Where each shape's own animation (pulse, fill, compression) runs. */
export const LOCAL_RANGES: Record<number, [number, number]> = {
  1: [135, 225],
  2: [270, 345],
  3: [380, 460],
  4: [500, 575],
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** 0 → 1 as `v` moves from `a` to `b`. */
export const ramp = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
