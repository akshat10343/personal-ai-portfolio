import { experience, leadership, type Role } from "../../content/site";
import { Section } from "../ui/Section";

function RoleList({ roles }: { roles: Role[] }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {roles.map((r) => (
        <li key={r.org + r.role} className="grid gap-1 py-5 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-6">
          <p className="pt-0.5 font-mono text-xs text-faint tabular-nums">{r.period}</p>
          <div>
            <h4 className="font-medium">
              {r.role} <span className="text-muted">· {r.org}</span>
            </h4>
            {r.points.map((p) => (
              <p key={p} className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
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
    <Section id="experience" index="02" title="Experience">
      <h3 className="sr-only">Work</h3>
      <RoleList roles={experience} />
      <h3 className="mt-12 mb-4 text-lg font-semibold tracking-tight">Leadership</h3>
      <RoleList roles={leadership} />
    </Section>
  );
}
