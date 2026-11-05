import type { Metadata } from "next";
import Chapter from "@/features/chapter-2-3/Chapter";

export const metadata: Metadata = {
  title: "2.3 Positioning & Target Audience · Eat Better Co Internship",
  description: "Module 2, Chapter 2.3 — how Eat Better differentiates itself, who it is for, and why customers choose it.",
};

export default function Chapter23Page() {
  return <Chapter />;
}
