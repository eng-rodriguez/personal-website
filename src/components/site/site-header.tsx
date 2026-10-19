import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { containerClassName } from "./container";
import { SiteNav } from "./site-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div
        className={cn(
          containerClassName,
          "flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4",
        )}
      >
        <Link
          href="/"
          className="inline-flex min-h-10 items-center font-semibold"
        >
          {site.name}
        </Link>
        <SiteNav actions={<ThemeToggle />} />
      </div>
    </header>
  );
}
