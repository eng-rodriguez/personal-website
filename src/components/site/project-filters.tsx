"use client";

import {
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
} from "react";

import { EmptyState } from "@/components/primitives/empty-state";
import { Grid } from "@/components/primitives/grid";
import { Button } from "@/components/ui/button";
import {
  matchesProjectFilter,
  noProjectFilter,
  projectCountLabel,
  type FilterOption,
  type ProjectFilter,
} from "@/lib/project-filters";
import type { ProjectStatus } from "@/lib/projects";

export type ProjectFilterItem = {
  readonly slug: string;
  readonly status: ProjectStatus;
  /** Technology keys, see technologyKey in "@/lib/project-filters". */
  readonly stack: readonly string[];
  readonly card: ReactNode;
};

export type ProjectFiltersProps = {
  items: readonly ProjectFilterItem[];
  categoryOptions: readonly FilterOption<ProjectStatus>[];
  technologyOptions: readonly FilterOption<string>[];
};

const optionClass =
  "group inline-flex min-h-10 max-w-full cursor-pointer items-center gap-1 rounded-md border border-input px-3 text-start text-sm text-muted-foreground wrap-anywhere has-checked:border-primary has-checked:bg-primary has-checked:font-semibold has-checked:text-primary-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring forced-colors:has-checked:underline forced-colors:has-checked:decoration-2 forced-colors:has-checked:underline-offset-4";

const noopSubscribe = () => () => {};

type RadioGroupProps = {
  legend: string;
  name: string;
  /** "" means All. */
  selected: string;
  options: readonly FilterOption<string>[];
  disabled: boolean;
  onChange: (value: string) => void;
  allRef?: Ref<HTMLInputElement>;
};

function RadioGroup({
  legend,
  name,
  selected,
  options,
  disabled,
  onChange,
  allRef,
}: RadioGroupProps) {
  const all: FilterOption<string> = { value: "", label: "All" };
  return (
    <fieldset disabled={disabled} className="mt-4 min-w-0">
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {[all, ...options].map((option) => (
          <label key={option.value} className={optionClass}>
            <input
              ref={option.value === "" ? allRef : undefined}
              type="radio"
              name={name}
              value={option.value}
              checked={selected === option.value}
              onChange={() => onChange(option.value)}
              autoComplete="off"
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className="hidden group-has-checked:inline"
            >
              ✓
            </span>
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Holds the filter selection. The cards arrive as server-rendered nodes;
 * non-matching ones are hidden on screen and still printed.
 */
export function ProjectFilters({
  items,
  categoryOptions,
  technologyOptions,
}: ProjectFiltersProps): ReactNode {
  const headingId = useId();
  const [filter, setFilter] = useState<ProjectFilter>(noProjectFilter);
  const categoryAllRef = useRef<HTMLInputElement>(null);
  // The server and hydration pass render the controls disabled, so a click
  // before hydration cannot leave a checked radio that disagrees with the list.
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const matches = items.map((item) => matchesProjectFilter(item, filter));
  const visible = matches.filter(Boolean).length;

  function clear() {
    setFilter(noProjectFilter);
    categoryAllRef.current?.focus();
  }

  return (
    <>
      <div data-project-filters="" className="mt-8 print:hidden">
        <div role="group" aria-labelledby={headingId}>
          <p id={headingId} className="text-sm font-semibold">
            Filters
          </p>
          <RadioGroup
            legend="Category"
            name="project-category"
            selected={filter.category ?? ""}
            options={categoryOptions}
            disabled={!hydrated}
            allRef={categoryAllRef}
            onChange={(value) =>
              setFilter((current) => ({
                ...current,
                category:
                  categoryOptions.find((o) => o.value === value)?.value ?? null,
              }))
            }
          />
          <RadioGroup
            legend="Technology"
            name="project-technology"
            selected={filter.technology ?? ""}
            options={technologyOptions}
            disabled={!hydrated}
            onChange={(value) =>
              setFilter((current) => ({
                ...current,
                technology: value === "" ? null : value,
              }))
            }
          />
        </div>
        <p
          role="status"
          aria-atomic="true"
          className="mt-4 text-sm text-muted-foreground"
        >
          {projectCountLabel(visible)}
        </p>
      </div>
      <Grid columns={1} className="mt-6">
        {items.map((item, index) => (
          <div
            key={item.slug}
            data-project-slug={item.slug}
            className={matches[index] ? undefined : "not-print:hidden"}
          >
            {item.card}
          </div>
        ))}
      </Grid>
      {visible === 0 ? (
        <EmptyState
          className="mt-6 print:hidden"
          title="No matching projects"
          description="No project matches the chosen category and technology."
          action={
            <Button type="button" variant="outline" size="lg" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : null}
    </>
  );
}
