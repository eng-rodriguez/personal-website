// @vitest-environment node
import { describe, expect, it } from "vitest";
import { ContentError } from "@/lib/content/collection";
import { splitFrontmatter } from "@/lib/content/frontmatter";

const file = "content/articles/x.mdx";

describe("splitFrontmatter", () => {
  it.each([
    ["LF", "---\ntitle: A\n---\nBody\n", "Body\n"],
    ["CRLF", "---\r\ntitle: A\r\n---\r\nBody\r\n", "Body\r\n"],
    ["BOM", "﻿---\ntitle: A\n---\nBody\n", "Body\n"],
  ])("test_ac2_splits_%s", (_name, source, body) => {
    expect(splitFrontmatter(source, file)).toEqual({
      data: { title: "A" },
      body,
    });
  });

  it("test_ac2_keeps_unquoted_dates_as_strings", () => {
    const { data } = splitFrontmatter(
      "---\npublishedAt: 2026-03-10\n---\n",
      file,
    );
    expect(data).toEqual({ publishedAt: "2026-03-10" });
  });

  it("test_ac2_empty_block_is_null", () => {
    expect(splitFrontmatter("---\n---\nBody", file).data).toBeNull();
  });

  it.each([
    ["missing block", "Body only", "missing Frontmatter block"],
    ["unterminated block", "---\ntitle: A\nBody", "unterminated"],
    ["YAML syntax error", "---\ntitle: [a\n---\nBody", ""],
    ["duplicate key", "---\ntitle: A\ntitle: B\n---\nBody", ""],
  ])("test_ac2_%s_names_the_file", (_name, source, text) => {
    try {
      splitFrontmatter(source, file);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ContentError);
      const issues = (error as ContentError).issues;
      expect(issues).toHaveLength(1);
      expect(issues[0].file).toBe(file);
      expect(issues[0].message).toContain(text);
    }
  });
});
