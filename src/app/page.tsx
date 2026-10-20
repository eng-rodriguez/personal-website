import { PageHeading } from "@/components/primitives/page-heading";
import { site } from "@/lib/site";

export default function Home() {
  return <PageHeading title={site.name} description={site.description} />;
}
