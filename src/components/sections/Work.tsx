import { ArrowUpRight, Plus } from "lucide-react";
import { featured, projects } from "../../content/site";
import { BarChart } from "../ui/BarChart";
import { Section } from "../ui/Section";
import { BatchingPlayground } from "./BatchingPlayground";

function SourceLink({ href, label = "Source" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="link inline-flex items-center gap-1 text-sm font-medium"
    >
      {label}
      <ArrowUpRight size={14} aria-hidden />
    </a>
  );
}

function Featured() {
  const d = featured.details!;
  return (
    <article id={featured.id} aria-labelledby={`${featured.id}-title`} className="scroll-mt-24">
      <p className="font-mono text-xs text-faint">
        {featured.kind} · {featured.period}
      </p>
      <h3 id={`${featured.id}-title`} className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
        {featured.title}
      </h3>
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{featured.summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <SourceLink href={featured.href!} label="Source on GitHub" />
        <p className="font-mono text-xs text-faint">{featured.tech.join(" · ")}</p>
      </div>

      <ol className="mt-8 max-w-3xl space-y-4">
        {featured.bullets.map((b, i) => (
          <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] text-[15px] leading-relaxed">
            <span aria-hidden className="pt-[3px] font-mono text-xs text-faint tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-lg border border-line bg-surface p-5 sm:p-6">
        <div className="grid gap-9 xl:grid-cols-2 xl:gap-x-10">
          {featured.charts.map((c) => (
            <BarChart key={c.title} chart={c} />
          ))}
        </div>
        <p className="mt-6 border-t border-line pt-4 font-mono text-xs text-faint">{featured.note}</p>
      </div>

      <details className="group mt-6 rounded-lg border border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-4 text-sm font-medium transition-colors hover:bg-subtle [&::-webkit-details-marker]:hidden">
          Engineering notes: how each piece works
          <Plus size={16} aria-hidden className="shrink-0 text-muted transition-transform group-open:rotate-45" />
        </summary>
        <div className="space-y-5 border-t border-line px-5 py-5 text-[15px] leading-relaxed">
          <div>
            <h4 className="font-mono text-xs text-faint">Why build it</h4>
            <p className="mt-1.5">{d.problem}</p>
          </div>
          <div>
            <h4 className="font-mono text-xs text-faint">How it works</h4>
            <ul className="mt-1.5 space-y-2.5">
              {d.approach.map((a) => (
                <li key={a} className="grid grid-cols-[1rem_minmax(0,1fr)]">
                  <span aria-hidden className="text-faint">–</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs text-faint">What I took away</h4>
            <p className="mt-1.5">{d.learned}</p>
          </div>
        </div>
      </details>

      <div className="mt-10">
        <BatchingPlayground />
      </div>
    </article>
  );
}

function MoreProjects() {
  return (
    <div className="mt-20">
      <h3 className="text-lg font-semibold tracking-tight">More projects</h3>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {projects.map((p) => (
          <li key={p.id} id={p.id} className="scroll-mt-24 py-7">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h4 className="text-lg font-semibold tracking-tight">{p.title}</h4>
              <p className="font-mono text-xs text-faint tabular-nums">{p.period}</p>
            </div>
            <p className="text-sm text-muted">{p.kind}</p>
            <p className="mt-3 max-w-2xl leading-relaxed">{p.summary}</p>
            <ul className="mt-3 max-w-2xl space-y-1.5 text-sm leading-relaxed text-muted">
              {p.bullets.map((b) => (
                <li key={b} className="grid grid-cols-[1rem_minmax(0,1fr)]">
                  <span aria-hidden className="text-faint">–</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              {p.href && <SourceLink href={p.href} />}
              <p className="font-mono text-xs text-faint">{p.tech.join(" · ")}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Work() {
  return (
    <Section
      id="work"
      index="01"
      title="Selected work"
      intro="One deep build shown in full, with real benchmark numbers. The rest follow."
    >
      <Featured />
      <MoreProjects />
    </Section>
  );
}
