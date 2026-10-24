// @vitest-environment node
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ContentError,
  compileProject,
  getProjectBySlug,
  getProjects,
} from "@/lib/projects";

const root = join(process.cwd(), "src/lib/__fixtures__/projects");
const valid = join(root, "valid");
const dirs: string[] = [];

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "projects-"));
  dirs.push(dir);
  return dir;
}

function slugs(options: Parameters<typeof getProjects>[0]) {
  return getProjects(options).map((project) => project.slug);
}

function contentError(run: () => unknown): ContentError {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ContentError);
    return error as ContentError;
  }
  throw new Error("expected a ContentError");
}

afterEach(() => {
  vi.unstubAllEnvs();
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

describe("getProjects", () => {
  it("test_ac1_ac6_development_includes_drafts_in_order", () => {
    expect(slugs({ directory: valid, mode: "development" })).toEqual([
      "draft-project",
      "another-project",
      "full-project",
      "minimal-project",
    ]);
  });

  it("test_ac1_full_project_has_every_field", () => {
    expect(
      getProjectBySlug("full-project", {
        directory: valid,
        mode: "development",
      }),
    ).toEqual({
      title: "Full project",
      slug: "full-project",
      summary: "A project that uses every field.",
      role: "Lead engineer",
      stack: ["TypeScript", "Next.js", "C#"],
      startedAt: "2026-01-15",
      endedAt: "2026-03-01",
      status: "completed",
      featured: true,
      draft: false,
      links: [
        {
          label: "Source code",
          url: "https://example.com/full-project",
          kind: "repo",
        },
        { label: "Live site", url: "https://example.com", kind: "live" },
        {
          label: "Write-up",
          url: "https://example.com/write-up",
          kind: "other",
        },
        { label: "Talk", url: "https://example.com/talk", kind: "other" },
      ],
      cover: {
        src: "/images/full-project.png",
        alt: "A placeholder cover image",
      },
      caseStudy: true,
    });
  });

  it("test_ac1_minimal_project_gets_defaults", () => {
    const project = getProjectBySlug("minimal-project", {
      directory: valid,
      mode: "development",
    });
    expect(project).toMatchObject({
      featured: false,
      draft: false,
      caseStudy: false,
      links: [],
    });
    expect(project).not.toHaveProperty("endedAt");
    expect(project).not.toHaveProperty("cover");
  });

  it("test_ac5_production_hides_drafts_in_all_three_functions", async () => {
    const production = { directory: valid, mode: "production" } as const;
    expect(slugs(production)).toEqual([
      "another-project",
      "full-project",
      "minimal-project",
    ]);
    expect(getProjectBySlug("draft-project", production)).toBeUndefined();
    await expect(
      compileProject("draft-project", production),
    ).resolves.toBeUndefined();
    await expect(
      compileProject("draft-project", {
        directory: valid,
        mode: "development",
      }),
    ).resolves.toMatchObject({ project: { slug: "draft-project" } });
  });

  it("test_ac5_default_mode_follows_NODE_ENV", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(slugs({ directory: valid })).not.toContain("draft-project");
    vi.stubEnv("NODE_ENV", "development");
    expect(slugs({ directory: valid })).toContain("draft-project");
  });

  it("test_ac6_same_start_orders_slugs_by_code_point", () => {
    const dir = tempDir();
    for (const slug of ["ab", "a-b", "a-c"]) {
      writeFileSync(
        join(dir, `${slug}.mdx`),
        `---\nslug: ${slug}\ntitle: T\nsummary: s\nrole: r\nstack: [x]\nstartedAt: 2026-01-01\nstatus: active\n---\nx\n`,
      );
    }
    expect(slugs({ directory: dir })).toEqual(["a-b", "a-c", "ab"]);
  });

  it("test_ac2_ac4_invalid_files_report_every_file_and_field", () => {
    const error = contentError(() =>
      getProjects({ directory: join(root, "invalid"), mode: "development" }),
    );
    const fields = error.issues.map((issue) => issue.field);
    expect(fields).toEqual(
      expect.arrayContaining([
        "title",
        "stack",
        "status",
        "startedAt",
        "client",
        "links.0.url",
        "cover.alt",
        "endedAt",
        "stack.1",
        "links.1.kind",
        "(frontmatter)",
        "(body)",
      ]),
    );
    expect(fields.filter((f) => f === "endedAt")).toHaveLength(2);
    const bodyMessages = (name: string) =>
      error.issues
        .filter((i) => i.file.endsWith(`${name}.mdx`) && i.field === "(body)")
        .map((i) => i.message)
        .join("\n");
    const missing = bodyMessages("case-study-missing");
    expect(missing).toContain('"## Outcome" is missing');
    expect(missing).toContain('"### Decisions"');
    expect(missing).toContain('must be a level-2 heading "## Decisions"');
    expect(bodyMessages("case-study-repeated")).toContain(
      '"## Problem" appears 2 times (lines 13, 17)',
    );
    expect(bodyMessages("case-study-misordered")).toContain(
      '"## Approach" (line 13) must come after "## Problem" (line 17)',
    );
    expect(bodyMessages("case-study-fenced")).toContain(
      '"## Outcome" is missing',
    );
  });

  it("test_ac5_invalid_drafts_still_fail_in_production", () => {
    const error = contentError(() =>
      getProjects({ directory: join(root, "invalid"), mode: "production" }),
    );
    expect(error.message).toContain("broken-project.mdx");
    expect(error.message).toContain("case-study-missing.mdx");
  });

  it("test_ac3_duplicate_slugs_name_both_files", () => {
    const error = contentError(() =>
      getProjects({ directory: join(root, "duplicate"), mode: "development" }),
    );
    expect(error.message).toContain("copy-of-shared.mdx");
    expect(error.message).toContain("shared-slug.mdx");
    expect(error.message).toContain(
      '"shared-slug" must equal the filename "copy-of-shared"',
    );
    expect(
      error.issues.filter((i) => i.message.includes("is also used by")),
    ).toHaveLength(2);
  });

  it("test_ac6_missing_empty_and_drafts_only_return_nothing", () => {
    expect(
      getProjects({ directory: join(tmpdir(), "no-such-dir-xyz") }),
    ).toEqual([]);
    expect(getProjects({ directory: tempDir() })).toEqual([]);
    expect(
      getProjects({ directory: join(root, "drafts-only"), mode: "production" }),
    ).toEqual([]);
  });

  it.each(["unknown", "../valid/full-project", "Full-Project", ""])(
    "test_ac5_slug_%j_is_undefined",
    (slug) => {
      const options = { directory: valid, mode: "development" } as const;
      expect(getProjectBySlug(slug, options)).toBeUndefined();
      return expect(compileProject(slug, options)).resolves.toBeUndefined();
    },
  );

  it("test_ac1_results_are_frozen", () => {
    const project = getProjectBySlug("full-project", {
      directory: valid,
      mode: "development",
    })!;
    expect(Object.isFrozen(project)).toBe(true);
    expect(Object.isFrozen(project.stack)).toBe(true);
    expect(Object.isFrozen(project.links)).toBe(true);
    expect(Object.isFrozen(project.cover)).toBe(true);
  });
});

describe("cache", () => {
  function setup() {
    const dir = tempDir();
    cpSync(
      join(valid, "minimal-project.mdx"),
      join(dir, "minimal-project.mdx"),
    );
    const options = { directory: dir, mode: "production" } as const;
    expect(slugs(options)).toEqual(["minimal-project"]);
    writeFileSync(join(dir, "bad.mdx"), "no frontmatter");
    return options;
  }

  it("test_ac5_production_reuses_loaded_content", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(slugs(setup())).toEqual(["minimal-project"]);
  });

  it("test_ac5_test_env_does_not_cache", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(() => getProjects(setup())).toThrow(ContentError);
  });
});

describe("compileProject", () => {
  it("test_ac4_compiles_the_case_study_body", async () => {
    const compiled = await compileProject("full-project", {
      directory: valid,
      mode: "development",
    });
    expect(compiled?.project.slug).toBe("full-project");
    const html = renderToStaticMarkup(compiled!.content);
    expect(html).toContain("<h2>Problem</h2>");
    expect(html).toContain("<h2>Outcome</h2>");
  });

  it("test_ac7_unsafe_body_loads_but_does_not_compile", async () => {
    const dir = tempDir();
    writeFileSync(
      join(dir, "unsafe.mdx"),
      `---\nslug: unsafe\ntitle: T\nsummary: s\nrole: r\nstack: [x]\nstartedAt: 2026-01-01\nstatus: active\ncaseStudy: true\n---\n## Problem\n\n{1 + 1}\n\n## Approach\n\n## Decisions\n\n## Outcome\n`,
    );
    const options = { directory: dir, mode: "development" } as const;
    expect(slugs(options)).toEqual(["unsafe"]);
    await expect(compileProject("unsafe", options)).rejects.toThrow(
      /unsafe\.mdx/,
    );
  });
});
