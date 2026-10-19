import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { themeStorageKey } from "@/lib/theme";

const html = document.documentElement;
const group = () => screen.getByRole("radiogroup", { name: "Theme" });
const radio = (name: string) => screen.getByRole("radio", { name });

afterEach(() => {
  html.removeAttribute("data-theme");
  html.removeAttribute("data-js");
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
  it("test_ac5_renders_a_named_radiogroup_with_three_ordered_radios", () => {
    render(<ThemeToggle />);
    expect(group()).toHaveAttribute("data-theme-toggle");
    expect(
      screen.getAllByRole("radio").map((r) => (r as HTMLInputElement).value),
    ).toEqual(["system", "light", "dark"]);
    expect(
      screen
        .getAllByRole("radio", { hidden: true })
        .map((r) => r.closest("label")?.textContent),
    ).toEqual(["System", "Light", "Dark"]);
    expect(radio("System")).toBeInTheDocument();
    expect(radio("Light")).toBeInTheDocument();
    expect(radio("Dark")).toBeInTheDocument();
  });

  it("test_ac1_shows_system_by_default", () => {
    render(<ThemeToggle />);
    expect(radio("System")).toBeChecked();
    expect(group()).not.toHaveClass("invisible");
  });

  it("test_ac2_reflects_a_choice_already_on_html", () => {
    html.setAttribute("data-theme", "dark");
    render(<ThemeToggle />);
    expect(radio("Dark")).toBeChecked();
  });

  it("test_ac6_persists_choices_and_clears_for_system", () => {
    render(<ThemeToggle />);
    fireEvent.click(radio("Light"));
    expect(html).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem(themeStorageKey)).toBe("light");
    expect(radio("Light")).toBeChecked();

    fireEvent.click(radio("System"));
    expect(html).not.toHaveAttribute("data-theme");
    expect(localStorage.getItem(themeStorageKey)).toBeNull();
    expect(radio("System")).toBeChecked();
  });

  it("test_ac7_works_when_storage_throws", () => {
    const error = vi.spyOn(console, "error");
    const warn = vi.spyOn(console, "warn");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    render(<ThemeToggle />);
    fireEvent.click(radio("Dark"));
    expect(radio("Dark")).toBeChecked();
    expect(html).toHaveAttribute("data-theme", "dark");
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("test_ac6_follows_another_tab", () => {
    render(<ThemeToggle />);
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: themeStorageKey,
          newValue: "light",
        }),
      );
    });
    expect(radio("Light")).toBeChecked();
  });

  it("test_ac2_hydrates_without_mismatch_and_reveals_the_real_choice", async () => {
    html.setAttribute("data-theme", "dark");
    const error = vi.spyOn(console, "error");
    const warn = vi.spyOn(console, "warn");

    const server = renderToString(<ThemeToggle />);
    expect(server).toContain("invisible");
    expect(server).not.toMatch(/\schecked[\s=/>]/);

    const container = document.createElement("div");
    container.innerHTML = server;
    document.body.appendChild(container);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <ThemeToggle />);
    });

    const dark = container.querySelector<HTMLInputElement>(
      'input[value="dark"]',
    );
    expect(dark?.checked).toBe(true);
    expect(container.querySelector('[role="radiogroup"]')).not.toHaveClass(
      "invisible",
    );
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();

    act(() => root?.unmount());
    container.remove();
  });

  it("test_ac4_ac9_uses_large_targets_and_outline_focus_without_forbidden_classes", () => {
    const { container } = render(<ThemeToggle />);
    for (const label of container.querySelectorAll("label")) {
      expect(label).toHaveClass(
        "min-h-10",
        "has-focus-visible:outline-2",
        "has-focus-visible:outline-offset-2",
        "has-focus-visible:outline-ring",
      );
    }
    for (const el of container.querySelectorAll("*")) {
      const classes = [...el.classList];
      expect(classes).not.toContain("outline-none");
      expect(classes.some((c) => c.startsWith("focus:"))).toBe(false);
      expect(classes.some((c) => c.startsWith("transition"))).toBe(false);
      expect(classes.some((c) => c.startsWith("dark:"))).toBe(false);
    }
  });
});
