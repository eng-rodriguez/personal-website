// @vitest-environment node
import { describe, expect, it } from "vitest";
import { articleFrontmatterSchema } from "@/lib/articles";

const valid = {
  title: "T",
  slug: "t",
  description: "D",
  publishedAt: "2026-03-10",
};

function fieldsOf(input: unknown): string[] {
  const result = articleFrontmatterSchema.safeParse(input);
  return result.success
    ? []
    : result.error.issues.map((issue) =>
        issue.code === "unrecognized_keys"
          ? issue.keys.join(",")
          : issue.path.join("."),
      );
}

describe("articleFrontmatterSchema", () => {
  it("test_ac1_applies_defaults", () => {
    expect(articleFrontmatterSchema.parse(valid)).toEqual({
      ...valid,
      tags: [],
      draft: false,
      featured: false,
    });
  });

  it.each([
    ["missing title", { ...valid, title: undefined }, "title"],
    ["blank title", { ...valid, title: "  " }, "title"],
    [
      "missing description",
      { ...valid, description: undefined },
      "description",
    ],
    ["blank description", { ...valid, description: " " }, "description"],
    ["unknown key", { ...valid, author: "x" }, "author"],
    [
      "unknown cover key",
      { ...valid, cover: { src: "/a.png", alt: "a", extra: 1 } },
      "extra",
    ],
    [
      "relative cover src",
      { ...valid, cover: { src: "images/a.png", alt: "a" } },
      "cover.src",
    ],
    [
      "protocol-relative cover src",
      { ...valid, cover: { src: "//host/a.png", alt: "a" } },
      "cover.src",
    ],
    [
      "backslash cover src",
      { ...valid, cover: { src: "/\\host/x.png", alt: "a" } },
      "cover.src",
    ],
    [
      "cover src with a space",
      { ...valid, cover: { src: "/a b.png", alt: "a" } },
      "cover.src",
    ],
    [
      "cover src with a tab",
      { ...valid, cover: { src: "/a\tb.png", alt: "a" } },
      "cover.src",
    ],
    ["cover without alt", { ...valid, cover: { src: "/a.png" } }, "cover.alt"],
    [
      "updatedAt before publishedAt",
      { ...valid, updatedAt: "2026-03-09" },
      "updatedAt",
    ],
  ])("test_ac2_rejects_%s", (_name, input, field) => {
    expect(fieldsOf(input)).toContain(field);
  });

  it("test_ac2_accepts_updatedAt_equal_to_publishedAt", () => {
    expect(
      articleFrontmatterSchema.safeParse({ ...valid, updatedAt: "2026-03-10" })
        .success,
    ).toBe(true);
  });
});
