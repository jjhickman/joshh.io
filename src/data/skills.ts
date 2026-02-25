import type { SkillCategory } from '@/lib/types';

export const skills: SkillCategory[] = [
  {
    name: 'Languages',
    skills: [
      'TypeScript',
      'JavaScript',
      'Python',
      'Java',
      'C++',
      'Go',
      'Kotlin',
      'Lua',
    ],
  },
  {
    name: 'Frontend',
    skills: ['React', 'Tailwind CSS', 'Framer Motion', 'HTML/CSS', 'Vite'],
  },
  {
    name: 'Backend',
    skills: ['Node.js', 'Express', 'gRPC', 'REST APIs', 'Spring'],
  },
  {
    name: 'Cloud & Infrastructure',
    skills: [
      'AWS (Lambda, DynamoDB, RDS, S3, CloudFormation, CDK, EKS)',
      'Docker',
      'Kubernetes',
      'NGINX',
    ],
  },
  {
    name: 'Data',
    skills: ['Snowflake', 'Looker', 'SQLite', 'PostgreSQL', 'OpenSearch'],
  },
  {
    name: 'Tools & Practices',
    skills: ['Git', 'ESLint', 'Vitest', 'Zod', 'Pino', 'CI/CD', 'Agile'],
  },
];
