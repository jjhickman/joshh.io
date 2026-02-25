import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    slug: "garbanzo-bot",
    title: "garbanzo-bot",
    description:
      "AI chat operations platform for communities. Multi-provider LLM routing with 500+ tests and Docker-first deployment.",
    longDescription:
      "A comprehensive AI chat operations platform designed for community management. Features multi-provider LLM routing, configurable personalities, rate limiting, and extensive test coverage. Built with TypeScript and Node.js, following a Docker-first deployment philosophy.",
    tech: ["TypeScript", "Node.js", "Docker", "SQLite", "Zod", "Vitest"],
    links: {
      github: "https://github.com/jjhickman/garbanzo-bot",
    },
    featured: true,
  },
  {
    slug: "music-concepts",
    title: "Music Concepts (In Progress)",
    description:
      "Music sketches and production experiments influenced by post-punk, electronic, and heavy guitar textures.",
    tech: ["Music Production", "Songwriting", "Arrangement"],
    links: {},
    featured: false,
  },
  {
    slug: "joshh-io",
    title: "joshh.io",
    description:
      "This website. A React SPA built with TypeScript, Tailwind CSS, and deployed on AWS Amplify.",
    tech: ["React", "TypeScript", "Tailwind CSS", "Vite", "AWS Amplify"],
    links: {
      github: "https://github.com/jjhickman/joshh.io",
      live: "https://joshh.io",
    },
    featured: false,
  },
];
