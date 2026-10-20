import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";
import { Link } from "./link";

describe("EmptyState", () => {
  it("test_ac7_renders_title_h2_and_description", () => {
    render(<EmptyState title="None yet" description="Soon." />);
    expect(
      screen.getByRole("heading", { level: 2, name: "None yet" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Soon.")).toBeInTheDocument();
  });

  it("test_ac7_headingLevel_h3", () => {
    render(<EmptyState title="None" description="d" headingLevel="h3" />);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  it("test_ac7_action_follows_the_description", () => {
    const { container } = render(
      <EmptyState
        title="None"
        description="Soon."
        action={<Link href="/">Home</Link>}
      />,
    );
    const description = screen.getByText("Soon.");
    const action = container.querySelector('[data-slot="empty-state-action"]')!;
    expect(
      description.compareDocumentPosition(action) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  it.each([undefined, null, false])(
    "test_ac7_no_action_container_for %s",
    (action) => {
      const { container } = render(
        <EmptyState title="None" description="d" action={action} />,
      );
      expect(
        container.querySelector('[data-slot="empty-state-action"]'),
      ).toBeNull();
    },
  );

  it("test_ac7_throws_for_empty_title_or_description", () => {
    expect(() => render(<EmptyState title="" description="d" />)).toThrow(
      "EmptyState title must not be empty",
    );
    expect(() => render(<EmptyState title="t" description=" " />)).toThrow(
      "EmptyState description must not be empty",
    );
  });
});
