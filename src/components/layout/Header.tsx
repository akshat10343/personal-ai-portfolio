import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { identity, navLinks } from "../../content/site";
import { useActiveSection } from "../../hooks/useActiveSection";
import { cn } from "../../lib/utils";

const sectionIds = navLinks.map((l) => l.href.slice(1));

export function Header() {
  const active = useActiveSection(sectionIds);
  const [open, setOpen] = useState(false);

  // Close the phone menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" className="text-sm font-semibold tracking-tight" onClick={() => setOpen(false)}>
          {identity.name}
        </a>
        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={active === l.href.slice(1) ? "true" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs transition-colors",
                    active === l.href.slice(1) ? "bg-white/10 text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="-mr-2 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:text-fg md:hidden"
        >
          {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Sections" className="border-t border-white/[0.06] md:hidden">
          <ul className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/[0.06] py-3.5 text-lg font-medium last:border-0"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
