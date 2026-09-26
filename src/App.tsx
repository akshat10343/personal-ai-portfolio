import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { Contact } from "./components/sections/Contact";
import { Experience } from "./components/sections/Experience";
import { Hero } from "./components/sections/Hero";
import { Toolbox } from "./components/sections/Toolbox";
import { Work } from "./components/sections/Work";
import { Writing } from "./components/sections/Writing";

function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-fg px-4 py-2 text-sm text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Work />
        <Experience />
        <Writing />
        <Toolbox />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
