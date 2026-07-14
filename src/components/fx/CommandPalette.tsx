import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Copy,
  FlaskConical,
  Home,
  Layers,
  Mail,
  PenLine,
  Search,
  SunMoon,
  Target,
  User,
  Wrench,
} from "lucide-react";
import { identity } from "../../content/site";
import { toggleTheme } from "../../lib/theme";
import { cn } from "../../lib/utils";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";

type Command = {
  id: string;
  label: string;
  group: "Navigate" | "Actions" | "Links";
  keywords?: string;
  icon: ReactNode;
  run: () => void | "keep-open";
};

const GROUPS: Command["group"][] = ["Navigate", "Actions", "Links"];

/** Loose match: substring, or characters appearing in order. */
function matches(query: string, target: string) {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const t = target.toLowerCase();
  if (t.includes(q)) return true;
  let i = 0;
  for (const ch of t) {
    if (ch === q[i]) i++;
    if (i === q.length) return true;
  }
  return false;
}

/**
 * ⌘K command palette: navigate sections, copy the email, open links.
 * Opens via Cmd/Ctrl+K or a window "open-cmdk" event (navbar button).
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
    setCopied(false);
  }, []);

  const goTo = useCallback(
    (id: string) => {
      close();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    },
    [close],
  );

  const commands = useMemo<Command[]>(
    () => [
      { id: "top", label: "Home", group: "Navigate", icon: <Home size={15} />, run: () => goTo("top") },
      { id: "about", label: "About", group: "Navigate", keywords: "bio me", icon: <User size={15} />, run: () => goTo("about") },
      { id: "projects", label: "Projects", group: "Navigate", keywords: "work nids tomshield", icon: <Layers size={15} />, run: () => goTo("projects") },
      { id: "experiments", label: "AI Experiments", group: "Navigate", keywords: "lab log", icon: <FlaskConical size={15} />, run: () => goTo("experiments") },
      { id: "writing", label: "Writing", group: "Navigate", keywords: "posts notes blog", icon: <PenLine size={15} />, run: () => goTo("writing") },
      { id: "skills", label: "Skills", group: "Navigate", keywords: "stack tools", icon: <Wrench size={15} />, run: () => goTo("skills") },
      { id: "goals", label: "Future Goals", group: "Navigate", keywords: "roadmap plan", icon: <Target size={15} />, run: () => goTo("goals") },
      { id: "contact", label: "Contact", group: "Navigate", keywords: "reach hire", icon: <Mail size={15} />, run: () => goTo("contact") },
      {
        id: "copy-email",
        label: copied ? "Copied!" : "Copy email address",
        group: "Actions",
        keywords: "clipboard mail",
        icon: copied ? <Check size={15} className="text-mint" /> : <Copy size={15} />,
        run: () => {
          void navigator.clipboard?.writeText(identity.email).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
          return "keep-open";
        },
      },
      {
        id: "toggle-theme",
        label: "Toggle light / dark mode",
        group: "Actions",
        keywords: "theme appearance color",
        icon: <SunMoon size={15} />,
        run: () => {
          toggleTheme();
          return "keep-open";
        },
      },
      {
        id: "email",
        label: `Email ${identity.email}`,
        group: "Actions",
        keywords: "send message hire",
        icon: <Mail size={15} />,
        run: () => {
          close();
          window.location.href = `mailto:${identity.email}`;
        },
      },
      {
        id: "github",
        label: "Open GitHub",
        group: "Links",
        keywords: "code repos",
        icon: <GithubIcon size={15} />,
        run: () => {
          close();
          window.open(identity.github, "_blank", "noreferrer");
        },
      },
      {
        id: "linkedin",
        label: "Open LinkedIn",
        group: "Links",
        keywords: "profile network",
        icon: <LinkedinIcon size={15} />,
        run: () => {
          close();
          window.open(identity.linkedin, "_blank", "noreferrer");
        },
      },
    ],
    [close, copied, goTo],
  );

  const results = useMemo(
    () => commands.filter((c) => matches(query, `${c.label} ${c.keywords ?? ""}`)),
    [commands, query],
  );

  // Global shortcuts + navbar trigger.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        close();
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cmdk", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmdk", onOpen);
    };
  }, [open, close]);

  // Focus the input and lock scroll while open.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setSelected(0), [query]);

  const runCommand = (cmd: Command) => {
    if (cmd.run() !== "keep-open") return;
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      e.preventDefault();
      runCommand(results[selected]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[55] bg-ink/70 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: -14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            onClick={(e) => e.stopPropagation()}
            className="ring-gradient mx-auto mt-[16vh] w-[min(92vw,34rem)] overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={16} className="shrink-0 text-body/60" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Type a command or search…"
                className="w-full bg-transparent py-3.5 text-sm text-bright placeholder:text-body/50 focus:outline-none"
                aria-label="Command palette search"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-body/50">
                esc
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-8 text-center font-mono text-xs text-body/50">
                  No matches. Try “projects” or “email”.
                </p>
              )}
              {GROUPS.map((group) => {
                const items = results.filter((r) => r.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className="mb-1">
                    <p className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-[0.2em] text-body/40 uppercase">
                      {group}
                    </p>
                    {items.map((cmd) => {
                      const idx = results.indexOf(cmd);
                      return (
                        <button
                          key={cmd.id}
                          type="button"
                          onClick={() => runCommand(cmd)}
                          onMouseMove={() => setSelected(idx)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-100",
                            idx === selected
                              ? "bg-bright/[0.07] text-bright"
                              : "text-body",
                          )}
                        >
                          <span className="text-accent-2/80">{cmd.icon}</span>
                          {cmd.label}
                          {idx === selected && (
                            <kbd className="ml-auto font-mono text-[10px] text-body/40">
                              ↵
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[10px] text-body/40">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span className="ml-auto">
                <span className="text-gradient font-semibold">AK</span>/cmdk
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
