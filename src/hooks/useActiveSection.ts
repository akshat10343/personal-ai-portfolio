import { useEffect, useState } from "react";

/**
 * Tracks which section id is currently in view so the navbar can
 * highlight the matching link.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A narrow band around the upper-middle of the viewport decides
      // the active section; avoids two sections fighting each other.
      { rootMargin: "-35% 0px -55% 0px" },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
