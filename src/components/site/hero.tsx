import { Link } from "@/components/primitives/link";
import { PageHeading } from "@/components/primitives/page-heading";
import { heroProblems, type HeroConfig } from "@/lib/hero";
import { cn } from "@/lib/utils";

export type HeroProps = { hero: HeroConfig; className?: string };

export function Hero({ hero, className }: HeroProps) {
  const problems = heroProblems(hero);
  if (problems.length > 0) {
    throw new Error("Invalid hero config: " + problems.join("; "));
  }
  const [primary, secondary] = hero.ctas;
  const portrait = hero.portrait;

  return (
    <div
      data-slot="hero"
      className={cn(
        "flex flex-col gap-8 sm:flex-row sm:items-start",
        className,
      )}
    >
      <div data-slot="hero-text" className="min-w-0 flex-1">
        <PageHeading title={hero.name} description={hero.role} />
        <p data-slot="hero-statement" className="mt-6 text-lg wrap-break-word">
          {hero.statement}
        </p>
        <div data-slot="hero-ctas" className="mt-8 flex flex-wrap gap-3">
          <Link
            href={primary.href}
            variant="default"
            size="lg"
            className="border border-transparent"
          >
            {primary.label}
          </Link>
          <Link href={secondary.href} variant="outline" size="lg">
            {secondary.label}
          </Link>
        </div>
      </div>
      {portrait ? (
        // eslint-disable-next-line @next/next/no-img-element -- no image asset or next/image config ships (HOME-002 A12)
        <img
          data-slot="hero-portrait"
          src={portrait.src}
          alt={portrait.alt}
          width={portrait.width}
          height={portrait.height}
          className="h-auto w-32 max-w-full shrink-0 rounded-lg sm:w-40"
        />
      ) : null}
    </div>
  );
}
