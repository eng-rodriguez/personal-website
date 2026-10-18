import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { site } from "@/lib/site";

describe("Home page", () => {
  it("test_ac1_renders_heading_and_leaves_main_landmark_to_the_shell", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: site.name }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("main")).toBeNull();
  });
});
