import type { ReactNode } from "react";

import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { Tag } from "@/components/primitives/tag";
import { ProjectFilters } from "@/components/site/project-filters";
import {
  categoryOptions,
  projectStatusLabels,
  technologyKey,
  technologyOptions,
} from "@/lib/project-filters";
import type { Project } from "@/lib/projects";

export type ProjectIndexProps = { projects: readonly Project[] };

/**
 * The Projects list. Cards are rendered here, on the server, and handed to the
 * client filters as nodes. Titles are not links until the detail route exists.
 */
export function ProjectIndex({ projects }: ProjectIndexProps): ReactNode {
  if (projects.length === 0) {
    return (
      <EmptyState
        className="mt-8"
        title="No projects yet"
        description="Projects and case studies will appear here."
      />
    );
  }

  return (
    <ProjectFilters
      items={projects.map((project) => ({
        slug: project.slug,
        status: project.status,
        stack: project.stack.map(technologyKey),
        card: (
          <Card
            title={project.title}
            headingLevel="h2"
            description={project.summary}
            footer={
              <>
                <p className="text-sm text-muted-foreground">
                  Status: {projectStatusLabels[project.status]}
                </p>
                <ul aria-label="Stack" className="mt-3 flex flex-wrap gap-2">
                  {project.stack.map((entry) => (
                    <li key={entry} className="max-w-full">
                      <Tag className="wrap-anywhere">{entry}</Tag>
                    </li>
                  ))}
                </ul>
              </>
            }
          />
        ),
      }))}
      categoryOptions={categoryOptions(projects)}
      technologyOptions={technologyOptions(projects)}
    />
  );
}
