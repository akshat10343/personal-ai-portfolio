import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FORMATION_KEYS, LOCAL_RANGES, clamp01, ramp, smooth, story } from "../../lib/story";

/*
 * The "product" of the story: TinyLlama drawn as 22 layers of 8×8 blocks.
 * Every block is one instance of a single InstancedMesh, and each scroll
 * position blends two formations (stack, exploded, cache wall, batching
 * lanes, compressed stack) per instance, with a small per-block delay so the
 * morphs ripple instead of moving as one slab.
 */

const LAYERS = 22;
const GRID = 8;
const PER_LAYER = GRID * GRID;
const N = LAYERS * PER_LAYER; // 1408 blocks
const COLS = 44;
const ROWS = N / COLS; // 32 rows = 4 cache slots × 8
const INT8_SHRINK = 0.469; // the measured storage cut

type Shape = { pos: Float32Array; scl: Float32Array };

function stackShape(gap: number, cell: number, size: number, thick: number): Shape {
  const pos = new Float32Array(N * 3);
  const scl = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const layer = Math.floor(i / PER_LAYER);
    const k = i % PER_LAYER;
    pos[i * 3] = ((k % GRID) - (GRID - 1) / 2) * cell;
    pos[i * 3 + 1] = (layer - (LAYERS - 1) / 2) * gap;
    pos[i * 3 + 2] = (Math.floor(k / GRID) - (GRID - 1) / 2) * cell;
    scl[i * 3] = size;
    scl[i * 3 + 1] = thick;
    scl[i * 3 + 2] = size;
  }
  return { pos, scl };
}

function wallShape(): Shape {
  const pitch = 0.16;
  const tile = 0.128;
  const slotGap = 0.24;
  const pos = new Float32Array(N * 3);
  const scl = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const slot = Math.floor(row / 8);
    pos[i * 3] = (col - (COLS - 1) / 2) * pitch;
    pos[i * 3 + 1] = -((row - (ROWS - 1) / 2) * pitch + (slot - 1.5) * slotGap);
    pos[i * 3 + 2] = 0;
    scl[i * 3] = tile;
    scl[i * 3 + 1] = tile;
    scl[i * 3 + 2] = 0.07;
  }
  return { pos, scl };
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
  silver: lin("#9ea2ae"),
};
const LANES = [C.orange, C.cool, C.violet, C.yellow];

/** Group placement per shape; `m` scales it down on portrait screens. */
const PLACE = [
  { x: 2.5, y: -0.25, rx: 0.5, ry: -0.62, s: 1.12, m: 0.95 },
  { x: 2.45, y: -0.35, rx: 0.46, ry: -0.8, s: 0.64, m: 0.8 },
  { x: 2.5, y: -0.2, rx: -0.05, ry: -0.3, s: 0.68, m: 0.54 },
  { x: 2.5, y: -0.2, rx: -0.05, ry: -0.3, s: 0.68, m: 0.54 },
  { x: 2.5, y: -0.25, rx: 0.5, ry: -0.62, s: 1.12, m: 0.95 },
];

type RGBG = [number, number, number, number];

function mixInto(out: RGBG, a: THREE.Color, b: THREE.Color, t: number, glow: number) {
  out[0] = a.r + (b.r - a.r) * t;
  out[1] = a.g + (b.g - a.g) * t;
  out[2] = a.b + (b.b - a.b) * t;
  out[3] = glow;
}

