import { identity } from "../../content/site";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} {identity.name} · {identity.location}
        </p>
        <p>
          Built with React, TypeScript, and Tailwind.{" "}
          <a
            href={`${identity.github}/personal-ai-portfolio`}
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            Source
          </a>
        </p>
      </div>
    </footer>
  );
}
