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
import { GLOSSARY_1_6 } from "./glossary";
import { BrandBadges, CleanLabel, Compliance, FacilitySection, Packaging, Promise, ReportSection, Think, WrapUp } from "./sections";

const World = dynamic(() => import("./three/World"), { ssr: false, loading: () => null });

const SECTIONS: ProgressSection[] = [
  { id: "intro", label: "Introduction" },
  { id: "badges", label: "Eat Better's quality promise" },
  { id: "promise", label: "Six checkpoints" },
  { id: "facility", label: "Simulation: Quality & Packaging Facility" },
  { id: "qa-report", label: "Quality Assurance Report" },
  { id: "clean-label", label: "Clean label strategy" },
  { id: "compliance", label: "Compliance & certifications" },
  { id: "packaging", label: "Packaging strategy" },
  { id: "takeaway", label: "Key takeaway" },
  { id: "think", label: "Think & Discuss" },
  { id: "wrap-up", label: "Wrap-up" },
];

export default function Chapter() {
  return (
    <GlossaryProvider entries={GLOSSARY_1_6}>
      <a href="#badges" className="sr-only z-50 rounded-lg bg-cocoa px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
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
        <BrandBadges />
        <Promise />
        <FacilitySection />
        <ReportSection />
        <CleanLabel />
        <Compliance />
        <Packaging />
        <TakeawayMoment
          text={TAKEAWAY}
          emphasise={["trust", "quality", "labels", "packaging", "earned"]}
          steps={[
            { img: "/chapter-1-6/frames/roasting.webp", label: "Quality checks" },
            { img: "/brand/products/hazelnut-laddoo-0.webp", label: "Clear labels" },
            { img: "/chapter-1-6/frames/sealed-boxes.webp", label: "Fresh packaging" },
          ]}
        />
        <Think />
        <WrapUp />
      </main>
    </GlossaryProvider>
  );
}
