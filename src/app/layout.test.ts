// @vitest-environment node
import { describe, expect, it } from "vitest";
import RootLayout, { metadata, viewport } from "@/app/layout";
import { metadata as experience } from "@/app/experience/page";
import { metadata as projects } from "@/app/projects/page";
import { metadata as resume } from "@/app/resume/page";
import { metadata as writing } from "@/app/writing/page";
import { site } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import type { ReactElement } from "react";

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

describe("root layout theme script", () => {
  it("test_ac2_mounts_the_script_in_head_before_body_and_suppresses_html_warnings", () => {
    const tree = RootLayout({ children: null }) as ReactElement<{
      lang: string;
      suppressHydrationWarning: boolean;
      children: ReactElement<{ children?: unknown }>[];
    }>;
    expect(tree.type).toBe("html");
    expect(tree.props.lang).toBe("en");
    expect(tree.props.suppressHydrationWarning).toBe(true);

    const [head, body] = tree.props.children;
    expect(head.type).toBe("head");
    expect(body.type).toBe("body");
    const script = head.props.children as ReactElement<{
      dangerouslySetInnerHTML: { __html: string };
    }>;
    expect(script.type).toBe("script");
    expect(script.props.dangerouslySetInnerHTML.__html).toBe(themeScript);
  });

  it("test_ac1_keeps_color_scheme_light_dark", () => {
    expect(viewport.colorScheme).toBe("light dark");
  });
});
