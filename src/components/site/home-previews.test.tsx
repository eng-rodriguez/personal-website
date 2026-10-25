import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePreviews } from "@/components/site/home-previews";
import type { Article } from "@/lib/articles";
import type { Project } from "@/lib/projects";

function project(slug: string, overrides: Partial<Project> = {}): Project {
  return {
    title: `Project ${slug}`,
    slug,
    summary: `Summary of ${slug}.`,
    role: "Lead engineer",
    stack: ["TypeScript", "Next.js"],
    startedAt: "2026-01-15",
    status: "completed",
    featured: true,
    draft: false,
    links: [
      { label: "Source", url: "https://example.com/source", kind: "repo" },
    ],
    caseStudy: false,
    ...overrides,
  };
}

function article(slug: string, overrides: Partial<Article> = {}): Article {
  return {
    title: `Article ${slug}`,
    slug,
    description: `Description of ${slug}.`,
    publishedAt: "2026-10-25",
    tags: [],
    draft: false,
    featured: false,
    ...overrides,
  };
}

describe("HomePreviews", () => {
  it("test_ac3_renders_projects_then_writing_with_h2_sections_and_h3_cards", () => {
    render(
      <HomePreviews
        projects={[project("a"), project("b")]}
        articles={[article("c")]}
      />,
    );
    expect(screen.getAllByRole("region")).toHaveLength(2);
    const projects = screen.getByRole("region", { name: "Featured projects" });
    const writing = screen.getByRole("region", { name: "Recent writing" });
    expect(
      projects.compareDocumentPosition(writing) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (const region of [projects, writing]) {
      expect(within(region).getAllByRole("heading", { level: 2 })).toHaveLength(
        1,
      );
      for (const card of within(region).getAllByRole("article")) {
        const heading = within(card).getByRole("heading", { level: 3 });
        expect(within(heading).getAllByRole("link")).toHaveLength(1);
      }
    }
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("test_ac4_project_card_shows_title_summary_and_stack_only", () => {
    render(
      <HomePreviews
        projects={[
          project("a", {
            stack: ["Go", "C#"],
            cover: { src: "/images/a.png", alt: "Cover" },
          }),
        ]}
        articles={[]}
      />,
    );
    const card = screen.getByRole("article");
    expect(within(card).getByText("Project a")).toBeInTheDocument();
    expect(within(card).getByText("Summary of a.")).toBeInTheDocument();
    const stack = within(card).getByRole("list", { name: "Stack" });
    expect(
      within(stack)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Go", "C#"]);
    expect(card.querySelector("img")).toBeNull();
    expect(card.querySelector('a[href^="https://"]')).toBeNull();
    expect(card).not.toHaveTextContent(/completed|Lead engineer|Source/);
  });

  it("test_ac4_article_card_shows_title_description_and_date", () => {
    const { container } = render(
      <HomePreviews projects={[]} articles={[article("c")]} />,
    );
    const card = screen.getByRole("article");
    expect(within(card).getByText("Article c")).toBeInTheDocument();
    expect(within(card).getByText("Description of c.")).toBeInTheDocument();
    const time = container.querySelector("time");
    expect(time).toHaveAttribute("datetime", "2026-10-25");
    expect(time).toHaveTextContent("Oct 25, 2026");
  });

  it("test_ac6_links_go_to_the_section_pages_with_a_view_all_link", () => {
    render(
      <HomePreviews
        projects={[project("a"), project("b")]}
        articles={[article("c"), article("d"), article("e")]}
      />,
    );
    const projects = screen.getByRole("region", { name: "Featured projects" });
    const writing = screen.getByRole("region", { name: "Recent writing" });
    const projectLinks = within(projects).getAllByRole("link");
    const writingLinks = within(writing).getAllByRole("link");
    expect(projectLinks).toHaveLength(3);
    expect(writingLinks).toHaveLength(4);
    for (const link of projectLinks) {
      expect(link).toHaveAttribute("href", "/projects");
    }
    for (const link of writingLinks) {
      expect(link).toHaveAttribute("href", "/writing");
    }
    expect(
      within(projects).getByRole("link", { name: "View all projects" }),
    ).toBeInTheDocument();
    expect(
      within(writing).getByRole("link", { name: "View all writing" }),
    ).toBeInTheDocument();
    for (const link of screen.getAllByRole("link")) {
      expect(link.getAttribute("href")).not.toMatch(/^\/(projects|writing)\//);
    }
  });

  it.each([
    ["both empty", [], []],
    ["projects only", [project("a")], []],
    ["articles only", [], [article("c")]],
  ] as const)("test_ac7_%s renders only the non-empty sections", (_, p, a) => {
    const { container } = render(<HomePreviews projects={p} articles={a} />);
    expect(screen.queryAllByRole("region")).toHaveLength(
      Number(p.length > 0) + Number(a.length > 0),
    );
    expect(screen.queryByText("Featured projects") === null).toBe(
      p.length === 0,
    );
    expect(screen.queryByText("Recent writing") === null).toBe(a.length === 0);
    expect(container.querySelector('[data-slot="empty-state"]')).toBeNull();
    if (p.length === 0 && a.length === 0) {
      expect(container.firstChild).toBeNull();
    }
  });

  it("test_ac14_renders_every_item_it_is_given", () => {
    render(
      <HomePreviews
        projects={["a", "b", "c", "d"].map((s) => project(s))}
        articles={["e", "f", "g", "h"].map((s) => article(s))}
      />,
    );
    expect(screen.getAllByRole("article")).toHaveLength(8);
  });
});
