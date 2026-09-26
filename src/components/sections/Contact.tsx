import { useState } from "react";
import { Check, Copy, FileText, Mail } from "lucide-react";
import { contact, identity } from "../../content/site";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";
import { StageChapter } from "../ui/StageChapter";

const ghostBtn =
  "inline-flex h-11 items-center gap-2 rounded-full border border-fg/15 bg-fg/5 px-5 text-sm font-medium backdrop-blur-md transition-colors hover:bg-fg/10";

/** The finale: the blocks assemble into a monogram while you find the email. */
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
    <StageChapter
      id="contact"
      shape={13}
      eyebrow="Contact"
      title={
        <span className="text-6xl md:text-8xl">
          {contact.heading.replace(".", "")}
          <span className="text-fire">.</span>
        </span>
      }
      sub={contact.body}
    >
      <div className="flex flex-wrap items-center gap-3">
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
      <div className="mt-3 flex flex-wrap items-center gap-3">
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
    </StageChapter>
  );
}
