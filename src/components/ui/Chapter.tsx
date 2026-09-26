import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** A full-width section with a big centered header, product-page style. */
export function Chapter({
  id,
  eyebrow,
  title,
  sub,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("relative py-24 md:py-36", className)}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <header className="reveal mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs tracking-wide text-accent uppercase">{eyebrow}</p>
          <h2
            id={`${id}-title`}
            className="mt-4 text-4xl leading-[1.04] font-semibold tracking-[-0.035em] sm:text-5xl md:text-6xl"
          >
            {title}
          </h2>
          {sub && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">{sub}</p>}
        </header>
        <div className="mt-14 md:mt-20">{children}</div>
      </div>
    </section>
  );
}
