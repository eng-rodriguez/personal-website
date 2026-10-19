import { describe, expect, it } from "vitest";
import { isActive, primaryNav } from "@/lib/navigation";

const activeHrefs = (pathname: string | null) =>
  primaryNav.filter((i) => isActive(pathname, i.href)).map((i) => i.href);

describe("primaryNav", () => {
  it("test_ac5_lists_the_five_core_routes_in_order", () => {
    expect(primaryNav.map((i) => [i.href, i.label])).toEqual([
      ["/", "Home"],
      ["/writing", "Writing"],
      ["/projects", "Projects"],
      ["/experience", "Experience"],
      ["/resume", "Resume"],
    ]);
  });
});

describe("isActive", () => {
  it.each([
    ["/", ["/"]],
    ["/writing", ["/writing"]],
    ["/writing/", ["/writing"]],
    ["/writing?x=1", ["/writing"]],
    ["/writing#a", ["/writing"]],
    ["/writing/example", ["/writing"]],
    ["/projects/a/b", ["/projects"]],
    ["/writingx", []],
    ["/missing", []],
    ["", []],
    [null, []],
  ])("test_ac5_pathname_%s_activates_%j", (pathname, expected) => {
    expect(activeHrefs(pathname)).toEqual(expected);
  });

  it("test_ac5_exactly_one_item_is_active_for_each_core_route", () => {
    for (const item of primaryNav) {
      expect(activeHrefs(item.href)).toEqual([item.href]);
    }
  });
});
