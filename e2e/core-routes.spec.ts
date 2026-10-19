import { expect, test } from "@playwright/test";
import { primaryNav } from "../src/lib/navigation";
import { site } from "../src/lib/site";

for (const { href, label } of primaryNav) {
  test(`${href} renders the shell, title and current nav item`, async ({
    page,
  }) => {
    const response = await page.goto(href);
    expect(response?.ok(), `${href} response`).toBe(true);

    await expect(page.getByRole("main"), `${href} main`).toHaveCount(1);
    await expect(
      page.getByRole("heading", { level: 1 }),
      `${href} h1`,
    ).toHaveCount(1);

    const title = href === "/" ? site.name : `${label} · ${site.name}`;
    await expect(page, `${href} title`).toHaveTitle(title);

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav, `${href} nav`).toBeVisible();
    await expect(nav.getByRole("link"), `${href} nav links`).toHaveCount(
      primaryNav.length,
    );
    await expect(
      nav.getByRole("link", { name: label, exact: true }),
      `${href} current link`,
    ).toHaveAttribute("aria-current", "page");
    await expect(
      nav.locator('[aria-current="page"]'),
      `${href} current count`,
    ).toHaveCount(1);
  });
}
