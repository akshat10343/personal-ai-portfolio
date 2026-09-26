import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BINS, histograms, N_BENIGN } from "../../lib/detect";
import { live } from "../../lib/live";
import { clamp01, ramp, smooth, story, timeline } from "../../lib/story";

/*
 * The stage behind the whole page: TinyLlama drawn as 22 layers of 8×8
 * blocks. Every block is one instance of a single InstancedMesh. Each scroll
 * position blends two shapes (see lib/story.ts for the list), some of which
 * are driven live by the interactive demos through lib/live.ts. A per-block
 * easing pass smooths every change, scroll-driven or live.
 */

const LAYERS = 22;
const GRID = 8;
const PER_LAYER = GRID * GRID;
const N = LAYERS * PER_LAYER; // 1408 blocks
const COLS = 44;
const ROWS = N / COLS; // 32 rows = 4 cache slots × 8
const INT8_SHRINK = 0.469; // the measured storage cut
const PROMPT_COLS = 8; // leftmost wall columns show the cached prompt

type Shape = { pos: Float32Array; scl: Float32Array };
const newShape = (): Shape => ({ pos: new Float32Array(N * 3), scl: new Float32Array(N * 3) });

function stackShape(gap: number, cell: number, size: number, thick: number): Shape {
  const s = newShape();
  for (let i = 0; i < N; i++) {
    const layer = Math.floor(i / PER_LAYER);
    const k = i % PER_LAYER;
    s.pos.set(
      [((k % GRID) - (GRID - 1) / 2) * cell, (layer - (LAYERS - 1) / 2) * gap, (Math.floor(k / GRID) - (GRID - 1) / 2) * cell],
      i * 3,
    );
    s.scl.set([size, thick, size], i * 3);
  }
  return s;
}

function wallShape(): Shape {
  const pitch = 0.16;
  const s = newShape();
  for (let i = 0; i < N; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const slot = Math.floor(row / 8);
    s.pos.set([(col - (COLS - 1) / 2) * pitch, -((row - (ROWS - 1) / 2) * pitch + (slot - 1.5) * 0.24), 0], i * 3);
    s.scl.set([0.128, 0.128, 0.07], i * 3);
  }
  return s;
}

/**
 * Rasterize a silhouette drawn in a 100×100 box and turn its pixels into
 * voxels, picking the finest resolution whose voxels still fit in N blocks.
 * Spare blocks shrink to nothing inside the shape. `meta` holds each voxel's
 * height in the shape (0 bottom → 1 top) for shading.
 */
function voxelShape(draw: (ctx: CanvasRenderingContext2D) => void, depth: number, size = 4.2) {
  const shape = newShape();
  const meta = new Float32Array(N);
  let pts: Array<[number, number]> = [];
  let res = 16;
  for (let r = 80; r >= 16; r -= 2) {
    const c = document.createElement("canvas");
    c.width = c.height = r;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.scale(r / 100, r / 100);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";
    draw(ctx);
    const data = ctx.getImageData(0, 0, r, r).data;
    const found: Array<[number, number]> = [];
    for (let y = 0; y < r; y++) for (let x = 0; x < r; x++) if (data[(y * r + x) * 4 + 3] > 127) found.push([x, y]);
    if (found.length * depth <= N) {
      pts = found;
      res = r;
      break;
    }
  }
  const pitch = size / res;
  const place = (i: number, [x, y]: [number, number], d: number, s: number) => {
    shape.pos.set([(x - res / 2 + 0.5) * pitch, -(y - res / 2 + 0.5) * pitch, (d - (depth - 1) / 2) * pitch], i * 3);
    shape.scl.set([s, s, s], i * 3);
    meta[i] = 1 - y / res;
  };
  let i = 0;
  for (let d = 0; d < depth; d++) for (const p of pts) place(i++, p, d, pitch * 0.84);
  for (let j = i; j < N; j++) place(j, pts[j % pts.length], 0, 0);
  return { shape, meta };
}

