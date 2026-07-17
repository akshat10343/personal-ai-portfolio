import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { identity, navLinks } from "../../content/site";
import { useActiveSection } from "../../hooks/useActiveSection";
import { getTheme, toggleTheme, type Theme } from "../../lib/theme";
import { cn } from "../../lib/utils";

/** Floating glass-pill navigation with active-section highlight. */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => getTheme());
  const reduce = useReducedMotion();

  // Stay in sync when the theme is toggled elsewhere (terminal, palette).
  useEffect(() => {
    const onChange = (e: Event) =>
      setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener("themechange", onChange);
    return () => window.removeEventListener("themechange", onChange);
  }, []);

  const ids = useMemo(() => navLinks.map((l) => l.href.slice(1)), []);
  const active = useActiveSection(ids);

  // Tuck the navbar away while scrolling down; bring it back on scroll up.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 480 && y > lastY);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={reduce ? false : { y: -24, opacity: 0 }}
        animate={
          hidden && !open ? { y: -96, opacity: 0 } : { y: 0, opacity: 1 }
        }
        transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-x-0 top-4 z-40 flex justify-center px-4"
      >
        <nav
          className={cn(
            "glass flex w-full max-w-4xl items-center justify-between rounded-full py-2 pr-2 pl-5 transition-shadow duration-300",
            scrolled && "shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]",
          )}
        >
          <a
            href="#top"
            className="font-mono text-sm font-semibold tracking-tight"
            aria-label={`${identity.name}, back to top`}
          >
            <span className="text-gradient">{identity.monogram}</span>
            <span className="text-body/50">/</span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = active === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      "relative rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors duration-200",
                      isActive ? "text-bright" : "text-body hover:text-bright",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-bright/[0.07]"
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            {identity.resumeUrl && (
              <a
                href={identity.resumeUrl}
                download
                className="rounded-full px-3 py-1.5 text-[13px] font-medium text-body transition-colors hover:text-bright"
              >
                Résumé
              </a>
            )}
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="rounded-full p-2 text-body transition-colors hover:text-bright"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-cmdk"))}
              className="flex items-center gap-1.5 rounded-full border border-line bg-bright/[0.04] px-3 py-1.5 font-mono text-[11px] text-body transition-colors hover:border-accent/40 hover:text-bright"
              aria-label="Open command palette"
            >
              <Search size={12} />
              ⌘K
            </button>
            <a
              href="#contact"
              className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 py-1.5 font-display text-[13px] font-semibold whitespace-nowrap text-ink transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(139,92,246,0.5)]"
            >
              Say hi
            </a>
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="rounded-full p-2 text-body"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-cmdk"))}
              className="rounded-full p-2 text-body"
              aria-label="Open command palette"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full p-2 text-bright"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col bg-ink/90 backdrop-blur-xl md:hidden"
          >
            <div className="flex items-center justify-between px-6 py-6">
              <span className="font-mono text-sm font-semibold">
                <span className="text-gradient">{identity.monogram}</span>
                <span className="text-body/50">/</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-bright"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <ul className="flex flex-1 flex-col justify-center gap-2 px-8">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={reduce ? false : { opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.35 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 font-display text-3xl font-semibold text-bright"
                  >
                    <span className="mr-3 font-mono text-sm text-accent-2/70">
                      0{i + 1}
                    </span>
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
