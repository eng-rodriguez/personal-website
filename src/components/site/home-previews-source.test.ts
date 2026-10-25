// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");
const previews = read("src/components/site/home-previews.tsx");
const page = read("src/app/page.tsx");

describe("home previews source", () => {
  it.each([
    ["home-previews.tsx", previews],
    ["page.tsx", page],
  ])(
    "test_ac10_%s is a server component without client code or any",
    (_, source) => {
      expect(source).not.toMatch(/["']use client["']/);
      expect(source).not.toMatch(
        /\b(useState|useEffect|useReducer|useLayoutEffect)\b/,
      );
      expect(source).not.toMatch(/:\s*any\b|\bas any\b|<any>/);
    },
  );

  it("test_ac10_page_is_synchronous", () => {
    expect(page).not.toMatch(/\basync\b/);
  });

  it("test_ac13_uses_only_existing_tokens_and_no_dark_variant", () => {
    expect(previews).not.toMatch(/dark:/);
    expect(previews).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(/);
    const allowed = new Set(["muted-foreground", "sm"]);
    for (const m of previews.matchAll(/\b(?:bg|text|border)-([a-z-]+)/g)) {
      expect(allowed.has(m[1]), m[0]).toBe(true);
    }
  });

  it.each([
    ["card-foreground", "card"],
    ["primary", "card"],
    ["muted-foreground", "card"],
    ["secondary-foreground", "secondary"],
    ["foreground", "background"],
    ["primary", "background"],
  ])("test_ac13_%s_on_%s_is_in_TEXT_PAIRS", (fg, bg) => {
    const entry = new RegExp(`\\["${fg}",\\s*"${bg}"\\]`);
    expect(read("src/app/globals.test.ts")).toMatch(entry);
  });

  it.each(["src/lib/home.ts", "src/lib/dates.ts"])(
    "test_ac13_%s is pure",
    (file) => {
      const source = read(file);
      expect(source).not.toMatch(/@\/components|from "react"|node:/);
    },
  );

  it("test_ac13_home_imports_content_modules_as_types_only", () => {
    const imports = read("src/lib/home.ts").match(/^import .*$/gm) ?? [];
    expect(imports.length).toBeGreaterThan(0);
    for (const line of imports) expect(line).toMatch(/^import type /);
  });
});
