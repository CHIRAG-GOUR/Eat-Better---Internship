import type { Metadata } from "next";
import Chapter from "@/features/chapter-1-2/Chapter";

export const metadata: Metadata = {
  title: "1.2 Vision, Mission & Values · Eat Better Co Internship",
  description: "Module 1, Chapter 1.2 — Eat Better's vision, mission and values, and how a vision guides everyday decisions.",
};

export default function Chapter12Page() {
  return <Chapter />;
}
