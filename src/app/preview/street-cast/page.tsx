import type { Metadata } from "next";
import Cast from "./Cast";

export const metadata: Metadata = { title: "Street cast preview · Eat Better Co Internship", robots: { index: false } };

export default function Page() {
  return <Cast />;
}
