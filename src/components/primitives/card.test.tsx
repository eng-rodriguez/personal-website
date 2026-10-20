import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./card";
import { Tag } from "./tag";

describe("Card", () => {
  it("test_ac4_title_link_description_and_footer", () => {
    render(
      <Card
        title="Site"
        href="/projects"
        description="About it."
        footer={<Tag>TypeScript</Tag>}
      />,
    );
    const article = screen.getByRole("article");
    const heading = within(article).getByRole("heading", { level: 3 });
    expect(within(heading).getAllByRole("link")).toHaveLength(1);
    expect(within(heading).getByRole("link", { name: "Site" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(within(article).getAllByRole("link")).toHaveLength(1);
    expect(within(article).getByText("About it.")).toBeInTheDocument();
    expect(within(article).getByText("TypeScript")).toBeInTheDocument();
    expect(within(article).queryByRole("button")).toBeNull();
    expect(article.querySelector("[tabindex]")).toBeNull();
    expect(article.querySelector("[onclick]")).toBeNull();
    expect(article).not.toHaveAttribute("role");
    expect(article).not.toHaveAttribute("onclick");
  });

  it("test_ac4_static_card_has_no_interactive_element", () => {
    render(<Card title="Plain" />);
    const article = screen.getByRole("article");
    expect(within(article).queryByRole("link")).toBeNull();
    expect(within(article).queryByRole("button")).toBeNull();
    expect(
      within(article).getByRole("heading", { level: 3, name: "Plain" }),
    ).toBeInTheDocument();
  });

  it("test_ac4_headingLevel_h2", () => {
    render(<Card title="T" headingLevel="h2" />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("test_ac4_omits_empty_description_and_footer", () => {
    const { container } = render(
      <Card title="T" description=" " footer={null} />,
    );
    expect(container.querySelector("p")).toBeNull();
    expect(container.querySelector('[data-slot="card-footer"]')).toBeNull();
  });

  it("test_ac10_keeps_focus_and_dark_rules", () => {
    render(<Card title="Site" href="/projects" />);
    const link = screen.getByRole("link");
    expect(link.className).not.toContain("outline-none");
    expect(link.className).not.toMatch(/(^|\s)focus:/);
    const article = screen.getByRole("article");
    expect(article).toHaveClass("min-w-0");
    expect(article.className).not.toContain("dark:");
  });

  it("test_ac4_rejects_h1_and_protocol_relative_hrefs_at_type_level", () => {
    // @ts-expect-error h1 is reserved for PageHeading
    render(<Card title="T" headingLevel="h1" />);
    // @ts-expect-error protocol-relative hrefs are not allowed
    expect(() => render(<Card title="T" href="//example.com" />)).toThrow();
  });
});
