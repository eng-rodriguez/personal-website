import { expect, test, type Page } from "@playwright/test";
import { primaryNav } from "../src/lib/navigation";

test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

const menu = (page: Page) => page.getByRole("button", { name: "Menu" });
const nav = (page: Page) => page.getByRole("navigation", { name: "Primary" });
const noHorizontalScroll = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );
const focusInMain = (page: Page) =>
  page.evaluate(() => {
    const main = document.getElementById("main-content");
    const active = document.activeElement;
    return active !== document.body && !!main && main.contains(active);
  });

for (const { href } of primaryNav) {
  test(`${href} at 375px opens the menu with five links and no horizontal scroll`, async ({
    page,
  }) => {
    const messages: string[] = [];
    page.on("console", (message) => messages.push(message.text()));
    page.on("pageerror", (error) => messages.push(error.message));
    await page.goto(href);

    await menu(page).tap();
    await expect(menu(page), `${href} expanded`).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    const links = nav(page).getByRole("link");
    await expect(links, `${href} links`).toHaveCount(primaryNav.length);
    for (const link of await links.all()) {
      await expect(link, `${href} link`).toBeVisible();
    }
    expect(await noHorizontalScroll(page), `${href} horizontal scroll`).toBe(
      true,
    );
    expect(
      messages.filter((m) => /hydrat|#418|#423|#425/i.test(m)),
      `${href} hydration messages`,
    ).toEqual([]);
  });
}

test("/ keyboard opens the menu and Tab walks the links", async ({ page }) => {
  await page.goto("/");

  await menu(page).focus();
  await page.keyboard.press("Enter");
  await expect(menu(page), "/ expanded by Enter").toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(menu(page), "/ focus after Enter").toBeFocused();
  await page.keyboard.press("Tab");
  await expect(nav(page).getByRole("link", { name: "Home" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(nav(page).getByRole("link", { name: "Writing" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(menu(page), "/ closed by Escape").toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.keyboard.press(" ");
  await expect(menu(page), "/ expanded by Space").toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("/writing Escape closes the menu and focuses the Menu button", async ({
  page,
}) => {
  await page.goto("/writing");

  await menu(page).tap();
  await page.keyboard.press("Escape");
  await expect(menu(page), "/writing closed").toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(nav(page), "/writing nav").toBeHidden();
  await expect(menu(page), "/writing focus").toBeFocused();
});

test("/ outside tap closes the menu and restores focus from the nav", async ({
  page,
}) => {
  await page.goto("/");

  await menu(page).tap();
  await page.locator("main").tap({ position: { x: 2, y: 2 } });
  await expect(menu(page), "/ closed by tap in main").toHaveAttribute(
    "aria-expanded",
    "false",
  );

  await menu(page).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(nav(page).getByRole("link", { name: "Home" })).toBeFocused();
  await page.locator("footer").tap({ position: { x: 2, y: 2 } });
  await expect(menu(page), "/ closed by tap in footer").toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(menu(page), "/ focus after footer tap").toBeFocused();
});

test("/ tapping the Menu button while open closes once", async ({ page }) => {
  await page.goto("/");

  await menu(page).tap();
  await menu(page).tap();
  await expect(menu(page), "/ closed").toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect
    .poll(() => menu(page).getAttribute("aria-expanded"), {
      message: "/ stays closed",
      timeout: 500,
    })
    .toBe("false");
});

test("/ choosing a link navigates, closes and keeps focus in main", async ({
  page,
}) => {
  await page.goto("/");

  await menu(page).tap();
  await nav(page).getByRole("link", { name: "Writing" }).tap();
  await expect(page, "/writing url").toHaveURL(/\/writing$/);
  await expect(menu(page), "/writing closed").toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(
    page.locator('#primary-navigation a[aria-current="page"]'),
  ).toHaveText("Writing");
  await expect
    .poll(() => focusInMain(page), { message: "/writing focus in main" })
    .toBe(true);

  await menu(page).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await nav(page).getByRole("link", { name: "Projects" }).focus();
  await page.keyboard.press("Enter");
  await expect(page, "/projects url").toHaveURL(/\/projects$/);
  await expect(menu(page), "/projects closed").toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect
    .poll(() => focusInMain(page), { message: "/projects focus in main" })
    .toBe(true);
});

test("/ the page scrolls with the menu open and after Escape", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "3000px";
    document.body.append(spacer);
  });

  await menu(page).tap();
  const overflow = await page.evaluate(() =>
    [document.documentElement, document.body].flatMap((el) => {
      const style = getComputedStyle(el);
      return [style.overflow, style.overflowY];
    }),
  );
  expect(overflow, "/ overflow values").not.toContain("hidden");
  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => page.evaluate(() => window.scrollY), {
      message: "/ scrolls while open",
    })
    .toBeGreaterThan(0);
  const before = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Escape");
  // Closing shrinks the content above the viewport and scroll anchoring
  // compensates, so the page may move by the menu height but not return to the top.
  const after = await page.evaluate(() => window.scrollY);
  expect(after, "/ no jump to top").toBeGreaterThan(before / 2);
  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => page.evaluate(() => window.scrollY), {
      message: "/ scrolls after close",
    })
    .toBeGreaterThan(after);
});

test("/ using the theme toggle keeps the menu open", async ({ page }) => {
  await page.goto("/");

  await menu(page).tap();
  await page.getByRole("radiogroup", { name: "Theme" }).getByText("Dark").tap();
  await expect(page.locator("html"), "/ theme").toHaveAttribute(
    "data-theme",
    "dark",
  );
  await expect(menu(page), "/ still open").toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("/ widening to md resets the menu and narrowing leaves it closed", async ({
  page,
}) => {
  await page.goto("/");

  await menu(page).tap();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(menu(page), "/ menu at 1024").toBeHidden();
  await expect(nav(page), "/ nav at 1024").toBeVisible();
  await expect(
    page.locator('[aria-expanded="true"]'),
    "/ expanded controls",
  ).toHaveCount(0);
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(menu(page), "/ back at 375").toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test.describe("without JavaScript at 375px", () => {
  test.use({ javaScriptEnabled: false });

  for (const { href } of primaryNav) {
    test(`${href} shows five links, no Menu button and no theme control`, async ({
      page,
    }) => {
      await page.goto(href);

      const links = nav(page).getByRole("link");
      await expect(links, `${href} links`).toHaveCount(primaryNav.length);
      for (const link of await links.all()) {
        await expect(link, `${href} link`).toBeVisible();
      }
      await expect(menu(page), `${href} menu`).toBeHidden();
      await expect(
        page.locator("[data-theme-toggle]"),
        `${href} theme toggle`,
      ).toBeHidden();
      expect(await noHorizontalScroll(page), `${href} horizontal scroll`).toBe(
        true,
      );
    });
  }
});

test("/ print hides the Menu button at 375px and 1024px", async ({ page }) => {
  await page.goto("/");

  await page.emulateMedia({ media: "print" });
  await expect(menu(page), "/ print at 375").toBeHidden();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(menu(page), "/ print at 1024").toBeHidden();
});

test("/ Back after a client navigation with focus on a menu link moves focus to main", async ({
  page,
}) => {
  await page.goto("/");

  await menu(page).click();
  await nav(page).getByRole("link", { name: "Writing" }).click();
  await expect(page, "/writing after click").toHaveURL(/\/writing$/);
  await menu(page).click();
  await nav(page).getByRole("link", { name: "Projects" }).focus();

  await page.evaluate(() => history.back());
  await expect(page, "/ after Back").toHaveURL(/\/$/);
  await expect(menu(page), "/ menu after Back").toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(await focusInMain(page), "/ focus in main after Back").toBe(true);
});

test.describe("at 1024px", () => {
  test.use({ viewport: { width: 1024, height: 768 }, hasTouch: false });

  test("/ Enter on an inline nav link navigates and keeps focus on the link", async ({
    page,
  }) => {
    await page.goto("/");

    const link = nav(page).getByRole("link", { name: "Writing" });
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page, "/writing after Enter").toHaveURL(/\/writing$/);
    await expect(link, "/writing link current").toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(link, "/writing link focused").toBeFocused();
    expect(await focusInMain(page), "/writing focus not in main").toBe(false);
  });
});
