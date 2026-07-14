import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, FileDown, Loader2, Mail, Send } from "lucide-react";
import { contact, identity } from "../../content/site";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";
import { MagneticButton } from "../ui/MagneticButton";
import { Reveal } from "../ui/Reveal";
import { ScrambleText } from "../ui/ScrambleText";

const inputCls =
  "w-full rounded-xl border border-line bg-bright/[0.04] px-4 py-3 text-sm text-bright placeholder:text-body/50 transition-colors focus:border-accent/50 focus:outline-none";

function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("company")) return; // honeypot — bots fill every field

    // No form backend configured yet: open the visitor's mail app instead.
    if (!contact.formAction) {
      const subject = encodeURIComponent(
        `Portfolio contact from ${data.get("name")}`,
      );
      const body = encodeURIComponent(
        `${data.get("message")}\n\n- ${data.get("name")} (${data.get("email")})`,
      );
      window.location.href = `mailto:${identity.email}?subject=${subject}&body=${body}`;
      return;
    }

    setStatus("sending");
    try {
      if (contact.formAccessKey) data.set("access_key", contact.formAccessKey);
      const res = await fetch(contact.formAction, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`form POST failed: ${res.status}`);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative mx-auto mt-10 max-w-lg text-left"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Your name"
          aria-label="Your name"
          className={inputCls}
        />
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          aria-label="Your email"
          className={inputCls}
        />
      </div>
      <textarea
        name="message"
        required
        rows={4}
        placeholder="What are we building?"
        aria-label="Message"
        className={`${inputCls} mt-3 resize-y`}
      />
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div className="mt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-2.5 font-display text-sm font-semibold text-ink transition-shadow hover:shadow-[0_0_28px_rgba(139,92,246,0.5)] disabled:opacity-60"
        >
          {status === "sending" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {status === "sent" && (
          <p className="flex items-center gap-1.5 font-mono text-xs text-mint">
            <Check size={13} /> sent. talk soon!
          </p>
        )}
        {status === "error" && (
          <p className="font-mono text-xs text-red-400/90">
            couldn't send. email me directly instead?
          </p>
        )}
        {!contact.formAction && status === "idle" && (
          <p className="font-mono text-[11px] text-body/50">
            opens your mail app
          </p>
        )}
      </div>
    </form>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (permissions/older browser) — mailto still works.
    }
  }

  return (
    <section id="contact" className="relative scroll-mt-28">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
        <Reveal>
          <div className="glass ring-gradient relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12 md:py-20">
            {/* local glow */}
            <div
              aria-hidden
              className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[100px]"
            />

            <p className="relative font-mono text-[13px] tracking-[0.2em] text-accent-2/80 uppercase">
              <span className="text-body/50">07 /</span>{" "}
              <ScrambleText text="Contact" />
            </p>
            <h2 className="relative mx-auto mt-4 max-w-2xl font-display text-4xl font-bold tracking-tight text-bright sm:text-5xl">
              {contact.heading}
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-lg leading-relaxed">
              {contact.body}
            </p>

            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton href={`mailto:${identity.email}`}>
                <Mail size={16} />
                {identity.email}
              </MagneticButton>
              {identity.resumeUrl && (
                <MagneticButton href={identity.resumeUrl} variant="ghost">
                  <FileDown size={16} />
                  Résumé
                </MagneticButton>
              )}
              <button
                type="button"
                onClick={copyEmail}
                aria-label="Copy email address"
                className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-sm text-body transition-colors duration-300 hover:border-accent/40 hover:text-bright"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center gap-2 text-mint"
                    >
                      <Check size={15} /> copied!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center gap-2"
                    >
                      <Copy size={15} /> copy
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            <div className="relative mt-8 flex items-center justify-center gap-5">
              <a
                href={identity.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-body transition-colors hover:text-bright"
              >
                <GithubIcon size={16} /> GitHub
              </a>
              <span className="text-body/30">·</span>
              <a
                href={identity.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-body transition-colors hover:text-bright"
              >
                <LinkedinIcon size={16} /> LinkedIn
              </a>
            </div>

            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
