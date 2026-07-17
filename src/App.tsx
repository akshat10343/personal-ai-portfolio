import { useCallback, useEffect, useState } from "react";
import { Backdrop } from "./components/fx/Backdrop";
import { CommandPalette } from "./components/fx/CommandPalette";
import { CursorGlow } from "./components/fx/CursorGlow";
import { IntroOverlay } from "./components/fx/IntroOverlay";
import { Marquee } from "./components/fx/Marquee";
import { MatrixRain } from "./components/fx/MatrixRain";
import { ShortcutsOverlay } from "./components/fx/ShortcutsOverlay";
import { TourMode } from "./components/fx/TourMode";
import { ScrollProgress } from "./components/fx/ScrollProgress";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { About } from "./components/sections/About";
import { Contact } from "./components/sections/Contact";
import { Experience } from "./components/sections/Experience";
import { Experiments } from "./components/sections/Experiments";
import { Goals } from "./components/sections/Goals";
import { Hero } from "./components/sections/Hero";
import { Projects } from "./components/sections/Projects";
import { Skills } from "./components/sections/Skills";
import { Writing } from "./components/sections/Writing";

function App() {
  // The boot overlay plays once per session; hero entrances wait for it.
  const [booted, setBooted] = useState(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return reduce || sessionStorage.getItem("intro-seen") === "1";
  });

  const finishIntro = useCallback(() => {
    sessionStorage.setItem("intro-seen", "1");
    setBooted(true);
  }, []);

  // Konami code → matrix mode. You found it.
  useEffect(() => {
    const seq = [
      "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
    ];
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === seq[i] ? i + 1 : k === seq[0] ? 1 : 0;
      if (i === seq.length) {
        i = 0;
        window.dispatchEvent(new CustomEvent("matrix-mode"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <IntroOverlay show={!booted} onDone={finishIntro} />
      <Backdrop />
      <CursorGlow />
      <CommandPalette />
      <MatrixRain />
      <TourMode />
      <ShortcutsOverlay />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero booted={booted} />
        <Marquee />
        <About />
        <Experience />
        <Projects />
        <Experiments />
        <Writing />
        <Skills />
        <Goals />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
