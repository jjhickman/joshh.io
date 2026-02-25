import { motion } from "framer-motion";
import { ArrowUpRight, Disc3, Headphones } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { SOCIAL_LINKS } from "@/lib/constants";

const influences = [
  "Post-Punk",
  "Electronic",
  "Nu-Metal",
  "Industrial",
  "Shoegaze",
  "Noise Rock",
];

export default function Music() {
  const youtubeLink =
    SOCIAL_LINKS.find((link) => link.icon === "youtube")?.href ??
    "https://youtube.com/@joshh.io";

  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-10"
      >
        {/* Header */}
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 dark:bg-amber-soft/10"
          >
            <Disc3 size={40} className="text-accent dark:text-amber-soft" />
          </motion.div>
          <h1 className="text-3xl font-bold sm:text-4xl">Studio</h1>
          <p className="mx-auto max-w-md text-text-light-muted dark:text-text-dark-muted leading-relaxed">
            Drafts, stems, and rough mixes while tracks are still in motion.
          </p>
        </div>

        {/* Concept */}
        <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <div className="flex items-center gap-2">
            <Headphones
              size={18}
              className="text-accent dark:text-amber-soft"
            />
            <h2 className="font-semibold">Current Status</h2>
          </div>
          <p className="text-sm text-text-light-muted dark:text-text-dark-muted leading-relaxed">
            No public releases yet. This page tracks direction, influences, and
            production progress as ideas move from sketch to full arrangement.
          </p>
          <p className="text-sm text-text-light-muted dark:text-text-dark-muted leading-relaxed">
            Updates and future uploads will be posted on YouTube.
          </p>
          <p>
            <a
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-light dark:text-amber-soft dark:hover:text-amber-strong"
            >
              Follow on YouTube
              <ArrowUpRight size={14} />
            </a>
          </p>
        </div>

        {/* Influences */}
        <div className="text-center">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-light-muted dark:text-text-dark-muted">
            Influences
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {influences.map((genre) => (
              <Badge key={genre} variant="outline">
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div className="text-center">
          <p className="text-sm text-text-light-muted dark:text-text-dark-muted">
            New uploads will be published on YouTube.
          </p>
        </div>
      </motion.div>
    </Section>
  );
}
