import { experiments } from "../../content/site";
import type { Experiment } from "../../content/site";
import { cn } from "../../lib/utils";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";

const statusStyles: Record<
  Experiment["status"],
  { label: string; dot: string; text: string }
> = {
  shipped: { label: "shipped", dot: "bg-mint", text: "text-mint" },
  active: { label: "active", dot: "bg-accent-2 animate-pulse", text: "text-accent-2" },
  queued: { label: "queued", dot: "bg-amber", text: "text-amber" },
};

function ExperimentRow({ exp, delay }: { exp: Experiment; delay: number }) {
  const status = statusStyles[exp.status];
  return (
    <Reveal delay={delay}>
      <div className="glass group relative grid gap-3 overflow-hidden rounded-xl px-6 py-5 transition-all duration-300 hover:translate-x-1 hover:border-accent/30 sm:grid-cols-[92px_130px_1fr] sm:items-baseline sm:gap-6">
        <span
          aria-hidden
          className="absolute top-1/2 left-0 h-0 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-accent to-accent-2 transition-all duration-300 group-hover:h-3/5"
        />
        <span className="font-mono text-xs text-body/50">{exp.code}</span>
        <span
          className={cn(
            "inline-flex items-center gap-2 font-mono text-xs",
            status.text,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
        <div>
          <h3 className="font-display text-[17px] font-semibold text-bright transition-colors duration-300 group-hover:text-accent-2">
            {exp.title}
          </h3>
          <p className="mt-1.5 text-[15px] leading-relaxed">{exp.body}</p>
        </div>
      </div>
    </Reveal>
  );
}

export function Experiments() {
  return (
    <Section
      id="experiments"
      index="04"
      eyebrow="AI Experiments"
      title={
        <>
          The <span className="text-gradient">lab log</span>: small
          experiments, real lessons.
        </>
      }
      lede="Not everything needs to be a capital-P Project. These are the questions I've chased down for the fun of it, plus what shipped, what's running, and what's next."
    >
      <div className="space-y-4">
        {experiments.map((exp, i) => (
          <ExperimentRow key={exp.code} exp={exp} delay={0.05 * i} />
        ))}
      </div>
    </Section>
  );
}
