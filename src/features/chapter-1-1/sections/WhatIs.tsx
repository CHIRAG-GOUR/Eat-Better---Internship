"use client";

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
    <section id="what-is" className="relative scroll-mt-20 bg-peach py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionIntro index="2" kicker="What is Eat Better Co?" title="Snacks you love. Ingredients you trust." />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { src: "/brand/products/hazelnut-laddoo-1.webp", alt: "Hazelnut Chocolate Laddoos" },
            { src: "/brand/products/millet-bhujia-1.webp", alt: "Millet Bhujia" },
            { src: "/brand/products/nut-mix-2.webp", alt: "Premium Nut Mix" },
            { src: "/brand/products/laddoo-box-42-1.webp", alt: "Assorted Laddoo Box" },
          ].map((img, i) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="relative aspect-square overflow-hidden rounded-2xl border border-cocoa shadow-[2px_2px_0_0_#2f1c1a]"
            >
              <Image src={img.src} alt={`${img.alt} — official Eat Better Co photo`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-700 hover:scale-105" />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="space-y-6">
            {WHAT_IS.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ delay: i * 0.1 }}
                className={i === 1 ? "border-l-4 border-orange pl-5 font-display text-[1.6rem] font-medium leading-snug text-cocoa" : "text-[1.15rem] leading-relaxed text-cocoa"}
              >
                {p}
              </motion.p>
            ))}
          </div>

          <div className="rounded-[28px] bg-cream p-5 shadow-[0_30px_60px_-36px_rgba(47,28,26,0.6)] sm:p-7">
            <ActivityLabel done={checked && allRight}>Activity · Keep or change?</ActivityLabel>
            <p className="mt-2 text-[1.1rem] leading-relaxed text-cocoa">
              Eat Better keeps some things about a snack and changes others. Select a card, then choose the tray it belongs in.
            </p>

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
      </div>
    </section>
  );
}
