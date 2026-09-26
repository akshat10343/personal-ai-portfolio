import { useEffect, useState } from "react";
import { Check, FileSpreadsheet, Lock, RotateCcw, X } from "lucide-react";
import { live } from "../../lib/live";
import { cn } from "../../lib/utils";

/**
 * A replay of the "swapped mirror" story from the writing section: the
 * popular mirror ships train/test with crossed filenames; a row-count check
 * against the paper catches it; roles get assigned by count; bytes get pinned.
 * Counts are the rounded figures quoted in the post.
 */
const FILES = [
  { name: "train.csv", rows: "82K", documented: "≈175K", trueRole: "test" },
  { name: "test.csv", rows: "≈175K", documented: "≈82K", trueRole: "train" },
] as const;

const STEPS = [
  { button: "Check row counts", caption: "Downloaded from the most popular mirror. The filenames look right." },
  { button: "Assign roles by row count", caption: "The paper documents train at about 175K rows. The file named “train” has 82K." },
  { button: "Pin the bytes", caption: "Roles now come from row counts, not filenames. The split is the right way round." },
  { button: "Replay", caption: "Each file’s SHA-256 hash is pinned in config. If the bytes change, the pipeline refuses to run." },
];

export function SwapDemo() {
  const [step, setStep] = useState(0);
  const swapped = step >= 2;
  useEffect(() => {
    live.swap = step;
  }, [step]);

  return (
    <div className="rounded-3xl border border-line bg-surface/90 p-5 backdrop-blur-md">
      <p className="font-mono text-xs text-faint">Interactive · replay</p>
      <h3 className="mt-1 text-lg font-semibold tracking-tight">Spot the swapped dataset</h3>

      <ol className="mt-4 flex gap-1.5" aria-label="Progress">
        {STEPS.slice(0, 3).map((_, i) => (
          <li
            key={i}
            className={cn("h-1 flex-1 rounded-full transition-colors duration-500", step > i ? "bg-accent" : "bg-subtle")}
          />
        ))}
      </ol>

      <div className="relative mt-6 grid grid-cols-2 gap-4">
        {FILES.map((f, i) => {
          const flagged = step === 1;
          const fixed = step >= 2;
          const shift = swapped ? (i === 0 ? "translateX(calc(100% + 1rem))" : "translateX(calc(-100% - 1rem))") : "none";
          return (
            <div
              key={f.name}
              className={cn(
                "rounded-2xl border bg-bg p-4 transition-[transform,border-color] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                flagged ? "border-hot/60" : fixed ? "border-ok/50" : "border-line",
              )}
              style={{ transform: shift }}
            >
              <div className="flex items-center gap-2 text-muted">
                <FileSpreadsheet size={16} aria-hidden />
                <span className="truncate font-mono text-xs">{f.name}</span>
              </div>
              <p className="mt-3 font-mono text-3xl font-semibold tabular-nums sm:text-4xl">{f.rows}</p>
              <p className="text-xs text-faint">rows</p>

              <div className="mt-4 min-h-12 text-xs leading-relaxed">
                {step === 0 && <p className="text-muted">Role from filename: {f.name.split(".")[0]}</p>}
                {flagged && (
                  <p className="flex items-start gap-1.5 text-hot">
                    <X size={14} aria-hidden className="mt-px shrink-0" />
                    Paper says {f.name.split(".")[0]} ≈ {f.documented.replace("≈", "")}
                  </p>
                )}
                {fixed && (
                  <p className="flex items-start gap-1.5 text-ok">
                    <Check size={14} aria-hidden className="mt-px shrink-0" />
                    Role from row count: {f.trueRole}
                  </p>
                )}
                {step >= 3 && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-muted">
                    <Lock size={12} aria-hidden />
                    sha256 pinned
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 min-h-12 text-sm leading-relaxed text-muted" aria-live="polite">
        {STEPS[step].caption}
      </p>

      <button
        type="button"
        onClick={() => setStep((s) => (s + 1) % STEPS.length)}
        className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
      >
        {step === 3 && <RotateCcw size={14} aria-hidden />}
        {STEPS[step].button}
      </button>
    </div>
  );
}
