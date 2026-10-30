import type { Metadata } from "next";
import { PageHeading } from "@/components/primitives/page-heading";
import { ProjectIndex } from "@/components/site/project-index";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description="Work I have built or contributed to."
      />
      <ProjectIndex projects={getProjects()} />
    </>
  );
}
