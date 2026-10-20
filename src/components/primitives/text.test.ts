import { describe, expect, it } from "vitest";
import { hasText, requireText } from "./text";

describe("requireText", () => {
  it("test_ac1_returns_non_empty_values_unchanged", () => {
    expect(requireText("x", "T")).toBe("x");
    expect(requireText(" x ", "T")).toBe(" x ");
  });

  it("test_ac1_throws_the_labelled_message_for_empty_or_blank", () => {
    expect(() => requireText("", "PageHeading title")).toThrow(
      "PageHeading title must not be empty",
    );
    expect(() => requireText("   ", "Card title")).toThrow(
      "Card title must not be empty",
    );
  });
});

describe("hasText", () => {
  it("test_ac1_is_false_for_undefined_empty_and_blank", () => {
    expect(hasText(undefined)).toBe(false);
    expect(hasText("")).toBe(false);
    expect(hasText(" \n")).toBe(false);
  });

  it("test_ac1_is_true_for_text", () => {
    expect(hasText("a")).toBe(true);
  });
});
