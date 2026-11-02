import type { Metadata } from "next";
import Chapter from "@/features/chapter-1-1/Chapter";

export const metadata: Metadata = {
  title: "1.1 About the Company · Eat Better Co Internship",
  description: "Module 1, Chapter 1.1 — the story of Eat Better Co, what it makes, and how its internet-first (D2C) model works.",
};

export default function Chapter11Page() {
  return <Chapter />;
}
