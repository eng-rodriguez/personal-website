import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import type { z } from "zod";
import { splitFrontmatter } from "@/lib/content/frontmatter";

export type ContentMode = "production" | "development";
export type ContentOptions = { directory?: string; mode?: ContentMode };

export type ContentIssue = {
  readonly file: string;
  readonly field?: string;
  readonly message: string;
};

function formatIssues(issues: readonly ContentIssue[]): string {
  const files = new Map<string, ContentIssue[]>();
  for (const issue of issues) {
    files.set(issue.file, [...(files.get(issue.file) ?? []), issue]);
  }
  const lines = [
    `Invalid content (${files.size} ${files.size === 1 ? "file" : "files"}):`,
  ];
  for (const [file, fileIssues] of files) {
    lines.push(`  ${file}`);
    for (const { field, message } of fileIssues) {
      lines.push(`    - ${field ? `${field}: ` : ""}${message}`);
    }
  }
  return lines.join("\n");
}

/** One error listing every invalid file and field. */
export class ContentError extends Error {
  readonly issues: readonly ContentIssue[];

  constructor(issues: readonly ContentIssue[], options?: { cause?: unknown }) {
    super(formatIssues(issues), options);
    this.name = "ContentError";
    this.issues = issues;
  }
}

export type CollectionEntry<T> = {
  readonly data: Readonly<T>;
  /** Path relative to process.cwd(), for messages. */
  readonly file: string;
  readonly body: string;
};

// Entries of different content types share the map; the key includes the
// directory, and each directory holds one type.
const cache = new Map<string, readonly CollectionEntry<unknown>[]>();

function displayPath(path: string): string {
  return relative(process.cwd(), path).split("\\").join("/");
}

function freeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
}

function readFileNames(directory: string): string[] {
  try {
    return readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function fieldOf(path: readonly PropertyKey[]): string | undefined {
  return path.length > 0 ? path.map(String).join(".") : undefined;
}

function loadUncached<S extends z.ZodType<{ slug: string; draft: boolean }>>(
  directory: string,
  schema: S,
  mode: ContentMode,
): CollectionEntry<z.output<S>>[] {
  const issues: ContentIssue[] = [];
  const entries: CollectionEntry<z.output<S>>[] = [];

  for (const name of readFileNames(directory)) {
    const path = join(directory, name);
    const file = displayPath(path);
    let parsed: { data: unknown; body: string };
    try {
      parsed = splitFrontmatter(readFileSync(path, "utf8"), file);
    } catch (error) {
      if (error instanceof ContentError) {
        issues.push(...error.issues);
        continue;
      }
      throw error;
    }

    const expected = basename(name, ".mdx");
    const result = schema.safeParse(parsed.data);
    const slug = result.success
      ? result.data.slug
      : (parsed.data as { slug?: unknown } | null)?.slug;
    // Checked even when other fields are invalid, so authors see every problem.
    const slugMismatch =
      typeof slug === "string" && slug !== expected
        ? {
            file,
            field: "slug",
            message: `"${slug}" must equal the filename "${expected}"`,
          }
        : undefined;

    if (!result.success) {
      const slugIssued = result.error.issues.some(
        (issue) => issue.path[0] === "slug",
      );
      for (const issue of result.error.issues) {
        if (issue.code === "unrecognized_keys") {
          for (const key of issue.keys) {
            issues.push({
              file,
              field: key,
              message: "unknown key (not part of the schema)",
            });
          }
          continue;
        }
        issues.push({
          file,
          field: fieldOf(issue.path) ?? "(frontmatter)",
          message: issue.message,
        });
      }
      if (slugMismatch && !slugIssued) issues.push(slugMismatch);
      continue;
    }

    if (slugMismatch) issues.push(slugMismatch);
    entries.push({ data: result.data, file, body: parsed.body });
  }

  const bySlug = new Map<string, string[]>();
  for (const { data, file } of entries) {
    bySlug.set(data.slug, [...(bySlug.get(data.slug) ?? []), file]);
  }
  for (const [slug, files] of bySlug) {
    if (files.length < 2) continue;
    for (const file of files) {
      const others = files.filter((other) => other !== file).join(", ");
      issues.push({
        file,
        field: "slug",
        message: `"${slug}" is also used by ${others}`,
      });
    }
  }

  if (issues.length > 0) {
    const order = new Map(
      [...new Set(issues.map((issue) => issue.file))].map((f, i) => [f, i]),
    );
    throw new ContentError(
      issues
        .map((issue, index) => ({ issue, index }))
        .sort(
          (a, b) =>
            (order.get(a.issue.file) ?? 0) - (order.get(b.issue.file) ?? 0) ||
            a.index - b.index,
        )
        .map(({ issue }) => issue),
    );
  }

  return entries
    .filter((entry) => mode !== "production" || !entry.data.draft)
    .map((entry) => freeze(entry));
}

/**
 * Loads and validates every `*.mdx` file of one content type. Throws one
 * ContentError listing all problems, drafts included. Drafts are dropped in
 * production mode. Results are cached per process only when NODE_ENV is
 * "production", so `next dev` and tests see edits.
 */
export function loadCollection<
  S extends z.ZodType<{ slug: string; draft: boolean }>,
>({
  directory,
  schema,
  mode,
}: {
  directory: string;
  schema: S;
  mode: ContentMode;
}): readonly CollectionEntry<z.output<S>>[] {
  const useCache = process.env.NODE_ENV === "production";
  const key = `${resolve(directory)}\0${mode}`;
  if (useCache) {
    const hit = cache.get(key);
    if (hit) return hit as readonly CollectionEntry<z.output<S>>[];
  }
  const entries = loadUncached(directory, schema, mode);
  if (useCache) cache.set(key, entries);
  return entries;
}
