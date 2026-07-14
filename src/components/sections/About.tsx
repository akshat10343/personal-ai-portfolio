import { GraduationCap, MapPin, Users } from "lucide-react";
import { about, identity } from "../../content/site";
import { CountUp } from "../ui/CountUp";
import { GitHubActivity } from "../ui/GitHubActivity";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";
import { TiltCard } from "../ui/TiltCard";

export function About() {
  return (
    <Section
      id="about"
      index="01"
      eyebrow="About"
      title={about.heading}
    >
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <Reveal>
          <TiltCard className="p-8">
            <div className="ring-gradient mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-raised">
              <span className="text-gradient font-display text-5xl font-bold">
                {identity.monogram}
              </span>
            </div>
            <h3 className="mt-6 text-center font-display text-xl font-semibold text-bright">
              {identity.name}
            </h3>
            <div className="mt-5 space-y-3 font-mono text-[13px] text-body">
              <p className="flex items-center gap-2.5">
                <GraduationCap size={15} className="text-accent-2/80 shrink-0" />
                B.S. Computer Science, UW · May 2028
              </p>
              <p className="flex items-center gap-2.5">
                <Users size={15} className="text-accent-2/80 shrink-0" />
                President, Trickfire Robotics
              </p>
              <p className="flex items-center gap-2.5">
                <MapPin size={15} className="text-accent-2/80 shrink-0" />
                {identity.location}
              </p>
            </div>
          </TiltCard>
        </Reveal>

        <div>
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.08 * i}>
              <p className="mb-5 text-[17px] leading-relaxed">{p}</p>
            </Reveal>
          ))}

          <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {about.stats.map((stat, i) => (
              <Reveal key={stat.label} delay={0.08 * i} className="h-full">
                <div className="glass flex h-full flex-col justify-center rounded-xl px-4 py-5 text-center">
                  <p className="text-gradient font-display text-[1.7rem] font-bold">
                    <CountUp value={stat.value} />
                  </p>
                  <p className="mt-1.5 text-xs leading-snug text-body/80">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <Reveal className="mt-6">
        <GitHubActivity />
      </Reveal>
    </Section>
  );
}
