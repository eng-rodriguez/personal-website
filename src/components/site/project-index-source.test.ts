// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");
const index = read("src/components/site/project-index.tsx");
const filters = read("src/components/site/project-filters.tsx");
const page = read("src/app/projects/page.tsx");
const rules = read("src/lib/project-filters.ts");
const hooks =
  /\b(useState|useEffect|useReducer|useLayoutEffect|useRef|useId|useSyncExternalStore)\b/;

describe("projects index source", () => {
  it.each([
    ["project-index.tsx", index],
    ["page.tsx", page],
  ])("test_ac10_%s is a server component without hooks", (_, source) => {
    expect(source).not.toMatch(/["']use client["']/);
    expect(source).not.toMatch(hooks);
    expect(source).not.toMatch(/:\s*any\b|\bas any\b|<any>/);
  });

  it("test_ac10_page_is_synchronous_with_no_route_config", () => {
    expect(page).not.toMatch(/\basync\b/);
    expect(page).not.toMatch(/export const (dynamic|revalidate)/);
  });

  it("test_ac10_filters_is_a_small_client_component", () => {
    expect(filters.trimStart()).toMatch(/^"use client"/);
    expect(filters).not.toMatch(/useSearchParams|next\/navigation|fetch\(/);
    expect(filters).not.toMatch(/primitives\/(card|tag)"/);
    expect(filters).not.toMatch(
      /^import (?!type)[^;]*from "@\/lib\/projects"/m,
    );
    expect(filters).not.toMatch(/dark:|outline-none|:\s*any\b/);
  });

  it("test_ac14_rules_module_is_pure_and_imports_projects_as_a_type", () => {
    expect(rules).not.toMatch(/from "react"|@\/components|node:/);
    const imports = rules.match(/^import .*$/gm) ?? [];
    expect(imports.length).toBeGreaterThan(0);
    for (const line of imports) expect(line).toMatch(/^import type /);
  });

  it.each([
    ["card-foreground", "card"],
    ["muted-foreground", "card"],
    ["secondary-foreground", "secondary"],
    ["foreground", "background"],
    ["muted-foreground", "background"],
    ["primary-foreground", "primary"],
  ])("test_ac13_%s_on_%s_is_in_TEXT_PAIRS", (fg, bg) => {
    const entry = new RegExp(`\\["${fg}",\\s*"${bg}"\\]`);
    expect(read("src/app/globals.test.ts")).toMatch(entry);
  });

  it("test_ac13_uses_only_existing_tokens", () => {
    const allowed = new Set([
      "muted-foreground",
      "sm",
      "start",
      "input",
      "primary",
      "primary-foreground",
    ]);
    for (const source of [index, filters]) {
      expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(/);
      for (const m of source.matchAll(
        /(?:^|[\s"'`:])(?:bg|text|border)-([a-z-]+)/g,
      )) {
        expect(allowed.has(m[1]), m[0]).toBe(true);
      }
    }
  });
});
