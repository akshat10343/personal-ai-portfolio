import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, X } from "lucide-react";

const ROWS: Array<{ keys: string; what: string }> = [
  { keys: "⌘K / Ctrl+K", what: "Command palette: jump anywhere, copy email" },
  { keys: "?", what: "This panel" },
  { keys: "Esc", what: "Close whatever is open" },
  { keys: "help", what: "Type it in the hero terminal. Then try `sudo hire akshat`" },
  { keys: "tour", what: "Terminal command: the 30-second recruiter tour" },
  { keys: "↑↑↓↓…", what: "You already know the rest of this one" },
];

/**
 * Press ? anywhere (outside inputs) for the keyboard map.
 * Also opened via the ⌘K palette ("open-shortcuts" event).
 */
export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "?" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        close();
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-shortcuts", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-shortcuts", onOpen);
    };
  }, [close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={close}
          className="fixed inset-0 z-[56] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="ring-gradient w-full max-w-md rounded-2xl border border-line bg-surface/95 p-6 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-accent-2/80 uppercase">
                <Keyboard size={14} />
                keyboard map
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close shortcuts"
                className="glass rounded-full p-2 text-body transition-colors hover:text-bright"
              >
                <X size={14} />
              </button>
            </div>
            <ul className="mt-5 space-y-3">
              {ROWS.map((row) => (
                <li key={row.keys} className="flex items-baseline gap-4">
                  <kbd className="shrink-0 rounded-md border border-line bg-bright/[0.04] px-2 py-1 font-mono text-[11px] text-bright">
                    {row.keys}
                  </kbd>
                  <span className="text-sm text-body">{row.what}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
