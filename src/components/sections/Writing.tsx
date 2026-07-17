import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { posts } from "../../content/site";
import type { Post } from "../../content/site";
import { Reveal } from "../ui/Reveal";
import { Section } from "../ui/Section";

function PostModal({ post, onClose }: { post: Post; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[52] bg-ink/80 backdrop-blur-md"
      />
      <div className="pointer-events-none fixed inset-0 z-[53] flex items-center justify-center p-4 sm:p-8">
        <motion.div
          layoutId={`post-${post.slug}`}
          className="pointer-events-auto max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface/[0.97] p-7 shadow-[0_40px_120px_-24px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-9"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-mono text-xs tracking-wide text-accent-2/80 uppercase">
                {post.date} · {post.tag}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-bright sm:text-3xl">
                {post.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close post"
              className="glass shrink-0 rounded-full p-2.5 text-body transition-colors hover:border-accent/40 hover:text-bright"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-6 space-y-5">
            {post.body.map((para, i) => (
              <p key={i} className="text-[15.5px] leading-relaxed">
                {para}
              </p>
            ))}
          </div>
          <p className="mt-8 border-t border-line pt-5 font-mono text-xs text-body/50">
            Written from a real project. Details generalized where they
            involve internship work.
          </p>
        </motion.div>
      </div>
    </>
  );
}

export function Writing() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openPost = posts.find((p) => p.slug === openSlug);

  return (
    <Section
      id="writing"
      index="05"
      eyebrow="Writing"
      title={
        <>
          Notes from the <span className="text-gradient">lab</span>, written
          up properly.
        </>
      }
      lede="Long-form write-ups of things that actually happened to me and my data. No listicles."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={0.07 * (i % 2)} className="h-full">
            <motion.article
              layoutId={`post-${post.slug}`}
              role="button"
              tabIndex={0}
              onClick={() => setOpenSlug(post.slug)}
              onKeyDown={(e) => e.key === "Enter" && setOpenSlug(post.slug)}
              className="glass ring-gradient group flex h-full cursor-pointer flex-col rounded-2xl p-7 transition-colors duration-300 hover:border-accent/30"
            >
              <p className="font-mono text-xs tracking-wide text-accent-2/80 uppercase">
                {post.date} · {post.tag}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold text-bright transition-colors duration-300 group-hover:text-accent-2">
                {post.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed">{post.teaser}</p>
              <p className="mt-auto flex items-center gap-1.5 pt-5 font-mono text-xs text-accent-2/70">
                read the note
                <ArrowUpRight
                  size={13}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </p>
            </motion.article>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {openPost && (
          <PostModal post={openPost} onClose={() => setOpenSlug(null)} />
        )}
      </AnimatePresence>
    </Section>
  );
}
