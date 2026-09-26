import type { ReactNode } from "react";

/**
 * A numbered section: the label column sticks on wide screens while the
 * content scrolls past it, like the margin of a spec sheet.
 */
export function Section({
  id,
  index,
  title,
  intro,
  children,
}: {
  id: string;
  index: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-12 md:py-24 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <header className="md:sticky md:top-24 md:self-start">
          <p className="font-mono text-xs text-faint tabular-nums">{index}</p>
          <h2 id={`${id}-title`} className="mt-1.5 text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {intro && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{intro}</p>}
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
