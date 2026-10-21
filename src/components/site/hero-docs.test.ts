// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("hero documentation", () => {
  it("test_ac10_design_system_describes_the_hero", () => {
    const doc = readFileSync(
      join(process.cwd(), "docs/design-system.md"),
      "utf8",
    );
    const start = doc.indexOf("\n## Hero");
    expect(start).toBeGreaterThan(-1);
    const next = doc.indexOf("\n## ", start + 1);
    const section = doc.slice(start, next === -1 ? undefined : next);
    for (const term of [
      "src/lib/site.ts",
      "src/lib/hero.ts",
      "HeroConfig",
      "portrait",
      "alt",
      "width",
      "height",
      "primaryNav",
      "outline",
      "20 characters",
      "320px",
      "Tab",
      "```ts",
    ]) {
      expect(section, term).toContain(term);
    }
  });
});
