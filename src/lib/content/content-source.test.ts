// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const modules = [
  "src/lib/content/schema.ts",
  "src/lib/content/frontmatter.ts",
  "src/lib/content/collection.ts",
  "src/lib/content/compile.ts",
  "src/lib/articles.ts",
];

describe("content sources", () => {
  it.each(modules)("test_ac6_%s_is_server_only_and_typed", (path) => {
    const source = read(path);
    expect(source).not.toContain('"use client"');
    expect(source).not.toMatch(/: any\b|as any\b|<any>/);
  });

  it.each(["src/lib/articles.ts", "src/lib/content/collection.ts"])(
    "test_ac6_%s_reads_files_with_node_fs",
    (path) => {
      expect(read(path)).toContain("node:");
    },
  );

  it("test_ac8_collection_imports_node_fs", () => {
    expect(read("src/lib/content/collection.ts")).toContain('from "node:fs"');
  });

  it("test_ac8_writing_page_is_a_synchronous_server_component", () => {
    const source = read("src/app/writing/page.tsx");
    expect(source).not.toMatch(/\basync\b/);
    expect(source).not.toContain('"use client"');
  });
});
