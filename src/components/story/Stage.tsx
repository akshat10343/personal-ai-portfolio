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
 */
export function Stage() {
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      story.vh = (window.scrollY / window.innerHeight) * 100;
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
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute top-1/2 left-1/2 h-[70vmax] w-[70vmax] -translate-y-1/2 rounded-full opacity-60 blur-3xl md:left-[64%]"
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
