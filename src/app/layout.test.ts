// @vitest-environment node
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/layout";
import { metadata as experience } from "@/app/experience/page";
import { metadata as projects } from "@/app/projects/page";
import { metadata as resume } from "@/app/resume/page";
import { metadata as writing } from "@/app/writing/page";
import { site } from "@/lib/site";

describe("root metadata", () => {
  it("test_ac7_defines_title_template_and_description", () => {
    expect(metadata.title).toEqual({
      default: site.name,
      template: "%s · " + site.name,
    });
    expect(metadata.description).toBe(site.description);
    expect(metadata.metadataBase).toBeUndefined();
  });

  it("test_ac7_placeholder_pages_set_their_titles", () => {
    expect(writing.title).toBe("Writing");
    expect(projects.title).toBe("Projects");
    expect(experience.title).toBe("Experience");
    expect(resume.title).toBe("Resume");
  });
});
