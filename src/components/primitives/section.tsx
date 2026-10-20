import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { hasText, requireText } from "./text";

export type SectionProps = {
  title: string;
  headingLevel?: "h2" | "h3" | "h4";
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Section({
  title,
  headingLevel: Heading = "h2",
  description,
  children,
  className,
}: SectionProps) {
  requireText(title, "Section title");
  const headingId = useId();
  return (
    <section
      data-slot="section"
      aria-labelledby={headingId}
      className={cn(className)}
    >
      <Heading
        id={headingId}
        className="text-xl font-semibold tracking-tight wrap-break-word"
      >
        {title}
      </Heading>
      {hasText(description) ? (
        <p className="mt-2 text-muted-foreground wrap-break-word">
          {description}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
