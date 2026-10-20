import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { requireText } from "./text";

export type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  headingLevel: Heading = "h2",
  className,
}: EmptyStateProps) {
  requireText(title, "EmptyState title");
  requireText(description, "EmptyState description");
  return (
    <div
      data-slot="empty-state"
      className={cn("rounded-lg border border-dashed p-6", className)}
    >
      <Heading className="text-lg font-semibold wrap-break-word">
        {title}
      </Heading>
      <p className="mt-2 text-muted-foreground wrap-break-word">
        {description}
      </p>
      {action !== null && action !== undefined && action !== false ? (
        <div data-slot="empty-state-action" className="mt-4">
          {action}
        </div>
      ) : null}
    </div>
  );
}
