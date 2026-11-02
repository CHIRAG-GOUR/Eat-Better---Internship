"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useClientValue } from "@/lib/useClient";

/** Custom corner-bracket icon: brackets push outward (enter) or tuck inward (exit). */
function Brackets({ fs, hover }: { fs: boolean; hover: boolean }) {
  // offset applied to each corner — positive = outward
  const d = fs ? (hover ? -1.6 : 0) : hover ? 1.6 : 0;
  const corners = [
    { path: fs ? "M9 4v5H4" : "M4 9V4h5", x: -1, y: -1 },
    { path: fs ? "M15 4v5h5" : "M20 9V4h-5", x: 1, y: -1 },
    { path: fs ? "M9 20v-5H4" : "M4 15v5h5", x: -1, y: 1 },
    { path: fs ? "M15 20v-5h5" : "M20 15v5h-5", x: 1, y: 1 },
  ];
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {corners.map((c, i) => (
        <motion.path key={i} d={c.path} animate={{ x: c.x * d, y: c.y * d }} transition={{ type: "spring", stiffness: 420, damping: 22 }} />
      ))}
    </svg>
  );
}

/** Always-visible fullscreen control, top-right (the only fixed control at the top). */
export function FullscreenToggle() {
  const [fs, setFs] = useState(false);
  const [hover, setHover] = useState(false);
  // false inside an LMS iframe that lacks allow="fullscreen": hide instead of showing a dead button
  const supported = useClientValue(() => !!document.fullscreenEnabled, false);

  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  if (!supported) return null;
  const toggle = () => {
    const p = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    p.catch(() => undefined);
  };

  return (
    <motion.button
      onClick={toggle}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.6 }}
      aria-label={fs ? "Exit fullscreen" : "Enter fullscreen"}
      aria-pressed={fs}
      title={fs ? "Exit fullscreen" : "Fullscreen"}
      className="fixed z-50 grid size-12 place-items-center rounded-full border border-cocoa bg-cream text-cocoa shadow-[2px_2px_0_0_#2f1c1a] transition-[box-shadow,background-color,color] hover:bg-orange hover:text-white hover:shadow-[3px_3px_0_0_#2f1c1a]"
      style={{ top: "max(16px, env(safe-area-inset-top))", right: "max(16px, env(safe-area-inset-right))" }}
    >
      <Brackets fs={fs} hover={hover} />
    </motion.button>
  );
}
