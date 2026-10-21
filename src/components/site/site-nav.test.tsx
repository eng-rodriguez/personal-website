import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SiteNav } from "@/components/site/site-nav";
import { ThemeToggle } from "@/components/site/theme-toggle";
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

describe("SiteNav actions", () => {
  it("test_ac10_renders_actions_before_the_menu_button_in_a_wrapping_cluster", () => {
    render(<SiteNav actions={<span data-testid="action">Action</span>} />);

    const action = screen.getByTestId("action");
    expect(
      action.compareDocumentPosition(toggle()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(action.parentElement).toBe(toggle().parentElement);
    expect(toggle().parentElement).toHaveClass("flex-wrap");
  });
});

function renderHarness(
  actions: ReactNode = <button type="button">Action</button>,
) {
  return render(
    <>
      <header>
        <SiteNav actions={actions} />
      </header>
      <main id="main-content" tabIndex={-1}>
        <a href="#x">In main</a>
        <p>Text</p>
      </main>
      <footer>
        <p>Footer text</p>
      </footer>
    </>,
  );
}
const expanded = () => toggle().getAttribute("aria-expanded");
const footerText = () => screen.getByText("Footer text");
const mainLink = () => screen.getByRole("link", { name: "In main" });
const navLink = (name: string) => within(nav()).getByRole("link", { name });
const mainEl = () => screen.getByRole("main");
function press(target: Element, init: PointerEventInit = {}) {
  fireEvent.pointerDown(target, init);
  fireEvent.click(target);
}
function openMenu() {
  fireEvent.click(toggle());
  expect(expanded()).toBe("true");
}

describe("SiteNav hooks and print", () => {
  it("test_ac1_click_opens_and_shows_the_nav", () => {
    render(<SiteNav />);

    fireEvent.click(toggle());
    expect(expanded()).toBe("true");
    expect(nav()).toHaveClass("block");
    expect(nav()).not.toHaveClass("hidden");
    expect(toggle()).toHaveAttribute("data-menu-toggle");
    expect(nav()).toHaveAttribute("data-primary-nav");
  });

  it("test_ac11_toggle_is_hidden_in_print", () => {
    render(<SiteNav />);

    expect(toggle()).toHaveClass("print:hidden");
  });

  it("test_a9_no_new_transitions", () => {
    render(<SiteNav />);

    for (const el of [toggle(), nav()]) {
      expect(
        Array.from(el.classList).some(
          (c) => c.startsWith("transition") || c.startsWith("animate"),
        ),
      ).toBe(false);
    }
  });
});

describe("SiteNav Escape", () => {
  it("test_ac3_escape_when_closed_changes_nothing", () => {
    renderHarness();

    mainLink().focus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(expanded()).toBe("false");
    expect(document.activeElement).toBe(mainLink());
  });

  it("test_ac3_escape_from_main_link_focuses_the_toggle", () => {
    renderHarness();

    openMenu();
    mainLink().focus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(expanded()).toBe("false");
    expect(document.activeElement).toBe(toggle());
  });
});

describe("SiteNav outside press", () => {
  it("test_ac4_outside_press_closes", () => {
    renderHarness();

    openMenu();
    fireEvent.pointerDown(footerText());
    expect(expanded()).toBe("false");
  });

  it("test_ac4_outside_press_with_focus_in_nav_returns_focus_to_toggle", () => {
    renderHarness();

    openMenu();
    navLink("Writing").focus();
    press(footerText());
    expect(expanded()).toBe("false");
    expect(document.activeElement).toBe(toggle());
  });

  it("test_ac4_outside_press_on_focusable_keeps_its_focus", () => {
    renderHarness();

    openMenu();
    navLink("Writing").focus();
    fireEvent.pointerDown(mainLink());
    mainLink().focus();
    fireEvent.click(mainLink());
    expect(expanded()).toBe("false");
    expect(document.activeElement).toBe(mainLink());
  });

  it("test_ac4_outside_press_with_focus_outside_nav_does_not_move_focus", () => {
    renderHarness();

    openMenu();
    mainLink().focus();
    press(footerText());
    expect(expanded()).toBe("false");
    expect(document.activeElement).toBe(mainLink());
  });

  it("test_ac4_pointercancel_restores_focus", () => {
    renderHarness();

    openMenu();
    navLink("Writing").focus();
    fireEvent.pointerDown(footerText());
    fireEvent.pointerCancel(document);
    expect(document.activeElement).toBe(toggle());
  });

  it("test_ac4_press_inside_nav_padding_keeps_it_open", () => {
    renderHarness();

    openMenu();
    fireEvent.pointerDown(within(nav()).getByRole("list"));
    expect(expanded()).toBe("true");
  });

  it("test_ac4_press_inside_header_keeps_it_open", () => {
    renderHarness();

    openMenu();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Action" }));
    expect(expanded()).toBe("true");
  });

  it("test_ac4_without_header_ancestor_uses_own_elements", () => {
    render(<SiteNav />);

    openMenu();
    fireEvent.pointerDown(within(nav()).getByRole("list"));
    expect(expanded()).toBe("true");
    fireEvent.pointerDown(document.body);
    expect(expanded()).toBe("false");
  });

  it("test_ac4_touch_tap_outside_closes_on_pointerup", () => {
    renderHarness();

    openMenu();
    fireEvent.pointerDown(footerText(), { pointerType: "touch", pointerId: 7 });
    expect(expanded()).toBe("true");
    fireEvent.pointerUp(footerText(), { pointerType: "touch", pointerId: 7 });
    expect(expanded()).toBe("false");
  });

  it("test_ac4_touch_pointercancel_keeps_it_open", () => {
    renderHarness();

    openMenu();
    fireEvent.pointerDown(footerText(), { pointerType: "touch", pointerId: 7 });
    fireEvent.pointerCancel(footerText(), {
      pointerType: "touch",
      pointerId: 7,
    });
    fireEvent.pointerUp(footerText(), { pointerType: "touch", pointerId: 7 });
    expect(expanded()).toBe("true");
  });

  it("test_ac4_mouse_pointerdown_closes", () => {
    renderHarness();

    openMenu();
    fireEvent.pointerDown(footerText(), { pointerType: "mouse" });
    expect(expanded()).toBe("false");
  });

  it("test_ac4_listeners_attach_only_while_open", () => {
    const added: [string, unknown][] = [];
    const removed: [string, unknown][] = [];
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    const watched = ["pointerdown", "keydown", "click", "pointercancel"];
    const collect = () => {
      added.length = 0;
      removed.length = 0;
      for (const [type, fn] of add.mock.calls)
        if (watched.includes(type)) added.push([type, fn]);
      for (const [type, fn] of remove.mock.calls)
        if (watched.includes(type)) removed.push([type, fn]);
    };
    const { unmount } = renderHarness();

    collect();
    expect(added.some(([t]) => t === "pointerdown")).toBe(false);
    openMenu();
    fireEvent.keyDown(document, { key: "Escape" });
    collect();
    expect(added.some(([t]) => t === "pointerdown")).toBe(true);
    for (const entry of added) expect(removed).toContainEqual(entry);

    openMenu();
    navLink("Writing").focus();
    fireEvent.pointerDown(footerText());
    collect();
    const pending = added.filter(
      ([t]) => t === "click" || t === "pointercancel",
    );
    expect(pending.length).toBeGreaterThan(0);
    unmount();
    collect();
    for (const entry of pending) expect(removed).toContainEqual(entry);
  });
});

describe("SiteNav toggle press", () => {
  it("test_ac5_toggle_press_closes_once_and_keeps_focus", () => {
    renderHarness();

    openMenu();
    toggle().focus();
    press(toggle());
    expect(expanded()).toBe("false");
    expect(document.activeElement).toBe(toggle());
  });

  it("test_ac5_rapid_toggling_matches_press_count", () => {
    renderHarness();

    for (let i = 0; i < 3; i++) press(toggle());
    expect(expanded()).toBe("true");
    press(toggle());
    expect(expanded()).toBe("false");
  });
});

describe("SiteNav link choice and history", () => {
  it("test_ac6_link_choice_closes_and_focuses_main", () => {
    renderHarness();

    openMenu();
    fireEvent.click(navLink("Writing"));
    expect(expanded()).toBe("false");
    expect(document.activeElement).toBe(mainEl());
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }])(
    "test_ac6_modified_click_keeps_menu_and_focus %j",
    (init) => {
      renderHarness();

      openMenu();
      navLink("Writing").focus();
      fireEvent.click(navLink("Writing"), init);
      expect(expanded()).toBe("true");
      expect(document.activeElement).toBe(navLink("Writing"));
    },
  );

  it("test_ac6_link_click_when_closed_does_not_move_focus", () => {
    renderHarness();

    navLink("Writing").focus();
    fireEvent.click(navLink("Writing"));
    expect(document.activeElement).toBe(navLink("Writing"));
  });

  describe("path change with focus in the nav", () => {
    const setVisible = (visible: boolean) =>
      Object.defineProperty(HTMLElement.prototype, "checkVisibility", {
        configurable: true,
        value: () => visible,
      });
    afterEach(() => {
      Reflect.deleteProperty(HTMLElement.prototype, "checkVisibility");
    });
    const changePath = (view: ReturnType<typeof renderHarness>) => {
      mockPath("/writing");
      view.rerender(
        <>
          <header>
            <SiteNav actions={<button type="button">Action</button>} />
          </header>
          <main id="main-content" tabIndex={-1}>
            <a href="#x">In main</a>
            <p>Text</p>
          </main>
          <footer>
            <p>Footer text</p>
          </footer>
        </>,
      );
    };

    it("test_ac6_path_change_with_focus_in_hidden_nav_focuses_main", () => {
      const view = renderHarness();

      openMenu();
      navLink("Writing").focus();
      setVisible(false);
      changePath(view);
      expect(expanded()).toBe("false");
      expect(document.activeElement).toBe(mainEl());
    });

    it("test_ac6_path_change_with_visible_nav_keeps_focus", () => {
      const view = renderHarness();

      navLink("Writing").focus();
      setVisible(true);
      changePath(view);
      expect(document.activeElement).toBe(navLink("Writing"));
    });

    it("test_ac6_path_change_with_focus_outside_nav_keeps_focus", () => {
      const view = renderHarness();

      openMenu();
      mainLink().focus();
      setVisible(false);
      changePath(view);
      expect(document.activeElement).toBe(mainLink());
    });
  });
});

describe("SiteNav scroll, theme and viewport", () => {
  it("test_ac7_opening_sets_no_scroll_lock", () => {
    const { container } = renderHarness();

    openMenu();
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
    expect(container.querySelector("[inert], [aria-modal]")).toBeNull();
    expect(container.querySelector(".overflow-hidden")).toBeNull();
  });

  it("test_ac8_theme_toggle_press_keeps_menu_open", () => {
    renderHarness(<ThemeToggle />);

    openMenu();
    const dark = screen.getByText("Dark");
    press(dark);
    expect(expanded()).toBe("true");
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("test_ac9_round_trip_across_md_stays_closed", () => {
    let listener: ((e: { matches: boolean }) => void) | undefined;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        addEventListener: (_: string, cb: typeof listener) => (listener = cb),
        removeEventListener: vi.fn(),
      })),
    );
    render(<SiteNav />);

    openMenu();
    act(() => listener!({ matches: true }));
    act(() => listener?.({ matches: false }));
    expect(expanded()).toBe("false");
  });
});
