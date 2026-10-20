import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tag } from "./tag";

describe("Tag", () => {
  it("test_ac5_is_a_static_span_that_is_not_focusable", () => {
    render(<Tag>TypeScript</Tag>);
    const tag = screen.getByText("TypeScript");
    expect(tag.tagName).toBe("SPAN");
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(tag).not.toHaveAttribute("tabindex");
    const before = document.activeElement;
    tag.focus();
    expect(document.activeElement).toBe(before);
  });

  it("test_ac5_uses_token_classes_and_no_dark_variant", () => {
    render(<Tag>TypeScript</Tag>);
    const tag = screen.getByText("TypeScript");
    expect(tag).toHaveClass(
      "border-transparent",
      "bg-secondary",
      "text-secondary-foreground",
    );
    expect(tag.className).not.toContain("dark:");
  });

  it("test_ac5_throws_for_empty_text", () => {
    expect(() => render(<Tag>{""}</Tag>)).toThrow("Tag text must not be empty");
  });
});
