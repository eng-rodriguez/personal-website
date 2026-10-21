import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./hero";
import type { HeroConfig } from "@/lib/hero";

const hero: HeroConfig = {
  name: "Test Name",
  role: "Test role",
  statement: "A test statement.",
  ctas: [
    { label: "First action", href: "/projects" },
    { label: "Second action", href: "/writing" },
  ],
};

describe("Hero", () => {
  it("test_ac1_renders_name_role_statement_and_two_ctas", () => {
    const { container } = render(<Hero hero={hero} />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Test Name");
    const root = container.querySelector('[data-slot="page-heading"]')!;
    expect(root).toContainElement(h1s[0]);
    expect(root.querySelector("p")).toHaveTextContent("Test role");
    expect(
      container.querySelector('[data-slot="hero-statement"]'),
    ).toHaveTextContent("A test statement.");

    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "First action",
      "Second action",
    ]);
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/projects",
      "/writing",
    ]);
    expect(links.map((l) => l.getAttribute("data-variant"))).toEqual([
      "default",
      "outline",
    ]);
    for (const link of links) {
      expect(link).toHaveClass("h-10");
      expect(link.className).not.toContain("outline-none");
      expect(link.className).not.toMatch(/(^|\s)focus:/);
      expect(link).not.toHaveAttribute("target");
    }
    expect(links[0]).toHaveClass("border-transparent");
  });

  it("test_ac2_renders_changed_config_without_old_values", () => {
    const changed: HeroConfig = {
      name: "Other Person",
      role: "Other role",
      statement: "Another statement.",
      ctas: [
        { label: "Go experience", href: "/experience" },
        { label: "Go resume", href: "/resume" },
      ],
    };
    const { container } = render(<Hero hero={changed} />);
    const text = container.textContent ?? "";
    for (const value of [
      "Other Person",
      "Other role",
      "Another statement.",
      "Go experience",
      "Go resume",
    ]) {
      expect(text).toContain(value);
    }
    for (const old of ["Test Name", "Test role", "A test statement."]) {
      expect(text).not.toContain(old);
    }
    const links = within(container).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/experience",
      "/resume",
    ]);
  });

  it("test_ac8_renders_no_portrait_element_when_not_configured", () => {
    const { container } = render(<Hero hero={hero} />);
    expect(screen.queryByRole("img")).toBeNull();
    const root = container.querySelector('[data-slot="hero"]')!;
    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toHaveAttribute("data-slot", "hero-text");
  });

  it("test_ac8_renders_a_sized_portrait_when_configured", () => {
    render(
      <Hero
        hero={{
          ...hero,
          portrait: {
            src: "/portrait.jpg",
            alt: "Portrait of the test name",
            width: 400,
            height: 500,
          },
        }}
      />,
    );
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(1);
    const img = imgs[0];
    expect(img).toHaveAttribute("alt", "Portrait of the test name");
    expect(img).toHaveAttribute("src", "/portrait.jpg");
    expect(img).toHaveAttribute("width", "400");
    expect(img).toHaveAttribute("height", "500");
    for (const cls of ["h-auto", "max-w-full", "w-32"]) {
      expect(img).toHaveClass(cls);
    }
  });

  it("test_ac3_throws_on_invalid_config", () => {
    expect(() => render(<Hero hero={{ ...hero, role: " " }} />)).toThrow(
      "Invalid hero config",
    );
  });
});
