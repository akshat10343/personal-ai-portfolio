import { motion, useReducedMotion } from "framer-motion";
import { Search, ShieldCheck, Sun } from "lucide-react";

/**
 * Stylized per-project visuals for the case-study modals. These are
 * illustrations built from the design system, not screenshots; the caption
 * says so. Swap for real screenshots by replacing this component's usage
 * with an <img> when captures exist.
 */
export function ProjectVisual({ id }: { id: string }) {
  const reduce = useReducedMotion();

  const bar = (w: string, delay: number, cls: string, label?: string, value?: string) => (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-right font-mono text-[10px] text-body/60">
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-bright/[0.07]">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: w }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className={`h-full rounded-full ${cls}`}
        />
      </div>
      <span className="w-12 shrink-0 font-mono text-[10px] text-body/70">
        {value}
      </span>
    </div>
  );

  let content: React.ReactNode = null;
  switch (id) {
    case "mini-llm":
      content = (
        <div className="dark-island rounded-lg border border-line p-4 font-mono text-[10px] leading-5">
          {(
            [
              ["slot 0", "decode", "Why is a KV cache useful? → reuses every prior key…", "text-mint"],
              ["slot 1", "decode", "Explain RoPE in one line → rotate q,k by position…", "text-mint"],
              ["slot 2", "prefill", "Summarize continuous batching ████░░", "text-amber"],
              ["slot 3", "queued", "waiting for a free cache slot", "text-body/40"],
            ] as const
          ).map(([slot, phase, text, cls]) => (
            <div key={slot} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-body/40">{slot}</span>
              <span className={`w-12 shrink-0 ${cls}`}>{phase}</span>
              <span className="overflow-hidden text-ellipsis text-body/70">
                {text}
              </span>
            </div>
          ))}
          <p className="mt-2 text-body/50">
            requests in · tokens out · every step correctness-gated
          </p>
        </div>
      );
      break;
    case "nlp-finance":
      content = (
        <div className="space-y-2.5 rounded-lg border border-line p-4">
          {bar("58%", 0.1, "bg-body/40", "bag-of-words")}
          {bar("74%", 0.25, "bg-indigo-400/70", "LSTM")}
          {bar("96.9%", 0.4, "bg-gradient-to-r from-accent to-accent-2", "BERT", "96.9%")}
          <p className="pt-1 font-mono text-[10px] text-body/50">
            test accuracy · same task, three generations of NLP
          </p>
        </div>
      );
      break;
    case "tomshield":
      content = (
        <div className="rounded-lg border border-line p-4">
          <div className="flex items-center justify-center gap-3">
            <ShieldCheck size={22} className="text-accent-2" />
            {["verify", "classify", "flag"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className="text-body/30">→</span>
                <span className="glass flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[10px] text-body">
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                  {s}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center font-mono text-[10px] text-body/50">
            microservices on Fargate · ~600 users
          </p>
        </div>
      );
      break;
    case "solarsave":
      content = (
        <div className="rounded-lg border border-line p-4">
          <div className="flex items-end justify-center gap-2">
            <Sun size={20} className="mb-1 text-amber" />
            {[35, 55, 42, 70, 58, 85, 96].map((h, i) => (
              <motion.div
                key={i}
                initial={reduce ? false : { height: 0 }}
                whileInView={{ height: h * 0.6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.06 * i, ease: "easeOut" }}
                className="w-5 rounded-t bg-gradient-to-t from-accent/60 to-accent-2/80"
              />
            ))}
          </div>
          <p className="mt-3 text-center font-mono text-[10px] text-body/50">
            irradiance in · payback estimate out
          </p>
        </div>
      );
      break;
    case "calorie-counter":
      content = (
        <div className="rounded-lg border border-line p-4">
          <div className="glass flex items-center gap-2 rounded-lg px-3 py-2">
            <Search size={12} className="text-body/50" />
            <span className="font-mono text-[11px] text-body/60">
              greek yogurt protein…
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {["w-4/5", "w-3/5", "w-2/3"].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-sm bg-accent/50" />
                <span className={`h-2 ${w} rounded bg-bright/[0.08]`} />
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[10px] text-body/50">
            messy .xlsx in · clean JSON out
          </p>
        </div>
      );
      break;
    default:
      return null;
  }

  return (
    <figure className="mt-6">
      {content}
      <figcaption className="mt-2 font-mono text-[10px] text-body/40">
        illustration, not a screenshot
      </figcaption>
    </figure>
  );
}
