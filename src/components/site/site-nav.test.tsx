import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SiteNav } from "@/components/site/site-nav";
import { primaryNav } from "@/lib/navigation";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
import { usePathname } from "next/navigation";

const mockPath = (path: string) => vi.mocked(usePathname).mockReturnValue(path);
const toggle = () => screen.getByRole("button", { name: "Menu" });
const nav = () => screen.getByRole("navigation", { name: "Primary" });

beforeEach(() => mockPath("/"));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SiteNav structure", () => {
  it("test_ac2_ac3_renders_named_nav_links_and_collapsed_toggle", () => {
    render(<SiteNav />);

    const links = within(nav()).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(
      primaryNav.map((i) => i.href),
    );
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(toggle()).toHaveAttribute("aria-controls", nav().id);
  });

  it("test_ac2_ac3_uses_responsive_classes", () => {
    render(<SiteNav />);

    expect(toggle()).toHaveClass("md:hidden");
    expect(nav()).toHaveClass("hidden", "md:block");
    fireEvent.click(toggle());
    expect(nav()).toHaveClass("block");
    expect(nav()).not.toHaveClass("hidden");
  });
});

describe("SiteNav disclosure", () => {
  it("test_ac4_toggle_opens_and_closes", () => {
    render(<SiteNav />);

    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("test_ac4_link_click_closes", () => {
    render(<SiteNav />);

    fireEvent.click(toggle());
    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("test_ac4_escape_closes_and_focuses_toggle", () => {
    render(<SiteNav />);

    fireEvent.click(toggle());
    fireEvent.keyDown(document, { key: "a" });
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(toggle());
  });

  it("test_ac4_pathname_change_closes_and_stays_closed_on_return", () => {
    const { rerender } = render(<SiteNav />);

    fireEvent.click(toggle());
    mockPath("/writing");
    rerender(<SiteNav />);
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    mockPath("/");
    rerender(<SiteNav />);
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("test_ac4_reaching_md_closes_the_menu", () => {
    let listener: ((e: { matches: boolean }) => void) | undefined;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        addEventListener: (_: string, cb: typeof listener) => (listener = cb),
        removeEventListener: vi.fn(),
      })),
    );
    render(<SiteNav />);

    fireEvent.click(toggle());
    expect(listener).toBeDefined();
    act(() => listener!({ matches: true }));
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("test_ac4_opening_without_matchmedia_does_not_throw", () => {
    render(<SiteNav />);

    expect(() => fireEvent.click(toggle())).not.toThrow();
  });
});

describe("SiteNav active link", () => {
  it.each(["/", "/writing", "/writing/example"])(
    "test_ac5_marks_exactly_one_link_for_%s",
    (path) => {
      mockPath(path);
      render(<SiteNav />);

      const current = within(nav())
        .getAllByRole("link")
        .filter((l) => l.getAttribute("aria-current") === "page");
      expect(current).toHaveLength(1);
      expect(current[0]).toHaveClass("underline", "font-semibold");
      for (const link of within(nav()).getAllByRole("link")) {
        if (link === current[0]) continue;
        expect(link).not.toHaveAttribute("aria-current");
        expect(link).not.toHaveClass("underline");
        expect(link).not.toHaveClass("font-semibold");
      }
    },
  );

  it.each(["/writingx", "/missing"])(
    "test_ac5_marks_no_link_for_%s",
    (path) => {
      mockPath(path);
      render(<SiteNav />);

      for (const link of within(nav()).getAllByRole("link")) {
        expect(link).not.toHaveAttribute("aria-current");
      }
    },
  );
});

describe("SiteNav targets and focus", () => {
  it("test_ac6_has_target_size_and_no_focus_overrides", () => {
    const { container } = render(<SiteNav />);

    expect(toggle()).toHaveClass("min-h-10");
    for (const link of within(nav()).getAllByRole("link")) {
      expect(link).toHaveClass("min-h-10", "motion-reduce:transition-none");
    }
    for (const el of container.querySelectorAll("*")) {
      const classes = Array.from(el.classList);
      expect(classes).not.toContain("outline-none");
      expect(classes.some((c) => c.startsWith("focus:"))).toBe(false);
    }
  });
});
