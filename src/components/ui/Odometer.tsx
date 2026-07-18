import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Mechanical-counter digits: each digit is a vertical strip that springs
 * to position when the value changes. Non-digit characters render as-is.
 */
export function Odometer({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{value}</span>;

  return (
    <span
      className={cn("inline-flex leading-none", className)}
      aria-label={value}
    >
      {value.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span
            key={i}
            aria-hidden
            className="relative inline-block h-[1em] overflow-hidden"
          >
            <span className="invisible">{ch}</span>
            <motion.span
              animate={{ y: `-${+ch}em` }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="absolute top-0 left-0 flex flex-col"
            >
              {DIGITS.map((d) => (
                <span key={d} className="h-[1em]">
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        ) : (
          <span key={i} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
