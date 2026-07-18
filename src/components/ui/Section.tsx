import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "../../lib/utils";
import { Reveal } from "./Reveal";
import { ScrambleText } from "./ScrambleText";
import { ScrubText } from "./ScrubText";

type SectionProps = {
  id: string;
  /** Zero-padded index shown in the mono eyebrow, e.g. "01". */
  index: string;
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Standard page section: numbered eyebrow, display title, optional lede,
 * and a huge outlined ghost numeral that drifts on scroll (parallax).
 */
export function Section({
  id,
  index,
  eyebrow,
  title,
  lede,
  children,
  className,
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [70, -70]);

  return (
    <section ref={ref} id={id} className={cn("relative scroll-mt-28", className)}>
      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
        <motion.span
          aria-hidden
          style={reduce ? undefined : { y: ghostY }}
          className="text-outline pointer-events-none absolute top-6 right-2 font-display text-[8rem] leading-none font-bold select-none sm:right-8 sm:text-[12rem]"
        >
          {index}
        </motion.span>

        <Reveal>
          <p className="font-mono text-[13px] tracking-[0.2em] text-accent-2/80 uppercase">
            <span className="text-body/50">{index} /</span>{" "}
            <ScrambleText text={eyebrow} />
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight text-bright sm:text-[2.6rem] sm:leading-[1.1]">
            {title}
          </h2>
          {lede && (
            <ScrubText
              text={lede}
              className="mt-5 max-w-2xl text-lg leading-relaxed"
            />
          )}
        </Reveal>
        <div className="relative mt-12 md:mt-16">{children}</div>
      </div>
    </section>
  );
}
