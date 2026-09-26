import { ChevronDown, FileText, Mail } from "lucide-react";
import { facts, identity } from "../../content/site";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";

const ghostBtn =
  "inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/10";

/** First screen, laid over the 3D model: who, what, and how to reach me. */
export function Hero() {
  return (
    <div className="relative flex min-h-svh flex-col">
      {/* Keeps text readable where it overlaps the model on small screens */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/55 to-black md:bg-gradient-to-r md:from-black/85 md:via-black/40 md:to-transparent"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-5 pt-24 pb-20 sm:px-8 md:justify-center md:pt-16 md:pb-16">
        <p className="inline-flex items-center gap-2 font-mono text-xs text-muted">
          <span aria-hidden className="h-2 w-2 rounded-full bg-ok shadow-[0_0_12px_2px] shadow-ok/60" />
          {identity.availability} · {identity.location}
        </p>
        <h1 className="mt-5 max-w-2xl text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-6xl md:text-[min(4.5rem,7.4svh)]">
          I build ML systems from scratch, then{" "}
          <span className="text-fire">prove they’re correct.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-[17px]">{identity.intro}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={`mailto:${identity.email}`}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
          >
            <Mail size={16} aria-hidden />
            Email me
          </a>
          {identity.resumeUrl && (
            <a href={identity.resumeUrl} className={ghostBtn}>
              <FileText size={16} aria-hidden />
              Résumé
            </a>
          )}
          <a href={identity.github} target="_blank" rel="noreferrer" className={ghostBtn}>
            <GithubIcon size={16} />
            GitHub
          </a>
          <a href={identity.linkedin} target="_blank" rel="noreferrer" className={ghostBtn}>
            <LinkedinIcon size={16} />
            LinkedIn
          </a>
        </div>

        <dl className="mt-9 grid max-w-2xl gap-x-8 gap-y-3 sm:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label} className="border-l border-white/15 pl-3">
              <dt className="font-mono text-[11px] tracking-wide text-faint uppercase">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium">{f.value}</dd>
              <dd className="text-xs text-muted">{f.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <a
        href="#engine"
        className="relative mx-auto mb-5 flex flex-col items-center gap-1 text-xs text-muted transition-colors hover:text-fg"
      >
        Scroll to take the engine apart
        <ChevronDown size={16} aria-hidden className="animate-bounce" />
      </a>
    </div>
  );
}
