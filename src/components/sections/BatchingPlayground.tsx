import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Cpu, RotateCcw, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/utils";
import { Odometer } from "../ui/Odometer";
import { Reveal } from "../ui/Reveal";

const TICK_MS = 150;
const SLOTS = 4;
const PREFILL_TICKS = 4;
const ARRIVE_MIN = 5;
const ARRIVE_MAX = 12;
const MAX_QUEUE = 5;

/** Canned prompt/completion pairs; completions stream word by word. */
const CORPUS = [
  {
    prompt: "Why is a KV cache useful?",
    completion:
      "It keeps every prior key and value around, so each new token only projects itself once.",
  },
  {
    prompt: "Explain RoPE in one line.",
    completion:
      "Rotate queries and keys by their absolute position so attention sees relative offsets.",
  },
  {
    prompt: "What is continuous batching?",
    completion:
      "Admit new requests into freed cache slots between decode steps instead of waiting for the whole batch.",
  },
  {
    prompt: "Why was INT8 slower here?",
    completion:
      "The portable path dequantizes before every matmul, so storage shrinks but latency grows.",
  },
  {
    prompt: "What is grouped-query attention?",
    completion:
      "Thirty-two query heads share four K/V heads, which shrinks the cache eight-fold.",
  },
  {
    prompt: "When is batch 16 a bad idea?",
    completion:
      "When padding and wide matmuls saturate the CPU and throughput collapses below batch one.",
  },
] as const;

type Phase = "queued" | "prefill" | "decode";

type Req = {
  id: number;
  prompt: string;
  tokens: string[];
  emitted: number;
  prefillLeft: number;
  phase: Phase;
  slot: number | null;
  queuedTick: number;
  admittedTick: number | null;
};

type Sim = {
  tick: number;
  nextId: number;
  nextArrival: number;
  capacity: 1 | 4;
  reqs: Req[]; // queued + in-flight
  tokensOut: number;
  completed: number;
  waitTicks: number[]; // queued→admitted, for avg wait
};

const r = (n: number) => Math.floor(Math.random() * n);

function newReq(id: number, tick: number): Req {
  const c = CORPUS[id % CORPUS.length];
  return {
    id,
    prompt: c.prompt,
    tokens: c.completion.split(" "),
    emitted: 0,
    prefillLeft: PREFILL_TICKS,
    phase: "queued",
    slot: null,
    queuedTick: tick,
    admittedTick: null,
  };
}

function initialSim(capacity: 1 | 4): Sim {
  // Start mid-story: two requests already decoding so the panel is never dead.
  const a = { ...newReq(0, 0), phase: "decode" as Phase, slot: 0, emitted: 4, admittedTick: 0, prefillLeft: 0 };
  const b = { ...newReq(1, 0), phase: capacity > 1 ? ("decode" as Phase) : ("queued" as Phase), slot: capacity > 1 ? 1 : null, emitted: capacity > 1 ? 2 : 0, admittedTick: capacity > 1 ? 0 : null, prefillLeft: capacity > 1 ? 0 : PREFILL_TICKS };
  return {
    tick: 0,
    nextId: 2,
    nextArrival: ARRIVE_MIN,
    capacity,
    reqs: [a, b],
    tokensOut: 6,
    completed: 0,
    waitTicks: [],
  };
}

/** One scheduler step, mirroring the real engine's loop: decode all active
 *  requests, release the finished, admit the queued into freed slots. */
function step(s: Sim): Sim {
  const tick = s.tick + 1;
  let { nextId, nextArrival, tokensOut, completed } = s;
  const waitTicks = [...s.waitTicks];
  let reqs = s.reqs.map((q) => ({ ...q }));

  // 1. decode / prefill every active request
  for (const q of reqs) {
    if (q.slot === null) continue;
    if (q.phase === "prefill") {
      q.prefillLeft -= 1;
      if (q.prefillLeft <= 0) q.phase = "decode";
    } else if (q.phase === "decode" && Math.random() > 0.12) {
      q.emitted += 1;
      tokensOut += 1;
    }
  }

  // 2. release finished requests
  reqs = reqs.filter((q) => {
    const finished = q.phase === "decode" && q.emitted >= q.tokens.length;
    if (finished) completed += 1;
    return !finished;
  });

  // 3. admit queued requests into free slots
  const used = new Set(reqs.filter((q) => q.slot !== null).map((q) => q.slot));
  for (let slot = 0; slot < s.capacity; slot++) {
    if (used.has(slot)) continue;
    const nextUp = reqs.find((q) => q.phase === "queued");
    if (!nextUp) break;
    nextUp.slot = slot;
    nextUp.phase = "prefill";
    nextUp.admittedTick = tick;
    waitTicks.push(tick - nextUp.queuedTick);
    used.add(slot);
  }

  // 4. arrivals
  if (tick >= nextArrival) {
    if (reqs.filter((q) => q.phase === "queued").length < MAX_QUEUE) {
      reqs.push(newReq(nextId, tick));
      nextId += 1;
    }
    nextArrival = tick + ARRIVE_MIN + r(ARRIVE_MAX - ARRIVE_MIN);
  }

  return { ...s, tick, nextId, nextArrival, reqs, tokensOut, completed, waitTicks };
}

const phaseChip: Record<Phase, string> = {
  queued: "text-body/40",
  prefill: "text-amber",
  decode: "text-mint",
};

/**
 * A toy continuous-batching scheduler running the featured project's actual
 * loop shape: 4 KV-cache slots, dynamic admission, per-token decode. The
 * capacity toggle is the whole lesson: watch the queue back up at batch 1.
 * Tokens are canned and speeds illustrative; the banner says so.
 */
