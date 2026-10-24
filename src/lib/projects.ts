import path from "node:path";
import type { ReactElement } from "react";
import { z } from "zod";
import { compileContent } from "@/lib/content/compile";
import type { ContentComponents } from "@/lib/content/compile";
import { loadCollection } from "@/lib/content/collection";
import type {
  ContentMode,
  ContentOptions,
  EntryCheck,
} from "@/lib/content/collection";
import { scanHeadings } from "@/lib/content/headings";
import {
  coverSchema,
  isoDateSchema,
  nonEmptyText,
  slugSchema,
} from "@/lib/content/schema";

export type { ContentMode, ContentOptions };
export { ContentError } from "@/lib/content/errors";

export const projectStatuses = ["active", "completed", "archived"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

/** Level-2 headings a case study must contain, once each, in this order. */
export const caseStudySections = [
  "Problem",
  "Approach",
  "Decisions",
  "Outcome",
] as const;

function isHttpsUrl(value: string): boolean {
  if (!value.startsWith("https://") || /\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "";
  } catch {
    return false;
  }
}

const httpsUrlSchema = z
  .string()
  .refine(isHttpsUrl, "must be an absolute https:// URL");

const linkSchema = z.strictObject({
  label: nonEmptyText,
  url: httpsUrlSchema,
  kind: z.enum(["repo", "live", "other"], "must be one of repo, live, other"),
});

const linksSchema = z
  .array(linkSchema)
  .default([])
  .superRefine((links, ctx) => {
    const seen = new Set<string>();
    links.forEach((link, index) => {
      if (link.kind !== "other" && seen.has(link.kind)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "kind"],
          message: `only one "${link.kind}" link is allowed`,
        });
      }
      seen.add(link.kind);
    });
  });

const stackSchema = z
  .array(nonEmptyText)
  .min(1, "must list at least one entry")
  .superRefine((stack, ctx) => {
    const seen = new Set<string>();
    stack.forEach((entry, index) => {
      const key = entry.toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: [index],
          message: `duplicate entry "${key}" (entries are compared case-insensitively)`,
        });
      }
      seen.add(key);
    });
  });

export const projectFrontmatterSchema = z
  .strictObject({
    title: nonEmptyText,
    slug: slugSchema,
    summary: nonEmptyText,
    role: nonEmptyText,
    stack: stackSchema,
    startedAt: isoDateSchema,
    endedAt: isoDateSchema.optional(),
    status: z.enum(
      projectStatuses,
      "must be one of active, completed, archived",
    ),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    links: linksSchema,
    cover: coverSchema.optional(),
    caseStudy: z.boolean().default(false),
  })
  .refine(
    (value) =>
      typeof value.endedAt !== "string" ||
      typeof value.startedAt !== "string" ||
      value.endedAt >= value.startedAt,
    {
      path: ["endedAt"],
      message: "must not be before startedAt",
      // Also run when other fields are invalid, so authors see every problem.
      when: () => true,
    },
  )
  .refine((value) => value.status !== "active" || value.endedAt === undefined, {
    path: ["endedAt"],
    message: "must be omitted while status is active",
    when: () => true,
  });

/** What an author writes: defaulted fields are optional. */
export type ProjectFrontmatter = z.input<typeof projectFrontmatterSchema>;
/** Normalized metadata returned by the API. Dates stay strings. */
export type Project = Readonly<z.output<typeof projectFrontmatterSchema>>;
export type CompiledProject = {
  readonly project: Project;
  readonly content: ReactElement;
};

/** Components MDX bodies may use. Empty until a story adds one. */
const projectComponents: ContentComponents = {};

const caseStudyIssues: EntryCheck<Project> = ({
  data,
  body,
  bodyLineOffset,
}) => {
  if (!data.caseStudy) return [];
  const headings = scanHeadings(body).map((heading) => ({
    ...heading,
    line: heading.line + bodyLineOffset,
  }));
  const issues: { field: string; message: string }[] = [];
  const found: { name: string; line: number }[] = [];

  for (const name of caseStudySections) {
    const levelTwo = headings.filter((h) => h.depth === 2 && h.text === name);
    if (levelTwo.length === 1) {
      found.push({ name, line: levelTwo[0].line });
    } else if (levelTwo.length > 1) {
      issues.push({
        field: "(body)",
        message: `case study section "## ${name}" appears ${levelTwo.length} times (lines ${levelTwo.map((h) => h.line).join(", ")}); it must appear once`,
      });
    } else {
      const other = headings.find((h) => h.text === name);
      issues.push({
        field: "(body)",
        message: other
          ? `"${"#".repeat(other.depth)} ${name}" (line ${other.line}) must be a level-2 heading "## ${name}"`
          : `case study section "## ${name}" is missing`,
      });
    }
  }

  // Order is checked over the sections found once, so a missing one does not hide it.
  for (let i = 1; i < found.length; i++) {
    if (found[i].line < found[i - 1].line) {
      issues.push({
        field: "(body)",
        message: `case study section "## ${found[i].name}" (line ${found[i].line}) must come after "## ${found[i - 1].name}" (line ${found[i - 1].line}); the order is ${caseStudySections.join(", ")}`,
      });
      break;
    }
  }
  return issues;
};

function defaultDirectory(): string {
  return path.join(process.cwd(), "content", "projects");
}

function defaultMode(): ContentMode {
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

function load({ directory, mode }: ContentOptions = {}) {
  return loadCollection({
    directory: directory ?? defaultDirectory(),
    schema: projectFrontmatterSchema,
    mode: mode ?? defaultMode(),
    validate: caseStudyIssues,
  });
}

/** Locale-independent ordering by UTF-16 code unit. */
function compareCodePoints(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Published Projects, newest start first, then by slug. Server only. */
export function getProjects(options?: ContentOptions): readonly Project[] {
  return load(options)
    .map((entry) => entry.data)
    .sort(
      (a, b) =>
        compareCodePoints(b.startedAt, a.startedAt) ||
        compareCodePoints(a.slug, b.slug),
    );
}

export function getProjectBySlug(
  slug: string,
  options?: ContentOptions,
): Project | undefined {
  return load(options).find((entry) => entry.data.slug === slug)?.data;
}

export async function compileProject(
  slug: string,
  options?: ContentOptions,
): Promise<CompiledProject | undefined> {
  const entry = load(options).find((item) => item.data.slug === slug);
  if (!entry) return undefined;
  const content = await compileContent(entry.body, {
    file: entry.file,
    lineOffset: entry.bodyLineOffset,
    components: projectComponents,
  });
  return { project: entry.data, content };
}
