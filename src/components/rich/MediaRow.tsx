"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Equal-height media row: every item keeps its true aspect ratio and all items share one height
 * (each item's width grows in proportion to its ratio). Stacks full-width on phones.
 * Use for screenshots, photos and videos side by side so nothing sits at a random size.
 */
export type MediaItem =
  | { kind: "image"; src: string; alt: string; ratio: number; caption?: string; fit?: "cover" | "contain" }
  | { kind: "node"; ratio: number; node: ReactNode; caption?: string; framed?: boolean };

export function MediaRow({ items, className = "" }: { items: MediaItem[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-start ${className}`}>
      {items.map((it, i) => (
        <motion.figure
          key={i}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ ["--r" as string]: it.ratio }}
          className="min-w-0 sm:[flex:var(--r)_1_0%]"
        >
          {it.kind === "image" ? (
            <div className="relative w-full overflow-hidden rounded-2xl border border-cocoa bg-cream shadow-[3px_3px_0_0_#2f1c1a]" style={{ aspectRatio: it.ratio }}>
              <Image src={it.src} alt={it.alt} fill sizes="(max-width: 640px) 100vw, 60vw" className={it.fit === "contain" ? "object-contain" : "object-cover object-top"} />
            </div>
          ) : it.framed === false ? (
            it.node
          ) : (
            <div className="w-full" style={{ aspectRatio: it.ratio }}>
              {it.node}
            </div>
          )}
          {it.caption && <figcaption className="mt-2 text-[0.88rem] leading-snug text-cocoa-2">{it.caption}</figcaption>}
        </motion.figure>
      ))}
    </div>
  );
}
