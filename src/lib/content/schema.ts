import { z } from "zod";

/** Lowercase kebab-case: `a`, `next-js-16`. */
export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "must be lowercase kebab-case (letters, digits and single hyphens)",
  );

/** Exactly `YYYY-MM-DD` and a real calendar date. Kept as a string. */
export const isoDateSchema = z.iso.date(
  "must be a real date in YYYY-MM-DD format",
);

/** Kebab-case tags without duplicates; defaults to no tags. */
export const tagsSchema = z
  .array(slugSchema)
  .default([])
  .superRefine((tags, ctx) => {
    const seen = new Set<string>();
    tags.forEach((tag, index) => {
      if (seen.has(tag)) {
        ctx.addIssue({
          code: "custom",
          path: [index],
          message: `duplicate tag "${tag}"`,
        });
      }
      seen.add(tag);
    });
  });

export const nonEmptyText = z.string().trim().min(1, "must not be empty");
