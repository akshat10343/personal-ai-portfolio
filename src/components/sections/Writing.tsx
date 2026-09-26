import { useEffect, useState } from "react";
import { posts, type Post } from "../../content/site";
import { Section } from "../ui/Section";

function Article({ post, open, onToggle }: { post: Post; open: boolean; onToggle: () => void }) {
  const bodyId = `post-${post.slug}-body`;
  return (
    <li id={`post-${post.slug}`} className="scroll-mt-24 py-7">
      <p className="font-mono text-xs text-faint">
        {post.date} · {post.tag}
      </p>
      <h3 className="mt-1.5 text-xl font-semibold tracking-tight">{post.title}</h3>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">{post.teaser}</p>

      {open && (
        <div id={bodyId} className="mt-6 max-w-2xl space-y-4 border-l-2 border-accent/60 pl-5 text-[16px] leading-[1.75]">
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
        className="link mt-4 cursor-pointer text-sm font-medium"
      >
        {open ? "Collapse" : "Read the post"}
      </button>
    </li>
  );
}

/** The post named by a #post-<slug> link, so individual posts are shareable. */
function slugFromHash() {
  const slug = window.location.hash.replace("#post-", "");
  return posts.some((p) => p.slug === slug) ? slug : null;
}

export function Writing() {
  const [open, setOpen] = useState<string | null>(slugFromHash);

  // The post didn't exist when the browser handled the hash, so scroll to it
  // once it has rendered open. Only on load: later toggles shouldn't jump.
  useEffect(() => {
    const slug = slugFromHash();
    if (slug) document.getElementById(`post-${slug}`)?.scrollIntoView();
  }, []);

  return (
    <Section
      id="writing"
      index="03"
      title="Writing"
      intro="Notes on evaluation and data quality from my intrusion-detection work."
    >
      <ul className="divide-y divide-line border-y border-line">
        {posts.map((p) => (
          <Article
            key={p.slug}
            post={p}
            open={open === p.slug}
            onToggle={() => setOpen((cur) => (cur === p.slug ? null : p.slug))}
          />
        ))}
      </ul>
    </Section>
  );
}
