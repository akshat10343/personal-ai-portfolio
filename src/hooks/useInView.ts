import { useEffect, useState, type RefObject } from "react";

/**
 * True while the element is on screen (or, with `once`, from the first time
 * it appears). Used to start animations and timers only when someone can
 * actually see them.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { once = false, margin = "0px" }: { once?: boolean; margin?: string } = {},
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, once, margin]);

  return inView;
}
