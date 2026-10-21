import { parse } from "yaml";
import { ContentError } from "@/lib/content/errors";

/**
 * Splits a leading `---` Frontmatter block from the body and parses it as
 * YAML. `bodyLineOffset` is the number of file lines before the body. The core schema keeps `2026-03-10` a string. Throws a ContentError
 * naming `file`.
 */
export function splitFrontmatter(
  source: string,
  file: string,
): { data: unknown; body: string; bodyLineOffset: number } {
  const text = source.startsWith("\uFEFF") ? source.slice(1) : source;
  const lines = text.split("\n");
  const fail = (message: string): never => {
    throw new ContentError([{ file, field: "(frontmatter)", message }]);
  };

  if (lines[0]?.replace(/\r$/, "") !== "---") {
    return fail("missing Frontmatter block (--- at the first line)");
  }
  const end = lines.findIndex(
    (line, index) => index > 0 && line.replace(/\r$/, "") === "---",
  );
  if (end === -1) return fail("unterminated Frontmatter block");

  let data: unknown;
  try {
    data = parse(
      lines
        .slice(1, end)
        .map((line) => line.replace(/\r$/, ""))
        .join("\n"),
      {
        schema: "core",
        uniqueKeys: true,
        prettyErrors: true,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ContentError([{ file, field: "(frontmatter)", message }], {
      cause: error,
    });
  }
  return {
    data,
    body: lines.slice(end + 1).join("\n"),
    bodyLineOffset: end + 1,
  };
}
