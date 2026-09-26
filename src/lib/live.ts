/**
 * State the interactive demos publish for the 3D stage to mirror. Each demo
 * writes its latest snapshot here; the scene reads it every frame. Plain
 * mutable objects on purpose: no React renders in the animation path.
 */
export type LiveSlot = {
  id: number;
  phase: "queued" | "prefill" | "decode" | "done";
  /** Prefill progress, 0..1. */
  pre: number;
  /** Share of the completion decoded so far, 0..1. */
  gen: number;
} | null;

export const live = {
  batch: null as null | { capacity: number; slots: LiveSlot[] },
  quant: null as null | {
    w: number[][];
    deq: number[][];
    maxAbs: number;
    hover: [number, number] | null;
  },
  /** Step of the swapped-dataset replay: 0 downloaded, 1 flagged, 2 swapped, 3 pinned. */
  swap: 0,
};
