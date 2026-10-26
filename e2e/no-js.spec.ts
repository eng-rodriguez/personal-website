import { expect, test } from "@playwright/test";
import { primaryNav } from "../src/lib/navigation";
import { site } from "../src/lib/site";
import { scriptReadyAttribute } from "../src/lib/theme";

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const { href } of primaryNav) {
    test(`${href} without JavaScript shows navigation and no theme control`, async ({
      page,
    }) => {
      const response = await page.goto(href);
      expect(response?.ok(), `${href} response`).toBe(true);
      await expect(
        page.locator("html"),
        `${href} data-js attribute`,
      ).not.toHaveAttribute(scriptReadyAttribute, /.*/);

      const nav = page.getByRole("navigation", { name: "Primary" });
      await expect(nav, `${href} nav`).toBeVisible();
      const links = nav.getByRole("link");
      await expect(links, `${href} nav links`).toHaveCount(primaryNav.length);
      for (const link of await links.all()) {
        await expect(link, `${href} nav link`).toBeVisible();
      }

      await expect(
        page.locator("[data-theme-toggle]"),
        `${href} theme toggle`,
      ).toBeHidden();
      await expect(
        page.getByRole("radiogroup", { name: "Theme" }),
        `${href} theme radiogroup`,
      ).toHaveCount(0);
    });
  }

  test("/ without JavaScript shows the hero and the primary CTA navigates", async ({
    page,
  }) => {
    const { hero } = site;
    await page.goto("/");
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 }), "/ h1").toHaveText(
      hero.name,
    );
    await expect(
      main.getByText(hero.role, { exact: true }),
      "/ role",
    ).toBeVisible();
    await expect(
      main.getByText(hero.statement, { exact: true }),
      "/ statement",
    ).toBeVisible();
    for (const cta of hero.ctas) {
      await expect(
        main.getByRole("link", { name: cta.label, exact: true }),
        `/ CTA ${cta.label}`,
      ).toBeVisible();
    }

    await main
      .getByRole("link", { name: hero.ctas[0].label, exact: true })
      .click();
    await expect(page, "/projects url").toHaveURL(hero.ctas[0].href);
    await expect(
      page.getByRole("heading", { level: 1 }),
      "/projects h1",
    ).toHaveText("Projects");
  });

  test("/ without JavaScript renders preview links that navigate", async ({
    page,
  }) => {
    await page.goto("/");
    const main = page.getByRole("main");
    const regions = main.getByRole("region");
    if ((await regions.count()) === 0) {
      test.info().annotations.push({
        type: "content",
        description: "no preview sections on /; card checks not exercised",
      });
      await expect(main.getByRole("link"), "/ main links").toHaveCount(2);
      return;
    }
    const links = regions.getByRole("link");
    for (const link of await links.all()) {
      await expect(link, "/ preview link").toBeVisible();
    }
    const first = links.first();
    const href = await first.getAttribute("href");
    await first.click();
    await expect(page, "/ preview link url").toHaveURL(href!);
    await expect(
      page.getByRole("heading", { level: 1 }),
      `${href} h1`,
    ).toBeVisible();
  });
});
