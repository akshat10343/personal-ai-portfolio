import { useEffect, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { live } from "../../lib/live";
import { cn } from "../../lib/utils";

const SIZE = 8;

/** Small seeded PRNG so "New weights" is repeatable per seed. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gaussian-ish weights, with one large outlier per row the way real layers have them. */
function makeWeights(seed: number) {
  const rand = mulberry32(seed);
  const normal = () => {
    const u = Math.max(rand(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  return Array.from({ length: SIZE }, (_, r) => {
    const rowScale = 0.25 + rand() * 0.9;
    const row = Array.from({ length: SIZE }, () => normal() * 0.3 * rowScale);
    if (rand() < 0.5) row[Math.floor(rand() * SIZE)] *= 3.2 + r * 0.1;
    return row;
  });
}

/** Symmetric quantization: one scale per row (per-channel) or one for all. */
function quantize(w: number[][], bits: number, perChannel: boolean) {
  const qmax = 2 ** (bits - 1) - 1;
  const absMax = (xs: number[]) => Math.max(...xs.map(Math.abs), 1e-12);
  const tensorScale = absMax(w.flat()) / qmax;
  return w.map((row) => {
    const scale = perChannel ? absMax(row) / qmax : tensorScale;
    return row.map((x) => {
      const q = Math.max(-qmax, Math.min(qmax, Math.round(x / scale)));
      return { q, deq: q * scale, scale };
    });
  });
}

/** Diverging fill: cool for negative, orange for positive. */
function cellColor(v: number, max: number) {
  const k = Math.min(1, Math.abs(v) / max);
  const hue = v < 0 ? "var(--color-cool)" : "var(--color-accent)";
  return `color-mix(in oklab, ${hue} ${Math.round(12 + k * 88)}%, #111114)`;
}

/**
 * Real quantization math on a toy 8×8 weight matrix: the same symmetric,
 * per-channel scheme the engine uses, at whatever bit width you pick. The 3D
 * stage draws the same matrix as bars and mirrors every change.
 */
export function QuantizeLab() {
  const [seed, setSeed] = useState(7);
  const [bits, setBits] = useState(8);
  const [perChannel, setPerChannel] = useState(true);
  const [hover, setHover] = useState<[number, number] | null>(null);

  const w = useMemo(() => makeWeights(seed), [seed]);
  const q = useMemo(() => quantize(w, bits, perChannel), [w, bits, perChannel]);

  const flat = w.flat();
  const maxAbs = Math.max(...flat.map(Math.abs));
  const errs = w.flatMap((row, r) => row.map((x, c) => Math.abs(x - q[r][c].deq)));
  const meanErr = errs.reduce((a, b) => a + b, 0) / errs.length;
  const norm = Math.sqrt(flat.reduce((a, x) => a + x * x, 0));
  const relErr = Math.sqrt(errs.reduce((a, e) => a + e * e, 0)) / norm;
  const levels = 2 ** bits - 1;

  useEffect(() => {
    live.quant = { w, deq: q.map((row) => row.map((x) => x.deq)), maxAbs, hover };
  }, [w, q, maxAbs, hover]);

  const [hr, hc] = hover ?? [0, 0];
  const cell = q[hr][hc];

  return (
    <div className="rounded-3xl border border-line bg-surface/90 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-faint">Interactive · real math</p>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-bg px-3.5 text-xs font-medium transition-colors hover:border-faint"
        >
          <Shuffle size={13} aria-hidden />
          New weights
        </button>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <figure onMouseLeave={() => setHover(null)}>
          <div
            className="grid aspect-square w-full gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
          >
            {q.map((row, r) =>
              row.map((x, c) => (
                <div
                  key={`${r}-${c}`}
                  onMouseEnter={() => setHover([r, c])}
                  className={cn(
                    "rounded-[3px] transition-[background-color] duration-300",
                    hover && hover[0] === r && hover[1] === c && "ring-2 ring-fg",
                  )}
                  style={{ background: cellColor(x.deq, maxAbs) }}
                />
              )),
            )}
          </div>
          <figcaption className="mt-2 font-mono text-[11px] text-faint">hover a weight</figcaption>
        </figure>

        <div className="min-w-0 space-y-4">
          <div>
            <label htmlFor="bits" className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-muted">Bit width</span>
              <span className="font-mono text-2xl font-semibold tabular-nums">
                INT{bits}
                <span className="ml-1.5 text-xs font-normal text-faint">{levels} levels</span>
              </span>
            </label>
            <input
              id="bits"
              type="range"
              min={2}
              max={8}
              step={1}
              value={bits}
              onChange={(e) => setBits(Number(e.target.value))}
              className="mt-2 w-full cursor-pointer accent-[var(--color-accent)]"
            />
          </div>
          <div role="group" aria-label="Scaling" className="inline-flex flex-wrap rounded-full border border-line bg-bg p-1 text-xs">
            {[
              { v: true, label: "Scale per row" },
              { v: false, label: "One scale" },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                aria-pressed={perChannel === o.v}
                onClick={() => setPerChannel(o.v)}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1.5 font-medium transition-colors",
                  perChannel === o.v ? "bg-fg text-bg" : "text-muted hover:text-fg",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
        {[
          ["vs FP32", `${(32 / bits).toFixed(1)}× smaller`],
          ["mean error", meanErr.toFixed(4)],
          ["relative error", `${(relErr * 100).toFixed(2)}%`],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col-reverse bg-bg px-3 py-2.5">
            <dt className="mt-0.5 text-[11px] text-muted">{k}</dt>
            <dd className="font-mono text-base font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 rounded-xl bg-bg px-3 py-2.5 font-mono text-[11px] leading-relaxed text-muted">
        {hover ? (
          <>
            w[{hr},{hc}] = {w[hr][hc].toFixed(4)} → q = {cell.q} × {cell.scale.toFixed(5)} ={" "}
            <span className="text-fg">{cell.deq.toFixed(4)}</span>
          </>
        ) : (
          "Each 3D bar is one weight. Red is the value rounding threw away."
        )}
      </p>
    </div>
  );
}
