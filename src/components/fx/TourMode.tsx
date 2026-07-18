import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

const STOP_MS = 4200;

/** The 30-second pitch, one stop at a time. */
const STOPS = [
  { id: "top", caption: "Akshat Kansal. CS @ UW, AI/ML research intern @ Nokia Bell Labs." },
  { id: "about", caption: "3.87 GPA · leads 150+ engineers · teaches 30 students a quarter." },
  { id: "experience", caption: "Bell Labs research, a founding-team startup, teaching, and two clubs he runs." },
  { id: "projects", caption: "Flagship: an LLM inference engine from raw PyTorch. KV cache, continuous batching, INT8." },
  { id: "writing", caption: "Writes up the methodology, not just the wins." },
  { id: "contact", caption: "Open to Summer 2027 internships. Say hi." },
];

/**
 * Recruiter mode: an auto-scrolling tour of the site's highlights with a
 * caption card at the bottom. Started via ⌘K or the terminal `tour`
 * command; Esc, the ✕, or clicking a caption dot exits/jumps.
 */
export function TourMode() {
  const [step, setStep] = useState<number | null>(null);

  const stop = useCallback(() => setStep(null), []);

  useEffect(() => {
    const onStart = () => setStep(0);
    window.addEventListener("start-tour", onStart);
    return () => window.removeEventListener("start-tour", onStart);
  }, []);

  useEffect(() => {
    if (step === null) return;
    document
      .getElementById(STOPS[step].id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    const t = setTimeout(() => {
      setStep((s) => (s === null || s >= STOPS.length - 1 ? null : s + 1));
    }, STOP_MS);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && stop();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [step, stop]);

  return (
    <AnimatePresence>
      {step !== null && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-6 z-[58] flex justify-center px-4"
        >
          <div className="glass ring-gradient flex max-w-xl items-center gap-4 rounded-2xl py-3 pr-3 pl-5 shadow-[0_20px_60px_-16px_rgba(0,0,0,0.7)]">
            <Sparkles size={16} className="shrink-0 text-accent-2" />
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-sm leading-snug text-bright"
              >
                {STOPS[step].caption}
              </motion.p>
            </AnimatePresence>
            <div className="ml-1 flex shrink-0 items-center gap-1.5">
              {STOPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-label={`Tour stop ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-5 bg-accent-2" : "w-1.5 bg-body/30"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={stop}
              aria-label="End tour"
              className="glass shrink-0 rounded-full p-2 text-body transition-colors hover:text-bright"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
