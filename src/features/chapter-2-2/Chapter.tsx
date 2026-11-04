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
import { GLOSSARY_2_2 } from "./glossary";
import { Community, DeskSection, Markets, Offers, Owned, Reviews, Social, Story, Think, WrapUp } from "./sections";

const World = dynamic(() => import("./three/World"), { ssr: false, loading: () => null });

const SECTIONS: ProgressSection[] = [
  { id: "intro", label: "Introduction" },
  { id: "community", label: "Community-first marketing" },
  { id: "owned", label: "Owned digital channels" },
  { id: "social", label: "Social media marketing" },
  { id: "story", label: "Storytelling & transparency" },
  { id: "reviews", label: "Reviews & ratings" },
  { id: "offers", label: "Offers & conversion" },
  { id: "markets", label: "Marketplaces & quick commerce" },
  { id: "growth-desk", label: "Activity: D2C Growth Desk" },
  { id: "takeaway", label: "Key takeaway" },
  { id: "think", label: "Think & Discuss" },
  { id: "wrap-up", label: "Wrap-up" },
];

export default function Chapter() {
  return (
    <GlossaryProvider entries={GLOSSARY_2_2}>
      <a href="#community" className="sr-only z-50 rounded-lg bg-cocoa px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
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
        <Community />
        <Owned />
        <Social />
        <Story />
        <Reviews />
        <Offers />
        <Markets />
        <DeskSection />
        <TakeawayMoment
          text={TAKEAWAY}
          emphasise={["stories", "reviews", "community", "first", "second"]}
          steps={[
            { img: "/chapter-2-2/video/home-kitchen-to-factory-poster.jpg", label: "Stories" },
            { img: "/chapter-1-3/exhibition-stall.webp", label: "Community" },
            { img: "/chapter-1-2/quick-delivery.webp", label: "A great first order" },
          ]}
        />
        <Think />
        <WrapUp />
      </main>
    </GlossaryProvider>
  );
}