/** Color + glow of block `i` in `shape`, given that shape's local progress. */
function paint(shape: number, i: number, lp: number, time: number, out: RGBG) {
  const h = hash(i);
  if (shape === 0) {
    // Idle model: a few blocks flicker like activations.
    const k = h > 0.84 ? Math.pow(Math.max(0, Math.sin(time * 1.3 + h * 40)), 2) : 0;
    mixInto(out, C.off, C.orange, k, 1.4 * k);
  } else if (shape === 1) {
    // Forward pass: a hot band climbs the layers; computed layers stay warm.
    const layer = Math.floor(i / PER_LAYER);
    const d = layer - (lp * (LAYERS + 6) - 3);
    if (Math.abs(d) < 0.8) mixInto(out, C.orange, C.white, 0.7, 2.4);
    else if (d < 0) mixInto(out, C.off, C.orange, 0.5 + 0.2 * h, 0.35);
    else mixInto(out, C.off, C.dim, h, 0);
  } else if (shape === 2) {
    // KV cache: each slot's row fills token by token.
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const slot = Math.floor(row / 8);
    const fill = lp * COLS * 1.08 - slot * 1.5;
    if (col < fill - 1) mixInto(out, C.off, C.orange, 0.72 + 0.28 * ((row % 8) / 7), 0.9);
    else if (col < fill) mixInto(out, C.orange, C.white, 0.8, 2.4);
    else mixInto(out, C.off, C.dim, 0.5 + 0.5 * h, 0);
  } else if (shape === 3) {
    // Continuous batching: each lane admits a new request as the last ends.
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const slot = Math.floor(row / 8);
    const period = 2.4 + slot * 0.65;
    const u = time / period + slot * 0.31;
    const n = Math.floor(u);
    const len = 18 + ((n * 7 + slot * 5) % 24);
    const head = Math.min((u - n) * len * 1.3, len);
    const lane = LANES[(n + slot) % LANES.length];
    if (col < head - 1) mixInto(out, C.off, lane, 0.85, 0.85);
    else if (col < head && head < len) mixInto(out, lane, C.white, 0.75, 2.4);
    else if (col < len) mixInto(out, C.off, lane, 0.12, 0.05);
    else mixInto(out, C.off, C.dim, 0.5 * h, 0);
  } else {
    // INT8: silver FP32 blocks cool into orange, brightness snaps to fewer levels.
    const levels = 48 - 44 * lp;
    const b = Math.round((0.55 + 0.45 * h) * levels) / levels;
    mixInto(out, C.silver, C.orange, smooth(lp * 1.3), lp * 0.55);
    out[0] *= b;
    out[1] *= b;
    out[2] *= b;
  }
}

