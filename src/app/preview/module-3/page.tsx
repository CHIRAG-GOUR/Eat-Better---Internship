import type { Metadata } from "next";
import WorldPreview from "./WorldPreview";

export const metadata: Metadata = {
  title: "Module 3 world preview · Eat Better Co Internship",
  description: "Preview the Module 3 3D world, Value Chain Valley, for each chapter.",
  robots: { index: false },
};

export default function Page() {
  return <WorldPreview />;
}
