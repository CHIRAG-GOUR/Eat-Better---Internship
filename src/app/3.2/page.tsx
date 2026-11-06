import type { Metadata } from "next";
import Chapter from "@/features/chapter-3-2/Chapter";

export const metadata: Metadata = {
  title: "3.2 Key Resources, Key Activities & Key Partners · Eat Better Co Internship",
  description: "Module 3, Chapter 3.2 — what Eat Better needs, does and depends on to deliver its promise.",
};

export default function Chapter32Page() {
  return <Chapter />;
}
