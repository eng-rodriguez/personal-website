import { expect, test } from "@playwright/test";
import { themeAttribute, themeStorageKey } from "../src/lib/theme";

test("choosing Dark persists across a reload", async ({ page }) => {
  await page.goto("/");

  const group = page.getByRole("radiogroup", { name: "Theme" });
  // The radio input is visually hidden, so its label receives the click.
  await group.locator("label", { hasText: "Dark" }).click();
  await expect(group.getByRole("radio", { name: "Dark" })).toBeChecked();

  const html = page.locator("html");
  await expect(html, "/ theme after choosing Dark").toHaveAttribute(
    themeAttribute,
    "dark",
  );
  await expect
    .poll(() => page.evaluate((k) => localStorage.getItem(k), themeStorageKey))
    .toBe("dark");

  await page.reload();
  await expect(html, "/ theme after reload").toHaveAttribute(
    themeAttribute,
    "dark",
  );
  await expect(
    page
      .getByRole("radiogroup", { name: "Theme" })
      .getByRole("radio", { name: "Dark" }),
    "/ Dark radio after reload",
  ).toBeChecked();
});
