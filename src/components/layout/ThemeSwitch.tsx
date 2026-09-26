import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme, type Theme } from "../../lib/theme";
import { cn } from "../../lib/utils";

/** A sliding sun/moon switch between the dark and light themes. */
export function ThemeSwitch() {
  const [theme, setState] = useState<Theme>(getTheme);
  const light = theme === "light";
  const toggle = () => {
    const next: Theme = light ? "dark" : "light";
    setTheme(next);
    setState(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      aria-label="Light mode"
      onClick={toggle}
      className="relative inline-flex h-7 w-[3.25rem] shrink-0 cursor-pointer items-center rounded-full border border-line bg-subtle p-0.5 transition-colors"
    >
      <Moon size={12} aria-hidden className="absolute left-2 text-muted" />
      <Sun size={12} aria-hidden className="absolute right-2 text-muted" />
      <span
        aria-hidden
        className={cn(
          "relative z-10 flex h-[1.375rem] w-[1.375rem] items-center justify-center rounded-full bg-fg text-bg shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.3,1.4,0.5,1)]",
          light && "translate-x-6",
        )}
      >
        {light ? <Sun size={12} /> : <Moon size={12} />}
      </span>
    </button>
  );
}
