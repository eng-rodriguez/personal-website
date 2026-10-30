// @vitest-environment node
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  categoryOptions,
  categoryOrder,
  filterProjects,
  matchesProjectFilter,
  noProjectFilter,
  projectCountLabel,
  technologyKey,
  technologyOptions,
  type FilterableProject,
  type ProjectFilter,
} from "@/lib/project-filters";
import { getProjects, projectStatuses } from "@/lib/projects";

const indexDirectory = join(
  process.cwd(),
  "src",
  "lib",
  "__fixtures__",
  "projects",
  "index",
);

function p(
  slug: string,
  status: FilterableProject["status"],
  stack: string[],
): FilterableProject {
  return { slug, status, stack };
}

const sample = [
  p("a", "active", ["TypeScript", "React"]),
  p("b", "active", ["react", "Go"]),
  p("c", "completed", ["Go", "typescript"]),
  p("d", "archived", ["TypeScript", "Rust"]),
];
const slugs = (list: readonly FilterableProject[]) => list.map((x) => x.slug);
const filter = (f: Partial<ProjectFilter>): ProjectFilter => ({
  ...noProjectFilter,
  ...f,
});

describe("project filter options", () => {
  it("test_ac14_no_projects_has_no_options_and_no_matches", () => {
    expect(categoryOptions([])).toEqual([]);
    expect(technologyOptions([])).toEqual([]);
    expect(filterProjects([], noProjectFilter)).toEqual([]);
  });

  it("test_ac14_one_project_offers_its_category_and_technologies", () => {
    const one = [p("a", "completed", ["Go", "Rust"])];
    expect(categoryOptions(one)).toEqual([
      { value: "completed", label: "Completed" },
    ]);
    expect(technologyOptions(one).map((o) => o.label)).toEqual(["Go", "Rust"]);
    expect(filterProjects(one, filter({ technology: "go" }))).toEqual(one);
    expect(filterProjects(one, filter({ category: "completed" }))).toEqual(one);
  });

  it("test_ac2_categories_are_the_present_statuses_in_lifecycle_order", () => {
    const input = [p("x", "archived", ["A"]), p("y", "active", ["A"])];
    expect(categoryOptions(input)).toEqual([
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
    ]);
  });

  it("test_ac2_categoryOrder_equals_projectStatuses", () => {
    expect([...categoryOrder]).toEqual([...projectStatuses]);
  });

  it("test_ac2_technologies_sort_case_insensitively", () => {
    const options = technologyOptions([
      p("a", "active", ["typescript", "React", "go"]),
    ]);
    expect(options.map((o) => o.label)).toEqual(["go", "React", "typescript"]);
  });

  it("test_ac2_technology_ties_break_by_key", () => {
    const a = technologyOptions([p("a", "active", ["b", "a"])]);
    expect(a.map((o) => o.value)).toEqual(["a", "b"]);
  });

  it("test_ac14_case_variants_make_one_option_with_the_first_spelling", () => {
    const options = technologyOptions(sample);
    expect(options.filter((o) => o.value === "typescript")).toEqual([
      { value: "typescript", label: "TypeScript" },
    ]);
    expect(options.map((o) => o.label)).toEqual([
      "Go",
      "React",
      "Rust",
      "TypeScript",
    ]);
    expect(
      slugs(filterProjects(sample, filter({ technology: "typescript" }))),
    ).toEqual(["a", "c", "d"]);
  });

  it("test_ac14_stack_order_does_not_change_options_or_matches", () => {
    const one = [p("a", "active", ["Go", "Rust"]), p("b", "active", ["Rust"])];
    const two = [p("a", "active", ["Rust", "Go"]), p("b", "active", ["Rust"])];
    expect(technologyOptions(one)).toEqual(technologyOptions(two));
    const f = filter({ technology: "go" });
    expect(slugs(filterProjects(one, f))).toEqual(
      slugs(filterProjects(two, f)),
    );
  });
});

