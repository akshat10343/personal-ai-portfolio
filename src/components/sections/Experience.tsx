import { experience, leadership, toolbox, type Role } from "../../content/site";
import { StageChapter } from "../ui/StageChapter";

function Timeline({ roles }: { roles: Role[] }) {
  return (
    <ol className="relative space-y-4 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:w-px before:bg-gradient-to-b before:from-accent/70 before:via-line before:to-transparent">
      {roles.map((r) => (
        <li key={r.org + r.role} className="reveal relative pl-9">
          <span
            aria-hidden
            className="absolute top-6 left-0 h-[15px] w-[15px] rounded-full border-2 border-accent bg-bg shadow-[0_0_14px_1px] shadow-accent/40"
          />
          <div className="rounded-3xl border border-line bg-surface/90 p-5 backdrop-blur-md transition-colors hover:border-fg/15">
            <p className="font-mono text-xs text-faint tabular-nums">{r.period}</p>
            <h4 className="mt-1.5 text-lg font-semibold tracking-tight">
              {r.role} <span className="font-normal text-muted">· {r.org}</span>
            </h4>
            {r.points.map((p) => (
              <p key={p} className="mt-2 leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Experience() {
  return (
    <StageChapter
      id="experience"
      shape={12}
      eyebrow="Experience"
      title="Where I’ve done the work."
      sub="The helix lights up as you scroll the timeline."
    >
      <h3 className="mb-5 font-mono text-xs tracking-wide text-faint uppercase">Work</h3>
      <Timeline roles={experience} />
      <h3 className="mt-12 mb-5 font-mono text-xs tracking-wide text-faint uppercase">Leadership</h3>
      <Timeline roles={leadership} />
      <div className="reveal mt-12 rounded-3xl border border-line bg-surface/90 p-5 backdrop-blur-md">
        <h3 className="font-mono text-xs tracking-wide text-faint uppercase">Toolbox</h3>
        <dl className="mt-4 space-y-4">
          {toolbox.map((g) => (
            <div key={g.title}>
              <dt className="text-sm font-medium">{g.title}</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <span key={s} className="rounded-full border border-line bg-bg px-3 py-1 text-xs text-muted">
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </StageChapter>
  );
}
