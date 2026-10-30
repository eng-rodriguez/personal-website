import type { Project, ProjectStatus } from "@/lib/projects";

// Type-only import on purpose: "@/lib/projects" loads the file system, Zod and the MDX
// compiler, and the client component imports this module.

/** The fields filtering reads. Cards and other data stay outside. */
export type FilterableProject = Pick<Project, "slug" | "status"> & {
  readonly stack: readonly string[];
};
export type FilterOption<V extends string> = {
  readonly value: V;
  readonly label: string;
};
/** null in a group means "All": that group adds no constraint. */
export type ProjectFilter = {
  readonly category: ProjectStatus | null;
  readonly technology: string | null;
};

/** Lifecycle order of Category options; a unit test keeps it equal to projectStatuses. */
export const categoryOrder = [
  "active",
  "completed",
  "archived",
] as const satisfies readonly ProjectStatus[];

export const noProjectFilter: ProjectFilter = {
  category: null,
  technology: null,
};

export const projectStatusLabels: Readonly<Record<ProjectStatus, string>> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

/** stack entries are grouped by this key; must match stackSchema's duplicate rule. */
export function technologyKey(entry: string): string {
  return entry.toLowerCase();
}

/** The statuses present among the projects, in lifecycle order. */
export function categoryOptions(
  projects: readonly FilterableProject[],
): readonly FilterOption<ProjectStatus>[] {
  const present = new Set(projects.map((project) => project.status));
  return categoryOrder
    .filter((status) => present.has(status))
    .map((status) => ({ value: status, label: projectStatusLabels[status] }));
}

const collator = new Intl.Collator("en-US", { sensitivity: "base" });

/**
 * One option per distinct stack entry (case-insensitive). The label is the
 * spelling of the first project that contains it. Sorted alphabetically.
 */
export function technologyOptions(
  projects: readonly FilterableProject[],
): readonly FilterOption<string>[] {
  const labels = new Map<string, string>();
  for (const project of projects) {
    for (const entry of project.stack) {
      const key = technologyKey(entry);
      if (!labels.has(key)) labels.set(key, entry);
    }
  }
  return [...labels.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort(
      (a, b) =>
        collator.compare(a.label, b.label) ||
        (a.value < b.value ? -1 : a.value > b.value ? 1 : 0),
    );
}

export function matchesProjectFilter(
  project: FilterableProject,
  filter: ProjectFilter,
): boolean {
  if (filter.category !== null && project.status !== filter.category) {
    return false;
  }
  if (filter.technology === null) return true;
  const wanted = filter.technology;
  return project.stack.some((entry) => technologyKey(entry) === wanted);
}

export function filterProjects<T extends FilterableProject>(
  projects: readonly T[],
  filter: ProjectFilter,
): readonly T[] {
  return projects.filter((project) => matchesProjectFilter(project, filter));
}

/** "No matching projects", "1 project", "3 projects". */
export function projectCountLabel(count: number): string {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`count must be a non-negative integer, got ${count}`);
  }
  if (count === 0) return "No matching projects";
  return count === 1 ? "1 project" : `${count} projects`;
}
