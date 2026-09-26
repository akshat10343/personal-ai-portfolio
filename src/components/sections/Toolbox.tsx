import { toolbox } from "../../content/site";
import { Section } from "../ui/Section";

export function Toolbox() {
  return (
    <Section id="toolbox" index="04" title="Toolbox">
      <dl className="divide-y divide-line border-y border-line">
        {toolbox.map((g) => (
          <div key={g.title} className="grid gap-1 py-4 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-6">
            <dt className="pt-0.5 font-mono text-xs text-faint">{g.title}</dt>
            <dd className="leading-relaxed">{g.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
