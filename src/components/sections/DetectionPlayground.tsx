import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/utils";
import { Reveal } from "../ui/Reveal";

const SPAWN_MS = 460;
const VISIBLE_ROWS = 8;
const ATTACK_RATE = 0.16;
const DETECT_RATE = 0.97;
const FALSE_ALARM_RATE = 0.06;

type Verdict = "unknown" | "ok" | "blocked" | "flag" | "missed";

type Flow = {
  id: number;
  time: string;
  src: string;
  dst: string;
  proto: string;
  bytes: string;
  verdict: Verdict;
};

type Stats = {
  inspected: number;
  blocked: number;
  missed: number;
  falseAlarms: number;
};

const ZERO: Stats = { inspected: 0, blocked: 0, missed: 0, falseAlarms: 0 };
const PROTOS = ["TCP", "UDP", "HTTP", "DNS", "SSH", "TLS"];

const r = (n: number) => Math.floor(Math.random() * n);
const ip = () =>
  Math.random() < 0.5
    ? `10.${r(256)}.${r(256)}.${r(254) + 1}`
    : `192.168.${r(256)}.${r(254) + 1}`;
const now = () => new Date().toTimeString().slice(0, 8);
const kb = () => `${(Math.random() * 9 + 0.1).toFixed(1)}KB`;

function spawnFlow(id: number, deployed: boolean): { flow: Flow; isAttack: boolean } {
  const isAttack = Math.random() < ATTACK_RATE;
  let verdict: Verdict = "unknown";
  if (deployed) {
    if (isAttack) {
      verdict = Math.random() < DETECT_RATE ? "blocked" : "missed";
    } else {
      verdict = Math.random() < FALSE_ALARM_RATE ? "flag" : "ok";
    }
  }
  return {
    isAttack,
    flow: {
      id,
      time: now(),
      src: ip(),
      dst: ip(),
      proto: PROTOS[r(PROTOS.length)],
      bytes: kb(),
      verdict,
    },
  };
}

const verdictChip: Record<Verdict, { label: string; cls: string }> = {
  unknown: { label: "·", cls: "text-body/30" },
  ok: { label: "ok", cls: "text-mint/70" },
  blocked: { label: "⚠ blocked", cls: "text-red-400 font-semibold" },
  flag: { label: "flagged", cls: "text-amber" },
  missed: { label: "missed", cls: "text-body/40 line-through" },
};

const pct = (num: number, den: number) =>
  den === 0 ? "…" : `${((num / den) * 100).toFixed(1)}%`;

/**
 * A toy intrusion detector: synthetic flows stream past, and deploying
 * the "detector" starts classifying them live. Every number here is
 * simulated — the honest banner says so.
 */
export function DetectionPlayground() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  const reduce = useReducedMotion();

  const [deployed, setDeployed] = useState(false);
  const [rows, setRows] = useState<Flow[]>([]);
  const [stats, setStats] = useState<Stats>(ZERO);
  const nextId = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const iv = setInterval(() => {
      const { flow } = spawnFlow(nextId.current++, deployed);
      setRows((prev) => [flow, ...prev].slice(0, VISIBLE_ROWS));
      if (deployed) {
        setStats((s) => ({
          inspected: s.inspected + 1,
          blocked: s.blocked + (flow.verdict === "blocked" ? 1 : 0),
          missed: s.missed + (flow.verdict === "missed" ? 1 : 0),
          falseAlarms: s.falseAlarms + (flow.verdict === "flag" ? 1 : 0),
        }));
      }
    }, SPAWN_MS);
    return () => clearInterval(iv);
  }, [inView, deployed]);

  function reset() {
    setDeployed(false);
    setStats(ZERO);
  }

  return (
    <Reveal>
      <div
        ref={ref}
        className="glass ring-gradient overflow-hidden rounded-2xl p-7 md:p-8"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="font-mono text-xs tracking-wide text-accent-2/80">
              DEMO / DETECTION PLAYGROUND
            </p>
            <h3 className="mt-1.5 font-display text-xl font-semibold text-bright">
              Deploy a detector on live(-ish) traffic
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-3 py-1 font-mono text-[10px] tracking-wide text-amber uppercase">
            <TriangleAlert size={11} />
            simulation
          </span>
          <div className="ml-auto flex gap-3">
            {deployed ? (
              <button
                type="button"
                onClick={reset}
                className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-display text-xs font-semibold text-bright transition-colors hover:border-accent/40"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDeployed(true)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2 font-display text-xs font-semibold text-ink shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow hover:shadow-[0_0_32px_rgba(139,92,246,0.6)]"
              >
                <ShieldCheck size={14} />
                Deploy detector
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* flow log */}
          <div className="dark-island min-h-72 rounded-xl border border-line bg-ink/60 p-4 font-mono text-[11px] leading-6 sm:text-xs">
            <p className="mb-2 text-body/40">
              {deployed
                ? "▸ detector active: classifying every flow"
                : "▸ traffic flowing: no detector deployed, attacks pass unseen"}
            </p>
            <AnimatePresence initial={false}>
              {rows.map((flow) => (
                <motion.div
                  key={flow.id}
                  initial={reduce ? false : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap sm:gap-3",
                    flow.verdict === "blocked" && "text-red-400/90",
                  )}
                >
                  <span className="text-body/40">{flow.time}</span>
                  <span className="hidden text-body/70 sm:inline">
                    {flow.src} → {flow.dst}
                  </span>
                  <span className="text-body/70 sm:hidden">
                    {flow.src.split(".").slice(0, 2).join(".")}… →{" "}
                    {flow.dst.split(".").slice(0, 2).join(".")}…
                  </span>
                  <span className="text-body/50">{flow.proto}</span>
                  <span className="text-body/40">{flow.bytes}</span>
                  <span className={cn("ml-auto", verdictChip[flow.verdict].cls)}>
                    {verdictChip[flow.verdict].label}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* stats */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-xl px-3 py-4 text-center">
                <p className="text-gradient font-display text-xl font-bold">
                  {pct(stats.blocked, stats.blocked + stats.missed)}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                  detection
                </p>
              </div>
              <div className="glass rounded-xl px-3 py-4 text-center">
                <p className="text-gradient font-display text-xl font-bold">
                  {pct(stats.falseAlarms, stats.inspected - stats.blocked - stats.missed + stats.falseAlarms)}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                  false alarms
                </p>
              </div>
              <div className="glass rounded-xl px-3 py-4 text-center">
                <p className="text-gradient font-display text-xl font-bold">
                  {stats.inspected}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                  inspected
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line px-3 py-3 text-center">
                <p className="font-display text-lg font-semibold text-red-400/90">
                  {stats.blocked}
                </p>
                <p className="font-mono text-[10px] text-body/60 uppercase">
                  attacks blocked
                </p>
              </div>
              <div className="rounded-xl border border-line px-3 py-3 text-center">
                <p className="font-display text-lg font-semibold text-body/70">
                  {stats.missed}
                </p>
                <p className="font-mono text-[10px] text-body/60 uppercase">
                  slipped through
                </p>
              </div>
            </div>
            <p className="mt-auto font-mono text-[11px] leading-relaxed text-body/50">
              Synthetic traffic, illustrative numbers. No real detector runs
              in your browser. The real work is in the case study above; this
              is what the job <em>feels</em> like.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
