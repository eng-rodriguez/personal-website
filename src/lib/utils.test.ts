import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("lets the later conflicting Tailwind class win", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy inputs", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });
});
