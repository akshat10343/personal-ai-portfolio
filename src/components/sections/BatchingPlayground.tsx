import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useInView } from "../../hooks/useInView";
import { cn } from "../../lib/utils";

const TICK_MS = 230;
const SLOTS = 4;
const PREFILL_TICKS = 4;
/** Finished requests linger this many ticks before the slot frees, so the
 *  completed answer is actually readable. */
const DONE_TICKS = 8;
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

type Phase = "queued" | "prefill" | "decode" | "done";

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
  doneLeft: number;
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
    doneLeft: DONE_TICKS,
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
    } else if (q.phase === "decode" && Math.random() > 0.22) {
      q.emitted += 1;
      tokensOut += 1;
      if (q.emitted >= q.tokens.length) {
        q.phase = "done";
        completed += 1;
      }
    } else if (q.phase === "done") {
      q.doneLeft -= 1;
    }
  }

  // 2. release requests that finished their readable hold
  reqs = reqs.filter((q) => !(q.phase === "done" && q.doneLeft <= 0));

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

const phaseColor: Record<Phase, string> = {
  queued: "text-faint",
  prefill: "text-warn",
  decode: "text-accent",
  done: "text-ok",
};

/** Keep the newest tokens visible once a line outgrows its slot. */
const tail = (text: string, max: number) =>
  text.length <= max ? text : "… " + text.slice(text.length - max);

const ctrlBtn =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-bg px-3 text-xs font-medium transition-colors hover:border-faint";

/**
 * A toy continuous-batching scheduler running the featured project's actual
 * loop shape: 4 KV-cache slots, dynamic admission, per-token decode. The
 * capacity toggle is the whole lesson: watch the queue back up at batch 1.
 * Tokens are canned and speeds illustrative; the caption says so.
 */
export function BatchingPlayground() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  // Moving content needs a pause control; reduced-motion visitors start paused.
  const [running, setRunning] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [sim, setSim] = useState<Sim>(() => initialSim(4));

  useEffect(() => {
    if (!inView || !running) return;
    const iv = setInterval(() => setSim(step), TICK_MS);
    return () => clearInterval(iv);
  }, [inView, running]);

  const queued = sim.reqs.filter((q) => q.phase === "queued");
  const bySlot = (i: number) => sim.reqs.find((q) => q.slot === i) ?? null;
  const avgWaitS =
    sim.waitTicks.length === 0
      ? 0
      : (sim.waitTicks.reduce((a, b) => a + b, 0) / sim.waitTicks.length) * (TICK_MS / 1000);

  const stats = [
    { label: "tokens generated", value: String(sim.tokensOut) },
    { label: "requests served", value: String(sim.completed) },
    { label: "avg queue wait", value: `${avgWaitS.toFixed(1)}s` },
    { label: "waiting in queue", value: String(queued.length), hot: queued.length >= MAX_QUEUE - 1 },
  ];

  return (
    <div ref={ref} className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="max-w-md">
          <p className="font-mono text-xs text-faint">Interactive · simulation</p>
          <h4 className="mt-1 font-medium">Continuous batching, live</h4>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Requests take a free cache slot, prefill, then decode token by token. Switch to one
            slot and watch the queue back up.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Cache slots" className="inline-flex h-9 items-center rounded-md border border-line bg-bg p-0.5 text-xs">
            <span className="px-2 text-muted">Slots</span>
            {([1, 4] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={sim.capacity === c}
                onClick={() => setSim((s) => ({ ...s, capacity: c }))}
                className={cn(
                  "h-full min-w-8 cursor-pointer rounded-[5px] px-2.5 font-mono font-medium transition-colors",
                  sim.capacity === c ? "bg-fg text-bg" : "text-muted hover:text-fg",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setRunning((r) => !r)} className={ctrlBtn}>
            {running ? <Pause size={13} aria-hidden /> : <Play size={13} aria-hidden />}
            {running ? "Pause" : "Run"}
          </button>
          <button type="button" onClick={() => setSim(initialSim(sim.capacity))} className={ctrlBtn}>
            <RotateCcw size={13} aria-hidden />
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-md border border-line bg-bg p-3 font-mono text-[11px] sm:text-xs">
          <p className="px-1 pb-2 text-faint">decode active → release finished → admit queued</p>
          <ul className="space-y-2">
            {Array.from({ length: SLOTS }, (_, i) => {
              const q = bySlot(i);
              // A slot beyond capacity still drains its in-flight request
              // before going offline, exactly like the real scheduler.
              const offline = i >= sim.capacity && !q;
              return (
                <li key={i} className={cn("rounded border border-line px-2.5 py-2", offline && "opacity-50")}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-faint">slot {i}</span>
                    {offline ? (
                      <span className="text-faint">offline</span>
                    ) : q ? (
                      <>
                        <span className="text-muted">req #{q.id}</span>
                        <span className={phaseColor[q.phase]}>{q.phase}</span>
                      </>
                    ) : (
                      <span className="text-faint">idle</span>
                    )}
                  </div>
                  <div className="mt-1 h-5 overflow-hidden leading-5 whitespace-nowrap">
                    {q && !offline ? (
                      q.phase === "prefill" ? (
                        <span className="text-warn">
                          {q.prompt} {"█".repeat(PREFILL_TICKS - q.prefillLeft)}
                          {"░".repeat(q.prefillLeft)}
                        </span>
                      ) : q.phase === "done" ? (
                        <span className="text-muted">
                          <span className="text-ok">✓ </span>
                          {q.tokens.join(" ")}
                        </span>
                      ) : (
                        <span className="text-muted">
                          {tail(q.prompt + " → " + q.tokens.slice(0, q.emitted).join(" "), 84)}
                          <span className="animate-blink text-accent">▊</span>
                        </span>
                      )
                    ) : (
                      <span className="text-faint">·</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse bg-surface px-3 py-3">
                <dt className="mt-0.5 text-xs text-muted">{s.label}</dt>
                <dd className={cn("font-mono text-xl font-medium tabular-nums", s.hot && "text-warn")}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="min-h-28 rounded-md border border-line bg-bg p-3">
            <p className="font-mono text-xs text-faint">request queue</p>
            <ul className="mt-1.5 space-y-0.5 font-mono text-xs leading-6">
              {queued.length === 0 ? (
                <li className="text-muted">clear: every request has a slot</li>
              ) : (
                queued.map((q) => (
                  <li key={q.id} className="truncate text-muted">
                    <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-warn align-middle" />
                    #{q.id} · {q.prompt}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <p className="border-t border-line px-5 py-3 text-xs leading-relaxed text-muted">
        Canned tokens at illustrative speeds; no model runs in your browser. The measured numbers
        (11.3× cached decode, 4.63× at capacity 4) are in the charts above.
      </p>
    </div>
  );
}
