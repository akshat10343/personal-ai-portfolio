import { Mail } from "lucide-react";
import { identity } from "../../content/site";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-8">
        <p className="font-mono text-xs text-body/80">
          © {new Date().getFullYear()} {identity.name} · designed & built from
          scratch with React, TypeScript, Tailwind, Framer Motion
        </p>
        <div className="flex items-center gap-4">
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-body transition-colors hover:text-bright"
          >
            <GithubIcon size={18} />
          </a>
          <a
            href={identity.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-body transition-colors hover:text-bright"
          >
            <LinkedinIcon size={18} />
          </a>
          <a
            href={`mailto:${identity.email}`}
            aria-label="Email"
            className="text-body transition-colors hover:text-bright"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
