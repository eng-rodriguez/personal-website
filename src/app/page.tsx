import { site } from "@/lib/site";

export default function Home() {
  return (
    <main>
      <h1>{site.name}</h1>
      <p>{site.description}</p>
    </main>
  );
}
