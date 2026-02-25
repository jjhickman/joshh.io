import type { Experience } from "@/lib/types";

export const experience: Experience[] = [
  {
    company: "Liberty Mutual Insurance",
    role: "Senior Software Engineer",
    location: "Boston, MA",
    startDate: "2024",
    endDate: "Present",
    description:
      "Building and maintaining enterprise-scale software solutions for one of the largest insurance providers in the US.",
    highlights: [
      "Developing and maintaining internal tooling and platforms",
      "Collaborating across teams to deliver high-impact features",
    ],
    tech: ["TypeScript", "React", "Node.js", "AWS"],
  },
  {
    company: "Boston Dynamics",
    role: "Senior Software Engineer",
    location: "Waltham, MA",
    startDate: "2021",
    endDate: "2024",
    description:
      "Warehouse Robotics Interfaces team. Developed and maintained the Stretch robot web interface, user analytics, and backend services for autonomous warehouse systems.",
    highlights: [
      "Developed and maintained the Stretch robot web interface using React and TypeScript",
      "Took ownership of user analytics for warehouse robots and autonomous systems (Snowflake, Looker)",
      "Designed and implemented UI/UX features for robot functionality",
      "Engineered backend Node.js REST and Python/C++/Go gRPC APIs for robot operations",
      "Enhanced the Stretch handheld controller (C++/UDP)",
      "Programmed the Stretch Android application (Kotlin)",
    ],
    tech: [
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "C++",
      "Go",
      "Kotlin",
      "gRPC",
      "Snowflake",
      "Looker",
    ],
  },
  {
    company: "SICK Sensor Intelligence",
    role: "Software Engineer",
    location: "Stoughton, MA",
    startDate: "2018",
    endDate: "2021",
    description:
      "Built scalable microservice applications, package scanning systems, and distributed real-time control systems for industrial sensor platforms.",
    highlights: [
      "Developed scalable microservice applications with NGINX and Node.js REST APIs using Docker",
      "Built scalable package/pallet scanning systems (Java, Spring)",
      "Led workshops on containerization and cloud technologies (AWS)",
      "Optimized archive compression and file-system I/O for C++ multi-threaded applications on Linux",
      "Developed distributed real-time control systems (C++, Lua)",
      "Created RESTful APIs for shipping manifest management (Java, Spring)",
    ],
    tech: [
      "Java",
      "Spring",
      "C++",
      "Lua",
      "Node.js",
      "Docker",
      "NGINX",
      "AWS",
      "Linux",
    ],
  },
];
