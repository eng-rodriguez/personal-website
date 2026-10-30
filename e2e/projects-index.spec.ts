import { expect, test, type Page } from "@playwright/test";
import { themeStorageKey } from "../src/lib/theme";

const noContent = {
  type: "content",
  description: "no Projects on /projects; filter checks not exercised",
};

const cardsOf = (page: Page) => page.getByRole("main").getByRole("article");
// Hidden cards stay in the DOM, so count the visible ones.
const visibleCards = (page: Page) =>
  page.locator("main [data-project-slug]:visible");

/** Fails the test on a hydration error in the console. */
function failOnHydrationErrors(page: Page) {
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) {
      throw new Error(`hydration error: ${message.text()}`);
    }
  });
}

async function hasProjects(page: Page): Promise<boolean> {
  if ((await cardsOf(page).count()) > 0) return true;
  test.info().annotations.push(noContent);
  return false;
}

test("/projects shows No projects yet and no controls when empty", async ({
  page,
}) => {
  failOnHydrationErrors(page);
  await page.goto("/projects");
  if (await hasProjects(page)) return;
  const main = page.getByRole("main");
  await expect(
    main.getByRole("heading", { level: 2, name: "No projects yet" }),
    "/projects empty state",
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Filters" }),
    "/projects filters",
  ).toHaveCount(0);
  await expect(main.getByRole("radio"), "/projects radios").toHaveCount(0);
  await expect(page.getByRole("status"), "/projects status").toHaveCount(0);
  await expect(
    main.getByText("No matching projects"),
    "/projects no match",
  ).toHaveCount(0);
});

test("/projects filters without a network request", async ({ page }) => {
  failOnHydrationErrors(page);
  await page.goto("/projects", { waitUntil: "networkidle" });
  if (!(await hasProjects(page))) return;
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));

  const category = page.getByRole("group", { name: "Category" });
  const technology = page.getByRole("group", { name: "Technology" });
  const status = page.getByRole("status");
  const total = await visibleCards(page).count();
  await expect(status, "/projects count").toHaveText(
    total === 1 ? "1 project" : `${total} projects`,
  );

  const expectCountMatches = async () => {
    const shown = await visibleCards(page).count();
    await expect(status, "/projects count").toHaveText(
      shown === 0
        ? "No matching projects"
        : shown === 1
          ? "1 project"
          : `${shown} projects`,
    );
  };

  await technology.locator("label").nth(1).click();
  await expectCountMatches();
  await category.locator("label").nth(1).click();
  await expectCountMatches();

  // Find a non-matching pair: every Category with the last Technology.
  const categories = await category.locator("label").count();
  const technologies = await technology.locator("label").count();
  let emptied = false;
  for (let c = 1; c < categories && !emptied; c++) {
    for (let t = 1; t < technologies && !emptied; t++) {
      await category.locator("label").nth(c).click();
      await technology.locator("label").nth(t).click();
      emptied = (await visibleCards(page).count()) === 0;
    }
  }
  if (emptied) {
    await expect(status).toHaveText("No matching projects");
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(
      category.getByRole("radio", { name: "All" }),
      "/projects focus",
    ).toBeFocused();
    await expect(visibleCards(page), "/projects cards").toHaveCount(total);
  }
  expect(requests, "/projects requests after load").toEqual([]);
});

test("/projects resets to All on reload", async ({ page }) => {
  await page.goto("/projects");
  if (!(await hasProjects(page))) return;
  const total = await visibleCards(page).count();
  await page
    .getByRole("group", { name: "Technology" })
    .locator("label")
    .nth(1)
    .click();
  await page.reload();
  await expect(
    page.getByRole("group", { name: "Category" }).getByRole("radio", {
      name: "All",
    }),
  ).toBeChecked();
  await expect(
    page.getByRole("group", { name: "Technology" }).getByRole("radio", {
      name: "All",
    }),
  ).toBeChecked();
  await expect(visibleCards(page)).toHaveCount(total);
});

for (const scheme of ["light", "dark"] as const) {
  test(`/projects filter controls by keyboard in ${scheme}`, async ({
    page,
  }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [themeStorageKey, scheme],
    );
    await page.goto("/projects");
    if (!(await hasProjects(page))) return;
    const category = page.getByRole("group", { name: "Category" });
    const technology = page.getByRole("group", { name: "Technology" });
    await expect(category).toBeEnabled();

    const categoryAll = category.getByRole("radio", { name: "All" });
    while (
      !(await categoryAll.evaluate((el) => el === document.activeElement))
    ) {
      await page.keyboard.press("Tab");
    }
    const outline = await categoryAll.evaluate((el) => {
      const s = getComputedStyle(el.closest("label")!);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(outline.style, `/projects ${scheme} outline`).toBe("solid");
    expect(
      outline.width,
      `/projects ${scheme} outline width`,
    ).toBeGreaterThanOrEqual(2);

    if ((await category.getByRole("radio").count()) > 1) {
      await page.keyboard.press("ArrowRight");
      await expect(category.getByRole("radio").nth(1)).toBeChecked();
    }
    await page.keyboard.press("Tab");
    await expect(technology.getByRole("radio").first()).toBeFocused();

    for (const label of await page.locator("main label").all()) {
      const box = await label.boundingBox();
      expect(box, "/projects option box").not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(24);
      expect(box!.height).toBeGreaterThanOrEqual(24);
    }
  });
}

test("/projects fits 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/projects");
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(
    overflow,
    "/projects horizontal overflow at 320px",
  ).toBeLessThanOrEqual(0);
  if (!(await hasProjects(page))) return;
  const boxes = page.locator(
    'main [data-slot="card"], main label, main [data-slot="tag"]',
  );
  for (const el of await boxes.all()) {
    const box = await el.boundingBox();
    expect(box, "/projects box").not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
});
