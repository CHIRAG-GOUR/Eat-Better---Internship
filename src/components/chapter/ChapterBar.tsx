"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
import { useClientValue } from "@/lib/useClient";
import { LaddooProgress, type ProgressSection } from "./LaddooProgress";

function FullscreenButton() {
  const [fs, setFs] = useState(false);
  // inside an LMS iframe without allow="fullscreen" this is false — hide rather than show a dead button
  const supported = useClientValue(() => !!document.fullscreenEnabled, false);
  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  if (!supported) return null;
  return (
    <button
      onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => undefined)}
      aria-label={fs ? "Exit fullscreen" : "Enter fullscreen"}
      title={fs ? "Exit fullscreen" : "Fullscreen"}
      className="eb-btn eb-btn-secondary !px-2.5 !py-2.5"
    >
      {fs ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
    </button>
  );
}

/** Header modelled on eatbetterco.com: orange top strip, peach bar, logo left. */
export function ChapterBar({ label, sections }: { label: string; sections: ProgressSection[] }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-t-[6px] border-orange bg-peach/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] lg:h-[76px] items-center gap-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:gap-4 sm:px-6">
        <Image src="/brand/eat-better-logo.svg" alt="Eat Better Co" width={83} height={40} priority className="h-8 w-auto shrink-0 sm:h-10" />
        <span className="hidden h-7 w-px bg-cocoa/20 lg:block" />
        <span className="hidden max-w-[220px] shrink-0 truncate text-[0.9rem] font-bold uppercase leading-tight tracking-[0.08em] text-cocoa lg:block xl:max-w-[340px]">{label}</span>
        <LaddooProgress sections={sections} />
        <FullscreenButton />
      </div>
    </header>
  );
}
