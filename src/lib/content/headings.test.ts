// @vitest-environment node
import { describe, expect, it } from "vitest";
import { scanHeadings } from "@/lib/content/headings";

const texts = (body: string) => scanHeadings(body).map((h) => h.text);

describe("scanHeadings", () => {
  it("test_ac4_reports_levels_text_and_one_based_lines", () => {
    const body = ["# One", "", "## Two", "text", "###### Six"].join("\n");
    expect(scanHeadings(body)).toEqual([
      { depth: 1, text: "One", line: 1 },
      { depth: 2, text: "Two", line: 3 },
      { depth: 6, text: "Six", line: 5 },
    ]);
  });

  it("test_ac4_removes_the_closing_sequence", () => {
    expect(texts("## Problem ##\n## Other   ###\n## ###")).toEqual([
      "Problem",
      "Other",
      "",
    ]);
  });

  it("test_ac4_accepts_up_to_three_leading_spaces", () => {
    expect(texts("   ## Three")).toEqual(["Three"]);
  });

  it.each(["    ## Four spaces", "\t## Tab", "#Problem", "####### Seven"])(
    "test_ac4_%j_is_not_a_heading",
    (line) => {
      expect(scanHeadings(line)).toEqual([]);
    },
  );

  it("test_ac4_empty_heading_has_empty_text", () => {
    expect(scanHeadings("##")).toEqual([{ depth: 2, text: "", line: 1 }]);
  });

  it.each([
    ["backtick", "```md\n## Hidden\n```\n## Shown"],
    ["tilde", "~~~md\n## Hidden\n~~~\n## Shown"],
    ["longer fence", "````\n## Hidden\n```\n## Hidden too\n````\n## Shown"],
  ])("test_ac4_%s_fence_hides_headings", (_name, body) => {
    expect(texts(body)).toEqual(["Shown"]);
  });

  it.each([
    ["a shorter run", "````\n## Hidden\n```\n## Hidden"],
    ["the other character", "```\n## Hidden\n~~~\n## Hidden"],
  ])("test_ac4_%s_does_not_close_a_fence", (_name, body) => {
    expect(texts(body)).toEqual([]);
  });

  it("test_ac4_backtick_info_string_with_a_backtick_is_not_a_fence", () => {
    expect(texts("``` a`b\n## Shown")).toEqual(["Shown"]);
  });

  it("test_ac4_unclosed_fence_hides_the_rest", () => {
    expect(texts("## Before\n```\n## Hidden\n## Hidden")).toEqual(["Before"]);
  });

  it("test_ac4_handles_crlf", () => {
    expect(scanHeadings("## Problem\r\ntext\r\n## Approach\r\n")).toEqual([
      { depth: 2, text: "Problem", line: 1 },
      { depth: 2, text: "Approach", line: 3 },
    ]);
  });
});
