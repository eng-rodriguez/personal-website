// @vitest-environment node
import { describe, expect, it } from "vitest";
import { projectFrontmatterSchema } from "@/lib/projects";

const base = {
  title: "T",
  slug: "t",
  summary: "S",
  role: "R",
  stack: ["TypeScript"],
  startedAt: "2026-01-01",
  status: "completed",
};

function issues(overrides: Record<string, unknown>) {
  const result = projectFrontmatterSchema.safeParse({ ...base, ...overrides });
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

const link = (overrides: Record<string, unknown> = {}) => ({
  label: "L",
  url: "https://example.com",
  kind: "other",
  ...overrides,
});

describe("projectFrontmatterSchema", () => {
  it("test_ac1_defaults_for_a_minimal_object", () => {
    const data = projectFrontmatterSchema.parse(base);
    expect(data).toMatchObject({
      featured: false,
      draft: false,
      caseStudy: false,
      links: [],
    });
    expect(data).not.toHaveProperty("endedAt");
    expect(data).not.toHaveProperty("cover");
  });

  it.each([
    ["title", ""],
    ["title", "   "],
    ["summary", ""],
    ["summary", "  "],
    ["role", ""],
    ["role", " "],
  ])("test_ac2_%s_%j_is_rejected", (field, value) => {
    expect(issues({ [field]: value }).map((i) => i.field)).toContain(field);
  });

  it.each([
    [{ stack: [] }, "stack"],
    [{ stack: [""] }, "stack.0"],
    [{ stack: ["TypeScript", "typescript"] }, "stack.1"],
    [{ status: "paused" }, "status"],
    [{ startedAt: "2026-02-30" }, "startedAt"],
    [{ startedAt: "2026-01-01T10:00:00" }, "startedAt"],
    [{ endedAt: "2025-12-31" }, "endedAt"],
    [{ status: "active", endedAt: "2026-02-01" }, "endedAt"],
    [{ links: [link({ url: "http://example.com" })] }, "links.0.url"],
    [{ links: [link({ url: "/relative" })] }, "links.0.url"],
    [{ links: [link({ url: "//example.com" })] }, "links.0.url"],
    [{ links: [link({ url: "https://" })] }, "links.0.url"],
    [{ links: [link({ url: "mailto:a@example.com" })] }, "links.0.url"],
    [{ links: [link({ label: undefined })] }, "links.0.label"],
    [{ links: [link({ kind: "blog" })] }, "links.0.kind"],
    [{ links: [link({ extra: 1 })] }, "links.0"],
    [
      { links: [link({ kind: "repo" }), link({ kind: "repo" })] },
      "links.1.kind",
    ],
    [
      { links: [link({ kind: "live" }), link({ kind: "live" })] },
      "links.1.kind",
    ],
    [{ cover: { src: "/a.png" } }, "cover.alt"],
    [{ cover: { src: "a.png", alt: "x" } }, "cover.src"],
    [{ client: "Example" }, ""],
  ])("test_ac2_%j_is_rejected_at_%s", (overrides, field) => {
    expect(issues(overrides).map((i) => i.field)).toContain(field);
  });

  it("test_ac2_reports_ended_before_start_alongside_other_invalid_fields", () => {
    const fields = issues({ title: "", endedAt: "2025-01-01" }).map(
      (i) => i.field,
    );
    expect(fields).toEqual(expect.arrayContaining(["title", "endedAt"]));
  });

  it("test_ac2_duplicate_stack_message_is_specific", () => {
    expect(issues({ stack: ["A", "B", "a"] })).toEqual([
      {
        field: "stack.2",
        message:
          'duplicate entry "a" (entries are compared case-insensitively)',
      },
    ]);
  });

  it.each([
    [{ endedAt: "2026-01-01" }],
    [{ status: "archived" }],
    [{ status: "completed" }],
    [{ links: [link(), link(), link()] }],
    [{ links: [link({ kind: "repo" }), link({ kind: "live" })] }],
  ])("test_ac1_%j_is_accepted", (overrides) => {
    expect(issues(overrides)).toEqual([]);
  });
});
