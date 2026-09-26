import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { experience, posts, type Post } from "../../content/site";
import { DetectorLab } from "../play/DetectorLab";
import { StageChapter } from "../ui/StageChapter";

/** The post named by a #post-<slug> link, so individual posts are shareable. */
function slugFromHash() {
  const slug = window.location.hash.replace("#post-", "");
  return posts.some((p) => p.slug === slug) ? slug : null;
}

function PostCard({ post, open, onToggle }: { post: Post; open: boolean; onToggle: () => void }) {
  const bodyId = `post-${post.slug}-body`;
  return (
    <article id={`post-${post.slug}`} className="scroll-mt-24 rounded-3xl border border-line bg-surface/90 p-6 backdrop-blur-md">
      <p className="font-mono text-xs text-faint">
        {post.date} · {post.tag}
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">{post.title}</h3>
      <p className="mt-3 leading-relaxed text-muted">{post.teaser}</p>
      {open && (
        <div id={bodyId} className="mt-6 space-y-4 border-l-2 border-accent/70 pl-5 text-[16px] leading-[1.75] text-fg/90">
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
    <>
      <StageChapter
        id="research"
        shape={7}
        eyebrow="08 · Research · Nokia Bell Labs"
        title={
          <>
            Before the model, <span className="text-ice">the data.</span>
          </>
        }
        sub={
          <>
            <p>
              {role.role}, {role.period}. {role.points[0]}
            </p>
            <p className="mt-3">
              Each block is one network flow, stacked by the detector’s attack score: attacks at the back, normal
              traffic in front. Pick where alerts fire, then leak the testbed columns back in and watch the problem
              turn suspiciously perfect.
            </p>
          </>
        }
      >
        <DetectorLab />
      </StageChapter>

      <StageChapter
        id="writing"
        shape={7}
        eyebrow="Writing"
        title="Notes from the research."
        sub="Two short posts on keeping evaluation honest."
      >
        <div className="space-y-5">
          {posts.map((p) => (
            <PostCard
              key={p.slug}
              post={p}
              open={open === p.slug}
              onToggle={() => setOpen((cur) => (cur === p.slug ? null : p.slug))}
            />
          ))}
        </div>
      </StageChapter>
    </>
  );
}
