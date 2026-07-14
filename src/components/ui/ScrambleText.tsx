import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "!<>-_\\/[]{}=+*^?#";
const TICK_MS = 26;
const REVEAL_PER_TICK = 1;

/**
 * "Decrypts" a string into place when it scrolls into view: unrevealed
 * characters cycle through random glyphs while the real text resolves
 * left to right. Best on mono type (no width jitter). Screen readers get
 * the final text via aria-label; reduced motion renders it directly.
 */
export function ScrambleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? text : "");

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(text);
      return;
    }
    let revealed = 0;
    const iv = setInterval(() => {
      revealed += REVEAL_PER_TICK;
      if (revealed >= text.length) {
        setDisplay(text);
        clearInterval(iv);
        return;
      }
      let out = text.slice(0, revealed);
      for (let i = revealed; i < text.length; i++) {
        out +=
          text[i] === " "
            ? " "
            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);
    }, TICK_MS);
    return () => clearInterval(iv);
  }, [inView, reduce, text]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{display || " "}</span>
    </span>
  );
}
