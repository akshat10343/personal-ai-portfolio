import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { experience } from "../../content/site";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";

/**
 * Pinned split view (lg+): the employer list sticks on the left and
 * highlights whichever role is currently in the middle of the viewport,
 * while the roles scroll by on the right with room to breathe. Below lg
 * it degrades to a simple stacked list.
 */
export function Experience() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const entryRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Track which entry sits in the middle band of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = entryRefs.current.indexOf(e.target as HTMLLIElement);
          if (idx !== -1) setActive(idx);
        }
      },
      { rootMargin: "-42% 0px -50% 0px" },
    );
    for (const el of entryRefs.current) el && io.observe(el);
    return () => io.disconnect();
  }, []);

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
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
        {/* pinned employer rail (lg+) */}
        <div className="hidden lg:block">
          <ol className="sticky top-28 space-y-1.5">
            {experience.map((job, i) => (
              <li key={`${job.org}-${job.role}`}>
                <button
                  type="button"
                  onClick={() =>
                    entryRefs.current[i]?.scrollIntoView({
                      behavior: reduce ? "auto" : "smooth",
                      block: "center",
                    })
                  }
                  className={
                    "group flex w-full items-baseline gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-300 " +
                    (active === i
                      ? "glass border-accent/35"
                      : "border-transparent hover:border-line")
                  }
                >
                  <span
                    className={
                      "font-mono text-[11px] transition-colors duration-300 " +
                      (active === i ? "text-accent-2" : "text-body/60")
                    }
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={
                        "block truncate font-display text-sm font-semibold transition-colors duration-300 " +
                        (active === i ? "text-bright" : "text-body/75")
                      }
                    >
                      {job.org}
                    </span>
                    <span
                      className={
                        "block truncate text-xs transition-colors duration-300 " +
                        (active === i ? "text-body" : "text-body/65")
                      }
                    >
                      {job.role}
                    </span>
                  </span>
                  <span
                    className={
                      "ml-auto hidden shrink-0 font-mono text-[10px] xl:inline " +
                      (active === i ? "text-accent-2/80" : "text-body/60")
                    }
                  >
                    {job.period.split("–")[0].trim()}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* the roles themselves */}
        <ol className="space-y-14 lg:space-y-28">
          {experience.map((job, i) => (
            <li
              key={`${job.org}-${job.role}`}
              ref={(el) => {
                entryRefs.current[i] = el;
              }}
              className="scroll-mt-32"
            >
              <Reveal delay={0.04 * (i % 3)}>
                <motion.div
                  animate={
                    reduce
                      ? undefined
                      : { opacity: active === i ? 1 : 0.55 }
                  }
                  transition={{ duration: 0.35 }}
                  className="lg:pl-2"
                >
                  <p className="font-mono text-[11px] tracking-[0.18em] text-accent-2/80 uppercase lg:hidden">
                    {String(i + 1).padStart(2, "0")} · {job.org}
                  </p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 lg:mt-0">
                    <h3 className="font-display text-xl font-semibold text-bright lg:text-2xl">
                      {job.role}
                    </h3>
                    <span className="hidden font-mono text-xs text-accent-2/80 lg:inline">
                      {job.org}
                    </span>
                    <span className="font-mono text-xs text-body/50">
                      {job.period}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {job.points.map((point) => (
                      <li
                        key={point}
                        className="flex max-w-2xl gap-3 text-[15px] leading-relaxed"
                      >
                        <span className="mt-[9px] h-1 w-3 shrink-0 rounded-full bg-gradient-to-r from-accent to-accent-2" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
