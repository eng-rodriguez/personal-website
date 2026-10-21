import type { HeroConfig } from "./hero";

export const site = {
  name: "Personal website",
  description:
    "Personal engineering website featuring technical writing, projects, professional experience and resume.",
  hero: {
    name: "Your Name",
    role: "Software engineer",
    statement:
      "I design and build reliable, accessible software, and I write about the engineering decisions behind it.",
    ctas: [
      { label: "View projects", href: "/projects" },
      { label: "Read writing", href: "/writing" },
    ],
  },
} as const satisfies { name: string; description: string; hero: HeroConfig };
