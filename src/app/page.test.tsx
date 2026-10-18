import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { site } from "@/lib/site";

describe("Home page", () => {
  it("renders the level 1 heading and leaves the main landmark to the shell", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: site.name }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("main")).toBeNull();
  });
});
