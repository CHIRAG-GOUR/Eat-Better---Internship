import type { Metadata } from "next";
import Chapter from "@/features/chapter-2-1/Chapter";

export const metadata: Metadata = {
  title: "2.1 Brand Identity — Visuals & Tone · Eat Better Co Internship",
  description: "Module 2, Chapter 2.1 — how Eat Better's name, logo, colours, packaging and tone shape its brand identity.",
};

export default function Chapter21Page() {
  return <Chapter />;
}
