// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("content docs", () => {
  it("test_ac9_content_guide_covers_authoring_rules", () => {
    const doc = read("docs/content.md");
    for (const term of [
      "content/articles",
      "slug",
      "publishedAt",
      "updatedAt",
      "tags",
      "draft",
      "featured",
      "cover",
      "NODE_ENV",
      "\\{",
      "does not build",
    ]) {
      expect(doc, term).toContain(term);
    }
  });

  it("test_ac9_adr_records_the_decision", () => {
    const doc = read("docs/adr/0006-mdx-content-pipeline.md");
    for (const term of [
      "next-mdx-remote",
      "6.0.0",
      "blockJS",
      "Status: Accepted",
    ]) {
      expect(doc, term).toContain(term);
    }
  });

  it("test_ac9_claude_md_points_to_the_pipeline", () => {
    const doc = read("CLAUDE.md");
    for (const term of [
      "ADR 0006",
      "content/articles",
      "src/lib/articles.ts",
    ]) {
      expect(doc, term).toContain(term);
    }
    const unresolved = doc.slice(doc.indexOf("## Unresolved architecture"));
    expect(unresolved.slice(0, unresolved.indexOf("## Factory"))).not.toContain(
      "MDX pipeline",
    );
  });

  it("test_ac9_domain_names_the_article_code", () => {
    const doc = read("docs/domain.md");
    expect(doc).toContain("`Article`");
    expect(doc).toContain("`ArticleFrontmatter`");
  });
});
