// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const doc = readFileSync(join(process.cwd(), "docs/design-system.md"), "utf8");
const start = doc.indexOf("## UI primitives");
const rest = doc.slice(start + 1);
const next = rest.indexOf("\n## ");
const section =
  start === -1 ? "" : rest.slice(0, next === -1 ? undefined : next);

describe("UI primitives documentation", () => {
  it("test_ac12_lists_every_primitive_and_the_reused_button", () => {
    expect(start).toBeGreaterThan(-1);
    for (const name of [
      "PageHeading",
      "Section",
      "Card",
      "Tag",
      "Link",
      "EmptyState",
      "Grid",
      "Button",
    ]) {
      expect(section).toContain(name);
    }
  });

  it("test_ac12_states_location_heading_and_link_rules", () => {
    for (const text of [
      "src/components/primitives",
      "aria-labelledby",
      "h1",
      "noopener noreferrer",
      "mailto:",
      "buttonVariants",
    ]) {
      expect(section).toContain(text);
    }
  });

  it("test_ac12_has_adding_a_primitive_and_a_tsx_example", () => {
    expect(section).toContain("### Adding a primitive");
    expect(section).toContain("```tsx");
  });
});
