// @vitest-environment node
import { describe, expect, it } from "vitest";
import { compileArticle, getArticles } from "@/lib/articles";

// Validates the real content/articles directory, drafts included, so an
// invalid Frontmatter or an unsafe or broken body fails `npm run check`.
describe("content/articles", () => {
  it("test_ac7_every_article_validates_and_compiles", async () => {
    const articles = getArticles({ mode: "development" });
    for (const { slug } of articles) {
      await expect(
        compileArticle(slug, { mode: "development" }),
      ).resolves.toBeDefined();
    }
  });
});
