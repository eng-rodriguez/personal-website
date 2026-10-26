import { expect, test } from "@playwright/test";
import { primaryNav } from "../src/lib/navigation";
import { site } from "../src/lib/site";
import { themeStorageKey } from "../src/lib/theme";

const { hero } = site;

test("/ shows the hero name, role and statement with the site title", async ({
  page,
}) => {
  await page.goto("/");
  const main = page.getByRole("main");
  await expect(
    main.getByRole("heading", { level: 1 }),
    "/ hero h1",
  ).toHaveCount(1);
  await expect(
    main.getByRole("heading", { level: 1 }),
    "/ hero h1 text",
  ).toHaveText(hero.name);
  await expect(
    main.getByText(hero.role, { exact: true }),
    "/ role",
  ).toBeVisible();
  await expect(
    main.getByText(hero.statement, { exact: true }),
    "/ statement",
  ).toBeVisible();
  await expect(page, "/ title").toHaveTitle(site.name);
});

for (const { label, href } of hero.ctas) {
  test(`/ CTA "${label}" navigates to ${href}`, async ({ page }) => {
    await page.goto("/");
    const main = page.getByRole("main");
    await expect(
      main.locator('[data-slot="hero"]').getByRole("link"),
      "/ hero links",
    ).toHaveCount(2);
    const cta = main.getByRole("link", { name: label, exact: true });
    await expect(cta, `/ CTA ${label} href`).toHaveAttribute("href", href);
    expect(href, `/ CTA ${label} href is internal`).not.toMatch(
      /^(mailto:|tel:|https?:|\/\/)/,
    );
    const response = await page.request.get(href);
    expect(response.ok(), `${href} response`).toBe(true);

    await cta.click();
    await expect(page, `${href} url after click`).toHaveURL(href);
    const expected = primaryNav.find((item) => item.href === href)!.label;
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1, `${href} h1 count`).toHaveCount(1);
    await expect(h1, `${href} h1 text`).toHaveText(expected);
  });
}

for (const scheme of ["light", "dark"] as const) {
  test(`/ keyboard reaches both CTAs after the header in ${scheme}`, async ({
    page,
  }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [themeStorageKey, scheme],
    );
    await page.goto("/");

    const stops: { zone: string; name: string }[] = [];
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      stops.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const zone = el.closest("header")
            ? "header"
            : el.closest("main")
              ? "main"
              : "other";
          const label =
            el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "";
          return { zone, name: label };
        }),
      );
      if (stops.filter((s) => s.zone === "main").length === 2) break;
    }

    expect(stops[0].zone, `/ ${scheme} first stop is the skip link`).toBe(
      "other",
    );
    const firstMain = stops.findIndex((s) => s.zone === "main");
    expect(firstMain, `/ ${scheme} reached main`).toBeGreaterThan(0);
    expect(
      stops.slice(1, firstMain).every((s) => s.zone === "header"),
      `/ ${scheme} header stops precede main`,
    ).toBe(true);
    expect(
      stops.slice(firstMain).map((s) => s.name),
      `/ ${scheme} CTA order`,
    ).toEqual(hero.ctas.map((c) => c.label));

    // Focus is on the second CTA; check it, then the first.
    const main = page.getByRole("main");
    for (const cta of [...hero.ctas].reverse()) {
      const link = main.getByRole("link", { name: cta.label, exact: true });
      await link.focus();
      const outline = await link.evaluate((el) => {
        const s = getComputedStyle(el);
        return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
      });
      expect(outline.style, `/ ${scheme} ${cta.label} outline style`).toBe(
        "solid",
      );
      expect(
        outline.width,
        `/ ${scheme} ${cta.label} outline width`,
      ).toBeGreaterThanOrEqual(2);
    }

    const second = hero.ctas[1];
    await main.getByRole("link", { name: second.label, exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page, `/ ${scheme} Enter on ${second.label}`).toHaveURL(
      second.href,
    );
  });
}

test("/ fits 320px wide with both CTAs fully visible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, "/ horizontal overflow at 320px").toBeLessThanOrEqual(0);
  for (const { label } of hero.ctas) {
    const box = await page
      .getByRole("main")
      .getByRole("link", { name: label, exact: true })
      .boundingBox();
    expect(box, `/ CTA ${label} box`).not.toBeNull();
    expect(box!.width, `/ CTA ${label} width`).toBeGreaterThanOrEqual(24);
    expect(box!.height, `/ CTA ${label} height`).toBeGreaterThanOrEqual(24);
    expect(box!.x, `/ CTA ${label} left edge`).toBeGreaterThanOrEqual(0);
    expect(
      box!.x + box!.width,
      `/ CTA ${label} right edge`,
    ).toBeLessThanOrEqual(320);
  }
});
