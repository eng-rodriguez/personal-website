// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isoDateSchema, slugSchema, tagsSchema } from "@/lib/content/schema";

describe("slugSchema", () => {
  it.each(["a", "a-1", "next-js-16"])("test_ac2_accepts_%s", (value) => {
    expect(slugSchema.safeParse(value).success).toBe(true);
  });
  it.each(["", "A", "a_b", "a b", "-a", "a-", "a--b"])(
    "test_ac2_rejects_%j",
    (value) => {
      expect(slugSchema.safeParse(value).success).toBe(false);
    },
  );
});

describe("isoDateSchema", () => {
  it.each(["2026-01-01", "2024-02-29"])("test_ac2_accepts_%s", (value) => {
    expect(isoDateSchema.safeParse(value).success).toBe(true);
  });
  it.each([
    "2026-02-30",
    "2025-02-29",
    "2026-13-01",
    "2026-1-1",
    "2026-01-01T00:00:00Z",
    "2026-01-01+02:00",
  ])("test_ac2_rejects_%s", (value) => {
    expect(isoDateSchema.safeParse(value).success).toBe(false);
  });
});

describe("tagsSchema", () => {
  it("test_ac2_defaults_to_empty", () => {
    expect(tagsSchema.parse(undefined)).toEqual([]);
  });
  it("test_ac2_rejects_uppercase", () => {
    expect(tagsSchema.safeParse(["Next"]).success).toBe(false);
  });
  it("test_ac2_reports_duplicate_at_its_index", () => {
    const result = tagsSchema.safeParse(["a", "b", "nextjs", "nextjs"]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual([3]);
      expect(result.error.issues[0].message).toBe('duplicate tag "nextjs"');
    }
  });
});
