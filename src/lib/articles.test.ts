// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ContentError,
  compileArticle,
  getArticleBySlug,
  getArticles,
} from "@/lib/articles";

const root = join(process.cwd(), "src/lib/__fixtures__/articles");
const valid = join(root, "valid");
const dirs: string[] = [];

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "articles-"));
  dirs.push(dir);
  return dir;
}

function slugs(options: Parameters<typeof getArticles>[0]) {
  return getArticles(options).map((article) => article.slug);
}

function contentError(run: () => unknown): ContentError {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ContentError);
    return error as ContentError;
  }
  throw new Error("expected a ContentError");
}

afterEach(() => {
  vi.unstubAllEnvs();
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

describe("getArticles", () => {
  it("test_ac1_ac5_development_includes_drafts_in_order", () => {
    expect(slugs({ directory: valid, mode: "development" })).toEqual([
      "draft-article",
      "another-article",
      "full-article",
      "minimal-article",
    ]);
  });

  it("test_ac1_full_article_has_every_field", () => {
    const article = getArticleBySlug("full-article", {
      directory: valid,
      mode: "development",
    });
    expect(article).toEqual({
      title: "Full article",
      slug: "full-article",
      description: "An article that uses every field.",
      publishedAt: "2026-03-10",
      updatedAt: "2026-03-12",
      tags: ["nextjs", "testing"],
      draft: false,
      featured: true,
      cover: {
        src: "/images/full-article.png",
        alt: "A placeholder cover image",
      },
    });
  });

  it("test_ac1_minimal_article_gets_defaults", () => {
    const article = getArticleBySlug("minimal-article", {
      directory: valid,
      mode: "development",
    });
    expect(article).toMatchObject({ tags: [], draft: false, featured: false });
    expect(article).not.toHaveProperty("updatedAt");
    expect(article).not.toHaveProperty("cover");
  });

  it("test_ac4_production_hides_drafts", () => {
    const options = { directory: valid, mode: "production" } as const;
    expect(slugs(options)).toEqual([
      "another-article",
      "full-article",
      "minimal-article",
    ]);
    expect(getArticleBySlug("draft-article", options)).toBeUndefined();
  });

  it("test_ac4_default_mode_follows_NODE_ENV", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(slugs({ directory: valid })).not.toContain("draft-article");
    vi.stubEnv("NODE_ENV", "development");
    expect(slugs({ directory: valid })).toContain("draft-article");
  });

  it("test_ac2_invalid_files_report_every_file_and_field", () => {
    const error = contentError(() =>
      getArticles({ directory: join(root, "invalid"), mode: "development" }),
    );
    const fields = error.issues.map((issue) => issue.field);
    expect(fields).toEqual(
      expect.arrayContaining([
        "title",
        "publishedAt",
        "updatedAt",
        "author",
        "tags.2",
        "cover.alt",
        "(frontmatter)",
      ]),
    );
    expect(error.message).toContain(
      "src/lib/__fixtures__/articles/invalid/broken-article.mdx",
    );
    expect(error.message).toContain(
      "src/lib/__fixtures__/articles/invalid/no-frontmatter.mdx",
    );
  });

  it("test_ac5_same_date_orders_slugs_by_code_point", () => {
    const dir = tempDir();
    for (const slug of ["ab", "a-b", "a-c"]) {
      writeFileSync(
        join(dir, `${slug}.mdx`),
        `---\nslug: ${slug}\ntitle: T\ndescription: d\npublishedAt: 2026-01-01\n---\nx\n`,
      );
    }
    expect(slugs({ directory: dir })).toEqual(["a-b", "a-c", "ab"]);
  });

  it("test_ac2_slug_mismatch_is_reported_with_other_field_errors", () => {
    const dir = tempDir();
    writeFileSync(
      join(dir, "bad-article.mdx"),
      '---\nslug: other-name\ntitle: ""\ndescription: d\npublishedAt: 2026-02-30\n---\nx\n',
    );
    const error = contentError(() => getArticles({ directory: dir }));
    expect(error.issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining(["title", "publishedAt", "slug"]),
    );
  });

  it("test_ac2_invalid_draft_still_fails_in_production", () => {
    expect(() =>
      getArticles({ directory: join(root, "invalid"), mode: "production" }),
    ).toThrow(ContentError);
  });

  it("test_ac3_duplicate_slugs_name_both_files", () => {
    const error = contentError(() =>
      getArticles({ directory: join(root, "duplicate"), mode: "development" }),
    );
    expect(error.message).toContain("copy-of-shared.mdx");
    expect(error.message).toContain("shared-slug.mdx");
    expect(error.message).toContain(
      '"shared-slug" must equal the filename "copy-of-shared"',
    );
    const duplicates = error.issues.filter((i) =>
      i.message.includes("is also used by"),
    );
    expect(duplicates).toHaveLength(2);
  });

  it("test_ac5_missing_empty_and_drafts_only_return_nothing", () => {
    expect(
      getArticles({ directory: join(tmpdir(), "no-such-dir-xyz") }),
    ).toEqual([]);
    expect(getArticles({ directory: tempDir() })).toEqual([]);
    expect(
      getArticles({ directory: join(root, "drafts-only"), mode: "production" }),
    ).toEqual([]);
  });

  it.each(["unknown", "../valid/full-article", "Full-Article", ""])(
    "test_ac4_slug_%j_is_undefined",
    (slug) => {
      const options = { directory: valid, mode: "development" } as const;
      expect(getArticleBySlug(slug, options)).toBeUndefined();
      return expect(compileArticle(slug, options)).resolves.toBeUndefined();
    },
  );

  it("test_ac1_results_are_frozen", () => {
    const [article] = getArticles({ directory: valid, mode: "development" });
    expect(Object.isFrozen(article)).toBe(true);
    expect(Object.isFrozen(article.tags)).toBe(true);
  });
});

describe("cache", () => {
  function setup() {
    const dir = tempDir();
    cpSync(
      join(valid, "minimal-article.mdx"),
      join(dir, "minimal-article.mdx"),
    );
    const options = { directory: dir, mode: "production" } as const;
    expect(slugs(options)).toEqual(["minimal-article"]);
    writeFileSync(join(dir, "bad.mdx"), "no frontmatter");
    return options;
  }

  it("test_ac5_production_reuses_loaded_content", () => {
    vi.stubEnv("NODE_ENV", "production");
    const options = setup();
    expect(slugs(options)).toEqual(["minimal-article"]);
  });

  it("test_ac5_test_env_does_not_cache", () => {
    vi.stubEnv("NODE_ENV", "test");
    const options = setup();
    expect(() => getArticles(options)).toThrow(ContentError);
  });
});

describe("compileArticle", () => {
  it("test_ac6_compiles_the_body", async () => {
    const options = { directory: valid, mode: "development" } as const;
    const compiled = await compileArticle("full-article", options);
    expect(compiled?.article.slug).toBe("full-article");
    expect(renderToStaticMarkup(compiled!.content)).toContain("Body heading");
  });

  it("test_ac4_draft_is_undefined_in_production_and_found_in_development", async () => {
    await expect(
      compileArticle("draft-article", { directory: valid, mode: "production" }),
    ).resolves.toBeUndefined();
    await expect(
      compileArticle("draft-article", {
        directory: valid,
        mode: "development",
      }),
    ).resolves.toMatchObject({ article: { slug: "draft-article" } });
  });
});
