import type { Metadata } from "next";
import WorldPreview from "./WorldPreview";

export const metadata: Metadata = {
  title: "Module 2 world preview · Eat Better Co Internship",
  description: "Preview the Module 2 3D world, Brand Boulevard, at each chapter's time of day.",
  robots: { index: false },
};

export default function Page() {
  return <WorldPreview />;
}
