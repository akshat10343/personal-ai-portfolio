import { useRef, type CSSProperties, type PointerEvent } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, MessagesSquare, ShieldCheck, Sun, Utensils, type LucideIcon } from "lucide-react";
import { projects, type Project } from "../../content/site";
import { Chapter } from "../ui/Chapter";

const LOOK: Record<string, { icon: LucideIcon; glow: string }> = {
  tomshield: { icon: ShieldCheck, glow: "rgba(100,210,255,0.35)" },
  "nlp-finance": { icon: MessagesSquare, glow: "rgba(191,90,242,0.35)" },
  solarsave: { icon: Sun, glow: "rgba(255,214,10,0.32)" },
  "calorie-counter": { icon: Utensils, glow: "rgba(48,209,88,0.3)" },
};

/** Card that tilts toward the pointer, with a light that follows it. */
function TiltCard({ p }: { p: Project }) {
  const ref = useRef<HTMLElement>(null);
  const look = LOOK[p.id] ?? LOOK.tomshield;
  const Icon = look.icon;

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg)`;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <article
      ref={ref}
      id={p.id}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group relative flex w-[82vw] max-w-[26rem] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-line bg-surface p-7 transition-transform duration-300 ease-out will-change-transform sm:w-[26rem]"
      style={{ "--glow": look.glow } as CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), var(--glow), transparent 60%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
        style={{ background: look.glow }}
      />
      <div className="relative flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Icon size={22} aria-hidden />
        </span>
        <span className="font-mono text-xs text-faint tabular-nums">{p.period}</span>
      </div>
      <h3 className="relative mt-8 text-2xl font-semibold tracking-tight">{p.title}</h3>
      <p className="relative text-sm text-muted">{p.kind}</p>
      <p className="relative mt-4 leading-relaxed">{p.summary}</p>
      <ul className="relative mt-4 space-y-2 text-sm leading-relaxed text-muted">
        {p.bullets.map((b) => (
          <li key={b} className="grid grid-cols-[1rem_minmax(0,1fr)]">
            <span aria-hidden className="text-faint">–</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-3 pt-7">
        <p className="font-mono text-[11px] text-faint">{p.tech.join(" · ")}</p>
        {p.href && (
          <a
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent"
          >
            Source
            <ArrowUpRight size={14} aria-hidden />
          </a>
        )}
      </div>
    </article>
  );
}

const GUTTER = "max(1.25rem, calc((100vw - 72rem) / 2 + 2rem))";

export function Projects() {
  const rail = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * Math.min(440, el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <Chapter
      id="projects"
      eyebrow="More work"
      title="Other things I’ve shipped."
      sub="A startup backend, an NLP benchmark, and two full-stack builds. Swipe or use the arrows."
      className="border-t border-line"
    >
      <div className="reveal">
        <div className="mb-5 hidden justify-end gap-2 md:flex">
          {[
            { dir: -1, label: "Previous projects", Icon: ChevronLeft },
            { dir: 1, label: "Next projects", Icon: ChevronRight },
          ].map(({ dir, label, Icon }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => scrollBy(dir)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface transition-colors hover:bg-subtle"
            >
              <Icon size={18} aria-hidden />
            </button>
          ))}
        </div>
        {/* Full-bleed rail: cards line up with the content column but can
            scroll out to the screen edges. */}
        <div
          ref={rail}
          className="relative left-1/2 flex w-screen -translate-x-1/2 snap-x snap-mandatory gap-5 overflow-x-auto pt-2 pb-6 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
        >
          {projects.map((p) => (
            <TiltCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </Chapter>
  );
}
