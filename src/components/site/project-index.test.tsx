import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectIndex } from "@/components/site/project-index";
import { getProjects } from "@/lib/projects";

const directory = join(
  process.cwd(),
  "src",
  "lib",
  "__fixtures__",
  "projects",
  "index",
);
const production = getProjects({ directory, mode: "production" });
const development = getProjects({ directory, mode: "development" });

describe("ProjectIndex", () => {
  it("test_ac1_renders_a_card_per_project_in_order", () => {
    const { container } = render(<ProjectIndex projects={production} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(4);
    production.forEach((project, index) => {
      const card = cards[index];
      expect(
        within(card).getByRole("heading", { level: 2, name: project.title }),
      ).toBeInTheDocument();
      expect(within(card).getByText(project.summary)).toBeInTheDocument();
      const label = {
        active: "Active",
        completed: "Completed",
        archived: "Archived",
      }[project.status];
      expect(card).toHaveTextContent(`Status: ${label}`);
      const stack = within(card).getByRole("list", { name: "Stack" });
      expect(
        within(stack)
          .getAllByRole("listitem")
          .map((li) => li.textContent),
      ).toEqual(project.stack);
    });
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(
      [...container.querySelectorAll("[data-project-slug]")].map((el) =>
        el.getAttribute("data-project-slug"),
      ),
    ).toEqual([
      "alpha-active",
      "beta-active",
      "gamma-completed",
      "long-archived",
    ]);
  });

  it("test_ac11_development_includes_the_draft_card", () => {
    render(<ProjectIndex projects={development} />);
    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "Elixir" })).toBeInTheDocument();
  });

  it("test_ac7_empty_shows_only_the_empty_state", () => {
    const { container } = render(<ProjectIndex projects={[]} />);
    const empty = container.querySelectorAll('[data-slot="empty-state"]');
    expect(empty).toHaveLength(1);
    expect(empty[0]).toHaveTextContent("No projects yet");
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText("No matching projects")).toBeNull();
  });

  it("test_ac8_renders_no_links_or_images", () => {
    const { container } = render(<ProjectIndex projects={production} />);
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector('[href^="/projects/"]')).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.innerHTML).not.toContain("example.com");
  });
});
