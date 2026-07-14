import { motion, useReducedMotion, useSpring } from "framer-motion";
import type { ReactNode, PointerEvent } from "react";
import { cn } from "../../lib/utils";

type MagneticButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "ghost";
  className?: string;
  onClick?: () => void;
};

/** Anchor styled as a button that leans gently toward the cursor. */
export function MagneticButton({
  children,
  href,
  variant = "primary",
  className,
  onClick,
}: MagneticButtonProps) {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 200, damping: 16 });
  const y = useSpring(0, { stiffness: 200, damping: 16 });

  function onPointerMove(e: PointerEvent<HTMLAnchorElement>) {
    if (reduce || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.22);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.28);
  }

  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      href={href}
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 font-display text-sm font-semibold tracking-wide transition-shadow duration-300",
        variant === "primary" &&
          "bg-gradient-to-r from-accent to-accent-2 text-ink shadow-[0_0_28px_rgba(139,92,246,0.35)] hover:shadow-[0_0_44px_rgba(139,92,246,0.55)]",
        variant === "ghost" &&
          "glass text-bright hover:border-accent/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)]",
        className,
      )}
    >
      {/* sheen that sweeps across on hover */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -translate-x-[110%] bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[110%]",
          variant === "primary" ? "via-white/40" : "via-bright/10",
        )}
      />
      {children}
    </motion.a>
  );
}
