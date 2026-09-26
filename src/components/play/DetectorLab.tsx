import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { BINS, metrics, policyThreshold, prAuc } from "../../lib/detect";
import { live } from "../../lib/live";
import { cn } from "../../lib/utils";

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

/**
 * Pick an alert threshold for a (simulated) intrusion detector, then leak the
 * testbed-artifact columns back in and watch the problem turn "perfect". The
 * 3D stage stacks every flow by score and colors it by the outcome.
 */
export function DetectorLab() {
  const [leaky, setLeaky] = useState(false);
  const [t, setT] = useState(() => policyThreshold(false));

  useEffect(() => {
    live.detect = { leaky, t };
  }, [leaky, t]);

  const m = metrics(leaky, t);
  const auc = prAuc(leaky);
  const atPolicy = t === policyThreshold(leaky);

  const stats = [
    { label: "attacks caught", value: pct(m.recall), tone: m.recall >= 0.95 ? "text-ok" : "text-hot" },
    { label: "false alarms", value: pct(m.falseAlarm), tone: m.falseAlarm > 0.3 ? "text-warn" : "" },
    { label: "precision", value: pct(m.precision), tone: "" },
    { label: "PR-AUC", value: auc.toFixed(3), tone: leaky ? "text-hot" : "" },
  ];

  return (
    <div className="rounded-3xl border border-line bg-surface/90 p-5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-faint">Interactive · simulated scores</p>
        <div role="group" aria-label="Features" className="inline-flex rounded-full border border-line bg-bg p-1 text-xs">
          {[
            { v: false, label: "Honest features" },
            { v: true, label: "Leaked columns" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={leaky === o.v}
              onClick={() => {
                setLeaky(o.v);
                setT(policyThreshold(o.v));
              }}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 font-medium transition-colors",
                leaky === o.v ? (o.v ? "bg-hot text-white" : "bg-fg text-bg") : "text-muted hover:text-fg",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="threshold" className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-muted">Alert when score ≥</span>
          <span className="font-mono text-2xl font-semibold tabular-nums">{(t / BINS).toFixed(3)}</span>
        </label>
        <input
          id="threshold"
          type="range"
          min={0}
          max={BINS}
          step={1}
          value={t}
          onChange={(e) => setT(Number(e.target.value))}
          className="mt-2 w-full cursor-pointer accent-[var(--color-accent)]"
        />
        <button
          type="button"
          onClick={() => setT(policyThreshold(leaky))}
          aria-pressed={atPolicy}
          className={cn(
            "mt-3 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors",
            atPolicy ? "border-accent/60 bg-accent/10 text-accent" : "border-line bg-bg hover:border-faint",
          )}
        >
          <Target size={13} aria-hidden />
          My rule: ≥ 95% of attacks caught, fewest false alarms
        </button>
      </div>

      <ul aria-label="Block colors" className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        {[
          ["bg-ok", "attack caught"],
          ["bg-hot", "attack missed"],
          ["bg-warn", "false alarm"],
          ["bg-cool", "normal, let through"],
        ].map(([dot, label]) => (
          <li key={label} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={cn("h-2.5 w-2.5 rounded-[3px]", dot)} />
            {label}
          </li>
        ))}
      </ul>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse bg-bg px-3 py-2.5">
            <dt className="mt-0.5 text-[11px] text-muted">{s.label}</dt>
            <dd className={cn("font-mono text-lg font-medium tabular-nums", s.tone)}>{s.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 rounded-xl bg-bg px-3 py-2.5 text-sm leading-relaxed text-muted" aria-live="polite">
        {leaky ? (
          <>
            <span className="font-medium text-hot">Too good to be true.</span> The two piles never touch, so any
            threshold looks perfect. The model is reading testbed artifacts, not traffic. I removed those columns and
            added a pytest contract so they stay removed.
          </>
        ) : t === 0 ? (
          <>Flag everything: every attack caught at 78.6% precision. Any real threshold has to clearly beat that.</>
        ) : (
          <>
            The overlap in the middle is where slow attacks like reconnaissance scans hide. Raise the bar and they slip
            through (red); lower it and normal traffic trips alarms (yellow).
          </>
        )}
      </p>

      <p className="mt-3 text-xs leading-relaxed text-faint">
        Simulated flows shaped like the real data: attack-heavy, with a hard overlapping middle. The real detector
        reached PR-AUC 0.995, with 96.2% detection at a 16.6% false-alarm rate on 560K held-out flows.
      </p>
    </div>
  );
}
