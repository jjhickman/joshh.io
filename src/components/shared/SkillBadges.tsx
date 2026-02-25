import { Badge } from '@/components/ui/Badge';
import type { SkillCategory } from '@/lib/types';

export interface SkillBadgesProps {
  categories: SkillCategory[];
}

export function SkillBadges({ categories }: SkillBadgesProps) {
  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.name}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-light-muted dark:text-text-dark-muted">
            {category.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {category.skills.map((skill) => (
              <Badge key={skill} variant="accent">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
