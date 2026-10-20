// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const files = [
  "page-heading",
  "section",
  "card",
  "tag",
  "link",
  "empty-state",
  "grid",
].map((name) => `src/components/primitives/${name}.tsx`);

// Text token paired with the background it sits on, per primitive.
const pairsInUse: [string, string, string][] = [
  ["card.tsx", "text-muted-foreground", "muted-foreground/card"],
  ["link.tsx", "text-primary", "primary/card"],
  ["tag.tsx", "text-secondary-foreground", "secondary-foreground/secondary"],
  ["page-heading.tsx", "text-muted-foreground", "muted-foreground/background"],
  ["link.tsx", "text-primary", "primary/background"],
];

describe("primitives contrast coverage (AC11)", () => {
  const globalsTest = read("src/app/globals.test.ts");

  it.each(pairsInUse)(
    "test_ac11_%s uses %s and %s is in TEXT_PAIRS",
    (file, cls, pair) => {
      expect(read(`src/components/primitives/${file}`)).toContain(cls);
      const [fg, bg] = pair.split("/");
      const entry = new RegExp(`\\["${fg}",\\s*"${bg}"\\]`);
      expect(globalsTest).toMatch(entry);
    },
  );

  it("test_ac11_primitives_use_only_existing_color_tokens_and_no_dark_variants", () => {
    const allowed = new Set([
      "foreground",
      "background",
      "muted-foreground",
      "card",
      "card-foreground",
      "primary",
      "secondary",
      "secondary-foreground",
      "transparent",
      "dashed",
      "base",
      "lg",
      "sm",
      "xl",
      "xs",
    ]);
    for (const file of files) {
      const source = read(file);
      expect(source, file).not.toMatch(/dark:/);
      expect(source, file).not.toMatch(
        /#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(/,
      );
      for (const m of source.matchAll(/\b(?:bg|text|border)-([a-z-]+)/g)) {
        expect(allowed.has(m[1]), `${file}: ${m[0]}`).toBe(true);
      }
    }
  });

  it("test_ac11_print_block_keeps_color_scheme_light", () => {
    const css = read("src/app/globals.css");
    expect(css).toMatch(
      /@media print\s*\{\s*:root\s*\{\s*color-scheme:\s*light;/,
    );
  });
});
