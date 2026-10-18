import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

const variants = {
  default: ["bg-primary", "text-primary-foreground"],
  destructive: ["bg-destructive", "text-destructive-foreground"],
  outline: ["border-input", "bg-background"],
  secondary: ["bg-secondary", "text-secondary-foreground"],
  ghost: ["hover:bg-accent", "hover:text-accent-foreground"],
  link: ["text-primary"],
} as const;

const sizes = [
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
] as const;

describe("Button", () => {
  it("renders a native button with an accessible name", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  describe.each(Object.entries(variants))("%s variant", (variant, classes) => {
    const renderVariant = () => {
      render(<Button variant={variant as keyof typeof variants}>Go</Button>);
      return screen.getByRole("button", { name: "Go" });
    };

    it("uses its token classes and no dark: overrides", () => {
      const button = renderVariant();
      for (const cls of classes) expect(button).toHaveClass(cls);
      expect(button.className).not.toMatch(/(^|\s)dark:/);
    });

    it("shows an outline focus indicator only for :focus-visible", () => {
      const button = renderVariant();
      expect(button).toHaveClass(
        "focus-visible:outline-2",
        "focus-visible:outline-offset-2",
        "focus-visible:outline-ring",
      );
      expect(button.className).not.toMatch(/(^|\s)outline-none/);
      expect(button.className).not.toMatch(/focus-visible:ring-/);
      expect(button.className).not.toMatch(/(^|\s)focus:/);
    });

    it("removes the transition for reduced motion", () => {
      expect(renderVariant()).toHaveClass("motion-reduce:transition-none");
    });
  });

  it("is not focusable when disabled", () => {
    render(<Button disabled>Off</Button>);
    const button = screen.getByRole("button", { name: "Off" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
    button.focus();
    expect(button).not.toHaveFocus();
  });

  it("renders a link with the button classes through asChild", () => {
    render(
      <Button asChild>
        <a href="/about">About</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/about");
    expect(link).toHaveClass("bg-primary");
  });

  it.each(sizes)("renders the %s size", (size) => {
    render(<Button size={size}>Sized</Button>);
    expect(screen.getByRole("button", { name: "Sized" })).toHaveAttribute(
      "data-size",
      size,
    );
  });
});
