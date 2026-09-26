import type { ReactNode } from "react";

/**
 * One screen-or-more chapter after the pinned story. Content sits in the left
 * column; `shape` tells the fixed 3D stage what to become on the right while
 * this chapter crosses the middle of the screen (see lib/story.ts). On phones
 * the content starts lower so the model stays visible above it.
 */
export function StageChapter({
  id,
  shape,
  eyebrow,
  title,
  sub,
  children,
}: {
  id?: string;
  shape: number;
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  const titleId = `${id ?? `chapter-${shape}`}-title`;
  return (
    <section id={id} data-shape={shape} aria-labelledby={titleId} className="relative flex min-h-svh items-center">
      <div className="mx-auto w-full max-w-6xl px-5 pt-[42svh] pb-16 sm:px-8 md:py-28">
        <div className="max-w-[36rem]">
          <header className="reveal max-md:rounded-3xl max-md:bg-black/55 max-md:p-5 max-md:backdrop-blur-sm">
            <p className="font-mono text-xs tracking-wide text-accent uppercase">{eyebrow}</p>
            <h2 id={titleId} className="mt-3 text-4xl leading-[1.04] font-semibold tracking-[-0.035em] md:text-[3.25rem]">
              {title}
            </h2>
            {sub && <div className="mt-4 text-[17px] leading-relaxed text-muted">{sub}</div>}
          </header>
          {children && <div className="reveal mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
