import { GithubIcon, LinkedinIcon, YoutubeIcon } from "@/lib/icons";
import { SOCIAL_LINKS, SITE_CONFIG } from "@/lib/constants";

const iconMap: Record<string, typeof GithubIcon> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-text-light-muted dark:text-text-dark-muted">
            &copy; {year} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-light-muted dark:text-amber-soft/85 hover:text-accent dark:hover:text-amber-strong transition-colors"
                  aria-label={link.label}
                >
                  {Icon ? <Icon size={18} /> : null}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
