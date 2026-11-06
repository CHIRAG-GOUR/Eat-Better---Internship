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
import { GLOSSARY_3_2 } from "./glossary";
import { Activities, CanvasOverview, KeyActivities, Partners, Resources, Think, WrapUp } from "./sections";

const World = dynamic(() => import("./three/World"), { ssr: false, loading: () => null });

const SECTIONS: ProgressSection[] = [
  { id: "intro", label: "Introduction" },
  { id: "canvas", label: "The canvas" },
  { id: "resources", label: "Key Resources" },
  { id: "key-activities", label: "Key Activities" },
  { id: "partners", label: "Key Partners" },
  { id: "think", label: "Think & discuss" },
  { id: "activities", label: "Activities" },
  { id: "takeaway", label: "Key takeaway" },
  { id: "wrap-up", label: "Wrap-up" },
];

export default function Chapter() {
  return (
    <GlossaryProvider entries={GLOSSARY_3_2}>
      <a href="#canvas" className="sr-only z-50 rounded-lg bg-cocoa px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
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
        <CanvasOverview />
        <Resources />
        <KeyActivities />
        <Partners />
        <Think />
        <Activities />
        <TakeawayMoment
          text={TAKEAWAY}
          emphasise={["middle", "right", "good", "side"]}
          steps={[
            { img: "/chapter-3-2/takeaway-clean-facility.webp", label: "What it needs" },
            { img: "/chapter-3-2/takeaway-craftsmanship.webp", label: "What it must be good at" },
            { img: "/chapter-3-2/corporate-box.webp", label: "Who it needs on its side" },
          ]}
        />
        <WrapUp />
      </main>
    </GlossaryProvider>
  );
}
