import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type GridProps = {
  columns?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
};

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
} as const satisfies Record<1 | 2 | 3, string>;

export function Grid({ columns = 1, children, className }: GridProps) {
  return (
    <div
      data-slot="grid"
      data-columns={columns}
      className={cn("grid gap-6 *:min-w-0", columnClasses[columns], className)}
    >
      {children}
    </div>
  );
}
