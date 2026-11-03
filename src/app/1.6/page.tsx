import type { Metadata } from "next";
import Chapter from "@/features/chapter-1-6/Chapter";

export const metadata: Metadata = {
  title: "1.6 Quality, Packaging & Compliance · Eat Better Co Internship",
  description: "Module 1, Chapter 1.6 — Eat Better's six-layer quality promise, clean-label commitment, FSSAI compliance and packaging, with a 3D quality and packaging facility simulation.",
};

export default function Chapter16Page() {
  return <Chapter />;
}
