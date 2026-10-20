import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Grid } from "./grid";

const items = ["a", "b", "c", "d"].map((k) => <div key={k}>{k}</div>);

describe("Grid", () => {
  it.each([
    [1, ["grid-cols-1"], ["sm:grid-cols-2", "lg:grid-cols-3"]],
    [2, ["grid-cols-1", "sm:grid-cols-2"], ["lg:grid-cols-3"]],
    [3, ["grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3"], []],
  ] as const)(
    "test_ac8_columns %d uses its literal classes",
    (columns, present, absent) => {
      const { container } = render(<Grid columns={columns}>{items}</Grid>);
      const root = container.querySelector('[data-slot="grid"]')!;
      expect(root).toHaveClass("grid", "gap-6", "*:min-w-0", ...present);
      for (const cls of absent) expect(root).not.toHaveClass(cls);
      expect(root.children).toHaveLength(4);
      for (const child of Array.from(root.children)) {
        expect(child.parentElement).toBe(root);
      }
      expect(root).toHaveAttribute("data-columns", String(columns));
    },
  );

  it("test_ac8_defaults_to_one_column_and_renders_empty", () => {
    const { container } = render(<Grid>{null}</Grid>);
    const root = container.querySelector('[data-slot="grid"]')!;
    expect(root).toHaveClass("grid-cols-1");
    expect(root).not.toHaveClass("sm:grid-cols-2");
    expect(root.children).toHaveLength(0);
  });

  it("test_ac8_rejects_four_columns_at_type_level", () => {
    // @ts-expect-error only 1 to 3 columns are supported
    render(<Grid columns={4}>{items}</Grid>);
  });
});
