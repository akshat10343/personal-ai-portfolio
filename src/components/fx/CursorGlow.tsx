import { useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

/**
 * A soft violet spotlight that trails the cursor across the whole page,
 * washing over glass panels as it passes. Mouse-only: disabled for touch
 * pointers and under reduced motion.
 */
export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const sx = useSpring(x, { stiffness: 90, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 90, damping: 22, mass: 0.6 });

  const glow = useMotionTemplate`radial-gradient(560px circle at ${sx}px ${sy}px, rgba(139, 92, 246, 0.085), rgba(34, 211, 238, 0.03) 45%, transparent 70%)`;

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ background: glow }}
      className="pointer-events-none fixed inset-0 z-[3]"
    />
  );
}
