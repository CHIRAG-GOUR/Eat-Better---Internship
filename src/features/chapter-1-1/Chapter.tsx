"use client";

import { useCallback, useState } from "react";
import { ChapterBar } from "@/components/chapter/ChapterBar";
import { ProgressRing, type ProgressSection } from "@/components/chapter/ProgressRing";
import { CHAPTER, type CategoryId } from "./content";
import { Hero } from "./sections/Hero";
import { Glance } from "./sections/Glance";
import { WhatIs } from "./sections/WhatIs";
import { StoryVideo } from "./sections/StoryVideo";
import { D2CJourney } from "./sections/D2CJourney";
import { Products } from "./sections/Products";
import { Takeaway } from "./sections/Takeaway";
import { ThinkDiscuss } from "./sections/ThinkDiscuss";
import { Conclusion } from "./sections/Conclusion";

const SECTIONS: ProgressSection[] = [
  { id: "intro", label: "Introduction" },
  { id: "glance", label: "Company at a glance" },
  { id: "what-is", label: "What is Eat Better Co?" },
  { id: "story", label: "The story (video)" },
  { id: "d2c", label: "The internet-first (D2C) model" },
  { id: "products", label: "What Eat Better makes" },
  { id: "takeaway", label: "Key takeaway" },
  { id: "think", label: "Think & Discuss" },
  { id: "wrap-up", label: "Wrap-up" },
];

export default function Chapter() {
  const [focus, setFocus] = useState<CategoryId | null>(null);
  const pick = useCallback((id: CategoryId) => {
    setFocus(null);
    requestAnimationFrame(() => setFocus(id));
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <>
      <a href="#glance" className="sr-only z-50 rounded-lg bg-cocoa px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-20">
        Skip to chapter content
      </a>
      <ChapterBar label={`${CHAPTER.module} · Chapter ${CHAPTER.number} · ${CHAPTER.title}`} />
      <ProgressRing sections={SECTIONS} />
      <main>
        <Hero onPickCategory={pick} />
        <Glance />
        <WhatIs />
        <StoryVideo />
        <D2CJourney />
        <Products focus={focus} />
        <Takeaway />
        <ThinkDiscuss />
        <Conclusion />
      </main>
    </>
  );
}
