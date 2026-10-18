import { describe, expect, it } from "vitest";
import { site } from "@/lib/site";

describe("@/* path alias", () => {
  it("test_ac6_alias_resolves_src_lib_module", () => {
    expect(site.name).toBeTruthy();
    expect(site.description).toBeTruthy();
  });
});
