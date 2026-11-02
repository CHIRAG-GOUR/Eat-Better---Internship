"use client";

import { GlossaryText } from "@/components/chapter/Glossary";
import { Panel } from "@/components/chapter/Panel";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { WHAT_IS } from "../content";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { useActivities } from "../activityStore";

type Bin = "keep" | "change";

export function WhatIs() {
  const [placed, setPlaced] = useState<Record<string, Bin>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const complete = useActivities((s) => s.complete);
  const items = WHAT_IS.attributes;
  const unplaced = items.filter((a) => !placed[a.id]);
  const allPlaced = unplaced.length === 0;
  const isRight = (id: string) => {
    const a = items.find((x) => x.id === id)!;
    return (placed[id] === "keep") === a.keep;
  };
  const allRight = allPlaced && items.every((a) => isRight(a.id));

  const place = (id: string, bin: Bin) => {
    setPlaced((p) => ({ ...p, [id]: bin }));
    setSelected(null);
    setChecked(false);
  };
  const unplace = (id: string) => {
    setPlaced((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
    setChecked(false);
  };
  const check = () => {
    setChecked(true);
    if (allRight) complete("keepChange");
  };

  const tray = (bin: Bin, title: string, sub: string) => {
    const ids = items.filter((a) => placed[a.id] === bin).map((a) => a.id);
    const sel = items.find((a) => a.id === selected);
    return (
      <div
        onClick={() => selected && place(selected, bin)}
        className={`flex min-h-[220px] flex-col rounded-[24px] border-2 border-dashed p-5 transition-colors ${sel ? "cursor-pointer border-orange bg-orange/5 hover:bg-orange/10" : "border-line-strong bg-white/60"}`}
      >
        <span className="font-display text-[1.45rem] font-semibold text-cocoa">{title}</span>
        <span className="text-[1rem] text-cocoa-2">{sub}</span>
        <span className="mt-4 flex flex-wrap gap-2">
          <AnimatePresence>
            {ids.map((id) => {
              const a = items.find((x) => x.id === id)!;
              const ok = isRight(id);
              return (
                <motion.button
                  layoutId={`attr-${id}`}
                  key={id}
                  onClick={(e) => {
                    e.stopPropagation();
                    unplace(id);
                  }}
                  aria-label={`${a.label} — in ${title}. Select to move back.`}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[1rem] font-bold ${checked ? (ok ? "bg-success text-white" : "bg-error text-white") : "bg-cocoa text-cream"}`}
                >
                  {checked && (ok ? <Check className="size-4" /> : <X className="size-4" />)}
                  {a.label}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </span>
        {sel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              place(sel.id, bin);
            }}
            className="mt-auto self-start rounded-xl bg-orange px-4 py-2 text-[0.98rem] font-bold text-white"
          >
            Put &ldquo;{sel.label.replace(/^The /, "")}&rdquo; here
          </button>
        )}
      </div>
    );
  };

  return (
    <section id="what-is" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="peach" reveal="left" width="max-w-7xl">
        <SectionIntro index="2" kicker="What is Eat Better Co?" title="Snacks you love. Ingredients you trust." />

        {/* picture-led: the belief sits on the balance illustration; real products beside the description */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <motion.figure
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[300px] overflow-hidden rounded-[24px] border border-cocoa shadow-[3px_3px_0_0_#2f1c1a]"
          >
            <Image src="/chapter-1-1/art/balance.webp" alt="Illustration of a brass scale balancing snacks and whole ingredients" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cocoa/90 via-cocoa/60 to-transparent p-5 pt-16 sm:p-7 sm:pt-20">
              <span className="block font-display text-[clamp(1.3rem,2.6vw,1.75rem)] font-medium leading-snug text-cream">
                <GlossaryText>{WHAT_IS.paragraphs[1]}</GlossaryText>
              </span>
            </figcaption>
          </motion.figure>

          <div className="flex flex-col gap-4">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[20px] bg-cream p-5 text-[1.12rem] leading-relaxed text-cocoa"
            >
              <GlossaryText>{WHAT_IS.paragraphs[0]}</GlossaryText>
            </motion.p>
            <div className="grid flex-1 grid-cols-2 gap-3">
              {[
                { src: "/brand/products/hazelnut-laddoo-1.webp", alt: "Hazelnut Chocolate Laddoos" },
                { src: "/brand/products/millet-bhujia-1.webp", alt: "Millet Bhujia" },
                { src: "/brand/products/nut-mix-2.webp", alt: "Premium Nut Mix" },
                { src: "/brand/products/laddoo-box-42-1.webp", alt: "Assorted Laddoo Box" },
              ].map((img, i) => (
                <motion.div
                  key={img.src}
                  initial={{ opacity: 0, y: 20, rotate: i % 2 ? 2 : -2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, type: "spring", stiffness: 150, damping: 18 }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-cocoa shadow-[2px_2px_0_0_#2f1c1a]"
                >
                  <Image src={img.src} alt={`${img.alt} — official Eat Better Co photo`} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-cocoa/75 px-2.5 py-1 text-[0.85rem] font-bold text-cream opacity-0 transition-opacity group-hover:opacity-100">{img.alt}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="rounded-[28px] bg-cream p-5 shadow-[0_30px_60px_-36px_rgba(47,28,26,0.6)] sm:p-7">
            <ActivityLabel done={checked && allRight}>Activity · Keep or change?</ActivityLabel>
            <p className="mt-2 text-[1.1rem] leading-relaxed text-cocoa">
              <GlossaryText>{WHAT_IS.paragraphs[2]}</GlossaryText>
            </p>
            <p className="mt-1 text-[1rem] text-cocoa-2">Sort each card: tap it, then tap a tray.</p>

            <div className="mt-5 flex min-h-[52px] flex-wrap gap-2" aria-label="Cards to sort">
              {unplaced.map((a) => (
                <motion.button
                  layoutId={`attr-${a.id}`}
                  key={a.id}
                  onClick={() => setSelected(selected === a.id ? null : a.id)}
                  aria-pressed={selected === a.id}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-full border-2 px-4 py-2 text-[1rem] font-bold transition-colors ${selected === a.id ? "border-orange bg-orange text-white" : "border-cocoa/20 bg-white text-cocoa hover:border-cocoa"}`}
                >
                  {a.label}
                </motion.button>
              ))}
              {allPlaced && <span className="py-2 text-[1rem] text-cocoa-2">All cards placed. Tap a card in a tray to move it back.</span>}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {tray("keep", "Keep", "What stays the same")}
              {tray("change", "Change", "What Eat Better does differently")}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={check}
                disabled={!allPlaced}
                className="eb-btn eb-btn-dark"
              >
                Check my trays
              </button>
              <button
                onClick={() => {
                  setPlaced({});
                  setChecked(false);
                }}
                className="flex items-center gap-1.5 rounded-xl px-3 py-3 text-[1rem] font-bold text-cocoa-2 hover:bg-peach"
              >
                <RotateCcw className="size-4" /> Reset
              </button>
            </div>

            <AnimatePresence mode="wait">
              {checked && (
                <motion.div
                  key={String(allRight)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-5 rounded-2xl p-4 text-[1.05rem] leading-relaxed ${allRight ? "bg-success/10 text-cocoa" : "bg-error/10 text-cocoa"}`}
                >
                  {allRight ? (
                    <>
                      <strong>Exactly.</strong> Eat Better keeps the crunch, flavour and satisfaction people love — and changes the ingredients and the way the snacks are made. That is how it avoids making people choose between taste and trust.
                    </>
                  ) : (
                    <>
                      <strong>Not quite.</strong> The red cards are in the wrong tray. Re-read the last paragraph: what does the brand <em>keep</em>, and what does it <em>change</em>?
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Panel>
    </section>
  );
}
