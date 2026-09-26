import { ArrowUpRight, Plus } from "lucide-react";
import { featured } from "../../content/site";
import { BatchingPlayground } from "../play/BatchingPlayground";
import { QuantizeLab } from "../play/QuantizeLab";
import { BarChart } from "../ui/BarChart";
import { Chapter } from "../ui/Chapter";

/** Hands-on demos of the engine's ideas, then the measured numbers. */
export function Play() {
  const d = featured.details!;
  return (
    <Chapter
      id="play"
      eyebrow="Hands on"
      title={
        <>
          Now <span className="text-fire">you</span> drive.
        </>
      }
      sub="Two small, honest simulations of what the engine does. Nothing here runs a model in your browser, but the scheduling and the rounding math are the real thing."
    >
      <div className="space-y-6">
        <div className="reveal">
          <BatchingPlayground />
        </div>
        <div className="reveal">
          <QuantizeLab />
        </div>

        <div className="reveal rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-faint">The receipts</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">Measured, not simulated</h3>
            </div>
            <a
              href={featured.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-fg px-4 text-xs font-medium text-bg transition-transform hover:scale-[1.03]"
            >
              Source on GitHub
              <ArrowUpRight size={14} aria-hidden />
            </a>
          </div>
          <div className="mt-7 grid gap-9 xl:grid-cols-2 xl:gap-x-12">
            {featured.charts.map((c) => (
              <BarChart key={c.title} chart={c} />
            ))}
          </div>
          <p className="mt-7 border-t border-line pt-4 font-mono text-xs text-faint">{featured.note}</p>

          <details className="group mt-5 rounded-2xl border border-line bg-bg">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-medium transition-colors hover:bg-subtle [&::-webkit-details-marker]:hidden">
              Engineering notes: how each piece works
              <Plus size={16} aria-hidden className="shrink-0 text-muted transition-transform group-open:rotate-45" />
            </summary>
            <div className="space-y-5 border-t border-line px-5 py-5 text-[15px] leading-relaxed">
              <div>
                <h4 className="font-mono text-xs text-faint">Why build it</h4>
                <p className="mt-1.5 text-muted">{d.problem}</p>
              </div>
              <div>
                <h4 className="font-mono text-xs text-faint">How it works</h4>
                <ul className="mt-1.5 space-y-2.5 text-muted">
                  {d.approach.map((a) => (
                    <li key={a} className="grid grid-cols-[1rem_minmax(0,1fr)]">
                      <span aria-hidden className="text-accent">–</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-mono text-xs text-faint">What I took away</h4>
                <p className="mt-1.5 text-muted">{d.learned}</p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </Chapter>
  );
}
