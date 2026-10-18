// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postcss, { type AtRule, type Root, type Rule } from "postcss";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const root = postcss.parse(css);

const COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
] as const;

function declarations(rule: Rule | AtRule): Map<string, string> {
  const out = new Map<string, string>();
  rule.walkDecls((decl) => {
    out.set(decl.prop, decl.value.trim());
  });
  return out;
}

function topLevelRules(selector: string): Rule[] {
  const found: Rule[] = [];
  (root as Root).each((node) => {
    if (node.type === "rule" && node.selector === selector) found.push(node);
  });
  return found;
}

function atRules(name: string, params?: (value: string) => boolean): AtRule[] {
  const found: AtRule[] = [];
  root.walkAtRules(name, (node) => {
    if (!params || params(node.params)) found.push(node);
  });
  return found;
}

const lightRoot = topLevelRules(":root")[0];
const darkMedia = atRules(
  "media",
  (p) => p.replace(/\s+/g, "") === "(prefers-color-scheme:dark)",
)[0];
const darkRoot = darkMedia?.nodes?.find(
  (node): node is Rule => node.type === "rule" && node.selector === ":root",
);
const light = lightRoot ? declarations(lightRoot) : new Map<string, string>();
const dark = darkRoot ? declarations(darkRoot) : new Map<string, string>();

// ---- Color math (CSS Color 4): OKLCH -> OKLab -> linear sRGB -> WCAG ratio.

type Rgb = [number, number, number];
type Color = { rgb: Rgb; alpha: number };

function parseNumber(raw: string, percentScale: number): number {
  return raw.endsWith("%")
    ? (parseFloat(raw) / 100) * percentScale
    : parseFloat(raw);
}

function parseOklch(token: string, value: string): Color {
  const match =
    /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(
      value,
    );
  if (!match)
    throw new Error(`--${token}: unsupported color format "${value}"`);
  const L = parseNumber(match[1], 1);
  const C = parseFloat(match[2]);
  const H = (parseFloat(match[3]) * Math.PI) / 180;
  const alpha = match[4] === undefined ? 1 : parseNumber(match[4], 1);
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear: Rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return { rgb: linear.map(encode) as Rgb, alpha };
}

function encode(linear: number): number {
  if (linear < -0.001 || linear > 1.001) return linear; // flagged by gamut test
  const c = Math.min(1, Math.max(0, linear));
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

function inGamut(color: Color): boolean {
  // encode() passes out-of-range channels through unchanged, so they stay
  // outside [-0.001, 1.001] here.
  return color.rgb.every((c) => c >= -0.001 && c <= 1.001);
}

function over(top: Color, backdrop: Color, alpha = top.alpha): Rgb {
  return top.rgb.map(
    (c, i) => c * alpha + backdrop.rgb[i] * (1 - alpha),
  ) as Rgb;
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function themeColors(theme: Map<string, string>): Record<string, Color> {
  const colors: Record<string, Color> = {};
  for (const name of COLOR_TOKENS) {
    const value = theme.get(`--${name}`);
    if (value === undefined) continue;
    colors[name] = parseOklch(name, value);
  }
  return colors;
}

const OPAQUE: Color["alpha"] = 1;
const solid = (rgb: Rgb): Color => ({ rgb, alpha: OPAQUE });

describe("globals.css structure", () => {
  it("imports tailwindcss and avoids class-based dark mode", () => {
    expect(atRules("import").map((n) => n.params)).toContain('"tailwindcss"');
    expect(
      atRules("import")
        .map((n) => n.params)
        .join(),
    ).not.toContain("tw-animate-css");
    expect(atRules("custom-variant")).toHaveLength(0);
    expect(css.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/\.dark\b/);
  });

  it("excludes docs from Tailwind source detection", () => {
    expect(atRules("source").map((n) => n.params)).toContain(
      'not "../../docs"',
    );
  });

  it("declares color-scheme light dark on :root", () => {
    expect(light.get("color-scheme")).toBe("light dark");
  });

  it("switches the dark theme only through prefers-color-scheme", () => {
    expect(darkMedia).toBeDefined();
    expect(darkRoot).toBeDefined();
  });
});

describe("design tokens", () => {
  it("declares the same color tokens in both themes", () => {
    const names = (theme: Map<string, string>) =>
      [...theme.keys()]
        .filter((k) => k.startsWith("--") && k !== "--radius")
        .map((k) => k.slice(2))
        .sort();
    expect(names(light)).toEqual([...COLOR_TOKENS].sort());
    expect(names(dark)).toEqual([...COLOR_TOKENS].sort());
  });

  it("maps each color token in @theme inline", () => {
    const inline = atRules("theme", (p) => p.trim() === "inline")[0];
    expect(inline).toBeDefined();
    const mapped = declarations(inline);
    for (const name of COLOR_TOKENS) {
      expect(mapped.get(`--color-${name}`), name).toBe(`var(--${name})`);
    }
    expect(mapped.has("--font-sans")).toBe(true);
  });

  it("defines radius and spacing", () => {
    expect(light.has("--radius")).toBe(true);
    const plainTheme = atRules("theme", (p) => p.trim() === "")[0];
    expect(declarations(plainTheme).get("--spacing")).toBe("0.25rem");
  });
});

describe("base rules", () => {
  it("draws focus with an outline on :focus-visible", () => {
    const rule = (() => {
      let found: Rule | undefined;
      root.walkRules(":focus-visible", (r) => {
        found = r;
      });
      return found;
    })();
    expect(rule?.toString()).toContain("outline-ring");
    expect(rule?.toString()).not.toContain("outline-ring/");
  });

  it("neutralizes motion for prefers-reduced-motion", () => {
    expect(
      atRules("media", (p) => p.includes("prefers-reduced-motion: reduce")),
    ).toHaveLength(1);
  });
});

const themes = [
  ["light", light],
  ["dark", dark],
] as const;

describe.each(themes)("color tokens (%s)", (_name, theme) => {
  const colors = themeColors(theme);

  it.each(COLOR_TOKENS)("%s is inside the sRGB gamut", (token) => {
    expect(inGamut(colors[token]), token).toBe(true);
  });
});

const TEXT_PAIRS: [string, string][] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["muted-foreground", "muted"],
  ["muted-foreground", "background"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
  ["primary", "background"],
];

// Button hover fills: the fill token at the given opacity over the page.
const HOVER_PAIRS: [string, string, number][] = [
  ["primary-foreground", "primary", 0.9],
  ["secondary-foreground", "secondary", 0.8],
  ["destructive-foreground", "destructive", 0.9],
];

describe.each(themes)("WCAG contrast (%s)", (_name, theme) => {
  const colors = themeColors(theme);
  const page = colors.background;

  it.each(TEXT_PAIRS)("%s on %s is at least 4.5:1", (fg, bg) => {
    const backdrop = solid(over(colors[bg], page));
    expect(
      ratio(over(colors[fg], backdrop), backdrop.rgb),
      `${fg}/${bg}`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(HOVER_PAIRS)(
    "%s on %s at %d opacity is at least 4.5:1",
    (fg, bg, opacity) => {
      const fill = solid(over(colors[bg], page, opacity));
      expect(
        ratio(over(colors[fg], fill), fill.rgb),
        `${fg}/${bg} hover`,
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(["ring", "input"])("%s on background is at least 3:1", (token) => {
    expect(
      ratio(over(colors[token], page), page.rgb),
      `${token}/background`,
    ).toBeGreaterThanOrEqual(3);
  });
});
