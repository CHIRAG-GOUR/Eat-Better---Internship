import type { Metadata } from "next";
import StudioLoader from "./StudioLoader";

export const metadata: Metadata = {
  title: "Packaging Design Studio · Eat Better Co × SkilliZee",
  description: "Real-time 3D packaging design prototype.",
};

export default function StudioPage() {
  return <StudioLoader />;
}
