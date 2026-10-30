import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import WritingPage from "@/app/writing/page";
import ProjectsPage from "@/app/projects/page";
import ExperiencePage from "@/app/experience/page";
import ResumePage from "@/app/resume/page";
import { site } from "@/lib/site";

const pages = [
  ["app/page.tsx", Home, site.hero.name, null],
  [
    "app/writing/page.tsx",
    WritingPage,
    "Writing",
    "Articles will appear here.",
  ],
  [
    "app/projects/page.tsx",
    ProjectsPage,
    "Projects",
    "Projects and case studies will appear here.",
  ],
  [
    "app/experience/page.tsx",
    ExperiencePage,
    "Experience",
    "Professional experience will appear here.",
  ],
  ["app/resume/page.tsx", ResumePage, "Resume", "The resume will appear here."],
] as const;

describe.each(pages)("%s", (file, Page, title, emptyText) => {
  it("test_ac9_uses_page_heading_for_the_single_h1_and_description", () => {
    const { container } = render(<Page />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(title);
    const root = container.querySelector('[data-slot="page-heading"]')!;
    expect(root).toContainElement(h1s[0]);
    expect(root.querySelector("p")).not.toBeNull();
  });

  it("test_ac9_shows_the_empty_state_only_on_placeholder_pages", () => {
    const { container } = render(<Page />);
    const empty = container.querySelector('[data-slot="empty-state"]');
    if (emptyText === null) {
      expect(empty).toBeNull();
    } else {
      expect(empty).toHaveTextContent(emptyText);
    }
  });

  it("test_ac16_projects_has_no_filters_while_content_is_empty", () => {
    if (file !== "app/projects/page.tsx") return;
    render(<Page />);
    expect(screen.queryByRole("group", { name: "Filters" })).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("test_ac9_no_longer_carries_the_duplicated_class_strings", () => {
    const source = readFileSync(join(process.cwd(), "src", file), "utf8");
    expect(source).not.toContain("text-3xl font-semibold tracking-tight");
    expect(source).not.toContain("mt-4 text-muted-foreground");
  });
});
