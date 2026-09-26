import { useEffect, useRef } from "react";
import { storyBeats } from "../../content/site";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { STORY_LENGTH, ramp } from "../../lib/story";
import { cn } from "../../lib/utils";
import { Hero } from "../sections/Hero";

const FADE = 16; // vh over which a caption fades in or out

/**
 * The pinned, scroll-driven story: the hero sits over the first screen, then
 * four chapters take the engine apart while the 3D stage (behind the whole
 * page) changes shape. Caption fades happen in one rAF-throttled handler that
 * writes styles directly, so React doesn't re-render while you scroll.
 */
export function EngineStory() {
  const wrap = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const captions = [...el.querySelectorAll<HTMLElement>("[data-from]")];
    const chapters = [...el.querySelectorAll<HTMLElement>("[data-chapter]")];
    const rail = el.querySelector<HTMLElement>("[data-rail]");

    let raf = 0;
    const update = () => {
      raf = 0;
      const v = (-el.getBoundingClientRect().top / window.innerHeight) * 100;

      for (const c of captions) {
        const from = Number(c.dataset.from);
        const to = Number(c.dataset.to);
        const a = ramp(v, from, from + FADE);
        const b = 1 - ramp(v, to - FADE, to);
        const o = Math.min(a, b);
        c.style.opacity = String(o);
        c.style.transform = reduced ? "" : `translateY(${((1 - a) - (1 - b)) * 36}px)`;
        c.style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
      let current = -1;
      captions.forEach((c, i) => {
        if (v >= Number(c.dataset.from) && v < Number(c.dataset.to)) current = i;
      });
      chapters.forEach((ch, i) => ch.toggleAttribute("data-on", i === current));
      if (rail) rail.style.opacity = String(ramp(v, 110, 130) * (1 - ramp(v, 585, 600)));
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
      id="top"
      ref={wrap}
      aria-label="The Mini LLM Inference Engine, explained as you scroll"
      className="relative"
      style={{ height: `${STORY_LENGTH + 100}svh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* The 3D model itself lives in <Stage />, fixed behind the page. */}
        {storyBeats.map((b) => (
          <div
            key={b.id}
            data-from={b.from}
            data-to={b.to}
            className="pointer-events-none absolute inset-x-0 bottom-0 opacity-0 md:inset-y-0 md:flex md:items-center"
          >
            <div className="mx-auto w-full max-w-6xl bg-gradient-to-t from-black via-black/85 to-transparent px-5 pt-16 pb-10 sm:px-8 md:bg-none md:pt-0 md:pb-0">
              <div className="max-w-md">
                <p className="font-mono text-xs tracking-wide text-accent uppercase">{b.kicker}</p>
                <h2 className="mt-3 text-3xl leading-[1.08] font-semibold tracking-[-0.03em] md:text-5xl">
                  {b.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-lg">{b.body}</p>
                <p className="text-fire mt-6 text-6xl leading-none font-semibold tracking-[-0.04em] tabular-nums md:mt-10 md:text-8xl">
                  {b.stat}
                </p>
                <p className="mt-3 max-w-xs text-sm leading-snug text-muted">{b.statLabel}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Chapter rail */}
        <ol
          data-rail
          aria-hidden
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-black/60 p-1 opacity-0 backdrop-blur-md md:flex"
        >
          {storyBeats.map((b) => (
            <li
              key={b.id}
              data-chapter
              className={cn(
                "rounded-full px-3 py-1.5 font-mono text-[11px] text-faint transition-colors duration-300",
                "data-[on]:bg-fg data-[on]:text-bg",
              )}
            >
              {b.kicker.split(" · ")[1]}
            </li>
          ))}
        </ol>
      </div>

      {/* Nav target for "Engine": spans the chapters, so it also drives the
          active-link highlight. */}
      <div
        id="engine"
        aria-hidden
        className="pointer-events-none absolute inset-x-0"
        style={{ top: "130svh", height: "470svh" }}
      />

      <div className="absolute inset-x-0 top-0 z-10">
        <Hero />
      </div>
    </section>
  );
}
