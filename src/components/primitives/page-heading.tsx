import { cn } from "@/lib/utils";
import { hasText, requireText } from "./text";

export type PageHeadingProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeading({
  title,
  description,
  className,
}: PageHeadingProps) {
  requireText(title, "PageHeading title");
  return (
    <div data-slot="page-heading" className={cn(className)}>
      <h1 className="text-3xl font-semibold tracking-tight wrap-break-word">
        {title}
      </h1>
      {hasText(description) ? (
        <p className="mt-4 text-muted-foreground wrap-break-word">
          {description}
        </p>
      ) : null}
    </div>
  );
}
