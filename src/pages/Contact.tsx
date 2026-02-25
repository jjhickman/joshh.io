import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon, YoutubeIcon } from "@/lib/icons";
import { Section } from "@/components/ui/Section";
import { SOCIAL_LINKS } from "@/lib/constants";

const iconMap: Record<string, typeof GithubIcon> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
};

export default function Contact() {
  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl dark:text-amber-soft">
            Contact
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-[0_12px_28px_rgba(34,22,64,0.08)] dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
              Contact Form
            </h2>
            <p className="mt-2 text-sm text-text-light-muted dark:text-text-dark-muted">
              UI mock for now. Backend delivery pipeline is planned next.
            </p>

            <form
              className="mt-4 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1 block text-sm font-medium text-text-light dark:text-text-dark"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-text-light outline-none transition-colors placeholder:text-text-light-muted focus:border-accent dark:border-neutral-700 dark:bg-neutral-950 dark:text-text-dark dark:placeholder:text-text-dark-muted"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-reply"
                  className="mb-1 block text-sm font-medium text-text-light dark:text-text-dark"
                >
                  Reply Email
                </label>
                <input
                  id="contact-reply"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-text-light outline-none transition-colors placeholder:text-text-light-muted focus:border-accent dark:border-neutral-700 dark:bg-neutral-950 dark:text-text-dark dark:placeholder:text-text-dark-muted"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1 block text-sm font-medium text-text-light dark:text-text-dark"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={6}
                  placeholder="What are you working on?"
                  className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-text-light outline-none transition-colors placeholder:text-text-light-muted focus:border-accent dark:border-neutral-700 dark:bg-neutral-950 dark:text-text-dark dark:placeholder:text-text-dark-muted"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled
                  className="rounded-full bg-accent/80 px-4 py-2 text-sm font-medium text-white opacity-75"
                >
                  Send (Soon)
                </button>
                <p className="text-xs text-text-light-muted dark:text-text-dark-muted">
                  Non-functional mock. No messages are sent yet.
                </p>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {SOCIAL_LINKS.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
                >
                  <div className="flex items-center gap-3">
                    {Icon ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent dark:bg-amber-soft/10 dark:text-amber-soft">
                        <Icon size={20} />
                      </div>
                    ) : null}
                    <div>
                      <p className="font-medium text-text-light dark:text-text-dark">
                        {link.label}
                      </p>
                      <p className="text-sm text-text-light-muted dark:text-text-dark-muted">
                        {link.href.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-text-light-muted dark:text-amber-soft/80"
                  />
                </a>
              );
            })}
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
