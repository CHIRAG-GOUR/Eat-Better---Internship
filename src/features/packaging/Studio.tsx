"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Maximize, Minimize, Redo2, RotateCcw, Undo2 } from "lucide-react";
import { useStudio } from "./store";
import { useArtwork } from "./useArtwork";
import { evaluateBrief } from "./checks";
import { drawPackArtwork, frontThumbnail } from "./art/drawArtwork";
import { StudioScene } from "./three/StudioScene";
import { ControlPanel } from "./ui/ControlPanel";
import { BriefPanel } from "./ui/BriefPanel";
import { FlatView, ReferenceCard, ShelfHint, ViewBar } from "./ui/ViewportOverlays";
import { CelebrateOverlay, IntroOverlay } from "./ui/Overlays";
import { exportConceptCard } from "./export";
import type { PackDesign } from "./types";

function cleanThumb(design: PackDesign) {
  const c = document.createElement("canvas");
  const { atlas } = drawPackArtwork(c, design);
  return frontThumbnail(c, atlas.front, 260);
}

function useFullscreen() {
  const [fs, setFs] = useState(false);
  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const toggle = useCallback(() => {
    if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.().catch(() => undefined);
    else void document.exitFullscreen?.();
  }, []);
  const supported = typeof document !== "undefined" && !!document.fullscreenEnabled;
  return { fs, toggle, supported };
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const s = useStudio.getState();
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        s.redo();
        return;
      }
      if (e.key === "Escape") {
        if (s.celebrateOpen) s.closeCelebrate();
        else s.select(null);
        return;
      }
      const sel = s.design.elements.find((x) => x.id === s.selectedId);
      if (!sel) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        s.removeElement(sel.id);
        return;
      }
      const step = e.shiftKey ? 0.05 : 0.01;
      const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      const m = moves[e.key];
      if (m) {
        e.preventDefault();
        s.patchElement(sel.id, { x: sel.x + m[0], y: sel.y + m[1] });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export default function Studio() {
  const design = useStudio((s) => s.design);
  const selectedId = useStudio((s) => s.selectedId);
  const canUndo = useStudio((s) => s.past.length > 0);
  const canRedo = useStudio((s) => s.future.length > 0);
  const introSeen = useStudio((s) => s.introSeen);
  const celebrated = useStudio((s) => s.celebrated);
  const { undo, redo, resetDesign, saveSnapshot, markCelebrated } = useStudio.getState();
  const art = useArtwork(design, selectedId);
  const { fs, toggle, supported } = useFullscreen();
  const [celebrateThumb, setCelebrateThumb] = useState<string | null>(null);
  useShortcuts();

  const checks = useMemo(() => (art.metrics ? evaluateBrief(design, art.metrics) : []), [design, art.metrics]);
  const allPass = checks.length > 0 && checks.every((c) => c.pass);
  const legible = checks.find((c) => c.id === "legibility")?.pass ?? false;

  useEffect(() => {
    if (allPass && introSeen && !celebrated) {
      const t = setTimeout(() => {
        setCelebrateThumb(cleanThumb(useStudio.getState().design));
        markCelebrated();
      }, 650);
      return () => clearTimeout(t);
    }
  }, [allPass, introSeen, celebrated, markCelebrated]);

  const onSave = useCallback(() => saveSnapshot(cleanThumb(useStudio.getState().design)), [saveSnapshot]);
  const onExport = useCallback(() => void exportConceptCard(useStudio.getState().design, checks), [checks]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#F4E6DA]">
      {/* top bar */}
      <header className="z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-cream px-3 sm:px-5">
        <Image src="/brand/eat-better-logo.svg" alt="Eat Better Co" width={66} height={32} priority className="h-8 w-auto" />
        <span className="hidden h-7 w-px bg-line-strong sm:block" />
        <div className="min-w-0 flex-1">
          <div className="hidden text-[0.78rem] font-bold uppercase tracking-[0.16em] text-orange sm:block">SkilliZee internship · prototype</div>
          <h1 className="truncate font-display text-[1.15rem] font-semibold leading-tight text-cocoa sm:text-[1.3rem]">Packaging Design Studio</h1>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
            <Undo2 className="size-5" />
          </IconBtn>
          <IconBtn label="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo}>
            <Redo2 className="size-5" />
          </IconBtn>
          <IconBtn label="Start over" onClick={resetDesign}>
            <RotateCcw className="size-5" />
          </IconBtn>
          {supported && (
            <IconBtn label={fs ? "Exit fullscreen" : "Fullscreen"} onClick={toggle}>
              {fs ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
            </IconBtn>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)]">
        {/* viewport */}
        <main className="relative h-[54dvh] shrink-0 lg:h-auto" aria-label="3D studio">
          <div className="absolute inset-0">
            <StudioScene art={art} design={design} />
          </div>
          {/* overlays (pointer-events only on their own controls) */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="hidden sm:block">
                <BriefPanel checks={checks} design={design} />
              </div>
              <div className="ml-auto">
                <ReferenceCard design={design} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FlatView art={art} design={design} />
              <ShelfHint legible={legible} />
              <ViewBar />
            </div>
          </div>
        </main>

        {/* mobile: brief sits above the controls */}
        <div className="border-t border-line bg-surface px-3 pt-3 sm:hidden">
          <BriefPanel checks={checks} design={design} />
        </div>

        <aside className="min-h-0 flex-1 border-l border-line bg-surface lg:flex-none" aria-label="Design controls">
          <ControlPanel design={design} metrics={art.metrics} onSave={onSave} onExport={onExport} />
        </aside>
      </div>

      <IntroOverlay />
      <CelebrateOverlay checks={checks} thumb={celebrateThumb} onExport={onExport} />
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-xl text-cocoa transition-colors hover:bg-peach disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </motion.button>
  );
}
