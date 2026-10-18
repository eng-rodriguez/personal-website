import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { containerClassName } from "./container";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export const mainContentId = "main-content";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href={"#" + mainContentId}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main
        id={mainContentId}
        tabIndex={-1}
        className={cn(containerClassName, "flex-1 py-16")}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
