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

  it("test_ac10_content_guide_covers_projects", () => {
    const doc = read("docs/content.md");
    for (const term of [
      "content/projects",
      "summary",
      "role",
      "stack",
      "startedAt",
      "endedAt",
      "status",
      "links",
      "caseStudy",
      "## Problem",
      "## Approach",
      "## Decisions",
      "## Outcome",
    ]) {
      expect(doc, term).toContain(term);
    }
  });

  it("test_ac10_adr_0007_records_the_decision", () => {
    const doc = read("docs/adr/0007-project-model-with-case-studies.md");
    for (const term of [
      "caseStudy",
      "## Problem",
      "ADR 0006",
      "Status: Accepted",
    ]) {
      expect(doc, term).toContain(term);
    }
  });

  it("test_ac10_claude_md_points_to_the_project_model", () => {
    const doc = read("CLAUDE.md");
    for (const term of [
      "ADR 0007",
      "content/projects",
      "src/lib/projects.ts",
    ]) {
      expect(doc, term).toContain(term);
    }
    const unresolved = doc.slice(doc.indexOf("## Unresolved architecture"));
    expect(unresolved.slice(0, unresolved.indexOf("## Factory"))).not.toContain(
      "whether case studies",
    );
  });

  it("test_ac10_domain_names_the_project_code", () => {
    const doc = read("docs/domain.md");
    expect(doc).toContain("`Project`");
    expect(doc).toContain("`ProjectFrontmatter`");
    expect(doc).toContain("caseStudy");
    expect(doc).not.toContain("whether a case study is a kind of project");
  });

  it("test_ac15_content_guide_states_what_featured_does_on_the_home_page", () => {
    const doc = read("docs/content.md");
    expect(doc).toContain("home page");
    const articles = doc.slice(
      doc.indexOf("## Frontmatter"),
      doc.indexOf("## Drafts"),
    );
    expect(articles).toContain("does not affect the home page");
    const projects = doc.slice(
      doc.indexOf("## Project Frontmatter"),
      doc.indexOf("## Case studies"),
    );
    expect(projects).toContain("selects the Project for the home page");
    expect(projects).toContain("at most 3");
    expect(projects).toContain("no ordering field");
  });

  it("test_ac16_content_guide_states_what_drives_the_projects_filters", () => {
    const doc = read("docs/content.md");
    const projects = doc.slice(
      doc.indexOf("## Project Frontmatter"),
      doc.indexOf("## Case studies"),
    );
    expect(projects).toContain(
      "`status` and `stack` drive the `/projects` filters",
    );
    expect(projects).toContain("no category or tags field");
    expect(projects).toContain("first Project");
  });
});
