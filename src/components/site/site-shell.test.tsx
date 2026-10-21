import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Experience from "@/app/experience/page";
import Home from "@/app/page";
import Projects from "@/app/projects/page";
import Resume from "@/app/resume/page";
import Writing from "@/app/writing/page";
import { SiteShell } from "@/components/site/site-shell";
import { primaryNav } from "@/lib/navigation";
import { site } from "@/lib/site";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
import { usePathname } from "next/navigation";

const pages = [
  ["/", Home],
  ["/writing", Writing],
  ["/projects", Projects],
  ["/experience", Experience],
  ["/resume", Resume],
] as const;

describe("SiteShell", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it.each(pages)("test_ac1_renders_single_landmarks_for_%s", (path, Page) => {
    vi.mocked(usePathname).mockReturnValue(path);
    render(
      <SiteShell>
        <Page />
      </SiteShell>,
    );

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    expect(screen.getAllByRole("navigation", { name: "Primary" })).toHaveLength(
      1,
    );
    expect(
      within(screen.getByRole("main")).getByRole("heading", { level: 1 }),
    ).toBeInTheDocument();
  });

  it("test_ac6_skip_link_is_first_focusable_and_targets_main", () => {
    const { container } = render(
      <SiteShell>
        <Home />
      </SiteShell>,
    );

    const first = container.querySelector(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const skip = screen.getByRole("link", { name: "Skip to main content" });
    expect(first).toBe(skip);
    expect(skip).toHaveAttribute("href", "#main-content");
    expect(skip).toHaveClass("sr-only", "focus:not-sr-only");
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
    expect(main.tabIndex).toBe(-1);
  });

  it("test_ac1_brand_links_home_without_aria_current", () => {
    render(
      <SiteShell>
        <Home />
      </SiteShell>,
    );

    const brand = within(screen.getByRole("banner")).getByRole("link", {
      name: site.name,
    });
    expect(brand).toHaveAttribute("href", "/");
    expect(brand).not.toHaveAttribute("aria-current");
  });
});

describe("SiteShell theme toggle", () => {
  it.each(pages)(
    "test_ac4_banner_contains_the_theme_group_for_%s",
    (path, Page) => {
      vi.mocked(usePathname).mockReturnValue(path);
      render(
        <SiteShell>
          <Page />
        </SiteShell>,
      );

      expect(
        within(screen.getByRole("banner")).getByRole("radiogroup", {
          name: "Theme",
        }),
      ).toBeInTheDocument();
    },
  );

  it("test_ac4_tab_order_is_skip_link_brand_theme_menu", () => {
    const { container } = render(
      <SiteShell>
        <Home />
      </SiteShell>,
    );

    const focusable = [
      ...container.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ];
    const brand = screen.getByRole("link", { name: site.name });
    const firstRadio = screen.getAllByRole("radio")[0];
    const menu = screen.getByRole("button", { name: "Menu" });
    expect(focusable[0]).toBe(
      screen.getByRole("link", { name: "Skip to main content" }),
    );
    const order = [brand, firstRadio, menu].map((el) => focusable.indexOf(el));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("test_ac2_tab_order_menu_then_links_in_order", () => {
    const { container } = render(
      <SiteShell>
        <Home />
      </SiteShell>,
    );

    const focusable = [
      ...container.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ];
    const menu = focusable.indexOf(
      screen.getByRole("button", { name: "Menu" }),
    );
    expect(menu).toBeGreaterThanOrEqual(0);
    const next = focusable
      .slice(menu + 1, menu + 1 + primaryNav.length)
      .map((el) => el.getAttribute("href"));
    expect(next).toEqual(primaryNav.map((item) => item.href));
    expect(focusable[menu + 1]).toBe(
      screen.getByRole("link", { name: "Home" }),
    );
  });
});
