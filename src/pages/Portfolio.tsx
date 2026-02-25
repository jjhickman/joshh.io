import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, FlaskConical, Wrench } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { projects } from "@/data/projects";
import { cn } from "@/lib/cn";

interface WorkbenchItem {
  title: string;
  blurb: string;
  href: string;
  label: string;
  external?: boolean;
  previewClass: string;
}

const workbenchItems: [WorkbenchItem, ...WorkbenchItem[]] = [
  {
    title: "Now Building",
    blurb: "Current experiments and active threads.",
    href: "/about",
    label: "Context",
    previewClass:
      "from-accent/35 via-lavender-100/40 to-amber-soft/45 dark:from-accent/30 dark:via-accent-dark/15 dark:to-amber-soft/20",
  },
  {
    title: "Notes",
    blurb: "Writing, breakdowns, and postmortems.",
    href: "/blog",
    label: "Writing",
    previewClass:
      "from-amber-soft/50 via-white/70 to-accent/20 dark:from-amber-soft/30 dark:via-background-dark/60 dark:to-accent/20",
  },
  {
    title: "Music Drafts",
    blurb: "Rough sketches and updates in progress.",
    href: "/studio",
    label: "Audio",
    previewClass:
      "from-accent/25 via-amber-soft/25 to-lavender-100/45 dark:from-accent/20 dark:via-amber-soft/18 dark:to-accent-dark/18",
  },
  {
    title: "YouTube",
    blurb: "New videos and demos as they ship.",
    href: "https://youtube.com/@joshh.io",
    label: "Video",
    external: true,
    previewClass:
      "from-amber-soft/45 via-accent/15 to-white/70 dark:from-amber-soft/30 dark:via-accent/20 dark:to-background-dark/55",
  },
];

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeWorkbench, setActiveWorkbench] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const project of projects) {
      for (const tech of project.tech) {
        tags.add(tech);
      }
    }
    return Array.from(tags).sort();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!activeFilter) return projects;
    return projects.filter((p) => p.tech.includes(activeFilter));
  }, [activeFilter]);

  const featured = filteredProjects.filter((p) => p.featured);
  const other = filteredProjects.filter((p) => !p.featured);
  const currentWorkbench = workbenchItems[activeWorkbench] ?? workbenchItems[0];

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveWorkbench((prev) => (prev + 1) % workbenchItems.length);
    }, 5200);

    return () => {
      window.clearInterval(interval);
    };
  }, [prefersReducedMotion]);

  const goPrev = () => {
    setActiveWorkbench(
      (prev) => (prev - 1 + workbenchItems.length) % workbenchItems.length,
    );
  };

  const goNext = () => {
    setActiveWorkbench((prev) => (prev + 1) % workbenchItems.length);
  };

  return (
    <Section wide>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Lab</h1>
          <p className="mt-2 text-text-light-muted dark:text-text-dark-muted">
            Projects and experiments.
          </p>
        </div>

        {/* Filter tags */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveFilter(null);
            }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              !activeFilter
                ? "bg-accent text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-text-light-muted dark:text-text-dark-muted hover:text-text-light dark:hover:text-text-dark",
            )}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveFilter(activeFilter === tag ? null : tag);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeFilter === tag
                  ? "bg-accent text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-text-light-muted dark:text-text-dark-muted hover:text-text-light dark:hover:text-text-dark",
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-black/8 bg-white/78 p-5 shadow-[0_16px_40px_rgba(34,22,64,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-background-dark-secondary/72 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FlaskConical size={17} className="text-accent" />
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
                Workbench
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="rounded-full border border-black/10 bg-white/85 p-2 text-text-light-muted transition-colors hover:text-text-light dark:border-white/15 dark:bg-background-dark/75 dark:text-amber-soft"
                aria-label="Previous workbench item"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-full border border-black/10 bg-white/85 p-2 text-text-light-muted transition-colors hover:text-text-light dark:border-white/15 dark:bg-background-dark/75 dark:text-amber-soft"
                aria-label="Next workbench item"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentWorkbench.title}
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -18 }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.35 }}
            >
              {currentWorkbench.external ? (
                <a
                  href={currentWorkbench.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "block rounded-xl border border-black/8 bg-gradient-to-br p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(34,22,64,0.12)] dark:border-white/10 sm:p-5",
                    currentWorkbench.previewClass,
                  )}
                >
                  <WorkbenchPreview item={currentWorkbench} />
                </a>
              ) : (
                <Link
                  to={currentWorkbench.href}
                  className={cn(
                    "block rounded-xl border border-black/8 bg-gradient-to-br p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(34,22,64,0.12)] dark:border-white/10 sm:p-5",
                    currentWorkbench.previewClass,
                  )}
                >
                  <WorkbenchPreview item={currentWorkbench} />
                </Link>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 flex gap-2">
            {workbenchItems.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  setActiveWorkbench(index);
                }}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === activeWorkbench
                    ? "w-8 bg-accent dark:bg-amber-soft"
                    : "w-2.5 bg-black/20 dark:bg-white/25",
                )}
                aria-label={`Go to ${item.title}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/8 bg-white/82 p-5 shadow-[0_16px_40px_rgba(34,22,64,0.08)] dark:border-white/10 dark:bg-background-dark-secondary/72 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Wrench size={17} className="text-accent" />
            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
              Experiments
            </h2>
          </div>

          {featured.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-[0.12em] text-text-light-muted uppercase dark:text-amber-soft/80">
                Featured
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {featured.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </div>
          )}

          {other.length > 0 && (
            <div className={cn(featured.length > 0 && "mt-8")}>
              {featured.length > 0 && (
                <h3 className="mb-4 text-sm font-semibold tracking-[0.12em] text-text-light-muted uppercase dark:text-amber-soft/80">
                  More
                </h3>
              )}
              <div className="grid gap-6 sm:grid-cols-2">
                {other.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </div>
          )}

          {filteredProjects.length === 0 && (
            <p className="py-12 text-center text-text-light-muted dark:text-text-dark-muted">
              No projects match that filter.
            </p>
          )}
        </div>
      </motion.div>
    </Section>
  );
}

interface WorkbenchPreviewProps {
  item: WorkbenchItem;
}

function WorkbenchPreview({ item }: WorkbenchPreviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr] sm:items-center">
      <div className="lab-preview-glow relative h-36 rounded-lg border border-black/8 bg-white/68 p-4 dark:border-white/10 dark:bg-background-dark/52">
        <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.55),transparent_42%)] dark:bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent_42%)]" />
        <div className="relative flex h-full items-end justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.12em] text-text-light-muted uppercase dark:text-text-dark">
              {item.label}
            </p>
            <p className="text-sm font-semibold text-text-light dark:text-text-dark">
              {item.title}
            </p>
          </div>
          <span className="text-xs font-medium text-text-light-muted dark:text-text-dark">
            Open
          </span>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-text-light-muted dark:text-text-dark-muted">
        {item.blurb}
      </p>
    </div>
  );
}
