import { afterEach, describe, expect, it, vi } from "vitest";
import {
  parseThemeChoice,
  readThemeChoice,
  setThemeChoice,
  subscribeThemeChoice,
  themeScript,
  themeStorageKey,
} from "@/lib/theme";

const html = document.documentElement;

afterEach(() => {
  html.removeAttribute("data-theme");
  html.removeAttribute("data-js");
  localStorage.clear();
  vi.restoreAllMocks();
});

function blockStorage(method: "getItem" | "setItem" | "removeItem") {
  return vi.spyOn(Storage.prototype, method).mockImplementation(() => {
    throw new DOMException("blocked", "SecurityError");
  });
}

describe("parseThemeChoice", () => {
  it.each([
    ["light", "light"],
    ["dark", "dark"],
    ["system", "system"],
    ["", "system"],
    ["Dark", "system"],
    ["auto", "system"],
    [null, "system"],
    [undefined, "system"],
    [42, "system"],
  ])("test_ac7_parses %j as %s", (value, expected) => {
    expect(parseThemeChoice(value)).toBe(expected);
  });
});

describe("themeScript", () => {
  const run = () => new Function(themeScript)();

  it.each(["dark", "light"])("test_ac2_applies_stored_%s", (value) => {
    localStorage.setItem(themeStorageKey, value);
    run();
    expect(html).toHaveAttribute("data-theme", value);
    expect(html).toHaveAttribute("data-js");
  });

  it.each(["bogus", ""])("test_ac7_ignores_stored_%j", (value) => {
    localStorage.setItem(themeStorageKey, value);
    run();
    expect(html).not.toHaveAttribute("data-theme");
    expect(html).toHaveAttribute("data-js");
  });

  it("test_ac1_leaves_system_when_nothing_is_stored", () => {
    run();
    expect(html).not.toHaveAttribute("data-theme");
    expect(html).toHaveAttribute("data-js");
  });

  it("test_ac7_survives_throwing_storage", () => {
    blockStorage("getItem");
    expect(run).not.toThrow();
    expect(html).not.toHaveAttribute("data-theme");
    expect(html).toHaveAttribute("data-js");
  });

  it("test_ac2_is_constant_text_with_the_storage_key_and_no_closing_tag", () => {
    expect(themeScript).toContain(themeStorageKey);
    expect(themeScript).not.toContain("</");
  });
});

describe("setThemeChoice", () => {
  it("test_ac6_persists_explicit_choices_and_clears_for_system", () => {
    setThemeChoice("dark");
    expect(html).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem(themeStorageKey)).toBe("dark");

    setThemeChoice("system");
    expect(html).not.toHaveAttribute("data-theme");
    expect(localStorage.getItem(themeStorageKey)).toBeNull();
  });

  it.each(["setItem", "removeItem"] as const)(
    "test_ac7_keeps_the_session_choice_when_%s_throws",
    (method) => {
      const error = vi.spyOn(console, "error");
      const warn = vi.spyOn(console, "warn");
      blockStorage(method);
      const choice = method === "setItem" ? "dark" : "system";
      html.setAttribute("data-theme", "light");

      expect(() => setThemeChoice(choice)).not.toThrow();
      expect(readThemeChoice()).toBe(choice);
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    },
  );

  it("test_ac6_notifies_subscribers_once_per_call", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeThemeChoice(onChange);
    setThemeChoice("light");
    expect(onChange).toHaveBeenCalledTimes(1);
    setThemeChoice("system");
    expect(onChange).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});

describe("readThemeChoice", () => {
  it("test_ac6_reflects_the_attribute", () => {
    expect(readThemeChoice()).toBe("system");
    html.setAttribute("data-theme", "dark");
    expect(readThemeChoice()).toBe("dark");
    html.setAttribute("data-theme", "light");
    expect(readThemeChoice()).toBe("light");
  });

  it("test_ac7_treats_an_invalid_attribute_as_system", () => {
    html.setAttribute("data-theme", "purple");
    expect(readThemeChoice()).toBe("system");
  });
});

describe("cross-tab sync", () => {
  const dispatch = (init: StorageEventInit) =>
    window.dispatchEvent(new StorageEvent("storage", init));

  it("test_ac6_applies_a_matching_storage_event", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeThemeChoice(onChange);

    dispatch({ key: themeStorageKey, newValue: "dark" });
    expect(html).toHaveAttribute("data-theme", "dark");
    expect(onChange).toHaveBeenCalledTimes(1);

    dispatch({ key: themeStorageKey, newValue: null });
    expect(html).not.toHaveAttribute("data-theme");

    html.setAttribute("data-theme", "dark");
    dispatch({ key: null, newValue: null });
    expect(html).not.toHaveAttribute("data-theme");
    expect(onChange).toHaveBeenCalledTimes(3);
    unsubscribe();
  });

  it("test_ac7_validates_the_event_value", () => {
    const unsubscribe = subscribeThemeChoice(() => {});
    dispatch({ key: themeStorageKey, newValue: "bogus" });
    expect(html).not.toHaveAttribute("data-theme");
    unsubscribe();
  });

  it("test_ac6_ignores_unrelated_keys", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeThemeChoice(onChange);
    dispatch({ key: "other", newValue: "dark" });
    expect(html).not.toHaveAttribute("data-theme");
    expect(onChange).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("test_ac6_stops_after_unsubscribe", () => {
    const onChange = vi.fn();
    subscribeThemeChoice(onChange)();
    dispatch({ key: themeStorageKey, newValue: "dark" });
    expect(html).not.toHaveAttribute("data-theme");
    expect(onChange).not.toHaveBeenCalled();
  });
});
