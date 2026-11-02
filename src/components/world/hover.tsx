"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";

/** Name of the 3D snack under the mouse (world background only; mouse devices). */
export const useWorldHover = create<{ label: string | null; set: (l: string | null) => void }>((set) => ({
  label: null,
  set: (label) => set({ label }),
}));

/** Wrap any prop in the world to show its name on hover. */
export function Hoverable({ label, children }: { label: string; children: ReactNode }) {
  const set = useWorldHover((s) => s.set);
  return (
    <group
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        set(label);
      }}
      onPointerOut={() => set(null)}
    >
      {children}
    </group>
  );
}

/** Cursor-following label, rendered in the DOM above the canvas. */
export function WorldHoverLabel() {
  const label = useWorldHover((s) => s.label);
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (el.current) el.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  useEffect(() => {
    document.body.style.cursor = label ? "help" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [label]);
  return (
    <div ref={el} className="pointer-events-none fixed left-0 top-0 z-40">
      <AnimatePresence>
        {label && (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16 }}
            className="whitespace-nowrap rounded-lg border border-cocoa bg-cream px-3 py-1.5 text-[0.98rem] font-bold text-cocoa shadow-[2px_2px_0_0_#2f1c1a]"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