function Blocks({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const smoothVh = useRef<number | null>(null);
  const { camera, size } = useThree();

  const shapes = useMemo(() => {
    const stack = stackShape(0.13, 0.26, 0.21, 0.085);
    const wall = wallShape();
    return {
      stack,
      list: [stack, stackShape(0.3, 0.3, 0.22, 0.07), wall, wall] as Shape[],
      int8: { pos: new Float32Array(N * 3), scl: new Float32Array(N * 3) } as Shape,
    };
  }, []);

  const { geometry, material, glow, delay } = useMemo(() => {
    const geometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.14);
    const glow = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
    glow.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aGlow", glow);
    const material = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      metalness: 0.55,
      roughness: 0.3,
      envMapIntensity: 0.9,
    });
    // Per-block emission, so lit blocks glow instead of just being bright.
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float aGlow;\nvarying float vGlow;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vGlow;")
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vColor.rgb * vGlow;",
        );
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

  const colA: RGBG = [0, 0, 0, 0];
  const colB: RGBG = [0, 0, 0, 0];

  useFrame((state, dt) => {
    const m = mesh.current;
    const g = group.current;
    if (!m || !g || !m.instanceColor) return;

    // Ease toward the scroll position so the scrollbar feels attached, not jerky.
    if (smoothVh.current === null || reduced) smoothVh.current = story.vh;
    else smoothVh.current += (story.vh - smoothVh.current) * (1 - Math.exp(-dt * 7));
    const v = smoothVh.current;
    const time = reduced ? 1.7 : state.clock.elapsedTime;

    // Which two shapes are we between?
    let k = 0;
    while (k < FORMATION_KEYS.length - 2 && v >= FORMATION_KEYS[k + 1].at) k++;
    const A = FORMATION_KEYS[k].shape;
    const B = FORMATION_KEYS[k + 1].shape;
    const span = FORMATION_KEYS[k + 1].at - FORMATION_KEYS[k].at;
    const T = A === B ? 0 : clamp01((v - FORMATION_KEYS[k].at) / span);
    const lp = (s: number) => (LOCAL_RANGES[s] ? ramp(v, ...LOCAL_RANGES[s]) : 0);
    const lpA = lp(A);
    const lpB = lp(B);

    // The compressed stack depends on how far the INT8 chapter has run.
    if (A === 4 || B === 4) {
      const f = 1 - INT8_SHRINK * smooth(lp(4));
      const { pos, scl } = shapes.stack;
      const out = shapes.int8;
      for (let j = 0; j < N * 3; j += 3) {
        out.pos[j] = pos[j];
        out.pos[j + 1] = pos[j + 1] * f;
        out.pos[j + 2] = pos[j + 2];
        out.scl[j] = scl[j];
        out.scl[j + 1] = scl[j + 1] * f;
        out.scl[j + 2] = scl[j + 2];
      }
    }
    const shapeOf = (s: number) => (s === 4 ? shapes.int8 : shapes.list[s]);
    const SA = shapeOf(A);
    const SB = shapeOf(B);

    const mat = m.instanceMatrix.array as Float32Array;
    const col = m.instanceColor.array as Float32Array;
    const gl = glow.array as Float32Array;

    for (let i = 0; i < N; i++) {
      // Staggered morph: each block starts a little later than the last.
      const t = A === B ? 0 : smooth((T - delay[i] * 0.35) / 0.65);
      const j = i * 3;
      const o = i * 16;
      mat[o] = SA.scl[j] + (SB.scl[j] - SA.scl[j]) * t;
      mat[o + 5] = SA.scl[j + 1] + (SB.scl[j + 1] - SA.scl[j + 1]) * t;
      mat[o + 10] = SA.scl[j + 2] + (SB.scl[j + 2] - SA.scl[j + 2]) * t;
      mat[o + 12] = SA.pos[j] + (SB.pos[j] - SA.pos[j]) * t;
      mat[o + 13] = SA.pos[j + 1] + (SB.pos[j + 1] - SA.pos[j + 1]) * t;
      mat[o + 14] = SA.pos[j + 2] + (SB.pos[j + 2] - SA.pos[j + 2]) * t;

      paint(A, i, lpA, time, colA);
      if (t > 0) {
        paint(B, i, lpB, time, colB);
        col[j] = colA[0] + (colB[0] - colA[0]) * t;
        col[j + 1] = colA[1] + (colB[1] - colA[1]) * t;
        col[j + 2] = colA[2] + (colB[2] - colA[2]) * t;
        gl[i] = colA[3] + (colB[3] - colA[3]) * t;
      } else {
        col[j] = colA[0];
        col[j + 1] = colA[1];
        col[j + 2] = colA[2];
        gl[i] = colA[3];
      }
    }
    m.instanceMatrix.needsUpdate = true;
    m.instanceColor.needsUpdate = true;
    glow.needsUpdate = true;

    // Place the whole object: to the right of the text on wide screens,
    // above the caption on portrait ones.
    const aspect = size.width / size.height;
    const portrait = aspect < 0.95;
    const pA = PLACE[A];
    const pB = PLACE[B];
    const gt = smooth(T);
    const mix = (a: number, b: number) => a + (b - a) * gt;
    const spinWeight = (A === 0 ? 1 - gt : 0) + (B === 0 ? gt : 0) + (A === 4 ? 1 - gt : 0) + (B === 4 ? gt : 0);
    const spin = reduced ? 0 : Math.sin(time * 0.25) * 0.35 * spinWeight;
    const scale = mix(pA.s, pB.s) * (portrait ? mix(pA.m, pB.m) : 1);
    g.scale.setScalar(scale);
    g.position.set(portrait ? 0 : mix(pA.x, pB.x), portrait ? 1.9 : mix(pA.y, pB.y), 0);
    g.rotation.set(
      mix(pA.rx, pB.rx) + story.py * 0.06,
      mix(pA.ry, pB.ry) + spin + story.px * 0.12,
      0,
    );

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
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, dt) => {
    if (ref.current && !reduced) ref.current.rotation.y += dt * 0.012;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.035} color="#8a8a92" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
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

export default function EngineScene({ active, reduced }: { active: boolean; reduced: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
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
