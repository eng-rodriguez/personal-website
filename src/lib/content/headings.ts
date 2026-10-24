export type Heading = {
  readonly depth: 1 | 2 | 3 | 4 | 5 | 6;
  readonly text: string;
  /** 1-based line within the scanned body. */
  readonly line: number;
};

const fenceOpen = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const fenceClose = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;
const atx = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?[ \t]*$/;

/**
 * Finds ATX headings (`## Text`) outside code fences. A line scanner covering
 * the CommonMark subset needed for top-level sections; setext headings and
 * headings inside blockquotes, lists or HTML are not reported.
 */
export function scanHeadings(body: string): readonly Heading[] {
  const headings: Heading[] = [];
  let fence: { char: string; length: number } | undefined;

  body.split("\n").forEach((raw, index) => {
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;

    if (fence) {
      const close = fenceClose.exec(line);
      if (
        close &&
        close[1][0] === fence.char &&
        close[1].length >= fence.length
      ) {
        fence = undefined;
      }
      return;
    }

    const open = fenceOpen.exec(line);
    if (open && !(open[1][0] === "`" && open[2].includes("`"))) {
      fence = { char: open[1][0], length: open[1].length };
      return;
    }

    const heading = atx.exec(line);
    if (!heading) return;
    let text = (heading[2] ?? "").trim();
    text = /^#+$/.test(text) ? "" : text.replace(/[ \t]+#+$/, "").trim();
    headings.push({
      depth: heading[1].length as Heading["depth"],
      text,
      line: index + 1,
    });
  });

  return headings;
}
