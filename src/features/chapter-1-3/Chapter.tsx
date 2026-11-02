"use client";

import dynamic from "next/dynamic";
import { FullscreenToggle } from "@/components/chapter/FullscreenToggle";
import { LaddooRing, type ProgressSection } from "@/components/chapter/LaddooRing";
import { ChapterOpener } from "@/components/chapter/ChapterOpener";
import { TakeawayMoment } from "@/components/chapter/TakeawayMoment";
import { GlossaryProvider } from "@/components/chapter/Glossary";
import { WorldShell } from "@/components/world/WorldShell";
import { CHAPTER, TAKEAWAY } from "./content";
import { GLOSSARY_1_3 } from "./glossary";
import { Exhibitions, Leaders, National, Roles, Story, Think, Timeline, WrapUp } from "./sections";

const World = dynamic(() => import("./three/World"), { ssr: false, loading: () => null });

const SECTIONS: ProgressSection[] = [
  { id: "intro", label: "Introduction" },
  { id: "story", label: "Where it all began" },
  { id: "exhibitions", label: "Exhibitions & direct selling" },
  { id: "national", label: "Going national" },
  { id: "leaders", label: "The leadership team" },
  { id: "roles", label: "How roles evolved" },
  { id: "timeline", label: "Journey timeline" },
  { id: "takeaway", label: "Key takeaway" },
  { id: "think", label: "Think & Discuss" },
  { id: "wrap-up", label: "Wrap-up" },
];

export default function Chapter() {
  return (
    <GlossaryProvider entries={GLOSSARY_1_3}>
      <a href="#story" className="sr-only z-50 rounded-lg bg-cocoa px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to chapter content
      </a>
      <WorldShell>
        <World />
      </WorldShell>
      <FullscreenToggle />
      <LaddooRing sections={SECTIONS} />
      <main className="pointer-events-none relative z-10">
        <ChapterOpener module={CHAPTER.module} number={CHAPTER.number} title={CHAPTER.title} subtitle={CHAPTER.subtitle} objective={CHAPTER.objective} />
        <Story />
        <Exhibitions />
        <National />
        <Leaders />
        <Roles />
        <Timeline />
        <TakeawayMoment
          text={TAKEAWAY}
          emphasise={["family", "problem", "real", "customers", "step"]}
          steps={[
            { img: "/chapter-1-3/home-kitchen.webp", label: "A real family problem" },
            { img: "/chapter-1-3/exhibition-stall.webp", label: "Tested with real customers" },
            { img: "/chapter-1-3/frames/warehouse.webp", label: "Scaled step by step" },
          ]}
        />
        <Think />
        <WrapUp />
      </main>
    </GlossaryProvider>
  );
}
