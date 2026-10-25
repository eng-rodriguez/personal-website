import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Link, type LinkHref } from "./link";
import { hasText, requireText } from "./text";

export type CardProps<H extends string> = {
  title: string;
  href?: LinkHref<H>;
  headingLevel?: "h2" | "h3" | "h4";
  description?: string;
  footer?: ReactNode;
  className?: string;
};

export function Card<H extends string>({
  title,
  href,
  headingLevel: Heading = "h3",
  description,
  footer,
  className,
}: CardProps<H>) {
  requireText(title, "Card title");
  return (
    <article
      data-slot="card"
      className={cn(
        "min-w-0 rounded-lg border bg-card p-6 text-card-foreground",
        className,
      )}
    >
      <Heading className="text-base font-semibold wrap-break-word">
        {href !== undefined ? (
          <Link<H>
            href={href}
            className="inline-block max-w-full min-h-6 min-w-6"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </Heading>
      {hasText(description) ? (
        <p className="mt-2 text-sm text-muted-foreground wrap-break-word">
          {description}
        </p>
      ) : null}
      {footer !== null && footer !== undefined && footer !== false ? (
        <div data-slot="card-footer" className="mt-4">
          {footer}
        </div>
      ) : null}
    </article>
  );
}
