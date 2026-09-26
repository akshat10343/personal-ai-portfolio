import { ArrowUpRight } from "lucide-react";
import { projects } from "../../content/site";
import { StageChapter } from "../ui/StageChapter";

/** 3D shape per project (see lib/story.ts): shield, chat bubble, sun, apple. */
const SHAPES: Record<string, number> = { tomshield: 8, "nlp-finance": 9, solarsave: 10, "calorie-counter": 11 };

/** One chapter per project; the 3D model becomes each one's icon. */
export function Projects() {
  return (
    <>
      {projects.map((p, i) => (
        <StageChapter
          key={p.id}
          id={i === 0 ? "projects" : p.id}
          shape={SHAPES[p.id] ?? 8}
          eyebrow={`More work · ${i + 1} of ${projects.length} · ${p.period}`}
          title={p.title}
          sub={
            <>
              <span className="block text-sm text-faint">{p.kind}</span>
              <span className="mt-3 block">{p.summary}</span>
            </>
          }
        >
          <div className="rounded-3xl border border-line bg-surface/90 p-6 backdrop-blur-md">
            <ul className="space-y-3 leading-relaxed text-muted">
              {p.bullets.map((b) => (
                <li key={b} className="grid grid-cols-[1.1rem_minmax(0,1fr)]">
                  <span aria-hidden className="text-accent">–</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {p.tech.map((t) => (
                <span key={t} className="rounded-full border border-line bg-bg px-3 py-1 text-xs text-muted">
                  {t}
                </span>
              ))}
            </div>
            {p.href && (
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex h-10 items-center gap-1.5 rounded-full bg-fg px-4 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
              >
                Source on GitHub
                <ArrowUpRight size={14} aria-hidden />
              </a>
            )}
          </div>
        </StageChapter>
      ))}
    </>
  );
}
