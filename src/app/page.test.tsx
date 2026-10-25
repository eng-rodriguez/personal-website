import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { site } from "@/lib/site";

describe("Home page", () => {
  it("test_ac1_renders_heading_and_leaves_main_landmark_to_the_shell", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: site.hero.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(site.hero.statement)).toBeInTheDocument();
    expect(screen.queryByRole("main")).toBeNull();
  });

  it("test_ac8_empty_content_renders_only_the_hero", () => {
    const { container } = render(<Home />);

    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(container.querySelector('[data-slot="empty-state"]')).toBeNull();
  });
});
