import type { Metadata } from "next";
import Chapter from "@/features/chapter-3-1/Chapter";

export const metadata: Metadata = {
  title: "3.1 Customer Segments, Value Propositions, Channels & Customer Relationships · Eat Better Co Internship",
  description: "Module 3, Chapter 3.1 — who Eat Better serves, what it promises, how it reaches customers and how it keeps them.",
};

export default function Chapter31Page() {
  return <Chapter />;
}
