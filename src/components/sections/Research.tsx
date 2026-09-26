import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { experience, posts, type Post } from "../../content/site";
import { SwapDemo } from "../play/SwapDemo";
import { Chapter } from "../ui/Chapter";

/** The post named by a #post-<slug> link, so individual posts are shareable. */
function slugFromHash() {
  const slug = window.location.hash.replace("#post-", "");
  return posts.some((p) => p.slug === slug) ? slug : null;
}

function PostCard({ post, open, onToggle }: { post: Post; open: boolean; onToggle: () => void }) {
  const bodyId = `post-${post.slug}-body`;
  return (
    <article id={`post-${post.slug}`} className="reveal scroll-mt-24 rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <p className="font-mono text-xs text-faint">
        {post.date} · {post.tag}
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{post.title}</h3>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">{post.teaser}</p>
      {open && (
        <div id={bodyId} className="mt-6 max-w-2xl space-y-4 border-l-2 border-accent/70 pl-5 text-[16px] leading-[1.75] text-fg/90">
          {post.body.map((para) => (
            <p key={para.slice(0, 32)}>{para}</p>
          ))}
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
        className="group mt-5 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-accent"
      >
        {open ? "Collapse" : "Read the post"}
        {!open && <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />}
      </button>
    </article>
  );
}

export function Research() {
  const role = experience[0];
  const [open, setOpen] = useState<string | null>(slugFromHash);

  // The post didn't exist when the browser handled the hash, so scroll to it
  // once it has rendered open. Only on load: later toggles shouldn't jump.
  useEffect(() => {
    const slug = slugFromHash();
    if (slug) document.getElementById(`post-${slug}`)?.scrollIntoView();
  }, []);

  return (
    <Chapter
      id="research"
      eyebrow="Research · Nokia Bell Labs"
      title={
        <>
          Before the model, <span className="text-ice">the data.</span>
        </>
      }
      sub="This summer I worked on machine learning for network intrusion detection. Most of the real work was making sure the benchmarks weren’t lying."
      className="border-t border-line"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="reveal flex flex-col justify-between rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <div>
            <p className="font-mono text-xs text-faint">{role.period}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{role.role}</h3>
            <p className="text-muted">{role.org}</p>
            <p className="mt-5 leading-relaxed">{role.points[0]}</p>
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
            {[
              ["2", "benchmarks audited for leakage"],
              ["3", "model families, one frozen protocol"],
              ["0.995", "best PR-AUC"],
            ].map(([v, k]) => (
              <div key={k} className="flex flex-col-reverse">
                <dt className="mt-1 text-xs leading-snug text-muted">{k}</dt>
                <dd className="text-ice text-3xl font-semibold tracking-tight tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="reveal">
          <SwapDemo />
        </div>
      </div>

      <h3 className="reveal mt-20 text-center text-2xl font-semibold tracking-tight">Writing</h3>
      <div className="mt-8 space-y-6">
        {posts.map((p) => (
          <PostCard
            key={p.slug}
            post={p}
            open={open === p.slug}
            onToggle={() => setOpen((cur) => (cur === p.slug ? null : p.slug))}
          />
        ))}
      </div>
    </Chapter>
  );
}
