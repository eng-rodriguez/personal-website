import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { containerClassName } from "./container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className={cn(containerClassName, "py-8")}>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
