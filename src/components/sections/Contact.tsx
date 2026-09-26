import { useState } from "react";
import { Check, Copy, FileText, Mail } from "lucide-react";
import { contact, identity } from "../../content/site";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";

const ghostBtn =
  "inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-medium transition-colors hover:bg-white/10";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${identity.email}`;
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden border-t border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-40vmax] left-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(255,159,10,0.18), rgba(255,69,58,0.06) 60%, transparent)" }}
      />
      <div className="reveal relative mx-auto max-w-4xl px-5 py-28 text-center sm:px-8 md:py-44">
        <p className="font-mono text-xs tracking-wide text-accent uppercase">Contact</p>
        <h2 id="contact-title" className="mt-4 text-5xl leading-[1.02] font-semibold tracking-[-0.04em] md:text-8xl">
          {contact.heading.replace(".", "")}
          <span className="text-fire">.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">{contact.body}</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${identity.email}`}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 font-medium text-bg transition-transform hover:scale-[1.03]"
          >
            <Mail size={17} aria-hidden />
            {identity.email}
          </a>
          <button type="button" onClick={copy} className={`${ghostBtn} cursor-pointer`}>
            {copied ? <Check size={15} aria-hidden className="text-ok" /> : <Copy size={15} aria-hidden />}
            {copied ? "Copied" : "Copy email"}
          </button>
          <span role="status" className="sr-only">
            {copied ? "Email address copied" : ""}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a href={identity.github} target="_blank" rel="noreferrer" className={ghostBtn}>
            <GithubIcon size={16} />
            GitHub
          </a>
          <a href={identity.linkedin} target="_blank" rel="noreferrer" className={ghostBtn}>
            <LinkedinIcon size={16} />
            LinkedIn
          </a>
          {identity.resumeUrl && (
            <a href={identity.resumeUrl} className={ghostBtn}>
              <FileText size={16} aria-hidden />
              Résumé
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
