import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { identity, navLinks } from "../../content/site";
import { useActiveSection } from "../../hooks/useActiveSection";
import { getTheme, toggleTheme, type Theme } from "../../lib/theme";
import { cn } from "../../lib/utils";

const sectionIds = navLinks.map((l) => l.href.slice(1));

export function Header() {
  const active = useActiveSection(sectionIds);
  const [theme, setTheme] = useState<Theme>(getTheme);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" className="font-semibold tracking-tight">
          {identity.name}
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Sections" className="hidden sm:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={active === l.href.slice(1) ? "true" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm transition-colors",
                      active === l.href.slice(1) ? "text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href="#contact"
            className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-fg sm:hidden"
          >
            Contact
          </a>
          <button
            type="button"
            onClick={() => setTheme(toggleTheme())}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-fg"
          >
            {theme === "dark" ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
          </button>
        </div>
      </div>
    </header>
  );
}
