"use client";

import dynamic from "next/dynamic";

/** WebGL + canvas code is client-only — keep it out of the server bundle and the first paint. */
const Studio = dynamic(() => import("@/features/packaging/Studio"), {
  ssr: false,
  loading: () => (
    <div className="grid h-dvh place-items-center bg-[#F4E6DA]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-14">
          <span className="absolute inset-0 animate-ping rounded-full bg-orange/30" />
          <span className="absolute inset-2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#8a5a3a,#3a1d10)]" />
        </div>
        <p className="font-display text-[1.15rem] font-medium text-cocoa">Setting up the studio…</p>
      </div>
    </div>
  ),
});

export default function StudioLoader() {
  return <Studio />;
}
