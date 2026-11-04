"use client";

import dynamic from "next/dynamic";
import { FullscreenToggle } from "@/components/chapter/FullscreenToggle";
import { ChapterNotes } from "@/components/chapter/ChapterNotes";
import { LaddooRing, type ProgressSection } from "@/components/chapter/LaddooRing";
import { ChapterOpener } from "@/components/chapter/ChapterOpener";
import { GlossaryProvider } from "@/components/chapter/Glossary";
import { WorldShell } from "@/components/world/WorldShell";
import { CHAPTER } from "./content";
import { GLOSSARY_2_1 } from "./glossary";
import { ColourSection, IdentityMap, LabSection, LookSection, NameSection, PackSection, PerceptionSection, Reflect, ToneSection, WrapUp } from "./sections";

const World = dynamic(() => import("./three/World"), { ssr: false, loading: () => null });

const SECTIONS: ProgressSection[] = [
  { id: "intro", label: "Introduction" },
  { id: "identity", label: "Six parts of an identity" },
  { id: "name", label: "Lab: Brand name" },
  { id: "look", label: "Lab: Logo & visual identity" },
  { id: "colour", label: "Lab: Colour psychology" },
  { id: "pack", label: "Lab: Packaging design" },
  { id: "tone", label: "Lab: Communication & tone" },
  { id: "perception", label: "Lab: Consumer perception" },
  { id: "lab", label: "Capstone: Brand Identity Lab" },
  { id: "reflect", label: "Activity: Reflect" },
  { id: "wrap-up", label: "Wrap-up" },
];

export default function Chapter() {
  return (
    <GlossaryProvider entries={GLOSSARY_2_1}>
      <a href="#identity" className="sr-only z-50 rounded-lg bg-cocoa px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
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
        <IdentityMap />
        <NameSection />
        <LookSection />
        <ColourSection />
        <PackSection />
        <ToneSection />
        <PerceptionSection />
        <LabSection />
        <Reflect />
        <WrapUp />
      </main>
    </GlossaryProvider>
  );
}
