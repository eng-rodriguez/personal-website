import type { Metadata } from "next";
import { EmptyState } from "@/components/primitives/empty-state";
import { PageHeading } from "@/components/primitives/page-heading";

export const metadata: Metadata = { title: "Resume" };

export default function ResumePage() {
  return (
    <>
      <PageHeading
        title="Resume"
        description="A condensed summary of experience and skills."
      />
      <EmptyState
        className="mt-8"
        title="Resume coming soon"
        description="The resume will appear here."
      />
    </>
  );
}
