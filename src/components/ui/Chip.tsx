import { cn } from "../../lib/utils";

/** Small mono tag used for tech stacks and skills. */
export function Chip({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-bright/[0.04] px-3 py-1 font-mono text-xs text-body transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:text-bright hover:shadow-[0_4px_16px_rgba(139,92,246,0.25)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
