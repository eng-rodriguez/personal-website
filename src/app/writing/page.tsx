import type { Metadata } from "next";
import { EmptyState } from "@/components/primitives/empty-state";
import { PageHeading } from "@/components/primitives/page-heading";

export const metadata: Metadata = { title: "Writing" };

export default function WritingPage() {
  return (
    <>
      <PageHeading
        title="Writing"
        description="Technical articles and notes."
      />
      <EmptyState
        className="mt-8"
        title="No articles yet"
        description="Articles will appear here."
      />
    </>
  );
}
