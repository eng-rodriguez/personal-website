import path from "node:path";
import type { ReactElement } from "react";
import { z } from "zod";
import { compileContent } from "@/lib/content/compile";
import type { ContentComponents } from "@/lib/content/compile";
import { loadCollection } from "@/lib/content/collection";
import type { ContentMode, ContentOptions } from "@/lib/content/collection";
import {
  isoDateSchema,
  nonEmptyText,
  slugSchema,
  tagsSchema,
} from "@/lib/content/schema";

export type { ContentMode, ContentOptions };
export { ContentError } from "@/lib/content/errors";

const coverSchema = z.strictObject({
  src: z
    .string()
    .regex(
      /^\/(?![/\\])[^\s\\]*$/,
      "must be a path starting with a single /, without spaces or backslashes",
    ),
  alt: nonEmptyText,
});

export const articleFrontmatterSchema = z
  .strictObject({
    title: nonEmptyText,
    slug: slugSchema,
    description: nonEmptyText,
    publishedAt: isoDateSchema,
    updatedAt: isoDateSchema.optional(),
    tags: tagsSchema,
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    cover: coverSchema.optional(),
  })
  .refine(
    (value) =>
      typeof value.updatedAt !== "string" ||
      typeof value.publishedAt !== "string" ||
      value.updatedAt >= value.publishedAt,
    {
      path: ["updatedAt"],
      message: "must not be before publishedAt",
      // Also run when other fields are invalid, so authors see every problem.
      when: () => true,
    },
  );

/** What an author writes: defaulted fields are optional. */
export type ArticleFrontmatter = z.input<typeof articleFrontmatterSchema>;
/** Normalized metadata returned by the API. Dates stay strings. */
export type Article = Readonly<z.output<typeof articleFrontmatterSchema>>;
export type CompiledArticle = {
  readonly article: Article;
  readonly content: ReactElement;
};

/** Components MDX bodies may use. Empty until a story adds one. */
const articleComponents: ContentComponents = {};

function defaultDirectory(): string {
  return path.join(process.cwd(), "content", "articles");
}

function defaultMode(): ContentMode {
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

function load({ directory, mode }: ContentOptions = {}) {
  return loadCollection({
    directory: directory ?? defaultDirectory(),
    schema: articleFrontmatterSchema,
    mode: mode ?? defaultMode(),
  });
}

/** Locale-independent ordering by UTF-16 code unit. */
function compareCodePoints(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Published Articles, newest first, then by slug. Server only. */
export function getArticles(options?: ContentOptions): readonly Article[] {
  return load(options)
    .map((entry) => entry.data)
    .sort(
      (a, b) =>
        compareCodePoints(b.publishedAt, a.publishedAt) ||
        compareCodePoints(a.slug, b.slug),
    );
}

export function getArticleBySlug(
  slug: string,
  options?: ContentOptions,
): Article | undefined {
  return load(options).find((entry) => entry.data.slug === slug)?.data;
}

export async function compileArticle(
  slug: string,
  options?: ContentOptions,
): Promise<CompiledArticle | undefined> {
  const entry = load(options).find((item) => item.data.slug === slug);
  if (!entry) return undefined;
  const content = await compileContent(entry.body, {
    file: entry.file,
    lineOffset: entry.bodyLineOffset,
    components: articleComponents,
  });
  return { article: entry.data, content };
}
