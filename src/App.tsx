import { useEffect } from "react";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { Contact } from "./components/sections/Contact";
import { Experience } from "./components/sections/Experience";
import { Play } from "./components/sections/Play";
import { Projects } from "./components/sections/Projects";
import { Research } from "./components/sections/Research";
import { EngineStory } from "./components/story/EngineStory";
import { Stage } from "./components/story/Stage";

/** Fade `.reveal` elements up the first time they scroll into view. */
function useReveals() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("js-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function App() {
  useReveals();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-fg px-4 py-2 text-sm text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      <Stage />
      <main id="main" className="relative z-10">
        <EngineStory />
        <Play />
        <Research />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}

export default App;
