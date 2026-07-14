import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789$#*+=";
const DURATION_MS = 9000;

/**
 * Easter egg: 9 seconds of matrix rain, triggered by the terminal's
 * `matrix` command or the Konami code (window "matrix-mode" event).
 * Skipped under reduced motion.
 */
export function MatrixRain() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const on = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setActive(true);
    };
    window.addEventListener("matrix-mode", on);
    return () => window.removeEventListener("matrix-mode", on);
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setActive(false), DURATION_MS);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let raf = 0;
    if (canvas && ctx) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fontSize = 16;
      const cols = Math.ceil(window.innerWidth / fontSize);
      const drops = Array.from({ length: cols }, () =>
        Math.floor(Math.random() * -40),
      );

      // Opaque first fill so the page vanishes into the rain.
      ctx.fillStyle = "rgba(3, 5, 8, 1)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      const step = () => {
        ctx.fillStyle = "rgba(3, 5, 8, 0.08)";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < cols; i++) {
          const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          ctx.fillStyle = Math.random() < 0.1 ? "#b7ffd8" : "#22c55e";
          ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 1.2 } }}
          className="pointer-events-none fixed inset-0 z-[70]"
          aria-hidden
        >
          <canvas ref={canvasRef} className="h-full w-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
