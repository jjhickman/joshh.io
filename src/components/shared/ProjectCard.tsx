import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/lib/icons";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/lib/types";

export interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card hover>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-text-light dark:text-amber-soft">
            {project.title}
          </h3>
          <div className="flex shrink-0 items-center gap-2">
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-light-muted dark:text-amber-soft/80 hover:text-accent dark:hover:text-amber-strong transition-colors"
                aria-label={`${project.title} on GitHub`}
              >
                <GithubIcon size={16} />
              </a>
            )}
            {project.links.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-light-muted dark:text-amber-soft/80 hover:text-accent dark:hover:text-amber-strong transition-colors"
                aria-label={`${project.title} live site`}
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
        <p className="text-sm text-text-light-muted dark:text-text-dark-muted leading-relaxed">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <Badge key={tech} variant="accent">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
