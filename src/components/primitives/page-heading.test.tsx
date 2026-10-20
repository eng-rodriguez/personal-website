import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeading } from "./page-heading";

describe("PageHeading", () => {
  it("test_ac2_renders_one_h1_then_the_description", () => {
    const { container } = render(
      <PageHeading title="Writing" description="Notes." />,
    );
    const root = container.querySelector('[data-slot="page-heading"]');
    expect(root).not.toBeNull();
    const heading = screen.getByRole("heading", { level: 1, name: "Writing" });
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    const p = root!.querySelector("p");
    expect(p).toHaveTextContent("Notes.");
    expect(
      heading.compareDocumentPosition(p!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it.each([undefined, "", "  "])(
    "test_ac2_renders_no_paragraph_for_description %j",
    (description) => {
      const { container } = render(
        <PageHeading title="Writing" description={description} />,
      );
      expect(container.querySelector("p")).toBeNull();
    },
  );

  it("test_ac2_throws_for_an_empty_title", () => {
    expect(() => render(<PageHeading title=" " />)).toThrow(
      "PageHeading title must not be empty",
    );
  });

  it("test_ac2_h1_keeps_the_page_heading_scale", () => {
    render(<PageHeading title="Writing" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass(
      "text-3xl",
      "font-semibold",
      "tracking-tight",
    );
  });
});
