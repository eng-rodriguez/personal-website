import type { Metadata } from "next";
import { EmptyState } from "@/components/primitives/empty-state";
import { PageHeading } from "@/components/primitives/page-heading";
import { getArticles } from "@/lib/articles";

export const metadata: Metadata = { title: "Writing" };

export default function WritingPage() {
  const articles = getArticles();

  return (
    <>
      <PageHeading
        title="Writing"
        description="Technical articles and notes."
      />
      {articles.length === 0 && (
        <EmptyState
          className="mt-8"
          title="No articles yet"
          description="Articles will appear here."
        />
      )}
    </>
  );
}
