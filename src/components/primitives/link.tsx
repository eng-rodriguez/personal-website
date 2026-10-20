import type * as React from "react";
import NextLink from "next/link";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HrefPattern =
  | `/${string}`
  | `#${string}`
  | `http://${string}`
  | `https://${string}`
  | `mailto:${string}`
  | `tel:${string}`;

/** Resolves to the href itself when allowed, otherwise `never` (a type error). */
export type LinkHref<H extends string> = H extends `//${string}`
  ? never
  : H extends HrefPattern
    ? H
    : never;

export type LinkProps<H extends string> = Omit<
  React.ComponentProps<"a">,
  "href" | "rel" | "target"
> &
  VariantProps<typeof buttonVariants> & { href: LinkHref<H> };

type HrefKind = "internal" | "external" | "plain";

function hrefKind(href: string): HrefKind {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return "external";
  }
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return "plain";
  if (
    href.startsWith("#") ||
    (href.startsWith("/") && !href.startsWith("//"))
  ) {
    return "internal";
  }
  throw new Error("Link href is not allowed: " + href);
}

const defaultStyle =
  "text-primary underline underline-offset-4 decoration-1 hover:decoration-2 wrap-break-word";

export function Link<H extends string>({
  href,
  variant,
  size,
  className,
  ...props
}: LinkProps<H>) {
  const kind = hrefKind(href);
  const styled = variant !== undefined;
  const classes = styled
    ? cn(buttonVariants({ variant, size }), className)
    : cn(defaultStyle, className);
  const common = {
    "data-slot": "link",
    ...(styled ? { "data-variant": variant } : {}),
    className: classes,
    ...props,
  };

  if (kind === "internal") return <NextLink href={href} {...common} />;
  if (kind === "external") {
    return <a href={href} rel="noopener noreferrer" {...common} />;
  }
  return <a href={href} {...common} />;
}
