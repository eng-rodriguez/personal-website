import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto max-w-prose px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{site.name}</h1>
      <p className="mt-4 text-muted-foreground">{site.description}</p>
    </main>
  );
}
