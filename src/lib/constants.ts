import type { NavItem, SocialLink } from "./types";

export const SITE_CONFIG = {
  name: "Josh Hickman",
  title: "Josh Hickman",
  description: "Software systems, notes, and music work in progress.",
  url: "https://joshh.io",
} as const;

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Lab", href: "/lab" },
  { label: "Blog", href: "/blog" },
  { label: "Studio", href: "/studio" },
  { label: "Contact", href: "/contact" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/jjhickman",
    icon: "github",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/joshuajhickman",
    icon: "linkedin",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@joshh.io",
    icon: "youtube",
  },
];
