import { useMemo } from "react";
import { Home, Layers, Mail, PenLine, Search } from "lucide-react";
import { useActiveSection } from "../../hooks/useActiveSection";
import { cn } from "../../lib/utils";

const ITEMS = [
  { id: "top", label: "Home", href: "#top", icon: Home },
  { id: "projects", label: "Projects", href: "#projects", icon: Layers },
  { id: "writing", label: "Writing", href: "#writing", icon: PenLine },
  { id: "contact", label: "Contact", href: "#contact", icon: Mail },
] as const;

/** Floating bottom dock on phones: quick jumps + the command palette. */
export function MobileDock() {
  const ids = useMemo(() => ITEMS.map((i) => i.id), []);
  const active = useActiveSection(ids);

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-6 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="glass ring-gradient flex items-center gap-1 rounded-full px-2 py-1.5 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.8)]">
        {ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "rounded-full p-2.5 transition-colors duration-200",
                isActive
                  ? "bg-bright/[0.08] text-accent-2"
                  : "text-body hover:text-bright",
              )}
            >
              <Icon size={18} />
            </a>
          );
        })}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-cmdk"))}
          aria-label="Open command palette"
          className="rounded-full bg-gradient-to-r from-accent to-accent-2 p-2.5 text-ink"
        >
          <Search size={18} />
        </button>
      </div>
    </nav>
  );
}
