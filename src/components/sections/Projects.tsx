import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ShieldAlert, X } from "lucide-react";
import { projects } from "../../content/site";
import type { Project } from "../../content/site";
import { NetworkGraph } from "../fx/NetworkGraph";
import { Chip } from "../ui/Chip";
import { ProjectVisual } from "../ui/ProjectVisual";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";
import { TiltCard } from "../ui/TiltCard";
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
        <TiltCard tilt={2} className="p-8 md:p-10">
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
                    96.2%
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] tracking-wide text-body/70 uppercase">
                    detection @ 16.6% FA
                  </p>
                </div>
                <div className="glass flex-1 rounded-lg px-4 py-3">
                  <p className="text-gradient font-display text-xl font-bold">
                    0.995
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] tracking-wide text-body/70 uppercase">
                    PR-AUC · 560K-row test
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
          className="pointer-events-auto max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface/[0.97] p-7 shadow-[0_40px_120px_-24px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-9"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-mono text-xs tracking-wide text-accent-2/80">
                CASE STUDY · {project.period}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-bright sm:text-3xl">
                {project.title}
              </h3>
              {project.org && (
                <p className="mt-1.5 text-sm text-body/70">{project.org}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close case study"
              className="glass shrink-0 rounded-full p-2.5 text-body transition-colors hover:border-accent/40 hover:text-bright"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-6 text-[16px] leading-relaxed">{project.summary}</p>

          <ProjectVisual id={project.id} />

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
        </motion.div>
      </div>
    </>
  );
}

export function Projects() {
  const [openId, setOpenId] = useState<string | null>(null);
  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const openProject = projects.find((p) => p.id === openId);

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
      lede="Each of these taught me something different: research rigor at Bell Labs, product urgency at a startup, and craft on everything in between. Click any card for the full story."
    >
      <div className="space-y-6">
        {featured && <FeaturedProject project={featured} onOpen={setOpenId} />}
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