export function BatchingPlayground() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  const reduce = useReducedMotion();

  const [sim, setSim] = useState<Sim>(() => initialSim(4));

  useEffect(() => {
    if (!inView) return;
    const iv = setInterval(() => setSim(step), TICK_MS);
    return () => clearInterval(iv);
  }, [inView]);

  const queued = sim.reqs.filter((q) => q.phase === "queued");
  const bySlot = (i: number) => sim.reqs.find((q) => q.slot === i) ?? null;
  const avgWaitS =
    sim.waitTicks.length === 0
      ? 0
      : (sim.waitTicks.reduce((a, b) => a + b, 0) / sim.waitTicks.length) *
        (TICK_MS / 1000);

  return (
    <Reveal>
      <div
        ref={ref}
        className="glass ring-gradient overflow-hidden rounded-2xl p-7 md:p-8"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="font-mono text-xs tracking-wide text-accent-2/80">
              DEMO / SERVING PLAYGROUND
            </p>
            <h3 className="mt-1.5 font-display text-xl font-semibold text-bright">
              Watch continuous batching earn its keep
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-3 py-1 font-mono text-[10px] tracking-wide text-amber uppercase">
            <TriangleAlert size={11} />
            simulation
          </span>
          <div className="ml-auto flex items-center gap-3">
            <div className="glass flex items-center gap-1 rounded-full p-1 font-mono text-xs">
              <span className="hidden px-2 text-body/60 sm:inline">
                cache slots
              </span>
              {([1, 4] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={sim.capacity === c}
                  onClick={() =>
                    setSim((s) => ({ ...s, capacity: c }))
                  }
                  className={cn(
                    "rounded-full px-3 py-1.5 font-semibold transition-colors",
                    sim.capacity === c
                      ? "bg-gradient-to-r from-accent to-accent-2 text-ink"
                      : "text-body hover:text-bright",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSim(initialSim(sim.capacity))}
              aria-label="Reset simulation"
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-display text-xs font-semibold text-bright transition-colors hover:border-accent/40"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* cache slots */}
          <div className="dark-island rounded-xl border border-line bg-ink/60 p-4 font-mono text-[11px] sm:text-xs">
            <p className="mb-3 flex items-center gap-2 text-body/40">
              <Cpu size={12} />
              scheduler: decode active → release finished → admit queued
            </p>
            <div className="space-y-3">
              {Array.from({ length: SLOTS }, (_, i) => {
                const q = bySlot(i);
                // A slot beyond capacity still drains its in-flight request
                // before going offline, exactly like the real scheduler.
                const offline = i >= sim.capacity && !q;
                return (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg border border-line/60 px-3 py-2.5",
                      offline && "opacity-40",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-body/40">slot {i}</span>
                      {offline ? (
                        <span className="text-body/40">
                          offline · capacity {sim.capacity}
                        </span>
                      ) : q ? (
                        <>
                          <span className="text-body/60">req #{q.id}</span>
                          <span className={phaseChip[q.phase]}>{q.phase}</span>
                        </>
                      ) : (
                        <span className="text-body/40">idle</span>
                      )}
                    </div>
                    <div className="mt-1 h-5 overflow-hidden leading-5 whitespace-nowrap">
                      {q && !offline ? (
                        q.phase === "prefill" ? (
                          <span className="text-amber/80">
                            {q.prompt}{" "}
                            {"█".repeat(PREFILL_TICKS - q.prefillLeft)}
                            {"░".repeat(q.prefillLeft)}
                          </span>
                        ) : (
                          <span className="text-body/70">
                            <span className="text-body/45">{q.prompt} → </span>
                            {q.tokens.slice(0, q.emitted).join(" ")}
                            <span className="animate-blink text-mint">▊</span>
                          </span>
                        )
                      ) : (
                        <span className="text-body/30">·</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* right column: stats + queue */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl px-3 py-4 text-center">
                <p className="font-display text-xl font-bold text-accent">
                  <Odometer value={String(sim.tokensOut)} />
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                  tokens generated
                </p>
              </div>
              <div className="glass rounded-xl px-3 py-4 text-center">
                <p className="font-display text-xl font-bold text-accent">
                  <Odometer value={String(sim.completed)} />
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                  requests served
                </p>
              </div>
              <div className="glass rounded-xl px-3 py-4 text-center">
                <p className="font-display text-xl font-bold text-accent">
                  {avgWaitS.toFixed(1)}s
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                  avg queue wait
                </p>
              </div>
              <div className="glass rounded-xl px-3 py-4 text-center">
                <p
                  className={cn(
                    "font-display text-xl font-bold",
                    queued.length >= MAX_QUEUE - 1
                      ? "text-red-400/90"
                      : "text-accent",
                  )}
                >
                  <Odometer value={String(queued.length)} />
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                  waiting in queue
                </p>
              </div>
            </div>

            <div className="dark-island min-h-32 rounded-xl border border-line p-4">
              <p className="font-mono text-[10px] tracking-[0.18em] text-accent-2/80 uppercase">
                request queue
              </p>
              <div className="mt-2 space-y-1 font-mono text-xs leading-6">
                {queued.length === 0 ? (
                  <p className="text-body/40">
                    queue clear: every request has a slot
                  </p>
                ) : (
                  queued.map((q) => (
                    <motion.p
                      key={q.id}
                      initial={reduce ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="truncate text-body/70"
                    >
                      <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber align-middle" />
                      #{q.id} · {q.prompt}
                    </motion.p>
                  ))
                )}
              </div>
            </div>

            <p className="mt-auto font-mono text-[11px] leading-relaxed text-body/50">
              Canned tokens at illustrative speeds; no model runs in your
              browser. The measured engine (11.3× cached decode, 4.63× at
              capacity 4) is in the case study above. Try switching to 1 slot
              and watch the queue back up.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
