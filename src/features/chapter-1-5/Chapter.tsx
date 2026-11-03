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
import { GLOSSARY_1_5 } from "./glossary";
import { Categories, FamilyYear, Occasions, StudioSection, Think, WrapUp } from "./sections";

const World = dynamic(() => import("./three/World"), { ssr: false, loading: () => null });

const SECTIONS: ProgressSection[] = [
  { id: "intro", label: "Introduction" },
  { id: "categories", label: "Four categories" },
  { id: "occasions", label: "Occasions the portfolio serves" },
  { id: "studio", label: "Activity: Product Innovation Studio" },
  { id: "year", label: "Activity: A family's snacking year" },
  { id: "takeaway", label: "Key takeaway" },
  { id: "think", label: "Think & Discuss" },
  { id: "wrap-up", label: "Wrap-up" },
];

export default function Chapter() {
  return (
    <GlossaryProvider entries={GLOSSARY_1_5}>
      <a href="#categories" className="sr-only z-50 rounded-lg bg-cocoa px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
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
        <Categories />
        <Occasions />
        <StudioSection />
        <FamilyYear />
        <TakeawayMoment
          text={TAKEAWAY}
          emphasise={["three", "habits", "everyday", "festive", "gifting", "family", "year"]}
          steps={[
            { img: "/brand/products/nut-mix-2.webp", label: "Everyday snacking" },
            { img: "/brand/products/diwali-hamper-0.webp", label: "Festive sweets" },
            { img: "/brand/products/laddoo-box-24-0.webp", label: "Gifting" },
          ]}
        />
        <Think />
        <WrapUp />
      </main>
    </GlossaryProvider>
  );
}
