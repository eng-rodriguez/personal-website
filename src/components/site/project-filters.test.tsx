import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ProjectFilters,
  type ProjectFilterItem,
  type ProjectFiltersProps,
} from "@/components/site/project-filters";

const item = (
  slug: string,
  status: ProjectFilterItem["status"],
  stack: string[],
): ProjectFilterItem => ({
  slug,
  status,
  stack,
  card: (
    <article>
      <h2>{`Title ${slug}`}</h2>
    </article>
  ),
});

const props: ProjectFiltersProps = {
  items: [
    item("a", "active", ["typescript", "react"]),
    item("b", "active", ["react", "go"]),
    item("c", "completed", ["go", "typescript"]),
    item("d", "archived", ["typescript"]),
  ],
  categoryOptions: [
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
  ],
  technologyOptions: [
    { value: "go", label: "Go" },
    { value: "react", label: "React" },
    { value: "typescript", label: "TypeScript" },
  ],
};

const click = (el: HTMLElement) => fireEvent.click(el);
const hiddenClass = "not-print:hidden";
const shown = (container: HTMLElement) =>
  [...container.querySelectorAll("[data-project-slug]")]
    .filter((el) => !el.classList.contains(hiddenClass))
    .map((el) => el.getAttribute("data-project-slug"));

function setup() {
  const view = render(<ProjectFilters {...props} />);
  const category = screen.getByRole("group", { name: "Category" });
  const technology = screen.getByRole("group", { name: "Technology" });
  return { category, technology, ...view };
}

describe("ProjectFilters", () => {
  it("test_ac2_offers_a_filters_group_with_two_radio_groups", () => {
    const { category, technology } = setup();
    const filters = screen.getByRole("group", { name: "Filters" });
    expect(filters).toContainElement(category);
    expect(filters).toContainElement(technology);
    const names = (group: HTMLElement) =>
      within(group)
        .getAllByRole("radio")
        .map((r) => (r as HTMLInputElement).labels?.[0].textContent);
    expect(names(category)).toEqual([
      "✓All",
      "✓Active",
      "✓Completed",
      "✓Archived",
    ]);
    expect(names(technology)).toEqual(["✓All", "✓Go", "✓React", "✓TypeScript"]);
    expect(within(category).getByRole("radio", { name: "All" })).toBeChecked();
    expect(
      within(technology).getByRole("radio", { name: "All" }),
    ).toBeChecked();
  });

  it("test_ac3_groups_combine_with_and_and_all_lifts_a_constraint", () => {
    const { category, technology, container } = setup();
    click(within(technology).getByRole("radio", { name: "Go" }));
    expect(shown(container)).toEqual(["b", "c"]);
    click(within(category).getByRole("radio", { name: "Active" }));
    expect(shown(container)).toEqual(["b"]);
    click(within(technology).getByRole("radio", { name: "All" }));
    expect(shown(container)).toEqual(["a", "b"]);
    click(within(category).getByRole("radio", { name: "All" }));
    expect(shown(container)).toEqual(["a", "b", "c", "d"]);
  });

  it("test_ac4_the_status_region_holds_one_message_matching_the_cards", () => {
    const { technology, container } = setup();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/^4 projects$/);
    click(within(technology).getByRole("radio", { name: "Go" }));
    click(within(technology).getByRole("radio", { name: "React" }));
    click(within(technology).getByRole("radio", { name: "TypeScript" }));
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(status).toHaveTextContent(/^3 projects$/);
    expect(shown(container)).toHaveLength(3);
    click(
      within(screen.getByRole("group", { name: "Category" })).getByRole(
        "radio",
        { name: "Archived" },
      ),
    );
    expect(status).toHaveTextContent(/^1 project$/);
  });

  it("test_ac5_no_match_shows_the_empty_state_and_clear_restores_focus", () => {
    const { category, technology, container } = setup();
    expect(
      screen.queryByText("No matching projects", { selector: "h2" }),
    ).toBeNull();
    click(within(category).getByRole("radio", { name: "Completed" }));
    click(within(technology).getByRole("radio", { name: "React" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "No matching projects",
    );
    expect(
      screen.getByRole("heading", { name: "No matching projects" }),
    ).toBeInTheDocument();
    expect(shown(container)).toEqual([]);
    click(screen.getByRole("button", { name: "Clear filters" }));
    expect(within(category).getByRole("radio", { name: "All" })).toBeChecked();
    expect(
      within(technology).getByRole("radio", { name: "All" }),
    ).toBeChecked();
    expect(shown(container)).toHaveLength(4);
    expect(container.querySelector('[data-slot="empty-state"]')).toBeNull();
    expect(document.activeElement).toBe(
      within(category).getByRole("radio", { name: "All" }),
    );
  });

  it("test_ac6_radios_are_named_grouped_and_focusable", () => {
    const { category, technology } = setup();
    for (const group of [category, technology]) {
      const radios = within(group).getAllByRole("radio");
      expect(new Set(radios.map((r) => r.getAttribute("name"))).size).toBe(1);
      for (const radio of radios) {
        expect(radio).toHaveAccessibleName();
        expect(radio).toHaveAttribute("type", "radio");
      }
    }
    // Arrow keys and Tab are native radio behavior that jsdom does not
    // implement; e2e/projects-index.spec.ts covers them in a browser.
  });

  it("test_ac6_labels_carry_the_focus_hit_area_and_check_mark_classes", () => {
    const { container } = setup();
    const labels = container.querySelectorAll("label");
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.className).toContain("min-h-10");
      expect(label.className).toContain("has-focus-visible:outline-2");
      expect(label.className).not.toMatch(/outline-none|focus:/);
      expect(label.querySelector(".group-has-checked\\:inline")).not.toBeNull();
    }
  });

  it("test_ac9_the_server_html_equals_the_initial_client_state", () => {
    const html = renderToString(<ProjectFilters {...props} />);
    expect(html).toContain("data-project-filters");
    expect(html.match(/<fieldset[^>]*disabled/g)).toHaveLength(2);
    expect(html.match(/checked=""/g)).toHaveLength(2);
    expect(html).not.toContain(hiddenClass);
    for (const slug of ["a", "b", "c", "d"]) {
      expect(html).toContain(`data-project-slug="${slug}"`);
    }
  });

  it("test_ac6_the_controls_are_enabled_after_hydration", () => {
    const { category } = setup();
    expect(category).toBeEnabled();
  });
});
