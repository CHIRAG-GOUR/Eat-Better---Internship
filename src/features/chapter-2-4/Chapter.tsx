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
import { GLOSSARY_2_4 } from "./glossary";
import { Activities, Corporate, Festive, Funding, InTheNews, PressSection, SharkTank, WrapUp } from "./sections";

const World = dynamic(() => import("./three/World"), { ssr: false, loading: () => null });

const SECTIONS: ProgressSection[] = [
  { id: "intro", label: "Introduction" },
  { id: "news", label: "In the news" },
  { id: "shark-tank", label: "The Shark Tank India advantage" },
  { id: "funding", label: "Fundraising as earned PR" },
  { id: "festive", label: "Seasonal campaigns" },
  { id: "corporate", label: "Corporate gifting & social proof" },
  { id: "press", label: "On-site press validation" },
  { id: "activities", label: "Activities" },
  { id: "takeaway", label: "Key takeaway" },
  { id: "wrap-up", label: "Wrap-up" },
];

export default function Chapter() {
  return (
    <GlossaryProvider entries={GLOSSARY_2_4}>
      <a href="#news" className="sr-only z-50 rounded-lg bg-cocoa px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to chapter content
      </a>
      <WorldShell scrim>
        <World />
      </WorldShell>
      <ChapterNotes chapterNumber={CHAPTER.number} chapterTitle={CHAPTER.title} />
      <FullscreenToggle />
      <LaddooRing sections={SECTIONS} />
      <main className="pointer-events-none relative z-10">
        <ChapterOpener module={CHAPTER.module} number={CHAPTER.number} title={CHAPTER.title} subtitle={CHAPTER.subtitle} objective={CHAPTER.objective} />
        <InTheNews />
        <SharkTank />
        <Funding />
        <Festive />
        <Corporate />
        <PressSection />
        <Activities />
        <TakeawayMoment
          text={TAKEAWAY}
          emphasise={["earned", "story", "transparent", "standards", "unit", "economics", "amplify"]}
          steps={[
            { img: "/chapter-1-3/home-kitchen.webp", label: "A compelling brand story" },
            { img: "/chapter-1-2/better-ingredients.webp", label: "Transparent product standards" },
            { img: "/chapter-2-4/lms-3.png", label: "Media amplifies it" },
          ]}
        />
        <WrapUp />
      </main>
    </GlossaryProvider>
  );
}
