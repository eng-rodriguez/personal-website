// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");
const hero = read("src/components/site/hero.tsx");

describe("hero source", () => {
  it("test_ac9_is_a_server_component_without_client_code_or_any", () => {
    expect(hero).not.toMatch(/["']use client["']/);
    expect(hero).not.toMatch(
      /\b(useState|useEffect|useReducer|useLayoutEffect)\b/,
    );
    expect(hero).not.toMatch(/:\s*any\b|\bas any\b|<any>/);
  });

  it("test_ac9_uses_only_existing_tokens_and_no_dark_variant", () => {
    expect(hero).not.toMatch(/dark:/);
    expect(hero).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(/);
    const allowed = new Set([
      "foreground",
      "background",
      "muted-foreground",
      "transparent",
      "lg",
    ]);
    for (const m of hero.matchAll(/\b(?:bg|text|border)-([a-z-]+)/g)) {
      expect(allowed.has(m[1]), m[0]).toBe(true);
    }
  });

  it.each([
    ["foreground", "background"],
    ["muted-foreground", "background"],
    ["primary-foreground", "primary"],
    ["accent-foreground", "accent"],
  ])("test_ac9_%s_on_%s_is_in_TEXT_PAIRS", (fg, bg) => {
    const entry = new RegExp(`\\["${fg}",\\s*"${bg}"\\]`);
    expect(read("src/app/globals.test.ts")).toMatch(entry);
  });

  it("test_ac9_hero_lib_has_no_react_or_component_imports", () => {
    const lib = read("src/lib/hero.ts");
    expect(lib).not.toMatch(/@\/components|from "react"/);
  });
});
