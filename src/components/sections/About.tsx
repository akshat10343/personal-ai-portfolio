import { GraduationCap, MapPin, Users } from "lucide-react";
import { about, identity } from "../../content/site";
import { CountUp } from "../ui/CountUp";
import { GitHubActivity } from "../ui/GitHubActivity";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";
import { TiltCard } from "../ui/TiltCard";

function StatTile({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="glass flex h-full flex-col justify-center rounded-2xl px-4 py-6 text-center transition-colors duration-300 hover:border-accent/30">
        <p className="text-gradient font-display text-[1.8rem] font-bold">
          <CountUp value={value} />
        </p>
        <p className="mt-1.5 text-xs leading-snug text-body/80">{label}</p>
      </div>
    </Reveal>
  );
}

/** About as a bento mosaic: profile, story, stats, teaching, live GitHub. */
export function About() {
  const [s1, s2, s3, s4] = about.stats;

  return (
    <Section id="about" index="01" eyebrow="About" title={about.heading}>
      <div className="grid gap-4 md:grid-cols-4">
        {/* profile */}
        <Reveal className="md:row-span-2">
          <TiltCard className="flex h-full flex-col justify-center p-6">
            {/* PLACEHOLDER: swap the monogram block for a real photo when ready */}
            <div className="ring-gradient mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-raised">
              <span className="text-gradient font-display text-4xl font-bold">
                {identity.monogram}
              </span>
            </div>
            <h3 className="mt-5 text-center font-display text-lg font-semibold text-bright">
              {identity.name}
            </h3>
            <div className="mt-4 space-y-2.5 font-mono text-xs text-body">
              <p className="flex items-center gap-2.5">
                <GraduationCap size={14} className="shrink-0 text-accent-2/80" />
                B.S. CS, UW · May 2028
              </p>
              <p className="flex items-center gap-2.5">
                <Users size={14} className="shrink-0 text-accent-2/80" />
                President, Trickfire Robotics
              </p>
              <p className="flex items-center gap-2.5">
                <MapPin size={14} className="shrink-0 text-accent-2/80" />
                {identity.location}
              </p>
            </div>
          </TiltCard>
        </Reveal>

        {/* the story */}
        <Reveal delay={0.06} className="md:col-span-3">
          <TiltCard className="h-full p-7">
            <p className="text-[16px] leading-relaxed">{about.paragraphs[0]}</p>
            <p className="mt-4 text-[16px] leading-relaxed">
              {about.paragraphs[1]}
            </p>
          </TiltCard>
        </Reveal>

        {/* stats row */}
        <StatTile value={s1.value} label={s1.label} delay={0.08} />
        <StatTile value={s2.value} label={s2.label} delay={0.14} />
        <StatTile value={s3.value} label={s3.label} delay={0.2} />

        {/* last stat + teaching/leading tile */}
        <StatTile value={s4.value} label={s4.label} delay={0.1} />
        <Reveal delay={0.16} className="md:col-span-3">
          <TiltCard className="flex h-full items-center p-7">
            <p className="text-[16px] leading-relaxed">{about.paragraphs[2]}</p>
          </TiltCard>
        </Reveal>

        {/* live GitHub */}
        <Reveal delay={0.1} className="md:col-span-4">
          <GitHubActivity />
        </Reveal>
      </div>
    </Section>
  );
}
