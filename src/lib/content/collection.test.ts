// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadCollection } from "@/lib/content/collection";
import { ContentError } from "@/lib/content/errors";

const schema = z.strictObject({
  slug: z.string(),
  draft: z.boolean().default(false),
  title: z.string().min(1),
});

const dirs: string[] = [];

function tempDir(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "collection-"));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), content);
  }
  return dir;
}

const file = (slug: string, extra = "", title = "T") =>
  `---\nslug: ${slug}\ntitle: "${title}"\n${extra}---\nbody\n`;

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

describe("loadCollection validate hook", () => {
  it("test_d4_issues_carry_the_file_and_join_frontmatter_issues", () => {
    const directory = tempDir({
      "a.mdx": file("a"),
      "b.mdx": file("b", "", ""),
    });
    const error = contentError(() =>
      loadCollection({
        directory,
        schema,
        mode: "development",
        validate: ({ data }) => [
          { field: "(body)", message: `no ${data.slug}` },
        ],
      }),
    );
    expect(
      error.issues.map((i) => [i.file.endsWith("a.mdx"), i.field]),
    ).toEqual([
      [true, "(body)"],
      [false, "title"],
    ]);
    expect(error.message).toContain("no a");
  });

  it("test_d4_validate_runs_on_drafts_in_production", () => {
    const directory = tempDir({ "a.mdx": file("a", "draft: true\n") });
    expect(() =>
      loadCollection({
        directory,
        schema,
        mode: "production",
        validate: () => [{ message: "rejected" }],
      }),
    ).toThrow(ContentError);
  });

  it("test_d4_validate_is_not_called_when_frontmatter_fails", () => {
    const directory = tempDir({ "a.mdx": file("a", "", "") });
    const validate = vi.fn(() => []);
    expect(() =>
      loadCollection({ directory, schema, mode: "development", validate }),
    ).toThrow(ContentError);
    expect(validate).not.toHaveBeenCalled();
  });

  it("test_d4_validate_receives_data_body_and_line_offset", () => {
    const directory = tempDir({ "a.mdx": file("a") });
    const validate = vi.fn(() => []);
    loadCollection({ directory, schema, mode: "development", validate });
    expect(validate).toHaveBeenCalledWith({
      data: { slug: "a", draft: false, title: "T" },
      body: "body\n",
      bodyLineOffset: 4,
    });
  });

  it("test_d4_without_validate_a_valid_directory_loads", () => {
    const directory = tempDir({ "a.mdx": file("a"), "b.mdx": file("b") });
    const entries = loadCollection({ directory, schema, mode: "development" });
    expect(entries.map((entry) => entry.data.slug)).toEqual(["a", "b"]);
  });
});
