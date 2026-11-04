"use client";

import type { ReactNode } from "react";
import { detectWebGL, useClientValue } from "@/lib/useClient";
import { WorldHoverLabel } from "./hover";

/**
 * Fixed, page-wide layer that holds a chapter's 3D world (pass the chapter's dynamically
 * imported World as children). Devices without WebGL get a warm static brand backdrop.
 */
export function WorldShell({ children, scrim = false }: { children: ReactNode; /** soft cream fade on the left so dark-title text stays readable over busy worlds */ scrim?: boolean }) {
  const webgl = useClientValue<boolean | null>(detectWebGL, null);
  return (
    <>
      <WorldHoverLabel />
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_20%,#FFF5EE_0%,#F9DCC4_55%,#F1C7A6_100%)]" />
        {webgl && <div className="absolute inset-0 [@media(hover:hover)]:pointer-events-auto">{children}</div>}
        <div className="absolute inset-0 bg-[radial-gradient(140%_100%_at_50%_45%,transparent_55%,rgba(47,28,26,0.10)_100%)]" />
        {scrim && <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,245,238,0.82)_0%,rgba(255,245,238,0.55)_38%,rgba(255,245,238,0)_62%)] max-md:bg-[linear-gradient(180deg,rgba(255,245,238,0.25)_0%,rgba(255,245,238,0.7)_45%,rgba(255,245,238,0.85)_100%)]" />}
      </div>
    </>
  );
}
