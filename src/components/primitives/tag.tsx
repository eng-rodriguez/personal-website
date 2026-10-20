import { cn } from "@/lib/utils";
import { requireText } from "./text";

export type TagProps = {
  children: string;
  className?: string;
};

export function Tag({ children, className }: TagProps) {
  requireText(children, "Tag text");
  return (
    <span
      data-slot="tag"
      className={cn(
        "inline-flex max-w-full items-center rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground wrap-break-word",
        className,
      )}
    >
      {children}
    </span>
  );
}
