import type { Metadata } from "next";
import Chapter from "@/features/chapter-1-4/Chapter";

export const metadata: Metadata = {
  title: "1.4 Problem–Solution Fit · Eat Better Co Internship",
  description: "Module 1, Chapter 1.4 — the consumer problem behind Eat Better's snacks, how its products answer it, and how customer evidence proves fit.",
};

export default function Chapter14Page() {
  return <Chapter />;
}
