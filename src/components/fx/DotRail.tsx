import { useMemo } from "react";
import { navLinks } from "../../content/site";
import { useActiveSection } from "../../hooks/useActiveSection";
import { cn } from "../../lib/utils";

/**
 * Slim dot rail on the right edge (xl+ screens): one dot per section,
 * the active one stretched and lit, labels on hover.
 */
export function DotRail() {
  const ids = useMemo(() => navLinks.map((l) => l.href.slice(1)), []);
  const active = useActiveSection(ids);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 xl:flex"
    >
      {navLinks.map((link) => {
        const isActive = active === link.href.slice(1);
        return (
          <a
            key={link.href}
            href={link.href}
            aria-label={link.label}
            className="group relative flex items-center p-0.5"
          >
            <span className="glass pointer-events-none absolute right-full mr-3 rounded-md px-2 py-1 font-mono text-[10px] whitespace-nowrap text-bright opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {link.label}
            </span>
            <span
              className={cn(
                "block rounded-full transition-all duration-300",
                isActive
                  ? "h-5 w-1.5 bg-gradient-to-b from-accent to-accent-2 shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                  : "h-1.5 w-1.5 bg-body/30 group-hover:bg-body/60",
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}
