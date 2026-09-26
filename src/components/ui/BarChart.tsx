import { useRef } from "react";
import type { Chart } from "../../content/site";
import { useInView } from "../../hooks/useInView";
import { cn } from "../../lib/utils";

/**
 * Horizontal bars with the value printed beside each one, so the chart reads
 * without hover and without relying on color. Bars grow in once on first view.
 */
export function BarChart({ chart }: { chart: Chart }) {
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref, { once: true, margin: "-40px" });

  return (
    <figure ref={ref} className="min-w-0">
      <figcaption>
        <span className="text-sm font-medium">{chart.title}</span>
        <span className="block font-mono text-xs text-faint">{chart.unit}</span>
      </figcaption>
      <dl className="mt-4 space-y-2.5">
        {chart.bars.map((b, i) => (
          <div key={b.label} className="grid grid-cols-[7.5rem_minmax(0,1fr)_2.75rem] items-center gap-3 text-xs sm:grid-cols-[9rem_minmax(0,1fr)_2.75rem]">
            <dt className={cn("leading-tight", b.accent ? "font-medium text-fg" : "text-muted")}>{b.label}</dt>
            <dd className="h-2.5 overflow-hidden rounded-[2px] bg-subtle">
              <div
                className={cn(
                  "h-full origin-left rounded-[2px] transition-transform duration-700 ease-out",
                  b.accent ? "bg-accent" : "bg-faint/45",
                )}
                style={{
                  width: `${Math.min(100, (b.value / chart.max) * 100)}%`,
                  transform: shown ? "scaleX(1)" : "scaleX(0)",
                  transitionDelay: `${i * 70}ms`,
                }}
              />
            </dd>
            <dd className={cn("text-right font-mono tabular-nums", b.accent ? "font-medium text-fg" : "text-muted")}>
              {b.display}
            </dd>
          </div>
        ))}
      </dl>
      {chart.note && <p className="mt-3 text-xs leading-relaxed text-muted">{chart.note}</p>}
    </figure>
  );
}
