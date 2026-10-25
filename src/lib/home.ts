import type { Article } from "@/lib/articles";
import type { Project } from "@/lib/projects";

export const homePreviewLimit = 3;

/**
 * Projects with featured: true, in the given order, at most homePreviewLimit.
 * The input must be getProjects() output: ordering and draft removal stay in the loader.
 */
export function selectFeaturedProjects(
  projects: readonly Project[],
): readonly Project[] {
  return projects
    .filter((project) => project.featured)
    .slice(0, homePreviewLimit);
}

/**
 * The first homePreviewLimit Articles of the given order. Article featured is ignored.
 * The input must be getArticles() output: ordering and draft removal stay in the loader.
 */
export function selectRecentArticles(
  articles: readonly Article[],
): readonly Article[] {
  return articles.slice(0, homePreviewLimit);
}
