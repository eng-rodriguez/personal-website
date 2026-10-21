import { primaryNav } from "./navigation";

export type CoreRoute = (typeof primaryNav)[number]["href"];
export type HeroCta = {
  readonly label: string;
  readonly href: Exclude<CoreRoute, "/">;
};
export type HeroPortrait = {
  readonly src: `/${string}`;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
};
export type HeroConfig = {
  readonly name: string;
  readonly role: string;
  readonly statement: string;
  readonly ctas: readonly [HeroCta, HeroCta];
  readonly portrait?: HeroPortrait;
};

const hasContent = (value: unknown): boolean =>
  typeof value === "string" && value.trim() !== "";

const isPositiveInteger = (n: unknown): boolean =>
  typeof n === "number" && Number.isInteger(n) && n > 0;

// Local path only: no protocol-relative or backslash start, no whitespace or
// control characters (the same rule as the Link primitive).
const localPath = /^\/(?![/\\])[^\u0000- \u007f-\u009f]*$/;

const coreHrefs: readonly string[] = primaryNav
  .map((item) => item.href)
  .filter((href) => href !== "/");

/** Returns one message per problem; an empty array means the config is valid. */
export function heroProblems(hero: HeroConfig): string[] {
  const problems: string[] = [];
  for (const field of ["name", "role", "statement"] as const) {
    if (!hasContent(hero[field])) {
      problems.push(`hero.${field} must not be empty`);
    }
  }

  const ctas: readonly unknown[] = hero.ctas;
  if (!Array.isArray(ctas) || ctas.length !== 2) {
    problems.push("hero.ctas must contain exactly two items");
  } else {
    const hrefs: unknown[] = [];
    ctas.forEach((cta, i) => {
      const item = (cta ?? {}) as { label?: unknown; href?: unknown };
      if (!hasContent(item.label)) {
        problems.push(`hero.ctas[${i}].label must not be empty`);
      }
      if (typeof item.href !== "string" || !coreHrefs.includes(item.href)) {
        problems.push(
          `hero.ctas[${i}].href must be a core route other than "/"`,
        );
      }
      hrefs.push(item.href);
    });
    if (typeof hrefs[0] === "string" && hrefs[0] === hrefs[1]) {
      problems.push("hero.ctas must not repeat the same href");
    }
  }

  const portrait = hero.portrait;
  if (portrait !== undefined) {
    if (!hasContent(portrait.alt)) {
      problems.push("hero.portrait.alt must not be empty");
    }
    if (!isPositiveInteger(portrait.width)) {
      problems.push("hero.portrait.width must be a positive integer");
    }
    if (!isPositiveInteger(portrait.height)) {
      problems.push("hero.portrait.height must be a positive integer");
    }
    if (typeof portrait.src !== "string" || !localPath.test(portrait.src)) {
      problems.push("hero.portrait.src must be a local path starting with /");
    }
  }
  return problems;
}
