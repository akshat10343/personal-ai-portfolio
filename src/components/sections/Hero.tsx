import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { identity } from "../../content/site";
import { cn } from "../../lib/utils";
import { NetworkGraph } from "../fx/NetworkGraph";
import { Terminal } from "../fx/Terminal";
import { MagneticButton } from "../ui/MagneticButton";
import { ScrambleText } from "../ui/ScrambleText";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

/** Headline words, revealed one by one; gradient ones shimmer forever. */
const HEADLINE: Array<{ text: string; gradient?: boolean }> = [
  { text: "I" },
  { text: "build" },
  { text: "intelligent", gradient: true },
  { text: "systems", gradient: true },
  { text: "that" },
  { text: "actually" },
  { text: "ship." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE },
  },
};

const headline = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const word = {
  hidden: { opacity: 0, y: 26, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE },
  },
};

export function Hero({ booted }: { booted: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Subtle parallax: hero content drifts up and fades as you scroll past.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-svh items-center overflow-hidden"
    >
      <NetworkGraph
        interactive
        className="absolute inset-0 opacity-40 [mask-image:radial-gradient(75%_70%_at_50%_40%,black,transparent)]"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pt-32 pb-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12"
      >
        <motion.div
          variants={container}
          initial={reduce ? false : "hidden"}
          animate={booted ? "show" : "hidden"}
        >
          <motion.div variants={item}>
            <span className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 font-mono text-xs text-body">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
              </span>
              {identity.availability}
            </span>
          </motion.div>

          <motion.h1
            variants={headline}
            className="mt-7 font-display text-[2.7rem] leading-[1.05] font-bold tracking-tight text-bright sm:text-6xl lg:text-[4.2rem]"
          >
            {HEADLINE.map((w, i) => (
              <motion.span
                key={i}
                variants={word}
                className={cn(
                  "inline-block whitespace-pre",
                  w.gradient && "text-gradient-animated",
                )}
              >
                {w.text}
                {i < HEADLINE.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed"
          >
            {identity.sub}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-4">
            <MagneticButton href="#projects">
              See my work
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </MagneticButton>
            <MagneticButton href="#contact" variant="ghost">
              Get in touch
            </MagneticButton>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-10 font-mono text-xs tracking-wide text-body/80"
          >
            <ScrambleText text={`${identity.role} · ${identity.location}`} />
          </motion.p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32, scale: 0.97 }}
          animate={
            booted
              ? { opacity: 1, y: 0, scale: 1 }
              : reduce
                ? undefined
                : { opacity: 0, y: 32, scale: 0.97 }
          }
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
        >
          <Terminal />
        </motion.div>
      </motion.div>

      <motion.a
        href="#about"
        aria-label="Scroll to about"
        initial={{ opacity: 0 }}
        animate={{ opacity: booted ? 1 : 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 text-body/50 transition-colors hover:text-bright md:block"
      >
        <motion.span
          animate={reduce ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="block"
        >
          <ChevronDown size={22} />
        </motion.span>
      </motion.a>
    </section>
  );
}

