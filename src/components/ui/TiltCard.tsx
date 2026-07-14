import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import type { ReactNode, PointerEvent } from "react";
import { cn } from "../../lib/utils";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  tilt?: number;
};

/**
 * Glass card that tilts toward the pointer and shows a cursor-tracking
 * spotlight. Falls back to a static card for touch / reduced motion.
 */
export function TiltCard({ children, className, tilt = 5 }: TiltCardProps) {
  const reduce = useReducedMotion();

  const rotateX = useSpring(0, { stiffness: 180, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 20 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowOpacity = useSpring(0, { stiffness: 200, damping: 30 });

  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${glowX}% ${glowY}%, rgba(139, 92, 246, 0.13), transparent 65%)`;

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * tilt * 2);
    rotateY.set((px - 0.5) * tilt * 2);
    glowX.set(px * 100);
    glowY.set(py * 100);
    glowOpacity.set(1);
  }

  function onPointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
    glowOpacity.set(0);
  }

  return (
    <motion.div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn(
        "glass ring-gradient group relative overflow-hidden rounded-2xl",
        className,
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: spotlight, opacity: glowOpacity }}
      />
      {children}
    </motion.div>
  );
}
