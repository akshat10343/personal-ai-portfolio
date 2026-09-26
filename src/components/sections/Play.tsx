import { ArrowUpRight, Plus } from "lucide-react";
import { featured } from "../../content/site";
import { BatchingPlayground } from "../play/BatchingPlayground";
import { QuantizeLab } from "../play/QuantizeLab";
import { BarChart } from "../ui/BarChart";
import { StageChapter } from "../ui/StageChapter";

/** Hands-on demos of the engine's ideas, then the measured numbers. */
export function Play() {
  const d = featured.details!;
  return (
    <>
      <StageChapter
        id="play"
        shape={5}
        eyebrow="05 · Now you drive"
        title={
          <>
            Run the scheduler <span className="text-fire">yourself.</span>
          </>
        }
        sub="The blocks are this simulator’s four cache slots, live. Switch to one slot and watch the queue back up while three rows go dark."
      >
        <BatchingPlayground />
      </StageChapter>

      <StageChapter
        shape={6}
        eyebrow="06 · Round it yourself"
        title="Quantize a weight matrix."
        sub="Real symmetric quantization on an 8×8 matrix, drawn as 3D bars. Drop the bit width and the red, the value rounding threw away, grows. One scale for the whole matrix is worse than one per row, which is why the engine scales per channel."
      >
        <QuantizeLab />
      </StageChapter>

      <StageChapter
        shape={14}
        eyebrow="07 · The receipts"
        title="Measured, not simulated."
        sub="The towers are decode throughput by stage, in tokens per second on an Apple M2 CPU. The orange one is the KV cache."
      >
        <div className="rounded-3xl border border-line bg-surface/90 p-5 backdrop-blur-md sm:p-6">
          <div className="space-y-8">
            {featured.charts.map((c) => (
              <BarChart key={c.title} chart={c} />
            ))}
          </div>
          <p className="mt-6 border-t border-line pt-4 font-mono text-xs text-faint">{featured.note}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={featured.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-fg px-4 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
            >
              Source on GitHub
              <ArrowUpRight size={14} aria-hidden />
            </a>
            <p className="font-mono text-xs text-faint">{featured.tech.join(" · ")}</p>
          </div>

          <details className="group mt-5 rounded-2xl border border-line bg-bg">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-4 py-3.5 text-sm font-medium transition-colors hover:bg-subtle [&::-webkit-details-marker]:hidden">
              Engineering notes: how each piece works
              <Plus size={16} aria-hidden className="shrink-0 text-muted transition-transform group-open:rotate-45" />
            </summary>
            <div className="space-y-5 border-t border-line px-4 py-5 text-[15px] leading-relaxed">
              <div>
                <h3 className="font-mono text-xs text-faint">Why build it</h3>
                <p className="mt-1.5 text-muted">{d.problem}</p>
              </div>
              <div>
                <h3 className="font-mono text-xs text-faint">How it works</h3>
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
                <h3 className="font-mono text-xs text-faint">What I took away</h3>
                <p className="mt-1.5 text-muted">{d.learned}</p>
              </div>
            </div>
          </details>
        </div>
      </StageChapter>
    </>
  );
}
