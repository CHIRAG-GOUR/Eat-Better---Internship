"use client";

import { GlossaryText } from "@/components/chapter/Glossary";
import { Panel } from "@/components/chapter/Panel";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Hand, RotateCcw } from "lucide-react";
import { BRAND_CLAIMS, CATEGORIES, PRODUCT_CARDS, type CategoryId } from "../content";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { useActivities } from "../activityStore";
import { useMediaQuery } from "@/lib/useClient";

// stable shuffle so the tray isn't pre-grouped by category
const ORDER = [6, 0, 3, 8, 2, 5, 9, 1, 7, 4];

/**
 * "Stock the shelves" — one-screen layout: the product tray runs across the top with large,
 * named photos; the four category shelves sit side by side below. Drag a product onto a shelf,
 * or tap a product and then tap a shelf.
 */
export function Products({ focus }: { focus: CategoryId | null }) {
  const [placed, setPlaced] = useState<Record<string, CategoryId>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [miss, setMiss] = useState<{ id: string; cat: CategoryId } | null>(null);
  const [hoverShelf, setHoverShelf] = useState<CategoryId | null>(null);
  const shelfRefs = useRef<Partial<Record<CategoryId, HTMLDivElement | null>>>({});
  const complete = useActivities((s) => s.complete);
  // drag with a mouse; on touch screens the tray scrolls sideways and products are placed by tapping
  const canDrag = useMediaQuery("(hover: hover) and (pointer: fine)");
  const cards = useMemo(() => ORDER.map((i) => PRODUCT_CARDS[i]), []);
  const remaining = cards.filter((c) => !placed[c.id]);
  const done = remaining.length === 0;

  useEffect(() => {
    if (done) complete("shelf");
  }, [done, complete]);

  const tryPlace = (id: string, cat: CategoryId) => {
    const card = PRODUCT_CARDS.find((c) => c.id === id)!;
    if (card.category === cat) {
      setPlaced((p) => ({ ...p, [card.id]: cat }));
      setSelected(null);
      setMiss(null);
    } else {
      setSelected(id);
      setMiss({ id, cat });
    }
  };
  const shelfAt = (x: number, y: number): CategoryId | null => {
    for (const c of CATEGORIES) {
      const r = shelfRefs.current[c.id]?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return c.id;
    }
    return null;
  };

  const selCard = PRODUCT_CARDS.find((c) => c.id === selected);
  const missCat = CATEGORIES.find((c) => c.id === miss?.cat);

  return (
    <section id="products" className="relative scroll-mt-6 px-3 py-6 sm:px-6 sm:py-10">
      <Panel tone="peach" reveal="up" width="max-w-7xl">
        <SectionIntro index="4" kicker="What does Eat Better make?" title="Stock the shelves">
          Drag each real product onto the shelf where it belongs — or tap a product, then tap a shelf.
        </SectionIntro>

        {/* tray */}
        <div className="mt-5 rounded-[24px] bg-cream p-3 sm:mt-6 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ActivityLabel done={done}>Activity · Product tray</ActivityLabel>
            <div className="flex items-center gap-3">
              <span className="text-[1rem] font-bold text-cocoa-2">{done ? "Every product is on its shelf!" : `${remaining.length} of ${cards.length} left`}</span>
              {Object.keys(placed).length > 0 && (
                <button
                  onClick={() => {
                    setPlaced({});
                    setSelected(null);
                    setMiss(null);
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.95rem] font-bold text-cocoa-2 hover:bg-peach"
                >
                  <RotateCcw className="size-4" /> Start again
                </button>
              )}
            </div>
          </div>

          <div className="no-scrollbar -mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-10 lg:overflow-visible">
            <AnimatePresence>
              {remaining.map((c) => {
                const on = selected === c.id;
                const shake = miss?.id === c.id;
                return (
                  <motion.button
                    key={c.id}
                    layout
                    drag={canDrag}
                    dragSnapToOrigin
                    dragElastic={0.9}
                    whileDrag={{ scale: 1.08, zIndex: 50, rotate: -3 }}
                    onDragStart={() => setSelected(c.id)}
                    onDrag={(e) => {
                      const p = e as PointerEvent;
                      setHoverShelf(shelfAt(p.clientX, p.clientY));
                    }}
                    onDragEnd={(e) => {
                      const p = e as PointerEvent;
                      const cat = shelfAt(p.clientX, p.clientY);
                      setHoverShelf(null);
                      if (cat) tryPlace(c.id, cat);
                    }}
                    onTap={() => {
                      setSelected(on ? null : c.id);
                      setMiss(null);
                    }}
                    aria-pressed={on}
                    aria-label={`${c.name}${on ? " — selected" : ""}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={shake ? { x: [0, -8, 8, -5, 5, 0], opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.35 }}
                    className={`relative flex w-[104px] shrink-0 snap-start flex-col sm:w-[132px] ${canDrag ? "cursor-grab touch-none active:cursor-grabbing" : ""} overflow-hidden rounded-2xl border bg-white text-left lg:w-auto ${on ? "border-orange shadow-[0_0_0_3px_rgba(255,92,0,0.35)]" : "border-cocoa/20 hover:border-cocoa"}`}
                  >
                    <span className="relative block aspect-square w-full">
                      <Image src={c.image} alt="" fill sizes="(max-width: 1024px) 132px, 120px" className="pointer-events-none object-cover" draggable={false} />
                    </span>
                    <span className="block min-h-[2.6em] px-2 py-1.5 text-[0.82rem] font-bold leading-tight text-cocoa">{c.name}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="mt-2 min-h-[1.6em] text-[0.98rem]">
            {miss && missCat && selCard ? (
              <span className="font-bold text-error">
                Not the {missCat.title.toLowerCase()} shelf — look at the pack and the name of {selCard.name} again.
              </span>
            ) : selCard ? (
              <span className="text-cocoa">
                <strong>{selCard.name}</strong> selected — now tap the shelf it belongs on.
              </span>
            ) : !done ? (
              <span className="flex items-center gap-1.5 text-cocoa-2">
                <Hand className="size-4" /> {canDrag ? "Drag a product down to a shelf." : "Tap a product, then tap its shelf."}
              </span>
            ) : null}
          </div>
        </div>

        {/* shelves */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const items = PRODUCT_CARDS.filter((p) => placed[p.id] === cat.id);
            const total = PRODUCT_CARDS.filter((p) => p.category === cat.id).length;
            const full = items.length === total;
            const glow = hoverShelf === cat.id || focus === cat.id;
            return (
              <div
                key={cat.id}
                id={`cat-${cat.id}`}
                ref={(el) => {
                  shelfRefs.current[cat.id] = el;
                }}
                className={`flex flex-col overflow-hidden rounded-[20px] bg-white ring-2 transition-[box-shadow,transform] duration-200 ${glow ? "scale-[1.02] ring-orange" : "ring-transparent"} ${selected ? "shadow-[0_0_0_3px_rgba(255,92,0,0.22)]" : "shadow-[0_18px_40px_-30px_rgba(47,28,26,0.6)]"}`}
              >
                <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-white" style={{ background: cat.tone }}>
                  <h3 className="font-display text-[1.08rem] font-semibold leading-tight sm:text-[1.2rem]">{cat.title}</h3>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[0.85rem] font-bold">
                    {full && <Check className="size-3.5" strokeWidth={3} />}
                    {items.length}/{total}
                  </span>
                </div>
                <button
                  onClick={() => selected && tryPlace(selected, cat.id)}
                  disabled={!selected}
                  aria-label={selected ? `Place ${selCard?.name} on the ${cat.title} shelf` : `${cat.title} shelf`}
                  className={`relative min-h-[92px] border-b-[8px] px-2.5 pb-2 pt-2.5 sm:min-h-[132px] sm:px-3 sm:pb-2.5 sm:pt-3 text-left transition-colors ${selected ? "cursor-pointer bg-orange/5 hover:bg-orange/10" : "cursor-default"}`}
                  style={{ borderBottomColor: "#C9AB8C" }}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {items.map((p) => (
                      <motion.div key={p.id} layoutId={`prod-${p.id}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-line" title={p.name}>
                        <Image src={p.image} alt={p.name} fill sizes="96px" className="object-cover" />
                      </motion.div>
                    ))}
                  </div>
                  {!items.length && <span className="absolute inset-0 grid place-items-center text-[0.95rem] text-cocoa-2/70">{selected ? "Place it here?" : "Empty shelf"}</span>}
                </button>
                <AnimatePresence>
                  {full && (
                    <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-1 overflow-hidden px-3.5 py-3">
                      {cat.points.map((pt) => (
                        <li key={pt} className="flex gap-2 text-[0.95rem] leading-snug text-cocoa">
                          <span className="mt-[0.45em] size-1.5 shrink-0 rounded-full" style={{ background: cat.tone }} />
                          <GlossaryText>{pt}</GlossaryText>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[0.85rem] text-cocoa-2/75">Product photos: official Eat Better Co images.</p>

        {/* brand claims */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          className="mt-10 rounded-[24px] bg-cocoa p-6 text-cream sm:p-8"
        >
          <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">What the brand says about its snacks</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {BRAND_CLAIMS.map((c, i) => (
              <motion.div
                key={c}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 200, damping: 18 }}
                className="rounded-2xl border border-cream/20 px-5 py-4 text-center font-display text-[1.4rem] font-semibold"
              >
                <GlossaryText>{c}</GlossaryText>
              </motion.div>
            ))}
          </div>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/75">
            These are Eat Better Co&apos;s own brand claims, as stated by the company — not independently tested nutrition or health facts.
          </p>
        </motion.div>
      </Panel>
    </section>
  );
}
