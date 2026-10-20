import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Section } from "./section";

describe("Section", () => {
  it("test_ac3_is_a_region_named_by_its_heading", () => {
    render(<Section title="Recent">Body</Section>);
    const region = screen.getByRole("region", { name: "Recent" });
    const heading = screen.getByRole("heading", { level: 2, name: "Recent" });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("aria-labelledby", heading.id);
    expect(region).toHaveTextContent("Body");
  });

  it.each([
    ["h3", 3],
    ["h4", 4],
  ] as const)(
    "test_ac3_headingLevel %s gives level %d",
    (headingLevel, level) => {
      render(
        <Section title="Recent" headingLevel={headingLevel}>
          x
        </Section>,
      );
      expect(screen.getByRole("heading", { level })).toBeInTheDocument();
    },
  );

  it("test_ac3_renders_description_only_with_text", () => {
    const { container, rerender } = render(
      <Section title="A" description="Desc">
        x
      </Section>,
    );
    expect(container.querySelector("p")).toHaveTextContent("Desc");
    rerender(
      <Section title="A" description="  ">
        x
      </Section>,
    );
    expect(container.querySelector("p")).toBeNull();
  });

  it("test_ac3_two_sections_have_different_heading_ids", () => {
    render(
      <>
        <Section title="One">a</Section>
        <Section title="Two">b</Section>
      </>,
    );
    const ids = screen.getAllByRole("heading").map((h) => h.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("test_ac3_rejects_h1_and_empty_titles", () => {
    expect(() =>
      render(
        // @ts-expect-error h1 is reserved for PageHeading
        <Section title="A" headingLevel="h1">
          x
        </Section>,
      ),
    ).not.toThrow();
    expect(() => render(<Section title="">x</Section>)).toThrow(
      "Section title must not be empty",
    );
  });
});
