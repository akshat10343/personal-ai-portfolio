import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type IntroOverlayProps = {
  show: boolean;
  onDone: () => void;
};

/**
 * One-shot boot screen: the monogram blurs in over a charging gradient
 * line, then the whole curtain slides up to reveal the page. Shown once
 * per browser session; skipped entirely under reduced motion (see App).
 */
export function IntroOverlay({ show, onDone }: IntroOverlayProps) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-7 bg-ink"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-mono text-5xl font-semibold tracking-tight"
          >
            <span className="text-gradient">AK</span>
            <span className="text-body/50">/</span>
          </motion.p>
          <div className="h-px w-44 overflow-hidden rounded-full bg-bright/10">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.25, ease: [0.65, 0, 0.35, 1] }}
              className="h-full origin-left bg-gradient-to-r from-accent to-accent-2"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
