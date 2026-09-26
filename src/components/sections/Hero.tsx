import { ArrowDown, FileText, Mail } from "lucide-react";
import { facts, featured, identity } from "../../content/site";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";

const secondaryBtn =
  "inline-flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-medium transition-colors hover:border-faint";

export function Hero() {
  return (
    <section id="top" aria-label="Introduction" className="mx-auto max-w-6xl px-5 pt-12 pb-16 sm:px-8 md:pt-20 md:pb-24">
      <p className="inline-flex items-center gap-2 font-mono text-xs text-muted">
        <span aria-hidden className="h-2 w-2 rounded-full bg-ok" />
        {identity.availability} · {identity.location}
      </p>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end lg:gap-16">
        <div>
          <h1 className="max-w-3xl text-[2.5rem] leading-[1.04] font-semibold tracking-[-0.035em] sm:text-6xl md:text-[4.25rem]">
            {identity.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{identity.intro}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${identity.email}`}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-85"
            >
              <Mail size={16} aria-hidden />
              Email me
            </a>
            {identity.resumeUrl && (
              <a href={identity.resumeUrl} className={secondaryBtn}>
                <FileText size={16} aria-hidden />
                Résumé
              </a>
            )}
            <a href={identity.github} target="_blank" rel="noreferrer" className={secondaryBtn}>
              <GithubIcon size={16} />
              GitHub
            </a>
            <a href={identity.linkedin} target="_blank" rel="noreferrer" className={secondaryBtn}>
              <LinkedinIcon size={16} />
              LinkedIn
            </a>
          </div>
        </div>

        <a
          href={`#${featured.id}`}
          className="group block rounded-lg border border-line bg-surface p-5 transition-colors hover:border-faint"
        >
          <p className="font-mono text-xs text-faint">Latest build · {featured.period}</p>
          <p className="mt-1 font-medium">{featured.title}</p>
          <dl className="mt-4 divide-y divide-line border-t border-line">
            {featured.stats.map((s) => (
              <div key={s.value} className="flex items-baseline gap-4 py-2.5">
                <dt className="w-16 shrink-0 font-mono text-lg font-medium tabular-nums">{s.value}</dt>
                <dd className="text-sm leading-snug text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            Read the case study
            <ArrowDown size={14} aria-hidden className="transition-transform group-hover:translate-y-0.5" />
          </p>
        </a>
      </div>

      <dl className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label} className="bg-bg p-5">
            <dt className="font-mono text-xs text-faint">{f.label}</dt>
            <dd className="mt-2 font-medium">{f.value}</dd>
            <dd className="mt-0.5 text-sm text-muted">{f.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
