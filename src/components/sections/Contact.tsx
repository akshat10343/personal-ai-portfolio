import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { contact, identity } from "../../content/site";
import { Section } from "../ui/Section";

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

  const links = [
    { label: "GitHub", value: `@${identity.githubHandle}`, href: identity.github },
    { label: "LinkedIn", value: `in/${identity.linkedinHandle}`, href: identity.linkedin },
    ...(identity.resumeUrl ? [{ label: "Résumé", value: "PDF", href: identity.resumeUrl }] : []),
  ];

  return (
    <Section id="contact" index="05" title="Contact">
      <p className="text-3xl font-semibold tracking-tight sm:text-4xl">{contact.heading}</p>
      <p className="mt-3 max-w-xl leading-relaxed text-muted">{contact.body}</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${identity.email}`}
          className="link font-mono text-lg font-medium break-all sm:text-xl"
        >
          {identity.email}
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-xs font-medium transition-colors hover:border-faint"
        >
          {copied ? <Check size={13} aria-hidden className="text-ok" /> : <Copy size={13} aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
        <span role="status" className="sr-only">
          {copied ? "Email address copied" : ""}
        </span>
      </div>

      <ul className="mt-10 divide-y divide-line border-y border-line">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="group grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-4 py-4 sm:grid-cols-[9.5rem_minmax(0,1fr)_auto] sm:gap-6 transition-colors hover:text-accent"
            >
              <span className="font-mono text-xs text-faint">{l.label}</span>
              <span className="font-medium">{l.value}</span>
              <ArrowUpRight size={16} aria-hidden className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
