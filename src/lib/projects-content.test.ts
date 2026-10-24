// @vitest-environment node
import { describe, expect, it } from "vitest";
import { compileProject, getProjects } from "@/lib/projects";

// Validates the real content/projects directory, drafts included, so invalid
// Frontmatter, a broken case study or an unsafe or broken body fails
// `npm run check`.
describe("content/projects", () => {
  it("test_ac7_every_project_validates_and_compiles", async () => {
    const projects = getProjects({ mode: "development" });
    for (const { slug } of projects) {
      await expect(
        compileProject(slug, { mode: "development" }),
      ).resolves.toBeDefined();
    }
  });
});
