import { Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Experience } from '@/lib/types';

export interface ExperienceTimelineProps {
  items: Experience[];
}

export function ExperienceTimeline({ items }: ExperienceTimelineProps) {
  return (
    <div className="relative space-y-8">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800" />

      {items.map((item, index) => (
        <div key={`${item.company}-${item.startDate}`} className="relative pl-12">
          {/* Timeline dot */}
          <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-200 dark:border-neutral-800 bg-background-light dark:bg-background-dark">
            <Briefcase
              size={14}
              className={
                index === 0
                  ? 'text-accent'
                  : 'text-text-light-muted dark:text-text-dark-muted'
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-text-light dark:text-text-dark">
                  {item.role}
                </h3>
                <p className="text-sm text-accent">{item.company}</p>
              </div>
              <span className="text-xs text-text-light-muted dark:text-text-dark-muted">
                {item.startDate} &mdash; {item.endDate} &middot; {item.location}
              </span>
            </div>

            <p className="text-sm text-text-light-muted dark:text-text-dark-muted leading-relaxed">
              {item.description}
            </p>

            <ul className="space-y-1">
              {item.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="text-sm text-text-light-muted dark:text-text-dark-muted before:content-['·'] before:mr-2 before:text-accent"
                >
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tech.map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
