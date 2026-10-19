import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteFooter } from "@/components/site/site-footer";
import { site } from "@/lib/site";

afterEach(() => {
  vi.useRealTimers();
});

describe("SiteFooter", () => {
  it("test_ac8_shows_year_and_site_name_without_contact_details", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2031-06-01T12:00:00Z"));

    const { container } = render(<SiteFooter />);
    const text = container.textContent ?? "";

    expect(text).toContain("© 2031");
    expect(text).toContain(site.name);
    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(text).not.toMatch(/@/);
    expect(text).not.toMatch(/\+?\d[\d\s().-]{6,}\d/);
  });
});
