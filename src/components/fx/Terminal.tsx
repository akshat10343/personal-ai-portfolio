import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import {
  identity,
  projects,
  skillGroups,
  terminalLines,
} from "../../content/site";
import { getTheme, toggleTheme } from "../../lib/theme";
import { cn } from "../../lib/utils";

const CHAR_MS = 16;
const LINE_PAUSE_MS = 380;
const MAX_LINES = 60;

type Kind = "cmd" | "out" | "dim" | "ok" | "err";
type Line = { kind: Kind; text: string };

const kindStyles: Record<Kind | "prompt", string> = {
  cmd: "text-bright",
  out: "text-body",
  dim: "text-body/60",
  ok: "text-mint",
  err: "text-red-400/90",
  prompt: "text-bright",
};

/** The intro pipeline lines, replayable via the `nids all` command. */
const pipelineLines: Line[] = terminalLines
  .filter((l) => l.kind !== "cmd" && l.kind !== "prompt")
  .map((l) => ({ kind: l.kind as Kind, text: l.text }));

function execute(raw: string): Line[] | "clear" {
  const cmd = raw.trim().toLowerCase();
  switch (cmd) {
    case "":
      return [];
    case "help":
      return [
        { kind: "out", text: "available commands:" },
        { kind: "dim", text: "  whoami      who is this guy" },
        { kind: "dim", text: "  projects    what he's built" },
        { kind: "dim", text: "  skills      the toolbox" },
        { kind: "dim", text: "  contact     how to reach him" },
        { kind: "dim", text: "  nids all    re-run the pipeline" },
        { kind: "dim", text: "  theme       flip light/dark" },
        { kind: "dim", text: "  matrix      you know what this does" },
        { kind: "dim", text: "  clear       wipe the screen" },
      ];
    case "whoami":
      return [
        { kind: "out", text: `${identity.name} · CS undergrad @ UW (May 2028)` },
        { kind: "out", text: identity.role },
        { kind: "dim", text: "hunts data leakage · teaches · leads robotics" },
      ];
    case "projects":
      return projects.map((p) => ({
        kind: "out" as Kind,
        text: `▸ ${p.title}${p.org ? ` · ${p.org.split("·")[0].trim()}` : ""}`,
      }));
    case "skills":
      return skillGroups.map((g) => ({
        kind: "out" as Kind,
        text: `▸ ${g.title}: ${g.skills.slice(0, 4).join(", ")}${g.skills.length > 4 ? ", …" : ""}`,
      }));
    case "contact":
      return [
        { kind: "out", text: `email     ${identity.email}` },
        { kind: "out", text: `github    ${identity.github.replace("https://", "")}` },
        { kind: "out", text: `linkedin  ${identity.linkedin.replace("https://", "")}` },
      ];
    case "clear":
      return "clear";
    case "nids":
    case "nids all":
      return [...pipelineLines];
    case "sudo hire akshat":
      return [
        { kind: "ok", text: "✓ permission granted. excellent judgment." },
        { kind: "out", text: `→ ${identity.email} to complete the transaction 🤝` },
      ];
    case "theme": {
      toggleTheme();
      return [{ kind: "ok", text: `✓ switched to ${getTheme()} mode` }];
    }
    case "matrix":
      window.dispatchEvent(new CustomEvent("matrix-mode"));
      return [{ kind: "ok", text: "wake up… (9 seconds of rain)" }];
    case "rm -rf /":
    case "sudo rm -rf /":
      return [
        { kind: "err", text: "permission denied: nice try." },
        { kind: "dim", text: "this portfolio is read-only. mostly." },
      ];
    case "ls":
      return [{ kind: "dim", text: "ambition.md  projects/  experiments/  goals/" }];
    case "exit":
      return [{ kind: "dim", text: "nice try. there's no leaving the portfolio." }];
    default:
      return [
        { kind: "err", text: `zsh: command not found: ${cmd}` },
        { kind: "dim", text: "try `help`" },
      ];
  }
}

/**
 * The hero terminal. Auto-types a real `nids` pipeline run when scrolled
 * into view, then hands the prompt to the visitor: `help`, `whoami`,
 * `sudo hire akshat`… Click anywhere on it to focus.
 */
export function Terminal() {
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  // Intro typing progress, measured in characters across all intro lines.
  const introTotal = terminalLines.reduce((sum, l) => sum + l.text.length, 0);
  const [progress, setProgress] = useState(0);
  const introDone = progress >= introTotal;

  const [cleared, setCleared] = useState(false);
  const [userLines, setUserLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setProgress(introTotal);
      return;
    }

    // Time-based typing: progress is derived from elapsed wall-clock time,
    // so throttled background tabs catch up instantly instead of crawling.
    const charsAt = (elapsed: number) => {
      let t = 0;
      let chars = 0;
      for (const line of terminalLines) {
        const lineDur = line.text.length * CHAR_MS;
        if (elapsed < t + lineDur) {
          return chars + Math.floor((elapsed - t) / CHAR_MS);
        }
        t += lineDur + LINE_PAUSE_MS;
        chars += line.text.length;
      }
      return chars;
    };

    const start = performance.now();
    const iv = setInterval(() => {
      const c = charsAt(performance.now() - start);
      setProgress(c);
      if (c >= introTotal) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [inView, reduce, introTotal]);

  // Keep the newest line visible.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [userLines, progress, input]);

  function onSubmit() {
    const result = execute(input);
    if (result === "clear") {
      setCleared(true);
      setUserLines([]);
    } else {
      setUserLines((prev) =>
        [...prev, { kind: "cmd" as Kind, text: `$ ${input}` }, ...result].slice(
          -MAX_LINES,
        ),
      );
    }
    setInput("");
  }

  // Intro lines, sliced by typing progress (skip the trailing bare prompt —
  // the interactive prompt replaces it once typing finishes).
  let remaining = progress;
  const introVisible = terminalLines.map((line) => {
    const take = Math.max(0, Math.min(line.text.length, remaining));
    remaining -= take;
    return { ...line, shown: line.text.slice(0, take), active: take > 0 };
  });
  const lastActive = [...introVisible].reverse().find((l) => l.active);

  return (
    <div
      ref={ref}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
      className={cn(
        "glass ring-gradient dark-island cursor-text overflow-hidden rounded-2xl shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] transition-shadow duration-300",
        focused && "shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8),0_0_0_1px_rgba(34,211,238,0.25)]",
      )}
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-body/60">
          akshat@bell-labs · zsh
        </span>
        {introDone && (
          <span className="ml-auto font-mono text-[10px] text-accent-2/60">
            interactive · try `help`
          </span>
        )}
      </div>
      <div
        ref={bodyRef}
        className="max-h-72 min-h-56 overflow-y-auto px-5 py-4 font-mono text-[13px] leading-7"
      >
        {!cleared &&
          introVisible.map(
            (line, i) =>
              line.active &&
              line.kind !== "prompt" && (
                <div key={i} className={kindStyles[line.kind]}>
                  {line.shown}
                  {line === lastActive && !introDone ? (
                    <span className="animate-blink ml-1 inline-block h-4 w-2 translate-y-0.5 bg-accent-2/80" />
                  ) : null}
                </div>
              ),
          )}

        {userLines.map((line, i) => (
          <div key={`u${i}`} className={kindStyles[line.kind]}>
            {line.text}
          </div>
        ))}

        {introDone && (
          <div className="relative text-bright">
            <span className="text-accent-2/90">$ </span>
            {input}
            <span className="animate-blink ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-accent-2/80" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="absolute h-0 w-0 opacity-0"
              aria-label="Terminal input. Type help for available commands"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
