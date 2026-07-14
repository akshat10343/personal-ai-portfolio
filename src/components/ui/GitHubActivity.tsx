import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { identity } from "../../content/site";
import { GithubIcon } from "./BrandIcons";

const USER = "akshat10343";
const CACHE_KEY = "gh-activity-v1";
const CACHE_TTL_MS = 60 * 60 * 1000;
const BAR_COLORS = ["#8b5cf6", "#22d3ee", "#818cf8", "#34d399"];

type Data = {
  publicRepos: number;
  followers: number;
  langs: Array<{ name: string; count: number }>;
  recent: Array<{ name: string; url: string; when: string }>;
};

function relTime(iso: string) {
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  if (days < 1) return "today";
  if (days < 2) return "yesterday";
  if (days < 30) return `${Math.floor(days)}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/**
 * Pulls real public data from the GitHub API when scrolled into view
 * (cached in sessionStorage for an hour to stay under rate limits).
 * Falls back to a plain link if the API is unreachable.
 */
export function GitHubActivity() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "80px" });
  const reduce = useReducedMotion();
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!inView) return;

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { t, data: d } = JSON.parse(cached) as { t: number; data: Data };
        if (Date.now() - t < CACHE_TTL_MS) {
          setData(d);
          return;
        }
      }
    } catch {
      /* bad cache — refetch */
    }

    Promise.all([
      fetch(`https://api.github.com/users/${USER}`).then((r) => {
        if (!r.ok) throw new Error("user fetch failed");
        return r.json();
      }),
      fetch(
        `https://api.github.com/users/${USER}/repos?sort=pushed&per_page=50`,
      ).then((r) => {
        if (!r.ok) throw new Error("repos fetch failed");
        return r.json();
      }),
    ])
      .then(
        ([user, repos]: [
          { public_repos: number; followers: number },
          Array<{
            name: string;
            html_url: string;
            language: string | null;
            pushed_at: string;
            fork: boolean;
          }>,
        ]) => {
          const own = repos.filter((r) => !r.fork);
          const counts = new Map<string, number>();
          for (const r of own) {
            if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
          }
          const d: Data = {
            publicRepos: user.public_repos,
            followers: user.followers,
            langs: [...counts.entries()]
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 4),
            recent: own.slice(0, 4).map((r) => ({
              name: r.name,
              url: r.html_url,
              when: relTime(r.pushed_at),
            })),
          };
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: d }));
          setData(d);
        },
      )
      .catch(() => setFailed(true));
  }, [inView]);

  const totalLangs = data?.langs.reduce((s, l) => s + l.count, 0) ?? 0;

  return (
    <div ref={ref} className="glass rounded-2xl p-6 sm:p-7">
      <div className="flex items-center gap-2.5">
        <GithubIcon size={15} className="text-body/70" />
        <p className="font-mono text-xs tracking-[0.18em] text-accent-2/80 uppercase">
          // live from GitHub
        </p>
        <span
          className={`ml-1 h-1.5 w-1.5 rounded-full ${
            data ? "animate-pulse bg-mint" : failed ? "bg-red-400/70" : "bg-amber"
          }`}
        />
        <a
          href={identity.github}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-body/60 transition-colors hover:text-bright"
        >
          @{USER}
          <ArrowUpRight size={12} />
        </a>
      </div>

      {failed && (
        <p className="mt-4 font-mono text-xs text-body/60">
          GitHub API unreachable right now. The repos still exist, promise.
        </p>
      )}

      {!failed && !data && (
        <p className="mt-4 font-mono text-xs text-body/50">
          querying api.github.com …
        </p>
      )}

      {data && (
        <div className="mt-5 grid gap-6 sm:grid-cols-[auto_1fr_1fr] sm:gap-10">
          <div className="flex gap-8 sm:flex-col sm:gap-4">
            <div>
              <p className="text-gradient font-display text-3xl font-bold">
                {data.publicRepos}
              </p>
              <p className="mt-0.5 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                public repos
              </p>
            </div>
            {data.followers > 0 && (
              <div>
                <p className="text-gradient font-display text-3xl font-bold">
                  {data.followers}
                </p>
                <p className="mt-0.5 font-mono text-[10px] tracking-wide text-body/60 uppercase">
                  followers
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="mb-3 font-mono text-[10px] tracking-wide text-body/50 uppercase">
              languages (own repos)
            </p>
            <div className="space-y-2.5">
              {data.langs.map((lang, i) => (
                <div key={lang.name}>
                  <div className="mb-1 flex justify-between font-mono text-[11px] text-body/70">
                    <span>{lang.name}</span>
                    <span>{Math.round((lang.count / totalLangs) * 100)}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-bright/[0.08]">
                    <motion.div
                      initial={reduce ? false : { width: 0 }}
                      whileInView={{
                        width: `${(lang.count / totalLangs) * 100}%`,
                      }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.1 * i, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-mono text-[10px] tracking-wide text-body/50 uppercase">
              recently pushed
            </p>
            <ul className="space-y-2">
              {data.recent.map((repo) => (
                <li key={repo.name}>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-baseline justify-between gap-3 font-mono text-xs"
                  >
                    <span className="truncate text-body transition-colors group-hover:text-bright">
                      {repo.name}
                    </span>
                    <span className="shrink-0 text-body/40">{repo.when}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
