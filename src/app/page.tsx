import { Hero } from "@/components/site/hero";
import { site } from "@/lib/site";

export default function Home() {
  return <Hero hero={site.hero} />;
}
