import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { Radar, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/utils";
import { Odometer } from "../ui/Odometer";
import { Reveal } from "../ui/Reveal";

const SPAWN_MS = 520;
const BURST_CHANCE = 0.18;
const VISIBLE_ROWS = 16;
const ATTACK_RATE = 0.22;
const DETECT_RATE = 0.995;
const FALSE_ALARM_RATE = 0.05;
const AUTO_DEPLOY_MS = 6500;

type Verdict = "unknown" | "ok" | "blocked" | "flag" | "missed";

/** Attack playbook: type, how it travels, and what gives it away. */
const ATTACKS = [
  { name: "SYN flood", proto: "TCP", port: 443, signals: "syn burst · no ack · tiny payloads" },
  { name: "port scan", proto: "TCP", port: 1, signals: "sequential ports · 1-packet flows" },
  { name: "SSH brute force", proto: "SSH", port: 22, signals: "rapid retries · fixed-size packets" },
  { name: "ARP spoofing", proto: "ARP", port: 0, signals: "mac/ip mismatch · unsolicited replies" },
  { name: "Mirai botnet", proto: "UDP", port: 23, signals: "known C2 cadence · plain UDP flood" },
  { name: "SQL injection", proto: "HTTP", port: 80, signals: "payload entropy · query anomalies" },
] as const;

type Flow = {
  id: number;
  time: string;
  src: string;
  dst: string;
  proto: string;
  bytes: string;
  verdict: Verdict;
  attack?: (typeof ATTACKS)[number];
  score?: number;
};

type Alert = {
  id: number;
  attack: (typeof ATTACKS)[number];
  src: string;
  dst: string;
  score: number;
};

type Stats = {
  inspected: number;
  blocked: number;
  missed: number;
  falseAlarms: number;
};

const ZERO: Stats = { inspected: 0, blocked: 0, missed: 0, falseAlarms: 0 };
const BENIGN_PROTOS = ["TCP", "UDP", "HTTP", "DNS", "TLS"];

const r = (n: number) => Math.floor(Math.random() * n);
const ip = () =>
  Math.random() < 0.5
    ? `10.${r(256)}.${r(256)}.${r(254) + 1}`
    : `192.168.${r(256)}.${r(254) + 1}`;
const now = () => new Date().toTimeString().slice(0, 8);
const kb = () => `${(Math.random() * 9 + 0.1).toFixed(1)}KB`;

function spawnFlow(id: number, deployed: boolean): Flow {
  const isAttack = Math.random() < ATTACK_RATE;
  const attack = isAttack ? ATTACKS[r(ATTACKS.length)] : undefined;

  let verdict: Verdict = "unknown";
  let score: number | undefined;
  if (deployed) {
    if (isAttack) {
      const caught = Math.random() < DETECT_RATE;
      verdict = caught ? "blocked" : "missed";
      score = caught ? 0.86 + Math.random() * 0.13 : 0.31 + Math.random() * 0.1;
    } else if (Math.random() < FALSE_ALARM_RATE) {
      verdict = "flag";
      score = 0.52 + Math.random() * 0.12;
    } else {
      verdict = "ok";
      score = 0.02 + Math.random() * 0.2;
    }
  }

  const dstPort =
    attack && attack.port > 1 ? `:${attack.port}` : attack ? `:${r(9000) + 1000}` : "";
  return {
    id,
    time: now(),
    src: ip(),
    dst: ip() + dstPort,
    proto: attack ? attack.proto : BENIGN_PROTOS[r(BENIGN_PROTOS.length)],
    bytes: kb(),
    verdict,
    attack,
    score,
  };
}

const verdictChip: Record<Verdict, { label: (f: Flow) => string; cls: string }> = {
  unknown: { label: () => "", cls: "" },
  ok: { label: (f) => `ok ${f.score?.toFixed(2) ?? ""}`, cls: "text-mint/60" },
  blocked: {
    label: (f) => `⚠ ${f.attack?.name ?? "attack"}`,
    cls: "text-red-400 font-semibold",
  },
  flag: { label: (f) => `flagged ${f.score?.toFixed(2) ?? ""}`, cls: "text-amber" },
  missed: { label: () => "missed", cls: "text-body/40 line-through" },
};

const pct = (num: number, den: number) =>
  den === 0 ? "0%" : `${((num / den) * 100).toFixed(1)}%`;

/**
 * A toy intrusion detector with the reasoning made visible: attacks have
 * named types, blocks come with a model score and the signals that tripped
 * it, and the whole thing deploys itself if the visitor just watches.
 * Every number is synthetic; the banner says so.
 */
export function DetectionPlayground() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  const reduce = useReducedMotion();

  const [deployed, setDeployed] = useState(false);
  const [autoDeployed, setAutoDeployed] = useState(false);
  // Pre-seed a full log so the panel never starts empty.
  const [rows, setRows] = useState<Flow[]>(() =>
    Array.from({ length: VISIBLE_ROWS }, (_, i) => ({
      ...spawnFlow(i, false),
      time: new Date(Date.now() - (i + 1) * 700).toTimeString().slice(0, 8),
    })),
  );
  const [alert, setAlert] = useState<Alert | null>(null);
  const [stats, setStats] = useState<Stats>(ZERO);
  const [pulse, setPulse] = useState(0);
  const nextId = useRef(VISIBLE_ROWS);
  const wasReset = useRef(false);

  // Traffic generator, with occasional bursts so it breathes.
  useEffect(() => {
    if (!inView) return;
    const spawnOne = () => {
      const flow = spawnFlow(nextId.current++, deployed);
      setRows((prev) => [flow, ...prev].slice(0, VISIBLE_ROWS));
      if (!deployed) return;
      setStats((s) => ({
        inspected: s.inspected + 1,
        blocked: s.blocked + (flow.verdict === "blocked" ? 1 : 0),
        missed: s.missed + (flow.verdict === "missed" ? 1 : 0),
        falseAlarms: s.falseAlarms + (flow.verdict === "flag" ? 1 : 0),
      }));
      if (flow.verdict === "blocked" && flow.attack) {
        setAlert({
          id: flow.id,
          attack: flow.attack,
          src: flow.src,
          dst: flow.dst,
          score: flow.score ?? 0.9,
        });
        setPulse((p) => p + 1);
      }
    };
    const iv = setInterval(() => {
      spawnOne();
      if (Math.random() < BURST_CHANCE) {
        setTimeout(spawnOne, 120);
        if (Math.random() < 0.4) setTimeout(spawnOne, 240);
      }
    }, SPAWN_MS);
    return () => clearInterval(iv);
  }, [inView, deployed]);

  // Demo mode: deploy itself if the visitor just watches (once, not after reset).
  useEffect(() => {
    if (!inView || deployed || wasReset.current) return;
    const t = setTimeout(() => {
      setAutoDeployed(true);
      setDeployed(true);
    }, AUTO_DEPLOY_MS);
    return () => clearTimeout(t);
  }, [inView, deployed]);

  function reset() {
    wasReset.current = true;
    setDeployed(false);
    setAutoDeployed(false);
    setStats(ZERO);
    setAlert(null);
  }

  return (
    <Reveal>
      <div
        ref={ref}
        className="glass ring-gradient border-beam overflow-hidden rounded-2xl p-7 md:p-8"
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
          <motion.div
            key={pulse > 0 ? `pulse-${pulse}` : "calm"}
            initial={
              reduce || pulse === 0
                ? false
                : { boxShadow: "0 0 0 1px rgba(248,113,113,0.55), 0 0 34px rgba(248,113,113,0.25)" }
            }
            animate={{ boxShadow: "0 0 0 0px rgba(248,113,113,0)" }}
            transition={{ duration: 0.7 }}
            className="dark-island min-h-72 overflow-hidden rounded-xl border border-line bg-ink/60 p-4 font-mono text-[11px] leading-6 sm:text-xs"
          >
            <p className="mb-2 text-body/40">
              {deployed
                ? `▸ detector active${autoDeployed ? " (auto-deployed for the demo)" : ""}: scoring every flow`
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
                  {flow.verdict !== "unknown" && (
                    <span className={cn("ml-auto", verdictChip[flow.verdict].cls)}>
                      {verdictChip[flow.verdict].label(flow)}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* right column: standby state, or stats + latest alert */}
          <div className="flex flex-col gap-4">
            {!deployed ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 text-center">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-amber" />
                </span>
                <p className="mt-4 font-mono text-xs tracking-[0.18em] text-amber/90 uppercase">
                  detector on standby
                </p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-body">
                  Attacks are in this traffic right now, unlabeled and
                  indistinguishable. Hit{" "}
                  <span className="text-bright">Deploy detector</span> to see
                  what the model catches, or wait and it will deploy itself.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-xl px-3 py-4 text-center">
                    <p className="font-display text-xl font-bold text-accent">
                      <Odometer value={pct(stats.blocked, stats.blocked + stats.missed)} />
                    </p>
                    <p className="mt-1 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                      detection
                    </p>
                  </div>
                  <div className="glass rounded-xl px-3 py-4 text-center">
                    <p className="font-display text-xl font-bold text-accent">
                      <Odometer
                        value={pct(
                          stats.falseAlarms,
                          stats.inspected - stats.blocked - stats.missed,
                        )}
                      />
                    </p>
                    <p className="mt-1 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                      false alarms
                    </p>
                  </div>
                  <div className="glass rounded-xl px-3 py-4 text-center">
                    <p className="font-display text-xl font-bold text-accent">
                      <Odometer value={String(stats.inspected)} />
                    </p>
                    <p className="mt-1 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                      inspected
                    </p>
                  </div>
                </div>

                <div className="dark-island min-h-36 rounded-xl border border-line p-4">
                  <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-red-400/80 uppercase">
                    <Radar size={12} />
                    latest alert
                  </p>
                  <AnimatePresence mode="wait">
                    {alert ? (
                      <motion.div
                        key={alert.id}
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-3 font-mono text-xs leading-6"
                      >
                        <p className="text-red-400/90">
                          ⚠ {alert.attack.name}{" "}
                          <span className="text-body/50">
                            · score {alert.score.toFixed(2)}
                          </span>
                        </p>
                        <p className="text-body/70">
                          {alert.src} → {alert.dst}
                        </p>
                        <p className="text-body/50">
                          signals: {alert.attack.signals}
                        </p>
                        <p className="text-mint/80">→ connection dropped</p>
                      </motion.div>
                    ) : (
                      <p className="mt-3 font-mono text-xs text-body/40">
                        listening for the first hit…
                      </p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line px-3 py-2.5 text-center">
                    <p className="font-display text-lg font-semibold text-red-400/90">
                      <Odometer value={String(stats.blocked)} />
                    </p>
                    <p className="font-mono text-[10px] text-body/60 uppercase">
                      attacks blocked
                    </p>
                  </div>
                  <div className="rounded-xl border border-line px-3 py-2.5 text-center">
                    <p className="font-display text-lg font-semibold text-body/70">
                      <Odometer value={String(stats.missed)} />
                    </p>
                    <p className="font-mono text-[10px] text-body/60 uppercase">
                      slipped through
                    </p>
                  </div>
                </div>
              </>
            )}

            <p className="mt-auto font-mono text-[11px] leading-relaxed text-body/50">
              Synthetic traffic, illustrative numbers. No real detector runs in
              your browser. This is what my Bell Labs internship work (see
              Experience) <em>feels</em> like day to day.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
