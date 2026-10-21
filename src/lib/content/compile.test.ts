// @vitest-environment node
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, describe, expect, it } from "vitest";
import { ContentError } from "@/lib/content/errors";
import { compileContent } from "@/lib/content/compile";

const file = "content/articles/sample.mdx";
const Note = (props: Record<string, unknown>) =>
  createElement("aside", null, String(props.title ?? ""));

async function html(body: string, components = {}) {
  return renderToStaticMarkup(await compileContent(body, { file, components }));
}

afterAll(() => {
  expect((globalThis as Record<string, unknown>).__mdxRan).toBeUndefined();
});

describe("compileContent", () => {
  it("test_ac6_renders_markdown", async () => {
    const out = await html(
      "## Heading\n\nSome *emphasis* and `code`.\n\n- item\n\n[link](https://example.com)",
    );
    for (const part of [
      "<h2>",
      "<em>",
      "<code>",
      "<li>",
      '<a href="https://example.com">',
    ]) {
      expect(out).toContain(part);
    }
  });

  it.each([
    ["flow expression", "{process.env.SECRET}", {}],
    ["inline expression", "a {1 + 1} b", {}],
    ["global assignment", "{globalThis.__mdxRan = true}", {}],
    ["import", 'import x from "node:fs"', {}],
    ["export", "export const y = (globalThis.__mdxRan = true)", {}],
    ["unknown component", "<Callout />", {}],
    ["html div", "<div>x</div>", {}],
    ["html script", "<script>alert(1)</script>", {}],
    ["fragment", "<>x</>", {}],
    ["spread attribute", "<Note {...props} />", { Note }],
    ["expression attribute", "<Note title={1} />", { Note }],
  ])("test_ac7_rejects_%s", async (_name, body, components) => {
    const error = await compileContent(body, { file, components }).catch(
      (e) => e,
    );
    expect(error).toBeInstanceOf(ContentError);
    expect(error.message).toContain(file);
  });

  it.each([
    ["nested html script", "<Note><script /></Note>"],
    ["nested expression", "<Note>{x}</Note>"],
    ["nested unknown component", "<Note><Other /></Note>"],
  ])("test_ac7_rejects_%s_inside_an_allowed_component", async (_n, body) => {
    const error = await compileContent(body, {
      file,
      components: { Note },
    }).catch((e) => e);
    expect(error).toBeInstanceOf(ContentError);
    expect(error.message).toContain(file);
  });

  it("test_ac7_error_names_construct_and_position", async () => {
    const error = await compileContent("ok\n\n{process.env.X}", {
      file,
      components: {},
    }).catch((e) => e);
    expect(error.message).toContain("JavaScript expressions");
    expect(error.message).toContain("line 3");
    expect(error.message).not.toContain("process.env.X");
  });

  it("test_ac7_allowed_component_with_string_attribute_renders", async () => {
    expect(await html('<Note title="Hi" />', { Note })).toContain(
      "<aside>Hi</aside>",
    );
  });

  it("test_ac7_syntax_error_is_a_content_error", async () => {
    const error = await compileContent("<Note", {
      file,
      components: { Note },
    }).catch((e) => e);
    expect(error).toBeInstanceOf(ContentError);
    expect(error.message).toContain(file);
  });

  it("test_ac6_escaped_brace_renders_literally", async () => {
    expect(await html("a \\{ b")).toContain("a { b");
  });
});