describe("project matching", () => {
  it("test_ac3_no_filter_returns_the_input_in_order_as_a_new_array", () => {
    const result = filterProjects(sample, noProjectFilter);
    expect(slugs(result)).toEqual(["a", "b", "c", "d"]);
    expect(result).not.toBe(sample);
  });

  it("test_ac14_category_only", () => {
    expect(
      slugs(filterProjects(sample, filter({ category: "active" }))),
    ).toEqual(["a", "b"]);
  });

  it("test_ac14_technology_only", () => {
    expect(slugs(filterProjects(sample, filter({ technology: "go" })))).toEqual(
      ["b", "c"],
    );
  });

  it("test_ac3_groups_combine_with_and_and_keep_order", () => {
    expect(
      slugs(
        filterProjects(
          sample,
          filter({ category: "active", technology: "go" }),
        ),
      ),
    ).toEqual(["b"]);
  });

  it("test_ac14_no_match_gives_an_empty_list", () => {
    expect(
      filterProjects(
        sample,
        filter({ category: "completed", technology: "react" }),
      ),
    ).toEqual([]);
  });

  it("test_ac3_a_null_group_equals_an_absent_group", () => {
    const f = { category: null, technology: "go" } satisfies ProjectFilter;
    expect(slugs(filterProjects(sample, f))).toEqual(
      slugs(filterProjects(sample, { category: null, technology: "go" })),
    );
    expect(matchesProjectFilter(sample[2], f)).toBe(true);
  });

  it("test_ac3_does_not_mutate_a_frozen_input", () => {
    const frozen = Object.freeze([...sample]);
    expect(() =>
      filterProjects(frozen, filter({ category: "active" })),
    ).not.toThrow();
    expect(() => technologyOptions(frozen)).not.toThrow();
    expect(() => categoryOptions(frozen)).not.toThrow();
  });
});

describe("helpers", () => {
  it("technologyKey is idempotent", () => {
    for (const entry of ["TypeScript", "C#", "go"]) {
      expect(technologyKey(technologyKey(entry))).toBe(technologyKey(entry));
    }
  });

  it("projectCountLabel words the count", () => {
    expect(projectCountLabel(0)).toBe("No matching projects");
    expect(projectCountLabel(1)).toBe("1 project");
    expect(projectCountLabel(2)).toBe("2 projects");
    expect(() => projectCountLabel(-1)).toThrow(RangeError);
    expect(() => projectCountLabel(1.5)).toThrow(RangeError);
  });
});

describe("index fixtures", () => {
  it("test_ac11_production_lists_four_projects_and_no_draft_option", () => {
    const projects = getProjects({
      directory: indexDirectory,
      mode: "production",
    });
    expect(slugs(projects)).toEqual([
      "alpha-active",
      "beta-active",
      "gamma-completed",
      "long-archived",
    ]);
    const labels = technologyOptions(projects).map((o) => o.label);
    expect(labels).not.toContain("Elixir");
    for (const label of ["Go", "React", "TypeScript"]) {
      expect(labels.filter((l) => l === label)).toHaveLength(1);
    }
    expect(categoryOptions(projects).map((o) => o.label)).toEqual([
      "Active",
      "Completed",
      "Archived",
    ]);
  });

  it("test_ac3_reference_combinations", () => {
    const projects = getProjects({
      directory: indexDirectory,
      mode: "production",
    });
    expect(
      slugs(
        filterProjects(
          projects,
          filter({ category: "active", technology: "go" }),
        ),
      ),
    ).toEqual(["beta-active"]);
    expect(
      slugs(filterProjects(projects, filter({ technology: "typescript" }))),
    ).toEqual(["alpha-active", "gamma-completed", "long-archived"]);
    expect(
      filterProjects(
        projects,
        filter({ category: "completed", technology: "react" }),
      ),
    ).toEqual([]);
  });

  it("test_ac11_development_keeps_the_draft_and_its_option", () => {
    const projects = getProjects({
      directory: indexDirectory,
      mode: "development",
    });
    expect(projects).toHaveLength(5);
    expect(projects[2].slug).toBe("draft-hidden");
    expect(technologyOptions(projects).map((o) => o.label)).toContain("Elixir");
  });
});
