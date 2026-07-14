import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Animates the numeric part of a stat ("3.87", "150+", "~600") from zero
 * when it scrolls into view, preserving any prefix/suffix and the number
 * of decimal places. Renders the final value directly under reduced motion.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  const [display, setDisplay] = useState(match ? "0" : value);

  useEffect(() => {
    if (!inView || !match) return;
    if (reduce) {
      setDisplay(match[2]);
      return;
    }
    const target = parseFloat(match[2]);
    const decimals = (match[2].split(".")[1] ?? "").length;
    const controls = animate(0, target, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  if (!match) return <span ref={ref}>{value}</span>;

  return (
    <span ref={ref}>
      {match[1]}
      {display}
      {match[3]}
    </span>
  );
}
