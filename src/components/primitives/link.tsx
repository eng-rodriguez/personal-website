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
export type LinkHref<H extends string> = H extends
  `//${string}` | `/\\${string}`
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

// Browsers drop tab/CR/LF and treat "\\" as "/", so these never reach a safe path.
const unsafeChars = /[\u0000-\u0020\u007f-\u009f]/;

function hrefKind(href: string): HrefKind {
  if (unsafeChars.test(href)) {
    throw new Error("Link href is not allowed: " + JSON.stringify(href));
  }
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return "external";
  }
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return "plain";
  if (
    href.startsWith("#") ||
    (href.startsWith("/") && href[1] !== "/" && href[1] !== "\\")
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
  const styled = variant !== undefined && variant !== null;
  const classes = styled
    ? cn(buttonVariants({ variant, size }), className)
    : cn(defaultStyle, className);
  // rel and target are not caller props; discard them even when an untyped
  // spread smuggles them in. Fixed attributes come after the spread.
  const rest: Record<string, unknown> = { ...props };
  delete rest.rel;
  delete rest.target;
  const fixed = {
    "data-slot": "link",
    ...(styled ? { "data-variant": variant } : {}),
    className: classes,
  };
  if (!styled) delete rest["data-variant"];

  if (kind === "internal") return <NextLink {...rest} href={href} {...fixed} />;
  if (kind === "external") {
    return <a {...rest} href={href} {...fixed} rel="noopener noreferrer" />;
  }
  return <a {...rest} href={href} {...fixed} />;
}
