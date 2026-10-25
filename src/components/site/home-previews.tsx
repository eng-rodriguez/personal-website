import type { ReactNode } from "react";

import { Card } from "@/components/primitives/card";
import { Grid } from "@/components/primitives/grid";
import { Link } from "@/components/primitives/link";
import { Section } from "@/components/primitives/section";
import { Tag } from "@/components/primitives/tag";
import type { Article } from "@/lib/articles";
import { formatContentDate } from "@/lib/dates";
import type { Project } from "@/lib/projects";

export type HomePreviewsProps = {
  projects: readonly Project[];
  articles: readonly Article[];
};

/** Renders the lists it is given; a list with no items renders no section. */
export function HomePreviews({
  projects,
  articles,
}: HomePreviewsProps): ReactNode {
  return (
    <>
      {projects.length > 0 ? (
        <Section title="Featured projects" className="mt-16">
          <Grid columns={1}>
            {projects.map((project) => (
              <Card
                key={project.slug}
                title={project.title}
                href="/projects"
                description={project.summary}
                footer={
                  <ul aria-label="Stack" className="flex flex-wrap gap-2">
                    {project.stack.map((entry) => (
                      <li key={entry} className="max-w-full">
                        <Tag className="wrap-anywhere">{entry}</Tag>
                      </li>
                    ))}
                  </ul>
                }
              />
            ))}
          </Grid>
          <p className="mt-6">
            <Link
              href="/projects"
              className="inline-flex min-h-10 items-center"
            >
              View all projects
            </Link>
          </p>
        </Section>
      ) : null}
      {articles.length > 0 ? (
        <Section title="Recent writing" className="mt-16">
          <Grid columns={1}>
            {articles.map((article) => (
              <Card
                key={article.slug}
                title={article.title}
                href="/writing"
                description={article.description}
                footer={
                  <time
                    dateTime={article.publishedAt}
                    className="text-sm text-muted-foreground"
                  >
                    {formatContentDate(article.publishedAt)}
                  </time>
                }
              />
            ))}
          </Grid>
          <p className="mt-6">
            <Link href="/writing" className="inline-flex min-h-10 items-center">
              View all writing
            </Link>
          </p>
        </Section>
      ) : null}
    </>
  );
}
