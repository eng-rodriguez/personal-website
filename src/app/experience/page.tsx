import type { Metadata } from "next";

export const metadata: Metadata = { title: "Experience" };

export default function ExperiencePage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Experience</h1>
      <p className="mt-4 text-muted-foreground">
        Professional experience will appear here.
      </p>
    </>
  );
}
