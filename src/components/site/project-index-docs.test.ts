// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const doc = readFileSync(join(process.cwd(), "docs/design-system.md"), "utf8");
const start = doc.indexOf("\n## Projects index");
const section = doc.slice(start + 1, doc.indexOf("\n## ", start + 1));

describe("projects index docs", () => {
  it("test_ac16_design_system_documents_the_projects_index", () => {
    expect(start).toBeGreaterThan(-1);
    for (const term of [
      "src/lib/project-filters.ts",
      "getProjects()",
      "`status`",
      "`stack`",
      "AND",
      "All",
      "case-insensitive",
      "first",
      "No projects yet",
      "No matching projects",
      "Clear filters",
      'role="status"',
      "data-js",
      "print",
      "not a link",
      "PROJ-003",
    ]) {
      expect(section, term).toContain(term);
    }
  });
});
