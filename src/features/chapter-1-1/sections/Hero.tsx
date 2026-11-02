"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { detectWebGL, useClientValue } from "@/lib/useClient";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, MousePointerClick } from "lucide-react";
import { CHAPTER, type CategoryId } from "../content";

const KitchenTable = dynamic(() => import("../three/KitchenTable"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-[#5a1416]" />,
});

const STATION_LABELS: Record<CategoryId, string> = {
  sweets: "Sweets & laddoos",
  namkeens: "Namkeens",
  nuts: "Nuts & mixes",
  gifting: "Combos & gifting",
};

/** null on the server (renders a placeholder), then true/false in the browser. */
function useWebGL() {
  return useClientValue<boolean | null>(detectWebGL, null);
}

export function Hero({ onPickCategory }: { onPickCategory: (id: CategoryId) => void }) {
  const webgl = useWebGL();
  const [hovered, setHovered] = useState<CategoryId | null>(null);

  return (
    <section id="intro" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#5a1416] pt-[70px] lg:block">
      {/* 3D world */}
      <div className="relative h-[46svh] w-full lg:absolute lg:inset-0 lg:h-auto">
        {webgl === false ? (
          <Image src="/brand/products/laddoo-box-42-1.webp" alt="Eat Better Co laddoos (official photo)" fill priority className="object-cover" sizes="100vw" />
        ) : webgl ? (
          <KitchenTable onPick={onPickCategory} onHoverChange={setHovered} />
        ) : null}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key={hovered}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="pointer-events-none absolute bottom-6 right-6 rounded-2xl bg-cream px-4 py-3 shadow-xl"
            >
              <div className="font-display text-[1.15rem] font-semibold text-cocoa">{STATION_LABELS[hovered]}</div>
              <div className="text-[0.95rem] text-cocoa-2">Click to explore this category</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* readable text column */}
      <div className="relative z-10 flex flex-1 items-center bg-cream lg:absolute lg:inset-y-0 lg:left-0 lg:w-[min(46%,640px)] lg:bg-transparent">
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-cream via-cream/95 to-transparent lg:block" aria-hidden />
        <div className="relative w-full px-5 py-10 sm:px-10 lg:py-0 lg:pl-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="flex flex-wrap items-center gap-2 text-[0.85rem] font-extrabold uppercase tracking-[0.16em] text-orange">
              <span>{CHAPTER.module}</span>
              <span className="size-1 rounded-full bg-orange" />
              <span>Chapter {CHAPTER.number}</span>
            </motion.div>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 20 } } }}
              className="mt-4 font-display text-[clamp(2.7rem,6vw,4.5rem)] font-medium uppercase leading-[0.98] text-cocoa"
            >
              About the
              <br />
              Company
            </motion.h1>
            <motion.p variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} className="mt-5 max-w-[34rem] text-[1.15rem] leading-relaxed text-cocoa-2">
              {CHAPTER.theme}
            </motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              className="mt-7 max-w-[34rem] rounded-2xl border border-line bg-white/80 p-5 shadow-[0_18px_40px_-24px_rgba(47,28,26,0.5)]"
            >
              <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-cocoa-2/80">Learning objective</div>
              <p className="mt-1.5 text-[1.05rem] leading-relaxed text-cocoa">{CHAPTER.objective}</p>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-7 flex flex-wrap items-center gap-4">
              <button
                onClick={() => document.getElementById("glance")?.scrollIntoView({ behavior: "smooth" })}
                className="group eb-btn eb-btn-primary"
              >
                Begin the chapter <ArrowDown className="size-5 transition-transform group-hover:translate-y-0.5" />
              </button>
              {webgl && (
                <span className="hidden items-center gap-2 text-[0.95rem] text-cocoa-2 lg:flex">
                  <MousePointerClick className="size-5 text-orange" /> Explore the table — each bowl is a product category
                </span>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
