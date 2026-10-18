import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-4 text-muted-foreground">
        Projects and case studies will appear here.
      </p>
    </>
  );
}