const DRAW = {
  shield(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(50, 4);
    ctx.lineTo(88, 18);
    ctx.lineTo(88, 48);
    ctx.bezierCurveTo(88, 74, 70, 90, 50, 97);
    ctx.bezierCurveTo(30, 90, 12, 74, 12, 48);
    ctx.lineTo(12, 18);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(31, 50);
    ctx.lineTo(45, 64);
    ctx.lineTo(70, 36);
    ctx.stroke();
  },
  bubble(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.roundRect(6, 12, 88, 60, 18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(24, 66);
    ctx.lineTo(18, 92);
    ctx.lineTo(46, 68);
    ctx.fill();
    ctx.globalCompositeOperation = "destination-out";
    for (const x of [30, 50, 70]) {
      ctx.beginPath();
      ctx.arc(x, 42, 6.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  sun(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(50, 50, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(50, 50);
    for (let k = 0; k < 8; k++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.roundRect(-4.5, -47, 9, 16, 4);
      ctx.fill();
    }
  },
  apple(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(37, 58, 27, 0, Math.PI * 2);
    ctx.arc(63, 58, 27, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(62, 17, 14, 6.5, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(47.5, 18, 5, 16);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(50, 30, 8, 0, Math.PI * 2);
    ctx.arc(50, 90, 6, 0, Math.PI * 2);
    ctx.fill();
  },
  monogram(ctx: CanvasRenderingContext2D) {
    ctx.font = '700 66px Geist, "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AK", 50, 54);
  },
};

function helixShape() {
  const shape = newShape();
  const meta = new Float32Array(N);
  const steps = N / 8; // two strands, 2×2 blocks per cross-section
  for (let i = 0; i < N; i++) {
    const strand = i % 2;
    const j = Math.floor(i / 2);
    const step = Math.floor(j / 4);
    const q = j % 4;
    const t = step / (steps - 1);
    const a = t * 5 * Math.PI + strand * Math.PI;
    const r = 1.25 + ((q & 1) - 0.5) * 0.12;
    shape.pos.set([Math.cos(a) * r, (t - 0.5) * 5.4 + ((q >> 1) - 0.5) * 0.12, Math.sin(a) * r], i * 3);
    shape.scl.set([0.105, 0.105, 0.105], i * 3);
    meta[i] = t;
  }
  return { shape, meta };
}

/** Decode tokens/s by stage, as four towers (same numbers as the chart). */
const TOWERS = [13.24, 1.21, 13.65, 2.28];
const TOWER_FOOT = 36; // 6×6 blocks per layer
const TOWER_K = Math.floor(N / TOWER_FOOT) / TOWERS.reduce((a, b) => a + b, 0);
const TOWER_H = TOWERS.map((v) => Math.max(1, Math.floor(v * TOWER_K)));
const TOWER_END = TOWER_H.map((_, t) => TOWER_H.slice(0, t + 1).reduce((a, b) => a + b, 0) * TOWER_FOOT);
const towerOf = (i: number) => {
  const t = TOWER_END.findIndex((end) => i < end);
  return t < 0 ? 3 : t;
};

/** Score bin of each block in the detector shape (filled with that shape). */
const detBin = new Int16Array(N);

/** Stack one class's flows into score columns, `depth` blocks deep. */
function laneInto(buf: Shape, offset: number, counts: number[], depth: number, z0: number, dir: number) {
  let i = offset;
  counts.forEach((c, b) => {
    for (let p = 0; p < c; p++, i++) {
      buf.pos.set([(b - (BINS - 1) / 2) * 0.11, -1.35 + Math.floor(p / depth) * 0.095, z0 + dir * (p % depth) * 0.1], i * 3);
      buf.scl.set([0.088, 0.082, 0.088], i * 3);
      detBin[i] = b;
    }
  });
}

/** Deterministic per-block noise in [0, 1). */
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const lin = (hex: string) => new THREE.Color(hex); // Color() converts sRGB hex to linear
const C = {
  off: lin("#19191d"),
  dim: lin("#26262c"),
  orange: lin("#ff9f0a"),
  white: lin("#fff3dc"),
  cool: lin("#64d2ff"),
  violet: lin("#bf5af2"),
  yellow: lin("#ffd60a"),
  green: lin("#30d158"),
  hot: lin("#ff453a"),
  silver: lin("#9ea2ae"),
  gray: lin("#55555c"),
};
const LANES = [C.orange, C.cool, C.violet, C.yellow];
/** Unlit block colors per theme: graphite on dark, brushed aluminum on light. */
const NEUTRALS = {
  dark: { off: lin("#19191d"), dim: lin("#26262c") },
  light: { off: lin("#c4c4cb"), dim: lin("#b1b1b9") },
};
const ICON_COLORS: Record<number, THREE.Color> = { 8: C.cool, 9: C.violet, 10: C.yellow, 11: C.green, 13: C.orange };

/** Group placement per shape; `m` scales it down on portrait screens. */
const P = (x: number, y: number, rx: number, ry: number, s: number, m: number) => ({ x, y, rx, ry, s, m });
const PLACE = [
  P(2.5, -0.25, 0.5, -0.62, 1.12, 0.95), // 0 stack
  P(2.45, -0.35, 0.46, -0.8, 0.64, 0.8), // 1 exploded
  P(2.5, -0.2, -0.05, -0.3, 0.68, 0.54), // 2 cache wall
  P(2.5, -0.2, -0.05, -0.3, 0.68, 0.54), // 3 batching
  P(2.5, -0.25, 0.5, -0.62, 1.12, 0.95), // 4 INT8
  P(2.95, -0.1, -0.05, -0.34, 0.52, 0.5), // 5 live scheduler
  P(2.95, -0.35, 0.52, -0.7, 0.9, 0.7), // 6 quant bars
  P(2.95, -0.2, 0.3, -0.5, 1.0, 0.64), // 7 detector
  P(2.9, 0, 0.05, -0.35, 0.85, 0.7), // 8 shield
  P(2.9, 0, 0.05, -0.35, 0.85, 0.7), // 9 bubble
  P(2.9, 0, 0.05, -0.35, 0.85, 0.7), // 10 sun
  P(2.9, 0, 0.05, -0.35, 0.85, 0.7), // 11 apple
  P(2.9, -0.1, 0.12, 0, 0.68, 0.62), // 12 helix
  P(2.75, 0, 0.05, -0.3, 0.82, 0.66), // 13 monogram
  P(3.0, 0.1, 0.32, -0.55, 0.95, 0.72), // 14 towers
];
const SPINS = [0, 4, 8, 9, 10, 11, 13];

type RGBG = [number, number, number, number];
function mixInto(out: RGBG, a: THREE.Color, b: THREE.Color, t: number, glow: number) {
  out[0] = a.r + (b.r - a.r) * t;
  out[1] = a.g + (b.g - a.g) * t;
  out[2] = a.b + (b.b - a.b) * t;
  out[3] = glow;
}

/** Quantized-bar column heights, from the live demo or a stand-in. */
function quantHeights(col: number) {
  const q = live.quant;
  const r = Math.floor(col / GRID);
  const c = col % GRID;
  if (!q) {
    const h = Math.round(4 + hash(col) * 16);
    return { orig: h, deq: h, neg: hash(col + 50) < 0.45, hover: false };
  }
  const k = LAYERS / q.maxAbs;
  return {
    orig: Math.round(Math.abs(q.w[r][c]) * k),
    deq: Math.round(Math.abs(q.deq[r][c]) * k),
    neg: q.w[r][c] < 0,
    hover: !!q.hover && q.hover[0] === r && q.hover[1] === c,
  };
}

function Blocks({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const smoothVh = useRef<number | null>(null);
  const primed = useRef(false);
  const { camera, size } = useThree();

  const S = useMemo(() => {
    const stack = stackShape(0.13, 0.26, 0.21, 0.085);
    const wall = wallShape();
    const icons: Record<number, { shape: Shape; meta: Float32Array }> = {
      8: voxelShape(DRAW.shield, 3),
      9: voxelShape(DRAW.bubble, 3),
      10: voxelShape(DRAW.sun, 3),
      11: voxelShape(DRAW.apple, 3),
      13: voxelShape(DRAW.monogram, 3, 4.6),
    };
    const helix = helixShape();
    const fixed: Record<number, Shape> = {
      0: stack,
      1: stackShape(0.3, 0.3, 0.22, 0.07),
      2: wall,
      3: wall,
      5: wall,
      12: helix.shape,
    };
    const meta: Record<number, Float32Array> = { 12: helix.meta };
    for (const [k, v] of Object.entries(icons)) {
      fixed[Number(k)] = v.shape;
      meta[Number(k)] = v.meta;
    }
    return { stack, fixed, meta, bufA: newShape(), bufB: newShape() };
  }, []);

  // Eased per-block state that the instance buffers are written from.
  const cur = useMemo(
    () => ({ pos: new Float32Array(N * 3), scl: new Float32Array(N * 3), col: new Float32Array(N * 3), glow: new Float32Array(N) }),
    [],
  );

  const { geometry, material, glow, delay } = useMemo(() => {
    const geometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.14);
    const glow = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
    glow.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aGlow", glow);
    const material = new THREE.MeshStandardMaterial({ color: "#ffffff", metalness: 0.55, roughness: 0.3, envMapIntensity: 0.9 });
    // Per-block emission, so lit blocks glow instead of just being bright.
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float aGlow;\nvarying float vGlow;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vGlow;")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor.rgb * vGlow;");
    };
    const delay = new Float32Array(N);
    for (let i = 0; i < N; i++) delay[i] = hash(i + 991);
    return { geometry, material, glow, delay };
  }, []);

  useEffect(() => {
    const m = mesh.current!;
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
    m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const a = m.instanceMatrix.array as Float32Array;
    for (let i = 0; i < N; i++) {
      a.fill(0, i * 16, i * 16 + 16);
      a[i * 16 + 15] = 1;
    }
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  /** Positions and scales of `shape`, filling `buf` for the shapes that move on their own. */
  const shapeOf = (shape: number, lp: number, buf: Shape): Shape => {
    if (S.fixed[shape]) return S.fixed[shape];
    if (shape === 4) {
      const f = 1 - INT8_SHRINK * smooth(lp);
      for (let j = 0; j < N * 3; j += 3) {
        buf.pos[j] = S.stack.pos[j];
        buf.pos[j + 1] = S.stack.pos[j + 1] * f;
        buf.pos[j + 2] = S.stack.pos[j + 2];
        buf.scl[j] = S.stack.scl[j];
        buf.scl[j + 1] = S.stack.scl[j + 1] * f;
        buf.scl[j + 2] = S.stack.scl[j + 2];
      }
    } else if (shape === 6) {
      // 8×8 matrix as bars: one column per weight, height = |value| in blocks.
      for (let i = 0; i < N; i++) {
        const col = i % PER_LAYER;
        const level = Math.floor(i / PER_LAYER);
        const h = quantHeights(col);
        const top = Math.max(h.orig, h.deq);
        const s = level < top ? 1 : 0;
        buf.pos.set([((col % GRID) - 3.5) * 0.42, -1.55 + Math.min(level, top) * 0.14, (Math.floor(col / GRID) - 3.5) * 0.42], i * 3);
        buf.scl.set([0.34 * s, 0.115 * s, 0.34 * s], i * 3);
      }
    } else if (shape === 7) {
      // Every flow stacked by its detector score: normal traffic in front, attacks behind.
      const { benign, attack } = histograms(live.detect.leaky);
      laneInto(buf, 0, benign, 3, 0.45, 1);
      laneInto(buf, N_BENIGN, attack, 7, 0.22, -1);
    } else if (shape === 14) {
      // Throughput towers grow in as the chapter scrolls.
      let i = 0;
      TOWER_H.forEach((height, t) => {
        const grown = height * clamp01(lp * 1.6);
        for (let level = 0; level < height; level++) {
          for (let b = 0; b < TOWER_FOOT; b++, i++) {
            buf.pos.set([(t - 1.5) * 1.35 + ((b % 6) - 2.5) * 0.17, -1.4 + level * 0.15, (Math.floor(b / 6) - 2.5) * 0.17], i * 3);
            const s = level < grown ? 1 : 0;
            buf.scl.set([0.15 * s, 0.13 * s, 0.15 * s], i * 3);
          }
        }
      });
      for (; i < N; i++) buf.scl.set([0, 0, 0], i * 3);
    }
    return buf;
  };

  /** Color + glow of block `i` in `shape`, given that shape's local progress. */
  const paint = (shape: number, i: number, lp: number, time: number, out: RGBG): void => {
    const h = hash(i);
    switch (shape) {
      case 0: {
        // Idle model: a few blocks flicker like activations.
        const k = h > 0.84 ? Math.pow(Math.max(0, Math.sin(time * 1.3 + h * 40)), 2) : 0;
        return mixInto(out, C.off, C.orange, k, 1.4 * k);
      }
      case 1: {
        // Forward pass: a hot band climbs the layers; computed layers stay warm.
        const d = Math.floor(i / PER_LAYER) - (lp * (LAYERS + 6) - 3);
        if (Math.abs(d) < 0.8) return mixInto(out, C.orange, C.white, 0.7, 2.4);
        if (d < 0) return mixInto(out, C.off, C.orange, 0.5 + 0.2 * h, 0.35);
        return mixInto(out, C.off, C.dim, h, 0);
      }
      case 2: {
        // KV cache: each slot's row fills token by token.
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const fill = lp * COLS * 1.08 - Math.floor(row / 8) * 1.5;
        if (col < fill - 1) return mixInto(out, C.off, C.orange, 0.72 + 0.28 * ((row % 8) / 7), 0.9);
        if (col < fill) return mixInto(out, C.orange, C.white, 0.8, 2.4);
        return mixInto(out, C.off, C.dim, 0.5 + 0.5 * h, 0);
      }
      case 3: {
        // Continuous batching: each lane admits a new request as the last ends.
        const col = i % COLS;
        const slot = Math.floor(Math.floor(i / COLS) / 8);
        const period = 2.4 + slot * 0.65;
        const u = time / period + slot * 0.31;
        const n = Math.floor(u);
        const len = 18 + ((n * 7 + slot * 5) % 24);
        const head = Math.min((u - n) * len * 1.3, len);
        const lane = LANES[(n + slot) % LANES.length];
        if (col < head - 1) return mixInto(out, C.off, lane, 0.85, 0.85);
        if (col < head && head < len) return mixInto(out, lane, C.white, 0.75, 2.4);
        if (col < len) return mixInto(out, C.off, lane, 0.12, 0.05);
        return mixInto(out, C.off, C.dim, 0.5 * h, 0);
      }
      case 4: {
        // INT8: silver FP32 blocks cool into orange, brightness snaps to fewer levels.
        const levels = 48 - 44 * lp;
        const b = Math.round((0.55 + 0.45 * h) * levels) / levels;
        mixInto(out, C.silver, C.orange, smooth(lp * 1.3), lp * 0.55);
        out[0] *= b;
        out[1] *= b;
        out[2] *= b;
        return;
      }
      case 5: {
        // The scheduler demo, live: one band of rows per cache slot.
        const b = live.batch;
        if (!b) return paint(3, i, lp, time, out);
        const col = i % COLS;
        const slot = Math.floor(Math.floor(i / COLS) / 8);
        const q = b.slots[slot];
        if (!q) {
          if (slot >= b.capacity) return mixInto(out, C.off, C.off, 0, 0);
          return mixInto(out, C.off, C.dim, 0.6 * h, 0);
        }
        if (q.phase === "prefill") {
          if (col < PROMPT_COLS * q.pre) return mixInto(out, C.off, C.yellow, 0.9, 0.9);
          if (col < PROMPT_COLS) return mixInto(out, C.off, C.yellow, 0.2, 0.05);
          return mixInto(out, C.off, C.dim, 0.5 * h, 0);
        }
        if (col < PROMPT_COLS) return mixInto(out, C.off, C.yellow, 0.45, 0.25);
        if (q.phase === "done") return mixInto(out, C.off, C.green, 0.85, 0.9);
        const g = (col - PROMPT_COLS + 1) / (COLS - PROMPT_COLS);
        const lane = LANES[q.id % LANES.length];
        if (g < q.gen - 0.03) return mixInto(out, C.off, lane, 0.85, 0.85);
        if (g < q.gen) return mixInto(out, lane, C.white, 0.75, 2.4);
        return mixInto(out, C.off, C.dim, 0.5 * h, 0);
      }
      case 6: {
        // Quantized bars: kept value in the weight's sign color, lost value in red.
        const col = i % PER_LAYER;
        const level = Math.floor(i / PER_LAYER);
        const q = quantHeights(col);
        const base = q.neg ? C.cool : C.orange;
        if (q.hover) return mixInto(out, base, C.white, 0.6, 2);
        if (level < Math.min(q.orig, q.deq)) return mixInto(out, C.off, base, 0.55 + 0.45 * (level / LAYERS), 0.55);
        return mixInto(out, C.off, C.hot, 0.9, 1.1);
      }
      case 7: {
        // Caught attacks green, missed attacks red, false alarms yellow,
        // passed traffic blue; the threshold column is edged in white.
        const t = live.detect.t;
        const flagged = detBin[i] >= t;
        const attack = i >= N_BENIGN;
        if (attack) mixInto(out, C.off, flagged ? C.green : C.hot, 0.8 + 0.2 * h, flagged ? 0.55 : 1.1);
        else if (flagged) mixInto(out, C.off, C.yellow, 0.9, 1.0);
        else mixInto(out, C.off, C.cool, 0.5 + 0.2 * h, 0.2);
        if (detBin[i] === t) {
          out[0] += (C.white.r - out[0]) * 0.45;
          out[1] += (C.white.g - out[1]) * 0.45;
          out[2] += (C.white.b - out[2]) * 0.45;
          out[3] += 0.8;
        }
        return;
      }
      case 12: {
        // Helix: one segment per role. The current role's segment burns
        // bright with a head sweeping through it; past roles stay warm.
        const t = S.meta[12][i];
        const n = live.roles;
        const cur = Math.min(n - 1, Math.floor(lp * n));
        const seg = Math.min(n - 1, Math.floor(t * n));
        const strand = i % 2 ? C.cool : C.orange;
        if (seg === cur) {
          if (Math.abs(t - Math.min(lp, 0.999)) < 0.012) return mixInto(out, strand, C.white, 0.7, 2.4);
          return mixInto(out, C.off, strand, 0.95, 1.3);
        }
        if (seg < cur) return mixInto(out, C.off, strand, 0.55, 0.3);
        return mixInto(out, C.off, strand, 0.12 + 0.1 * h, 0.04);
      }
      case 14: {
        // Towers: the KV-cache stage in accent, the HF reference in silver.
        const t = towerOf(i);
        const base = t === 2 ? C.orange : t === 0 ? C.silver : C.gray;
        return mixInto(out, C.off, base, 0.75 + 0.25 * h, t === 2 ? 0.9 : 0.15);
      }
      default: {
        // Icons and monogram: one hue, shaded by height, with a slow shimmer band.
        const m = S.meta[shape]?.[i] ?? 0.5;
        const band = Math.exp(-((m - ((time * 0.22) % 1.4) + 0.2) ** 2) * 60);
        mixInto(out, C.off, ICON_COLORS[shape] ?? C.orange, 0.45 + 0.5 * m, 0.45 + band * 1.6);
        out[0] += (C.white.r - out[0]) * band * 0.5;
        out[1] += (C.white.g - out[1]) * band * 0.5;
        out[2] += (C.white.b - out[2]) * band * 0.5;
      }
    }
  };

  const colA: RGBG = [0, 0, 0, 0];
  const colB: RGBG = [0, 0, 0, 0];
  const themeRef = useRef("");
  // Eased group placement, so nav jumps glide instead of snapping.
  const place = useRef<{ x: number; y: number; s: number; rx: number; ry: number } | null>(null);

  useFrame((state, dt) => {
    const m = mesh.current;
    const g = group.current;
    if (!m || !g || !m.instanceColor) return;

    // Swap the unlit block colors when the theme changes.
    const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    if (theme !== themeRef.current) {
      themeRef.current = theme;
      C.off.copy(NEUTRALS[theme].off);
      C.dim.copy(NEUTRALS[theme].dim);
    }

    // Ease toward the scroll position so the scrollbar feels attached, not
    // jerky. During a nav jump, go straight to the destination instead, and
    // let the per-block easing below carry every block there in one morph.
    const jumping = story.lock !== null || performance.now() - story.jumpAt < 1400;
    if (smoothVh.current === null || reduced || story.lock !== null) smoothVh.current = story.lock ?? story.vh;
    else smoothVh.current += (story.vh - smoothVh.current) * (1 - Math.exp(-dt * 7));
    const v = smoothVh.current;
    const time = reduced ? 1.7 : state.clock.elapsedTime;

    // Which two shapes are we between?
    const keys = timeline.keys;
    let k = 0;
    while (k < keys.length - 2 && v >= keys[k + 1].at) k++;
    const A = keys[k].shape;
    const B = keys[k + 1].shape;
    const T = A === B ? 0 : clamp01((v - keys[k].at) / (keys[k + 1].at - keys[k].at));
    const lp = (s: number) => (timeline.ranges[s] ? ramp(v, ...timeline.ranges[s]) : 0);
    const lpA = lp(A);
    const lpB = lp(B);
    const SA = shapeOf(A, lpA, S.bufA);
    const SB = A === B ? SA : shapeOf(B, lpB, S.bufB);

    // Blocks glide to their targets; the first frame snaps so nothing flies in from 0.
    const ease = reduced || !primed.current ? 1 : 1 - Math.exp(-dt * (jumping ? 3.5 : 12));
    primed.current = true;
    const mat = m.instanceMatrix.array as Float32Array;
    const col = m.instanceColor.array as Float32Array;
    const gl = glow.array as Float32Array;
    const { pos, scl } = cur;
    // On the light theme, glow washes colors toward white, so keep it subtle.
    const glowScale = theme === "light" ? 0.3 : 1;

    for (let i = 0; i < N; i++) {
      // Staggered morph: each block starts a little later than the last.
      const t = A === B ? 0 : smooth((T - delay[i] * 0.35) / 0.65);
      const j = i * 3;
      for (let a = 0; a < 3; a++) {
        pos[j + a] += (SA.pos[j + a] + (SB.pos[j + a] - SA.pos[j + a]) * t - pos[j + a]) * ease;
        scl[j + a] += (SA.scl[j + a] + (SB.scl[j + a] - SA.scl[j + a]) * t - scl[j + a]) * ease;
      }
      paint(A, i, lpA, time, colA);
      if (t > 0) paint(B, i, lpB, time, colB);
      for (let a = 0; a < 3; a++) {
        const target = t > 0 ? colA[a] + (colB[a] - colA[a]) * t : colA[a];
        cur.col[j + a] += (target - cur.col[j + a]) * ease;
      }
      cur.glow[i] += ((t > 0 ? colA[3] + (colB[3] - colA[3]) * t : colA[3]) - cur.glow[i]) * ease;

      const o = i * 16;
      mat[o] = scl[j];
      mat[o + 5] = scl[j + 1];
      mat[o + 10] = scl[j + 2];
      mat[o + 12] = pos[j];
      mat[o + 13] = pos[j + 1];
      mat[o + 14] = pos[j + 2];
      col[j] = cur.col[j];
      col[j + 1] = cur.col[j + 1];
      col[j + 2] = cur.col[j + 2];
      gl[i] = cur.glow[i] * glowScale;
    }
    m.instanceMatrix.needsUpdate = true;
    m.instanceColor.needsUpdate = true;
    glow.needsUpdate = true;

    // Place the whole object: right of the text on wide screens, above it on portrait ones.
    const aspect = size.width / size.height;
    const portrait = aspect < 0.95;
    const pA = PLACE[A];
    const pB = PLACE[B];
    const gt = smooth(T);
    const mix = (a: number, b: number) => a + (b - a) * gt;
    const weight = (s: number) => (A === s ? 1 - gt : 0) + (B === s ? gt : 0);
    const spinWeight = SPINS.reduce((acc, s) => acc + weight(s), 0);
    const spin = reduced ? 0 : Math.sin(time * 0.25) * 0.35 * spinWeight;
    const w12 = weight(12);
    const helixTurn = w12 * (lp(12) * Math.PI * 1.5 + (reduced ? 0 : time * 0.15));
    const target = {
      s: mix(pA.s, pB.s) * (portrait ? mix(pA.m, pB.m) : 1),
      x: portrait ? 0 : mix(pA.x, pB.x),
      // The helix slides so the current role's segment stays near the middle.
      y: (portrait ? 1.9 : mix(pA.y, pB.y)) - w12 * (lp(12) - 0.5) * 5.4 * 0.3 * mix(pA.s, pB.s),
      rx: mix(pA.rx, pB.rx),
      ry: mix(pA.ry, pB.ry) + spin + helixTurn,
    };
    const pl = (place.current ??= { ...target });
    const ge = reduced ? 1 : 1 - Math.exp(-dt * (jumping ? 3.5 : 14));
    for (const key of ["s", "x", "y", "rx", "ry"] as const) pl[key] += (target[key] - pl[key]) * ge;
    g.scale.setScalar(pl.s);
    g.position.set(pl.x, pl.y, 0);
    g.rotation.set(pl.rx + story.py * 0.06, pl.ry + story.px * 0.12, 0);

    const cam = camera as THREE.PerspectiveCamera;
    const z = portrait ? 11 + (1 - aspect) * 10 : 11;
    if (Math.abs(cam.position.z - z) > 0.01) {
      cam.position.z = z;
      cam.updateProjectionMatrix();
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[geometry, material, N]} frustumCulled={false} />
    </group>
  );
}

/** Faint dust for depth, drifting slowly behind the model. */
function Dust({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 700;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (hash(i * 3) - 0.5) * 30;
      pos[i * 3 + 1] = (hash(i * 3 + 1) - 0.5) * 18;
      pos[i * 3 + 2] = -4 - hash(i * 3 + 2) * 10;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  // A soft round sprite, so dust reads as specks rather than square pixels.
  const sprite = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.5, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  }, []);
  const mat = useRef<THREE.PointsMaterial>(null);
  useEffect(
    () => () => {
      geometry.dispose();
      sprite.dispose();
    },
    [geometry, sprite],
  );
  useFrame((_, dt) => {
    if (ref.current && !reduced) ref.current.rotation.y += dt * 0.012;
    if (mat.current) mat.current.color.set(document.documentElement.dataset.theme === "light" ? "#6e6e78" : "#8a8a92");
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial ref={mat} map={sprite} size={0.06} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

export default function EngineScene({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 11], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden
    >
      <Environment />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 6]} intensity={2.2} />
      <pointLight position={[-5, -3, 4]} intensity={40} distance={22} color="#ff9f0a" />
      <pointLight position={[6, 2, -3]} intensity={30} distance={22} color="#64d2ff" />
      <Dust reduced={reduced} />
      <Blocks reduced={reduced} />
    </Canvas>
  );
}
