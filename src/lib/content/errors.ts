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
