"use client";

import dynamic from "next/dynamic";
import { detectWebGL, useClientValue } from "@/lib/useClient";
import { WorldHoverLabel } from "@/components/world/hover";

const World = dynamic(() => import("./World"), { ssr: false, loading: () => null });

/**
 * Fixed, page-wide 3D layer (Architecture-internship pattern: one background behind every
 * section). Devices without WebGL get a warm, static brand backdrop instead.
 */
export function WorldBackground() {
  const webgl = useClientValue<boolean | null>(detectWebGL, null);
  return (
    <>
    <WorldHoverLabel />
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {/* base colour shows instantly and under the canvas while it loads */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_20%,#FFF5EE_0%,#F9DCC4_55%,#F1C7A6_100%)]" />
      {webgl && (
        <div className="absolute inset-0 [@media(hover:hover)]:pointer-events-auto">
          <World />
        </div>
      )}
      {/* gentle edge vignette keeps the centre calm for reading */}
      <div className="absolute inset-0 bg-[radial-gradient(140%_100%_at_50%_45%,transparent_55%,rgba(47,28,26,0.10)_100%)]" />
    </div>
    </>
  );
}
