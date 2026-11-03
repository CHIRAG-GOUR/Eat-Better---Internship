import type { Metadata } from "next";
import Chapter from "@/features/chapter-1-5/Chapter";

export const metadata: Metadata = {
  title: "1.5 The Product Portfolio · Eat Better Co Internship",
  description: "Module 1, Chapter 1.5 — Eat Better's laddoos, namkeens, nut mixes and gift boxes, the occasions they serve, and a product innovation studio.",
};

export default function Chapter15Page() {
  return <Chapter />;
}
