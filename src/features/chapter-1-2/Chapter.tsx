"use client";

import dynamic from "next/dynamic";
import { FullscreenToggle } from "@/components/chapter/FullscreenToggle";
import { ChapterNotes } from "@/components/chapter/ChapterNotes";
import { LaddooRing, type ProgressSection } from "@/components/chapter/LaddooRing";
import { ChapterOpener } from "@/components/chapter/ChapterOpener";
import { TakeawayMoment } from "@/components/chapter/TakeawayMoment";
import { GlossaryProvider } from "@/components/chapter/Glossary";
import { WorldShell } from "@/components/world/WorldShell";
import { CHAPTER, TAKEAWAY } from "./content";
import { GLOSSARY_1_2 } from "./glossary";
import { Direction, Identity, Offerings, Practices, Think, Values, WrapUp } from "./sections";

const World = dynamic(() => import("./three/World"), { ssr: false, loading: () => null });

const SECTIONS: ProgressSection[] = [
  { id: "intro", label: "Introduction" },
  { id: "identity", label: "Brand identity & philosophy" },
  { id: "direction", label: "Vision & mission" },
  { id: "values", label: "Core values" },
  { id: "practices", label: "Turning the vision into decisions" },
  { id: "offerings", label: "Products & distribution" },
  { id: "takeaway", label: "Key takeaway" },
  { id: "think", label: "Think & Discuss" },
  { id: "wrap-up", label: "Wrap-up" },
];

export default function Chapter() {
  return (
    <GlossaryProvider entries={GLOSSARY_1_2}>
      <a href="#identity" className="sr-only z-50 rounded-lg bg-cocoa px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to chapter content
      </a>
      <WorldShell>
        <World />
      </WorldShell>
      <ChapterNotes chapterNumber={CHAPTER.number} chapterTitle={CHAPTER.title} />
      <FullscreenToggle />
      <LaddooRing sections={SECTIONS} />
      <main className="pointer-events-none relative z-10">
        <ChapterOpener module={CHAPTER.module} number={CHAPTER.number} title={CHAPTER.title} subtitle={CHAPTER.subtitle} objective={CHAPTER.objective} />
        <Identity />
        <Direction />
        <Values />
        <Practices />
        <Offerings />
        <TakeawayMoment
          text={TAKEAWAY}
          emphasise={["filter", "tasty", "better", "no"]}
          steps={[
            { img: "/chapter-1-2/better-ingredients.webp", label: "A decision" },
            { img: "/chapter-1-1/art/balance.webp", label: "Tasty and better for you?" },
            { img: "/chapter-1-2/frames/shipping-box.webp", label: "Only then: yes" },
          ]}
        />
        <Think />
        <WrapUp />
      </main>
    </GlossaryProvider>
  );
}
