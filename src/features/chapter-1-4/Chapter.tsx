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
import { GLOSSARY_1_4 } from "./glossary";
import { ExpeditionSection, FitTable, Market, Signals, Think, WhatIsFit, WrapUp } from "./sections";

const World = dynamic(() => import("./three/World"), { ssr: false, loading: () => null });

const SECTIONS: ProgressSection[] = [
  { id: "intro", label: "Introduction" },
  { id: "fit", label: "What is problem–solution fit?" },
  { id: "market", label: "The problem and the answer" },
  { id: "expedition", label: "Activity: Consumer Insight Expedition" },
  { id: "table", label: "The fit, at a glance" },
  { id: "signals", label: "Activity: Is it fit?" },
  { id: "takeaway", label: "Key takeaway" },
  { id: "think", label: "Think & Discuss" },
  { id: "wrap-up", label: "Wrap-up" },
];

export default function Chapter() {
  return (
    <GlossaryProvider entries={GLOSSARY_1_4}>
      <a href="#fit" className="sr-only z-50 rounded-lg bg-cocoa px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
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
        <WhatIsFit />
        <Market />
        <ExpeditionSection />
        <FitTable />
        <Signals />
        <TakeawayMoment
          text={TAKEAWAY}
          emphasise={["repeat", "customers", "advertising", "reviews", "signals"]}
          steps={[
            { img: "/chapter-1-1/art/balance.webp", label: "A recurring problem" },
            { img: "/chapter-1-4/frames/natural-laddoos.webp", label: "A product that solves it" },
            { img: "/chapter-1-2/frames/shipping-box.webp", label: "Customers who come back" },
          ]}
        />
        <Think />
        <WrapUp />
      </main>
    </GlossaryProvider>
  );
}
