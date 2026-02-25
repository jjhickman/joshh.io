import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { SITE_CONFIG } from "@/lib/constants";
import { projects } from "@/data/projects";

const featuredProjects = projects.filter((p) => p.featured);

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const transitionEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const heroMotion = {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: prefersReducedMotion ? 0.2 : 0.6,
      ease: transitionEase,
    },
  };

  return (
    <div className="relative overflow-hidden">
      <Section wide className="relative !pt-10 sm:!pt-14 lg:!pt-16">
        <div className="hero-surface relative overflow-hidden rounded-3xl p-6 shadow-[0_28px_65px_rgba(34,22,64,0.16)] sm:p-10 lg:p-12">
          <div className="rhythm-grid pointer-events-none absolute inset-0 opacity-50 dark:opacity-35" />
          <motion.div {...heroMotion} className="relative max-w-3xl space-y-5">
            <h1 className="font-display text-4xl leading-[1.06] tracking-tight text-text-light sm:text-5xl lg:text-6xl dark:text-amber-soft">
              {SITE_CONFIG.name}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-text-light-muted sm:text-lg dark:text-text-dark-muted">
              I build software in Boston and share experiments, notes, and work
              in progress.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium tracking-wide text-accent uppercase">
                {projects.length} projects
              </div>
              <div className="rounded-full border border-amber-soft/45 bg-amber-soft/30 px-3 py-1 text-xs font-medium tracking-wide text-text-light dark:text-text-dark">
                {featuredProjects.length} featured
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link to="/lab">
                <Button
                  size="lg"
                  className="rounded-full px-7 shadow-[0_10px_25px_rgba(115,68,255,0.28)]"
                >
                  Work
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full border-accent/30 bg-white/75 px-7 backdrop-blur-sm dark:bg-background-dark-secondary/70"
                >
                  Contact
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>

      <Section wide className="relative !pt-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.55 }}
        >
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl leading-tight tracking-tight text-text-light dark:text-text-dark">
              Featured Projects
            </h2>
            <Link
              to="/lab"
              className="group flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-light"
            >
              View all
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </motion.div>
      </Section>

      <div className="pointer-events-none absolute top-14 right-[-18%] h-72 w-72 rounded-full bg-accent/28 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 left-[-14%] h-80 w-80 rounded-full bg-amber-soft/38 blur-3xl" />
    </div>
  );
}
