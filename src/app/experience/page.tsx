import type { Metadata } from "next";
import { EmptyState } from "@/components/primitives/empty-state";
import { PageHeading } from "@/components/primitives/page-heading";

export const metadata: Metadata = { title: "Experience" };

export default function ExperiencePage() {
  return (
    <>
      <PageHeading
        title="Experience"
        description="Roles I have held and what I did in them."
      />
      <EmptyState
        className="mt-8"
        title="No experience listed yet"
        description="Professional experience will appear here."
      />
    </>
  );
}
