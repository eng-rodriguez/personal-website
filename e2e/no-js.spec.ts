import { expect, test } from "@playwright/test";
import { primaryNav } from "../src/lib/navigation";
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
});
