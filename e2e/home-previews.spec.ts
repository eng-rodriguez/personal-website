import { expect, test, type Page } from "@playwright/test";
import { themeStorageKey } from "../src/lib/theme";

const sectionNames = ["Featured projects", "Recent writing"];
const noContent = {
  type: "content",
  description: "no preview sections on /; card checks not exercised",
};

const regionsOf = (page: Page) => page.getByRole("main").getByRole("region");

/** Region names, in document order, from the page as rendered. */
async function renderedRegions(page: Page): Promise<string[]> {
  const regions = regionsOf(page);
  const names: string[] = [];
  for (const region of await regions.all()) {
    names.push(
      (await region.getByRole("heading", { level: 2 }).textContent()) ?? "",
    );
  }
  return names;
}

test("/ preview sections are absent or well-formed", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");
  await expect(page.getByRole("heading", { level: 1 }), "/ h1").toHaveCount(1);

  const names = await renderedRegions(page);
  const expected = sectionNames.filter((n) => names.includes(n));
  expect(names, "/ region names and order").toEqual(expected);

  if (names.length === 0) {
    test.info().annotations.push(noContent);
    await expect(main.getByRole("heading", { level: 2 }), "/ h2").toHaveCount(
      0,
    );
    await expect(
      main.locator('[data-slot="empty-state"]'),
      "/ empty state",
    ).toHaveCount(0);
    await expect(main.getByRole("link"), "/ main links").toHaveCount(2);
    return;
  }
  for (const region of await regionsOf(page).all()) {
    await expect(region.getByRole("heading", { level: 2 }), "/ h2").toHaveCount(
      1,
    );
    const cards = region.getByRole("article");
    expect(await cards.count(), "/ cards").toBeGreaterThan(0);
    for (const card of await cards.all()) {
      const heading = card.getByRole("heading", { level: 3 });
      await expect(heading, "/ card h3").toHaveCount(1);
      await expect(heading.getByRole("link"), "/ card title link").toHaveCount(
        1,
      );
    }
  }
});

test("/ preview links go to the section pages", async ({ page }) => {
  await page.goto("/");
  const targets: [string, string, string][] = [
    ["Featured projects", "/projects", "Projects"],
    ["Recent writing", "/writing", "Writing"],
  ];
  let found = 0;
  for (const [name, href, h1] of targets) {
    const region = page.getByRole("main").getByRole("region", { name });
    if ((await region.count()) === 0) continue;
    found++;
    for (const link of await region.getByRole("link").all()) {
      await expect(link, `/ ${name} link href`).toHaveAttribute("href", href);
    }
    for (const trigger of [
      region.getByRole("article").first().getByRole("link"),
      region.getByRole("link", { name: /^View all/ }),
    ]) {
      await trigger.click();
      await expect(page, `${href} url`).toHaveURL(href);
      await expect(
        page.getByRole("heading", { level: 1 }),
        `${href} h1`,
      ).toHaveText(h1);
      await page.goBack();
    }
  }
  if (found === 0) test.info().annotations.push(noContent);
});

test("/ previews fit 320px with 24px targets", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, "/ horizontal overflow at 320px").toBeLessThanOrEqual(0);
  const links = regionsOf(page).getByRole("link");
  if ((await links.count()) === 0) {
    test.info().annotations.push(noContent);
    return;
  }
  for (const link of await links.all()) {
    const box = await link.boundingBox();
    const label = (await link.textContent()) ?? "link";
    expect(box, `/ ${label} box`).not.toBeNull();
    expect(box!.width, `/ ${label} width`).toBeGreaterThanOrEqual(24);
    expect(box!.height, `/ ${label} height`).toBeGreaterThanOrEqual(24);
    expect(box!.x, `/ ${label} left edge`).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width, `/ ${label} right edge`).toBeLessThanOrEqual(
      320,
    );
  }
});

for (const scheme of ["light", "dark"] as const) {
  test(`/ keyboard reaches the preview links in order in ${scheme}`, async ({
    page,
  }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [themeStorageKey, scheme],
    );
    await page.goto("/");
    const main = page.getByRole("main");
    if ((await regionsOf(page).count()) === 0) {
      test.info().annotations.push(noContent);
      return;
    }
    const expected = await main
      .getByRole("link")
      .evaluateAll((els) => els.map((el) => el.textContent?.trim() ?? ""));

    const stops: string[] = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const stop = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const inMain = el.closest("main") !== null;
        const s = getComputedStyle(el);
        return {
          inMain,
          name: el.textContent?.trim() ?? "",
          outline: s.outlineStyle,
          width: parseFloat(s.outlineWidth),
          preview: el.closest('[data-slot="section"]') !== null,
        };
      });
      if (stop.inMain) {
        stops.push(stop.name);
        if (stop.preview) {
          expect(stop.outline, `/ ${scheme} ${stop.name} outline`).toBe(
            "solid",
          );
          expect(
            stop.width,
            `/ ${scheme} ${stop.name} outline width`,
          ).toBeGreaterThanOrEqual(2);
        }
      } else if (stops.length > 0) {
        break;
      }
    }
    expect(stops, `/ ${scheme} focus order in main`).toEqual(expected);
  });
}
