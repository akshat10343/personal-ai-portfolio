import { skillGroups } from "../../content/site";
import { Chip } from "../ui/Chip";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";
import { TiltCard } from "../ui/TiltCard";

export function Skills() {
  return (
    <Section
      id="skills"
      index="05"
      eyebrow="Skills"
      title={
        <>
          A toolbox built by <span className="text-gradient">shipping</span>,
          not by listing.
        </>
      }
      lede="Everything here has survived contact with a real project: a research pipeline, a production deploy, or a benchmark I actually ran."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, i) => (
          <Reveal key={group.title} delay={0.06 * (i % 3)} className="h-full">
            <TiltCard className="h-full p-6">
              <h3 className="font-mono text-xs tracking-[0.18em] text-accent-2/80 uppercase">
                {group.title}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Chip key={skill}>{skill}</Chip>
                ))}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
