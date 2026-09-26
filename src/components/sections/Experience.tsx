import { useEffect, useRef } from "react";
import { experience, leadership, toolbox } from "../../content/site";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { live } from "../../lib/live";
import { ramp } from "../../lib/story";
import { StageChapter } from "../ui/StageChapter";

const ROLES = [
  ...experience.map((r) => ({ ...r, group: "Work" })),
  ...leadership.map((r) => ({ ...r, group: "Leadership" })),
];
/** Scroll distance per role while the section is pinned, in vh. */
const ROLE_VH = 70;
const FADE = 12;

/**
 * Pinned like the opening story: one role at a time on the left, swapping as
 * you scroll, while the helix lights that role's segment (the scene reads the
 * section's pinned range from `data-span` and the role count from live.roles).
 */
function Timeline() {
  const wrap = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    live.roles = ROLES.length;
    const el = wrap.current;
    if (!el) return;
    const cards = [...el.querySelectorAll<HTMLElement>("[data-role]")];
    const dots = [...el.querySelectorAll<HTMLElement>("[data-dot]")];
    const counter = el.querySelector<HTMLElement>("[data-counter]");

    let raf = 0;
    const update = () => {
      raf = 0;
      const v = (-el.getBoundingClientRect().top / window.innerHeight) * 100;
      const current = Math.max(0, Math.min(ROLES.length - 1, Math.floor(v / ROLE_VH)));
      cards.forEach((c, i) => {
        const from = i * ROLE_VH;
        const to = (i + 1) * ROLE_VH;
        const a = i === 0 ? 1 : ramp(v, from - FADE / 2, from + FADE / 2);
        const b = i === ROLES.length - 1 ? 1 : 1 - ramp(v, to - FADE / 2, to + FADE / 2);
        const o = Math.min(a, b);
        c.style.opacity = String(o);
        c.style.transform = reduced ? "" : `translateY(${((1 - a) - (1 - b)) * 28}px)`;
        c.style.pointerEvents = o > 0.5 ? "auto" : "none";
      });
      dots.forEach((d, i) => d.toggleAttribute("data-on", i === current));
      if (counter) counter.textContent = `${current + 1} of ${ROLES.length}`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  return (
    <section
      id="experience"
      ref={wrap}
      data-shape={12}
      data-span={ROLES.length * ROLE_VH}
      aria-labelledby="experience-title"
      className="relative"
      style={{ height: `${ROLES.length * ROLE_VH + 100}svh` }}
    >
      <div className="sticky top-0 flex h-svh items-end md:items-center">
        <div className="mx-auto w-full max-w-6xl px-5 pb-8 sm:px-8 md:pb-0">
          <div className="max-w-[34rem] max-md:rounded-3xl max-md:bg-bg/60 max-md:p-5 max-md:backdrop-blur-sm">
            <p className="font-mono text-xs tracking-wide text-accent uppercase">Experience</p>
            <h2 id="experience-title" className="mt-3 text-4xl leading-[1.04] font-semibold tracking-[-0.035em] md:text-[3.25rem]">
              Where I’ve done the work.
            </h2>

            <ol className="relative mt-8 grid">
              {ROLES.map((r, i) => (
                <li
                  key={r.org + r.role}
                  data-role={i}
                  className="col-start-1 row-start-1 rounded-3xl border border-line bg-surface/90 p-6 backdrop-blur-md"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <p className="font-mono text-xs text-faint">
                    <span className="text-accent">{r.group}</span> · {r.period}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{r.role}</h3>
                  <p className="text-muted">{r.org}</p>
                  {r.points.map((p) => (
                    <p key={p} className="mt-4 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </li>
              ))}
            </ol>

            <div aria-hidden className="mt-6 flex items-center gap-3">
              <div className="flex gap-1.5">
                {ROLES.map((r) => (
                  <span
                    key={r.org + r.role}
                    data-dot
                    className="h-1.5 w-1.5 rounded-full bg-fg/20 transition-all duration-300 data-[on]:w-6 data-[on]:bg-accent"
                  />
                ))}
              </div>
              <span data-counter className="font-mono text-xs text-faint tabular-nums">
                1 of {ROLES.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <>
      <Timeline />
      <StageChapter
        id="toolbox"
        shape={0}
        eyebrow="Toolbox"
        title="What I build with."
        sub="The model reassembles for the last stretch. Here’s what I reach for."
      >
        <div className="rounded-3xl border border-line bg-surface/90 p-6 backdrop-blur-md">
          <dl className="space-y-5">
            {toolbox.map((g) => (
              <div key={g.title}>
                <dt className="text-sm font-medium">{g.title}</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {g.items.map((s) => (
                    <span key={s} className="rounded-full border border-line bg-bg px-3 py-1 text-xs text-muted">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </StageChapter>
    </>
  );
}
