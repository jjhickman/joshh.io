import { GithubIcon, LinkedinIcon, YoutubeIcon } from "@/lib/icons";
import { SOCIAL_LINKS } from "@/lib/constants";

const iconMap: Record<string, typeof GithubIcon> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
};

export interface SocialLinksProps {
  size?: number;
  className?: string;
}

export function SocialLinks({ size = 20, className }: SocialLinksProps) {
  return (
    <div className={className ?? "flex items-center gap-4"}>
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
            {Icon ? <Icon size={size} /> : null}
          </a>
        );
      })}
    </div>
  );
}
