// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const modules = {
  "page-heading": () => import("./page-heading"),
  section: () => import("./section"),
  card: () => import("./card"),
  tag: () => import("./tag"),
  link: () => import("./link"),
  "empty-state": () => import("./empty-state"),
  grid: () => import("./grid"),
} as const;

const files = {
  "page-heading": "PageHeading",
  section: "Section",
  card: "Card",
  tag: "Tag",
  link: "Link",
  "empty-state": "EmptyState",
  grid: "Grid",
} as const satisfies Record<keyof typeof modules, string>;

describe.each(Object.entries(files) as [keyof typeof files, string][])(
  "%s.tsx",
  (file, name) => {
    const source = readFileSync(
      join(process.cwd(), `src/components/primitives/${file}.tsx`),
      "utf8",
    );

    it("test_ac1_is_a_server_component_without_any_or_dark_variants", () => {
      expect(source).not.toMatch(/["']use client["']/);
      expect(source).not.toMatch(/:\s*any\b|\bas any\b|<any>/);
      expect(source).not.toMatch(
        /\b(useState|useEffect|useReducer|useLayoutEffect)\b/,
      );
      expect(source).not.toContain("dark:");
    });

    it("test_ac1_exports_the_named_function", async () => {
      const mod: Record<string, unknown> = await modules[file]();
      expect(typeof mod[name]).toBe("function");
    });
  },
);
