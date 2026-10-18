import type { Metadata } from "next";

export const metadata: Metadata = { title: "Writing" };

export default function WritingPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Writing</h1>
      <p className="mt-4 text-muted-foreground">Articles will appear here.</p>
    </>
  );
}
