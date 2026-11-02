"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
import { useClientValue } from "@/lib/useClient";

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
export function ChapterBar({ label }: { label: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-t-[6px] border-orange bg-peach/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Image src="/brand/eat-better-logo.svg" alt="Eat Better Co" width={83} height={40} priority className="h-10 w-auto shrink-0" />
        <span className="hidden h-7 w-px bg-cocoa/20 sm:block" />
        <span className="min-w-0 flex-1 truncate text-[0.95rem] font-bold uppercase tracking-[0.08em] text-cocoa">{label}</span>
        <FullscreenButton />
      </div>
    </header>
  );
}
