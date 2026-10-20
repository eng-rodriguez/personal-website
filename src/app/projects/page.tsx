import type { Metadata } from "next";
import { EmptyState } from "@/components/primitives/empty-state";
import { PageHeading } from "@/components/primitives/page-heading";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description="Work I have built or contributed to."
      />
      <EmptyState
        className="mt-8"
        title="No projects yet"
        description="Projects and case studies will appear here."
      />
    </>
  );
}
