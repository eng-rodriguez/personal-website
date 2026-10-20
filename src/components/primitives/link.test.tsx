import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "./link";

const nextLink = vi.hoisted(() => vi.fn());

vi.mock("next/link", () => ({
  default: (props: ComponentProps<"a">) => {
    nextLink(props);
    return <a data-next-link {...props} />;
  },
}));

beforeEach(() => nextLink.mockClear());

describe("Link", () => {
  it.each(["/writing", "/", "#main-content"] as const)(
    "test_ac6_internal %s uses next/link without rel or target",
    (href) => {
      render(<Link href={href}>Go</Link>);
      const a = screen.getByRole("link", { name: "Go" });
      expect(nextLink).toHaveBeenCalledWith(expect.objectContaining({ href }));
      expect(a).toHaveAttribute("href", href);
      expect(a).not.toHaveAttribute("rel");
      expect(a).not.toHaveAttribute("target");
    },
  );

  it.each(["https://example.com/a", "http://example.com"] as const)(
    "test_ac6_external %s is a plain anchor with rel",
    (href) => {
      render(<Link href={href}>Go</Link>);
      const a = screen.getByRole("link", { name: "Go" });
      expect(nextLink).not.toHaveBeenCalled();
      expect(a).toHaveAttribute("rel", "noopener noreferrer");
      expect(a).not.toHaveAttribute("target");
    },
  );

  it.each(["mailto:someone@example.com", "tel:+15550100"] as const)(
    "test_ac6_plain %s has no rel or target",
    (href) => {
      render(<Link href={href}>Go</Link>);
      const a = screen.getByRole("link", { name: "Go" });
      expect(nextLink).not.toHaveBeenCalled();
      expect(a).toHaveAttribute("href", href);
      expect(a).not.toHaveAttribute("rel");
      expect(a).not.toHaveAttribute("target");
    },
  );

  it.each([
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "/a\nb",
    "/a\u0000b",
    "/a b",
    "javascript:alert(1)",
    "JAVASCRIPT:alert(1)",
    " javascript:alert(1)",
    "data:text/html,x",
    "vbscript:x",
    "",
  ])("test_ac6_runtime_guard_throws_for_%j", (href) => {
    expect(() => render(<Link href={href as never}>x</Link>)).toThrow(
      "Link href is not allowed",
    );
  });

  it.each(["/a", "https://example.com/a", "mailto:a@b.c"] as const)(
    "test_ac6_untyped_spread_cannot_override_fixed_attributes %s",
    (href) => {
      const smuggled = {
        rel: "opener",
        target: "_blank",
        "data-slot": "x",
        "data-variant": "y",
      };
      render(
        <Link href={href} {...smuggled}>
          Go
        </Link>,
      );
      const a = screen.getByRole("link");
      expect(a).not.toHaveAttribute("target");
      expect(a).not.toHaveAttribute("data-variant");
      expect(a).toHaveAttribute("data-slot", "link");
      if (href.startsWith("https")) {
        expect(a).toHaveAttribute("rel", "noopener noreferrer");
      } else {
        expect(a).not.toHaveAttribute("rel");
      }
    },
  );

  it("test_ac6_null_variant_is_unstyled", () => {
    render(
      <Link href="/" variant={null}>
        Go
      </Link>,
    );
    const a = screen.getByRole("link");
    expect(a).toHaveClass("text-primary", "underline");
    expect(a).not.toHaveAttribute("data-variant");
  });

  it("test_ac10_default_style_is_underlined_without_focus_overrides", () => {
    render(<Link href="/">Go</Link>);
    const a = screen.getByRole("link");
    expect(a).toHaveClass("text-primary", "underline");
    expect(a.className).not.toContain("outline-none");
    expect(a.className).not.toMatch(/(^|\s)focus:/);
    expect(a.className).not.toContain("dark:");
  });

  describe.each([
    "default",
    "destructive",
    "outline",
    "secondary",
    "ghost",
    "link",
  ] as const)("variant %s", (variant) => {
    it("test_ac6_carries_the_buttonVariants_classes", () => {
      render(
        <Link href="/" variant={variant}>
          Go
        </Link>,
      );
      const a = screen.getByRole("link");
      for (const cls of buttonVariants({ variant }).split(" ")) {
        expect(a).toHaveClass(cls);
      }
      expect(a).toHaveClass(
        "focus-visible:outline-2",
        "focus-visible:outline-offset-2",
        "focus-visible:outline-ring",
      );
      expect(a).toHaveAttribute("data-variant", variant);
      expect(a.className).not.toContain("dark:");
      expect(a.className).not.toContain("outline-none");
      expect(a.className).not.toMatch(/(^|\s)focus:/);
    });
  });

  it("test_ac6_size_lg_adds_its_height", () => {
    render(
      <Link href="/" variant="default" size="lg">
        Go
      </Link>,
    );
    expect(screen.getByRole("link")).toHaveClass("h-10");
  });

  it("test_ac6_href_policy_is_enforced_by_the_type", () => {
    const someString: string = "/x";
    const slug: string = "a";
    // Compile-time checks only: the elements are created, not rendered.
    void [
      <Link key="ok" href={`/writing/${slug}`}>
        x
      </Link>,
      // @ts-expect-error empty href is rejected
      <Link key="1" href="">
        x
      </Link>,
      // @ts-expect-error protocol-relative href is rejected
      <Link key="2" href="//example.com">
        x
      </Link>,
      // @ts-expect-error backslash after the slash is rejected
      <Link key="2b" href="/\\evil.example">
        x
      </Link>,
      // @ts-expect-error script scheme is rejected
      <Link key="3" href="javascript:alert(1)">
        x
      </Link>,
      // @ts-expect-error other schemes are rejected
      <Link key="4" href="ftp://example.com">
        x
      </Link>,
      // @ts-expect-error a bare host is rejected
      <Link key="5" href="example.com">
        x
      </Link>,
      // @ts-expect-error an untyped string is rejected
      <Link key="6" href={someString}>
        x
      </Link>,
      // @ts-expect-error rel is not a caller prop
      <Link key="7" href="/" rel="opener">
        x
      </Link>,
      // @ts-expect-error target is not a caller prop
      <Link key="8" href="/" target="_blank">
        x
      </Link>,
    ];
    expect(someString).toBe("/x");
  });
});
