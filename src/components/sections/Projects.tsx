import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ArrowUpRight, ShieldAlert, X } from "lucide-react";
import { projects } from "../../content/site";
import type { Project } from "../../content/site";
import { NetworkGraph } from "../fx/NetworkGraph";
import { CaseCharts } from "../ui/CaseCharts";
import { Chip } from "../ui/Chip";
import { Gallery } from "../ui/Gallery";
import { ProjectVisual } from "../ui/ProjectVisual";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";
import { TiltCard } from "../ui/TiltCard";
import { BatchingPlayground } from "./BatchingPlayground";
import { DetectionPlayground } from "./DetectionPlayground";

function Bullet({ children }: { children: string }) {
  return (
    <li className="flex gap-3 text-[15px] leading-relaxed">
      <span className="mt-[9px] h-1 w-3 shrink-0 rounded-full bg-gradient-to-r from-accent to-accent-2" />
      {children}
    </li>
  );
}

type OpenProps = { onOpen: (id: string) => void };

/** The featured card's story, told in three pinned steps (desktop). */
const SCROLLY_STEPS = [
  {
    tag: "STEP 1 / 3 · THE SCRATCH PASS",
    heading: "Rebuild the model from raw tensors",
    bulletIdx: [0],
    tiles: [
      ["1.1B", "params, pinned revision"],
      ["0.0", "max logit error vs HF"],
    ],
  },
  {
    tag: "STEP 2 / 3 · THE SERVING CORE",
    heading: "Cache once, batch continuously",
    bulletIdx: [1, 2],
    tiles: [
      ["11.3×", "decode speedup"],
      ["4.63×", "batch-4 throughput"],
    ],
  },
  {
    tag: "STEP 3 / 3 · THE HONEST TRADEOFF",
    heading: "INT8, with the cost reported",
    bulletIdx: [3, 4],
    tiles: [
      ["46.9%", "storage cut"],
      ["100%", "top-1 agreement"],
    ],
  },
] as const;

