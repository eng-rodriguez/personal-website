import type { ComponentType, ReactElement } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import { ContentError } from "@/lib/content/collection";

/** Allowlist of components MDX bodies may use, keyed by JSX name. */
export type ContentComponents = Readonly<
  Record<string, ComponentType<Record<string, unknown>>>
>;

type Position = {
  start?: { line?: number; column?: number };
};
type MdastNode = {
  type: string;
  name?: string | null;
  position?: Position;
  children?: MdastNode[];
  attributes?: { type: string; name?: string }[];
};

type Rejection = { error?: ContentError };

function where(node: MdastNode): string {
  const start = node.position?.start;
  return start?.line
    ? ` (line ${start.line}, column ${start.column ?? 1})`
    : "";
}

function problemWith(node: MdastNode, allowed: readonly string[]) {
  switch (node.type) {
    case "mdxjsEsm":
      return "import and export are not allowed";
    case "mdxFlowExpression":
    case "mdxTextExpression":
      return "JavaScript expressions ({...}) are not allowed; escape a literal brace as \\{";
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement": {
      if (!node.name || !allowed.includes(node.name)) {
        return `component <${node.name ?? ""}> is not allowed`;
      }
      const hasExpression = node.attributes?.some(
        (attribute) =>
          attribute.type === "mdxJsxExpressionAttribute" ||
          (attribute as { value?: { type?: string } }).value?.type ===
            "mdxJsxAttributeValueExpression",
      );
      return hasExpression
        ? "attribute expressions are not allowed"
        : undefined;
    }
    default:
      return undefined;
  }
}

/**
 * Remark plugin that fails on the first unsafe construct. It is listed in the
 * user plugins, which next-mdx-remote runs before its own blockJS transforms,
 * so unsafe nodes are rejected instead of silently stripped. The plugin error
 * is recorded in `rejection` because next-mdx-remote rewraps thrown errors.
 */
function rejectUnsafeMdx(options: {
  file: string;
  allowed: readonly string[];
  rejection: Rejection;
}) {
  return (tree: MdastNode) => {
    const visit = (node: MdastNode) => {
      const problem = problemWith(node, options.allowed);
      if (problem) {
        const error = new ContentError([
          {
            file: options.file,
            field: "(body)",
            message: `${problem}${where(node)}`,
          },
        ]);
        options.rejection.error = error;
        throw error;
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

/**
 * Compiles an MDX body on the server. Any expression, import, export or JSX
 * element outside `components` throws a ContentError naming `file`.
 */
export async function compileContent(
  body: string,
  { file, components }: { file: string; components: ContentComponents },
): Promise<ReactElement> {
  const rejection: Rejection = {};
  try {
    const { content } = await compileMDX({
      source: body,
      components,
      options: {
        parseFrontmatter: false,
        blockJS: true,
        blockDangerousJS: true,
        mdxOptions: {
          remarkPlugins: [
            [
              rejectUnsafeMdx,
              { file, allowed: Object.keys(components), rejection },
            ],
          ],
        },
      },
    });
    return content;
  } catch (error) {
    if (rejection.error) throw rejection.error;
    if (error instanceof ContentError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new ContentError([{ file, field: "(body)", message }], {
      cause: error,
    });
  }
}
