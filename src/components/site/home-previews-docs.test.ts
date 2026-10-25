// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const doc = readFileSync(join(process.cwd(), "docs/design-system.md"), "utf8");
const start = doc.indexOf("\n## Home previews");
const section = doc.slice(start + 1, doc.indexOf("\n## ", start + 1));

describe("home previews docs", () => {
  it("test_ac15_design_system_documents_the_home_previews", () => {
    expect(start).toBeGreaterThan(-1);
    for (const term of [
      "src/lib/home.ts",
      "`homePreviewLimit` (3)",
      "featured",
      "getProjects()",
      "getArticles()",
      "not rendered",
      "/projects",
      "/writing",
      "View all",
      "en-US",
      "UTC",
      "Oct 25, 2026",
      "24 by 24",
    ]) {
      expect(section, term).toContain(term);
    }
  });
});
