import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { goals } from "../../content/site";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";

export function Goals() {
  const lineRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // The timeline's spine draws itself as you scroll through it.
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 0.75", "end 0.55"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  return (
    <Section
      id="goals"
      index="06"
      eyebrow="Future Goals"
      title={
        <>
          Where this is all <span className="text-gradient">headed</span>.
        </>
      }
      lede="The plan, loosely held. North star: build AI systems people actually rely on."
    >
      <div ref={lineRef} className="relative ml-2 sm:ml-6">
        {/* spine */}
        <div className="absolute top-1 bottom-1 left-[5px] w-px bg-line" />
        <motion.div
          style={{ scaleY: reduce ? 1 : scaleY }}
          className="absolute top-1 bottom-1 left-[5px] w-px origin-top bg-gradient-to-b from-accent to-accent-2"
        />

        <ol className="space-y-12">
          {goals.map((goal, i) => (
            <li key={goal.title} className="relative pl-10">
              <motion.span
                initial={reduce ? false : { scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 16,
                  delay: 0.08 * i,
                }}
                className="absolute top-1.5 left-0 h-[11px] w-[11px] rounded-full border-2 border-accent bg-ink shadow-[0_0_14px_rgba(139,92,246,0.8)]"
              />
              <Reveal delay={0.05 * i}>
                <p className="font-mono text-xs tracking-wide text-accent-2/80 uppercase">
                  {goal.when}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-bright">
                  {goal.title}
                </h3>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed">
                  {goal.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
