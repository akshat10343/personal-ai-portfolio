import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { experience } from "../../content/site";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";

export function Experience() {
  const lineRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 0.75", "end 0.55"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  return (
    <Section
      id="experience"
      index="02"
      eyebrow="Experience"
      title={
        <>
          Where I've <span className="text-gradient">shipped</span> so far.
        </>
      }
      lede="The short version of the résumé, minus nothing that matters."
    >
      <div ref={lineRef} className="relative ml-2 sm:ml-6">
        <div className="absolute top-1 bottom-1 left-[5px] w-px bg-line" />
        <motion.div
          style={{ scaleY: reduce ? 1 : scaleY }}
          className="absolute top-1 bottom-1 left-[5px] w-px origin-top bg-gradient-to-b from-accent to-accent-2"
        />

        <ol className="space-y-11">
          {experience.map((job, i) => (
            <li key={`${job.org}-${job.role}`} className="relative pl-10">
              <motion.span
                initial={reduce ? false : { scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 16,
                  delay: 0.06 * i,
                }}
                className="absolute top-1.5 left-0 h-[11px] w-[11px] rounded-full border-2 border-accent-2 bg-ink shadow-[0_0_14px_rgba(34,211,238,0.7)]"
              />
              <Reveal delay={0.05 * i}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-lg font-semibold text-bright">
                    {job.role}
                  </h3>
                  <span className="font-mono text-xs text-accent-2/80">
                    {job.org}
                  </span>
                  <span className="font-mono text-xs text-body/50">
                    {job.period}
                  </span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {job.points.map((point) => (
                    <li
                      key={point}
                      className="max-w-2xl text-[15px] leading-relaxed"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
