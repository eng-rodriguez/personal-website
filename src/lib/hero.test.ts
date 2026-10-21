import { describe, expect, it } from "vitest";
import {
  heroProblems,
  type HeroConfig,
  type HeroCta,
  type HeroPortrait,
} from "./hero";
import { site } from "./site";

const valid: HeroConfig = {
  name: "Test Name",
  role: "Test role",
  statement: "A test statement.",
  ctas: [
    { label: "First", href: "/projects" },
    { label: "Second", href: "/writing" },
  ],
};

const withPortrait = (patch: Record<string, unknown>): HeroConfig => ({
  ...valid,
  portrait: {
    src: "/portrait.jpg",
    alt: "Portrait",
    width: 400,
    height: 500,
    ...patch,
  },
});

const withCta = (index: 0 | 1, patch: Record<string, unknown>): HeroConfig =>
  ({
    ...valid,
    ctas: valid.ctas.map((c, i) => (i === index ? { ...c, ...patch } : c)),
  }) as unknown as HeroConfig;

describe("heroProblems", () => {
  it("test_ac3_accepts_valid_config_and_the_real_site_copy", () => {
    expect(heroProblems(valid)).toEqual([]);
    expect(heroProblems(site.hero)).toEqual([]);
    expect(heroProblems(withPortrait({}))).toEqual([]);
  });

  it.each(["", "   ", "\n\t"])(
    "test_ac3_rejects_blank_text_fields_%j",
    (blank) => {
      for (const field of ["name", "role", "statement"] as const) {
        const problems = heroProblems({ ...valid, [field]: blank });
        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain(`hero.${field}`);
      }
      for (const i of [0, 1] as const) {
        const problems = heroProblems(withCta(i, { label: blank }));
        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain(`hero.ctas[${i}].label`);
      }
    },
  );

  it.each([
    undefined as never,
    "" as never,
    "/contact" as never,
    "/" as never,
    "https://example.com" as never,
    "mailto:someone@example.com" as never,
    "tel:+15550100" as never,
  ])("test_ac3_rejects_cta_href_%s", (href) => {
    const problems = heroProblems(withCta(0, { href }));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("hero.ctas[0].href");
  });

  it("test_ac3_rejects_duplicate_hrefs", () => {
    const problems = heroProblems(withCta(1, { href: "/projects" }));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("repeat");
  });

  it.each([1, 3])("test_ac3_rejects_%i_ctas", (count) => {
    const ctas = Array.from({ length: count }, () => valid.ctas[0]);
    const problems = heroProblems({ ...valid, ctas } as never);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("exactly two");
  });

  it.each([
    ["alt", ""],
    ["alt", "  "],
    ["width", 0],
    ["width", -1],
    ["width", 1.5],
    ["width", NaN],
    ["height", 0],
    ["src", "//cdn.example"],
    ["src", "/\\cdn.example"],
    ["src", "/a b.jpg"],
    ["src", "https://example.com/a.jpg"],
  ])("test_ac3_rejects_portrait_%s_%j", (field, value) => {
    const problems = heroProblems(withPortrait({ [field]: value }));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain(`hero.portrait.${field}`);
  });
});

describe("HeroConfig types", () => {
  it("test_ac3_types_reject_invalid_shapes", () => {
    const a = valid.ctas[0];
    const b = valid.ctas[1];
    // @ts-expect-error one CTA is not allowed
    const one: HeroConfig = { ...valid, ctas: [a] };
    // @ts-expect-error three CTAs are not allowed
    const three: HeroConfig = { ...valid, ctas: [a, b, a] };
    // @ts-expect-error href outside primaryNav
    const unknown: HeroCta = { label: "x", href: "/contact" };
    // @ts-expect-error the current page is not a target
    const home: HeroCta = { label: "x", href: "/" };
    // @ts-expect-error external href
    const external: HeroCta = { label: "x", href: "https://example.com" };
    // @ts-expect-error missing href
    const missing: HeroCta = { label: "x" };
    // @ts-expect-error portrait without alt
    const noAlt: HeroPortrait = { src: "/p.jpg", width: 1, height: 1 };
    expect([one, three, unknown, home, external, missing, noAlt]).toHaveLength(
      7,
    );
  });
});
