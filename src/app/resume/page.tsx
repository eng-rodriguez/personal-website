import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resume" };

export default function ResumePage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Resume</h1>
      <p className="mt-4 text-muted-foreground">The resume will appear here.</p>
    </>
  );
}