function FeaturedScrolly({ project, onOpen }: { project: Project } & OpenProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setStep(
      Math.max(
        0,
        Math.min(SCROLLY_STEPS.length - 1, Math.floor(v * SCROLLY_STEPS.length)),
      ),
    );
  });

  const s = SCROLLY_STEPS[step];

  return (
    <div ref={wrapRef} className="relative h-[240vh]">
      <div className="sticky top-24">
        <motion.div
          layoutId={`proj-${project.id}`}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(project.id)}
          onKeyDown={(e) => e.key === "Enter" && onOpen(project.id)}
          className="cursor-pointer"
        >
          <TiltCard tilt={1.5} className="border-beam p-8 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="font-mono text-xs tracking-wide text-accent-2/80">
                  FEATURED · {project.period}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-bright sm:text-3xl">
                  {project.title}
                </h3>
                <p className="mt-1.5 text-sm text-body/70">{project.org}</p>
                <p className="mt-4 text-[16px] leading-relaxed">
                  {project.summary}
                </p>

                <div className="mt-6 min-h-52">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.28 }}
                    >
                      <p className="font-mono text-[11px] tracking-[0.18em] text-accent-2/80">
                        {s.tag}
                      </p>
                      <h4 className="mt-2 font-display text-lg font-semibold text-bright">
                        {s.heading}
                      </h4>
                      <ul className="mt-3 space-y-3">
                        {s.bulletIdx.map((i) => (
                          <Bullet key={i}>{project.bullets[i]}</Bullet>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-5 flex gap-2">
                  {SCROLLY_STEPS.map((st, i) => (
                    <span
                      key={st.tag}
                      className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                        i <= step
                          ? "bg-gradient-to-r from-accent to-accent-2"
                          : "bg-bright/[0.08]"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
                <p className="mt-4 font-mono text-xs text-accent-2/70">
                  keep scrolling for the story · click for the case study +
                </p>
              </div>

              <div className="dark-island relative hidden min-h-72 overflow-hidden rounded-xl border border-line bg-ink/60 lg:block">
                <NetworkGraph forceDark className="absolute inset-0 opacity-80" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28 }}
                    className="absolute right-4 bottom-4 left-4 flex gap-3"
                  >
                    {s.tiles.map(([value, label]) => (
                      <div key={label} className="glass flex-1 rounded-lg px-4 py-3">
                        <p className="text-gradient font-display text-xl font-bold">
                          {value}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] tracking-wide text-body/70 uppercase">
                          {label}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </div>
  );
}

function FeaturedProject({ project, onOpen }: { project: Project } & OpenProps) {
  return (
    <Reveal>
      <motion.div
        layoutId={`proj-${project.id}`}
        role="button"
        tabIndex={0}
        onClick={() => onOpen(project.id)}
        onKeyDown={(e) => e.key === "Enter" && onOpen(project.id)}
        className="cursor-pointer"
      >
        <TiltCard tilt={2} className="border-beam p-8 md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="font-mono text-xs tracking-wide text-accent-2/80">
                FEATURED · {project.period}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-bright sm:text-3xl">
                {project.title}
              </h3>
              <p className="mt-1.5 text-sm text-body/70">{project.org}</p>
              <p className="mt-5 text-[16px] leading-relaxed">{project.summary}</p>
              <ul className="mt-6 space-y-3">
                {project.bullets.map((b) => (
                  <Bullet key={b}>{b}</Bullet>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              {project.note && (
                <p className="mt-6 flex items-center gap-2 font-mono text-xs text-body/50">
                  <ShieldAlert size={13} className="shrink-0" />
                  {project.note}
                </p>
              )}
              <p className="mt-4 font-mono text-xs text-accent-2/70">
                open case study +
              </p>
            </div>

            <div className="dark-island relative hidden min-h-72 overflow-hidden rounded-xl border border-line bg-ink/60 lg:block">
              <NetworkGraph forceDark className="absolute inset-0 opacity-80" />
              <div className="absolute right-4 bottom-4 left-4 flex gap-3">
                <div className="glass flex-1 rounded-lg px-4 py-3">
                  <p className="text-gradient font-display text-xl font-bold">
                    11.3×
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] tracking-wide text-body/70 uppercase">
                    decode speedup
                  </p>
                </div>
                <div className="glass flex-1 rounded-lg px-4 py-3">
                  <p className="text-gradient font-display text-xl font-bold">
                    4.63×
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] tracking-wide text-body/70 uppercase">
                    batch-4 throughput
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </Reveal>
  );
}

function ProjectCard({
  project,
  delay,
  onOpen,
}: { project: Project; delay: number } & OpenProps) {
  return (
    <Reveal delay={delay} className="h-full">
      <motion.div
        layoutId={`proj-${project.id}`}
        role="button"
        tabIndex={0}
        onClick={() => onOpen(project.id)}
        onKeyDown={(e) => e.key === "Enter" && onOpen(project.id)}
        className="h-full cursor-pointer"
      >
        <TiltCard className="flex h-full flex-col p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-semibold text-bright">
                {project.title}
              </h3>
              <p className="mt-1 text-[13px] text-body/70">
                {project.org} · {project.period}
              </p>
            </div>
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.title} on GitHub`}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-full p-2.5 text-body transition-all duration-300 group-hover:text-bright hover:border-accent/50 hover:text-bright"
              >
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            )}
          </div>
          <p className="mt-4 text-[15px] leading-relaxed">{project.summary}</p>
          <ul className="mt-4 space-y-2.5">
            {project.bullets.map((b) => (
              <Bullet key={b}>{b}</Bullet>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
            {project.tech.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
            <span className="ml-auto font-mono text-xs text-accent-2/70">
              case study +
            </span>
          </div>
        </TiltCard>
      </motion.div>
    </Reveal>
  );
}

function CaseStudyModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[52] bg-ink/80 backdrop-blur-md"
      />
      <div className="pointer-events-none fixed inset-0 z-[53] flex items-center justify-center p-4 sm:p-8">
        <motion.div
          layoutId={`proj-${project.id}`}
          className="pointer-events-auto max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-line bg-surface/[0.97] shadow-[0_40px_120px_-24px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          {/* sticky mini header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-surface/85 px-7 py-3.5 backdrop-blur-xl sm:px-9">
            <p className="font-mono text-xs tracking-wide text-accent-2/80">
              CASE STUDY · {project.period}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close case study"
              className="glass shrink-0 rounded-full p-2.5 text-body transition-colors hover:border-accent/40 hover:text-bright"
            >
              <X size={16} />
            </button>
          </div>

          {/* hero band */}
          <div className="relative overflow-hidden px-7 pt-7 pb-6 sm:px-9">
            <div
              aria-hidden
              className="absolute -top-20 left-1/3 h-56 w-[30rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[90px]"
            />
            <h3 className="relative font-display text-3xl font-bold text-bright sm:text-4xl">
              {project.title}
            </h3>
            {project.org && (
              <p className="relative mt-2 text-sm text-body/70">{project.org}</p>
            )}
            {project.heroStats && (
              <div className="relative mt-5 flex flex-wrap gap-3">
                {project.heroStats.map(([value, label]) => (
                  <div
                    key={label}
                    className="glass rounded-xl px-4 py-2.5"
                  >
                    <span className="text-gradient font-display text-xl font-bold">
                      {value}
                    </span>
                    <span className="ml-2 font-mono text-[10px] tracking-wide text-body/70 uppercase">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-7 pb-8 sm:px-9">
          <p className="text-[16px] leading-relaxed">{project.summary}</p>

          <ProjectVisual id={project.id} />

          {project.charts && <CaseCharts charts={project.charts} />}
          {project.gallery && <Gallery images={project.gallery} />}

          {project.details && (
            <>
              <h4 className="mt-8 font-mono text-xs tracking-[0.2em] text-accent-2/80 uppercase">
                The problem
              </h4>
              <p className="mt-3 text-[15px] leading-relaxed">
                {project.details.problem}
              </p>

              <h4 className="mt-8 font-mono text-xs tracking-[0.2em] text-accent-2/80 uppercase">
                The approach
              </h4>
              <ul className="mt-3 space-y-3">
                {project.details.approach.map((a) => (
                  <Bullet key={a}>{a}</Bullet>
                ))}
              </ul>

              <h4 className="mt-8 font-mono text-xs tracking-[0.2em] text-accent-2/80 uppercase">
                What stuck with me
              </h4>
              <p className="mt-3 border-l-2 border-accent/50 pl-4 text-[15px] leading-relaxed text-bright/90 italic">
                {project.details.learned}
              </p>
            </>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {project.tech.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>

          {project.href && (
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 font-display text-sm font-semibold text-ink transition-shadow hover:shadow-[0_0_28px_rgba(139,92,246,0.5)]"
            >
              View on GitHub
              <ArrowUpRight size={15} />
            </a>
          )}
          {project.note && (
            <p className="mt-6 flex items-center gap-2 font-mono text-xs text-body/50">
              <ShieldAlert size={13} className="shrink-0" />
              {project.note}
            </p>
          )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

export function Projects() {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const openProject = projects.find((p) => p.id === openId);

  // Scrollytelling only where there's room to pin (and motion is welcome).
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <Section
      id="projects"
      index="03"
      eyebrow="Projects"
      title={
        <>
          Things I've <span className="text-gradient">built</span>, from
          research pipelines to real users.
        </>
      }
      lede="Each of these taught me something different: systems depth from building an inference engine, product urgency at a startup, and craft on everything in between. Click any card for the full story."
    >
      <div className="space-y-6">
        {featured &&
          (isDesktop && !reduce ? (
            <FeaturedScrolly project={featured} onOpen={setOpenId} />
          ) : (
            <FeaturedProject project={featured} onOpen={setOpenId} />
          ))}
        <BatchingPlayground />
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              delay={0.07 * (i % 2)}
              onOpen={setOpenId}
            />
          ))}
        </div>
        <DetectionPlayground />
      </div>

      <AnimatePresence>
        {openProject && (
          <CaseStudyModal
            project={openProject}
            onClose={() => setOpenId(null)}
          />
        )}
      </AnimatePresence>
    </Section>
  );
}
