// @vitest-environment node
import { cpSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getArticles } from "@/lib/articles";
import {
  homePreviewLimit,
  selectFeaturedProjects,
  selectRecentArticles,
} from "@/lib/home";
import { getProjects } from "@/lib/projects";

const fixtures = join(process.cwd(), "src/lib/__fixtures__");
const dir = (type: "articles" | "projects", name: string) =>
  join(fixtures, type, name);
const slugs = (items: readonly { slug: string }[]) =>
  items.map((item) => item.slug);

function tempWith(
  type: "articles" | "projects",
  files: readonly string[],
): string {
  const target = mkdtempSync(join(tmpdir(), "home-"));
  for (const file of files) {
    cpSync(join(dir(type, "home"), file), join(target, file));
  }
  return target;
}

const projectsIn = (directory: string, mode: "production" | "development") =>
  selectFeaturedProjects(getProjects({ directory, mode }));
const articlesIn = (directory: string, mode: "production" | "development") =>
  selectRecentArticles(getArticles({ directory, mode }));

describe("home selection", () => {
  it("test_ac14_limit_is_3", () => {
    expect(homePreviewLimit).toBe(3);
  });

  it("test_ac1_featured_projects_in_loader_order_without_unfeatured", () => {
    expect(slugs(projectsIn(dir("projects", "home"), "production"))).toEqual([
      "alpha-featured",
      "beta-featured",
      "long-featured",
    ]);
  });

  it("test_ac2_recent_articles_ignore_the_featured_flag", () => {
    const selected = articlesIn(dir("articles", "home"), "production");
    expect(slugs(selected)).toEqual([
      "alpha-recent",
      "beta-recent",
      "long-article",
    ]);
    expect(slugs(selected)).not.toContain("older-featured");
  });

  it("test_ac9_drafts_take_no_slot_in_production_only", () => {
    const production = [
      ...projectsIn(dir("projects", "home"), "production"),
      ...articlesIn(dir("articles", "home"), "production"),
    ];
    expect(slugs(production)).not.toContain("draft-featured");
    expect(slugs(production)).not.toContain("draft-newest");
    expect(production).toHaveLength(6);

    expect(slugs(projectsIn(dir("projects", "home"), "development"))).toEqual([
      "draft-featured",
      "alpha-featured",
      "beta-featured",
    ]);
    expect(slugs(articlesIn(dir("articles", "home"), "development"))).toEqual([
      "draft-newest",
      "alpha-recent",
      "beta-recent",
    ]);
  });

  describe("counts", () => {
    it("test_ac14_none", () => {
      const empty = mkdtempSync(join(tmpdir(), "home-empty-"));
      for (const type of ["projects", "articles"] as const) {
        const select = type === "projects" ? projectsIn : articlesIn;
        expect(select(dir(type, "drafts-only"), "production")).toEqual([]);
        expect(select(empty, "production")).toEqual([]);
      }
    });

    it("test_ac14_fewer_than_the_limit", () => {
      expect(slugs(projectsIn(dir("projects", "valid"), "production"))).toEqual(
        ["full-project"],
      );
      const articles = tempWith("articles", [
        "alpha-recent.mdx",
        "beta-recent.mdx",
      ]);
      expect(slugs(articlesIn(articles, "production"))).toEqual([
        "alpha-recent",
        "beta-recent",
      ]);
    });

    it("test_ac14_exactly_the_limit", () => {
      expect(articlesIn(dir("articles", "valid"), "production")).toHaveLength(
        3,
      );
      const projects = tempWith("projects", [
        "alpha-featured.mdx",
        "beta-featured.mdx",
        "long-featured.mdx",
      ]);
      expect(projectsIn(projects, "production")).toHaveLength(3);
    });

    it.each(["production", "development"] as const)(
      "test_ac14_more_than_the_limit_in_%s",
      (mode) => {
        expect(projectsIn(dir("projects", "home"), mode)).toHaveLength(3);
        expect(articlesIn(dir("articles", "home"), mode)).toHaveLength(3);
      },
    );
  });

  it("test_ac14_returns_new_arrays_and_leaves_input_unchanged", () => {
    const projects = Object.freeze(
      getProjects({ directory: dir("projects", "home"), mode: "production" }),
    );
    const articles = Object.freeze(
      getArticles({ directory: dir("articles", "home"), mode: "production" }),
    );
    expect(selectFeaturedProjects(projects)).not.toBe(projects);
    expect(selectRecentArticles(articles)).not.toBe(articles);
    expect(projects).toHaveLength(5);
    expect(articles).toHaveLength(4);
  });
});
