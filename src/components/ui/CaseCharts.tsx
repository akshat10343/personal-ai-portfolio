import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "../../content/site";

type Charts = NonNullable<Project["charts"]>;

/**
 * Animated horizontal bar charts inside case studies. Data lives on the
 * project in site.ts and must be real; a chart can set `min` to zoom the
 * axis (the note should say so).
 */
export function CaseCharts({ charts }: { charts: Charts }) {
  const reduce = useReducedMotion();

  return (
    <div className="mt-8 space-y-7">
      {charts.map((chart, ci) => (
        <div key={chart.title} className="rounded-xl border border-line p-5">
          <p className="font-mono text-[11px] tracking-[0.14em] text-accent-2/90 uppercase">
            {chart.title}
          </p>
          <div className="mt-4 space-y-3">
            {chart.bars.map((bar, bi) => {
              const min = chart.min ?? 0;
              const w = Math.max(
                2,
                ((bar.value - min) / (chart.max - min)) * 100,
              );
              return (
                <div key={bar.label} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-right font-mono text-[11px] text-body/70">
                    {bar.label}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-bright/[0.07]">
                    <motion.div
                      initial={reduce ? false : { width: 0 }}
                      whileInView={{ width: `${w}%` }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{
                        duration: 0.9,
                        delay: 0.1 * bi + 0.05 * ci,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`h-full rounded-full ${
                        bar.accent
                          ? "bg-gradient-to-r from-accent to-accent-2"
                          : "bg-body/35"
                      }`}
                    />
                  </div>
                  <span
                    className={`w-14 shrink-0 font-mono text-[11px] ${
                      bar.accent ? "font-semibold text-bright" : "text-body/70"
                    }`}
                  >
                    {bar.display}
                  </span>
                </div>
              );
            })}
          </div>
          {chart.note && (
            <p className="mt-3 font-mono text-[10px] text-body/45">
              {chart.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
