// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

describe("shell documentation", () => {
  it("test_ac10_design_system_describes_shell_routes_active_rule_and_menu", () => {
    const doc = read("docs/design-system.md");
    const section = doc.slice(doc.indexOf("## Global shell"));
    expect(section).toContain("Landmarks");
    expect(section).toContain("main#main-content");
    expect(section).toContain("isActive");
    expect(section).toContain('aria-current="page"');
    expect(section).toContain("aria-expanded");
    expect(section).toContain("Skip link");
    expect(section).toContain("primaryNav");
  });

  it("test_ac10_claude_md_describes_shell_and_core_routes", () => {
    const doc = read("CLAUDE.md");
    for (const route of [
      "/",
      "/writing",
      "/projects",
      "/experience",
      "/resume",
    ]) {
      expect(doc).toContain("`" + route + "`");
    }
    expect(doc).toContain("global shell");
    expect(doc).toContain("src/components/site");
    expect(doc).toContain("src/lib/navigation.ts");
  });
});
