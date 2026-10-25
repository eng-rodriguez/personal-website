import { HomePreviews } from "@/components/site/home-previews";
import { Hero } from "@/components/site/hero";
import { getArticles } from "@/lib/articles";
import { selectFeaturedProjects, selectRecentArticles } from "@/lib/home";
import { getProjects } from "@/lib/projects";
import { site } from "@/lib/site";

export default function Home() {
  const projects = selectFeaturedProjects(getProjects());
  const articles = selectRecentArticles(getArticles());
  return (
    <>
      <Hero hero={site.hero} />
      <HomePreviews projects={projects} articles={articles} />
    </>
  );
}
