import { Component, lazy, Suspense, useEffect, type ReactNode } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { measureTimeline, story } from "../../lib/story";

// three.js is the heaviest thing on the page, so it loads after the text.
const EngineScene = lazy(() => import("./EngineScene"));

/** If WebGL isn't available, keep the page and drop the 3D. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The fixed 3D stage behind the whole page. It tracks scroll and pointer
 * position, and re-measures where each `data-shape` chapter sits whenever the
 * layout changes, so the scene always knows which shape to show.
 *
 * In-page links are handled here too: clicking one scrolls the page, but the
 * scene is locked to the destination, so the model morphs straight from the
 * current shape to the target's instead of replaying every chapter between.
 */
export function Stage() {
  const reduced = useReducedMotion();

  useEffect(() => {
    let jumpTo: number | null = null;
    let jumpTimer = 0;
    const release = () => {
      story.lock = null;
      jumpTo = null;
      window.clearTimeout(jumpTimer);
    };
    const onScroll = () => {
      story.vh = (window.scrollY / window.innerHeight) * 100;
      if (jumpTo !== null && Math.abs(window.scrollY - jumpTo) < 2) release();
    };
    const onLinkClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = a?.getAttribute("href")?.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const maxTop = document.documentElement.scrollHeight - window.innerHeight;
      const top = Math.round(Math.min(maxTop, Math.max(0, el.getBoundingClientRect().top + window.scrollY - pad)));
      jumpTo = top;
      story.lock = (top / window.innerHeight) * 100;
      story.jumpAt = performance.now();
      history.pushState(null, "", `#${id}`);
      const smoothScroll = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: smoothScroll ? "smooth" : "auto" });
      // Safety net: never stay locked if the scroll is interrupted or can't land exactly.
      window.clearTimeout(jumpTimer);
      jumpTimer = window.setTimeout(release, 2500);
      if (Math.abs(window.scrollY - top) < 2) release();
    };
    const onPointer = (e: PointerEvent) => {
      story.px = (e.clientX / window.innerWidth) * 2 - 1;
      story.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    let raf = 0;
    const remeasure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        measureTimeline();
        onScroll();
      });
    };

    remeasure();
    document.fonts?.ready.then(remeasure);
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("click", onLinkClick);
    // If the reader grabs the scroll mid-jump, hand control back to them.
    const userScroll = ["wheel", "touchstart", "keydown"] as const;
    for (const ev of userScroll) window.addEventListener(ev, release, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      release();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("click", onLinkClick);
      for (const ev of userScroll) window.removeEventListener(ev, release);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute top-1/2 left-1/2 h-[70vmax] w-[70vmax] -translate-y-1/2 rounded-full opacity-60 blur-3xl in-data-[theme=light]:opacity-35 md:left-[64%]"
        style={{
          background: "radial-gradient(closest-side, rgba(255,159,10,0.16), rgba(255,69,58,0.06) 55%, transparent 75%)",
          animation: reduced ? undefined : "drift 14s ease-in-out infinite alternate",
          translate: "-50% 0",
        }}
      />
      <SceneBoundary>
        <Suspense fallback={null}>
          <EngineScene reduced={reduced} />
        </Suspense>
      </SceneBoundary>
    </div>
  );
}
