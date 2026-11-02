import type { Metadata } from "next";
import Chapter from "@/features/chapter-1-3/Chapter";

export const metadata: Metadata = {
  title: "1.3 Origin Story & Founders · Eat Better Co Internship",
  description: "Module 1, Chapter 1.3 — how a family kitchen in Jaipur became a national snack brand, the founders, and how their roles evolved.",
};

export default function Chapter13Page() {
  return <Chapter />;
}
