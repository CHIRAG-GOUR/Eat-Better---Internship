"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { BRAND_CLAIMS, CATEGORIES, PRODUCT_CARDS, type CategoryId } from "../content";
import { ActivityLabel, SectionIntro } from "@/components/chapter/SectionIntro";
import { useActivities } from "../activityStore";

// stable shuffle so the tray isn't pre-grouped by category
const ORDER = [6, 0, 3, 8, 2, 5, 9, 1, 7, 4];

export function Products({ focus }: { focus: CategoryId | null }) {
  const [placed, setPlaced] = useState<Record<string, CategoryId>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [miss, setMiss] = useState<{ id: string; cat: CategoryId } | null>(null);
  const complete = useActivities((s) => s.complete);
  const cards = useMemo(() => ORDER.map((i) => PRODUCT_CARDS[i]), []);
  const remaining = cards.filter((c) => !placed[c.id]);
  const done = remaining.length === 0;

  useEffect(() => {
    if (done) complete("shelf");
  }, [done, complete]);

  const drop = (cat: CategoryId) => {
    if (!selected) return;
    const card = PRODUCT_CARDS.find((c) => c.id === selected)!;
    if (card.category === cat) {
      setPlaced((p) => ({ ...p, [card.id]: cat }));
      setSelected(null);
      setMiss(null);
    } else {
      setMiss({ id: card.id, cat });
    }
  };

  const selCard = PRODUCT_CARDS.find((c) => c.id === selected);

  return (
    <section id="products" className="relative scroll-mt-20 bg-peach py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionIntro index="4" kicker="What does Eat Better make?" title="Stock the shelves">
          Eat Better makes four kinds of products. Pick a real product from the tray, then place it on the shelf where it belongs. Each shelf reveals what that category includes once it&apos;s stocked.
        </SectionIntro>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* tray */}
          <div className="self-start rounded-[28px] bg-cream p-5 shadow-[0_24px_50px_-32px_rgba(47,28,26,0.6)] lg:sticky lg:top-24">
            <ActivityLabel done={done}>Activity · Product tray</ActivityLabel>
            <p className="mt-2 text-[1.02rem] text-cocoa-2">
              {done ? "Every product is on its shelf." : `${remaining.length} of ${cards.length} products left to place.`}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-3">
              <AnimatePresence>
                {remaining.map((c) => {
                  const on = selected === c.id;
                  const shake = miss?.id === c.id;
                  return (
                    <motion.button
                      key={c.id}
                      layoutId={`prod-${c.id}`}
                      onClick={() => {
                        setSelected(on ? null : c.id);
                        setMiss(null);
                      }}
                      aria-pressed={on}
                      aria-label={c.name}
                      animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`relative aspect-square overflow-hidden rounded-2xl ring-offset-2 ring-offset-cream ${on ? "ring-4 ring-orange" : "ring-1 ring-line hover:ring-cocoa"}`}
                    >
                      <Image src={c.image} alt="" fill sizes="120px" className="object-cover" />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              {selCard ? (
                <motion.div key={selCard.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-white p-3.5">
                  <div className="text-[0.82rem] font-extrabold uppercase tracking-[0.12em] text-orange">Selected</div>
                  <div className="text-[1.08rem] font-bold leading-snug text-cocoa">{selCard.name}</div>
                  {miss?.id === selCard.id ? (
                    <p className="mt-1 text-[0.98rem] leading-snug text-error">
                      Not the {CATEGORIES.find((c) => c.id === miss.cat)?.title.toLowerCase()} shelf. Look at the pack and the product name again.
                    </p>
                  ) : (
                    <p className="mt-1 text-[0.98rem] text-cocoa-2">Now choose a shelf.</p>
                  )}
                </motion.div>
              ) : (
                !done && <p className="mt-4 text-[0.98rem] text-cocoa-2">Select a product to begin.</p>
              )}
            </AnimatePresence>
            {Object.keys(placed).length > 0 && (
              <button onClick={() => { setPlaced({}); setSelected(null); setMiss(null); }} className="mt-3 flex items-center gap-1.5 rounded-xl px-2 py-2 text-[0.98rem] font-bold text-cocoa-2 hover:bg-peach">
                <RotateCcw className="size-4" /> Start again
              </button>
            )}
            <p className="mt-3 text-[0.85rem] leading-snug text-cocoa-2/75">Product photos: official Eat Better Co images.</p>
          </div>

          {/* shelves */}
          <div className="grid gap-4 sm:grid-cols-2">
            {CATEGORIES.map((cat) => {
              const items = PRODUCT_CARDS.filter((p) => placed[p.id] === cat.id);
              const total = PRODUCT_CARDS.filter((p) => p.category === cat.id).length;
              const full = items.length === total;
              const highlighted = focus === cat.id;
              return (
                <motion.div
                  key={cat.id}
                  id={`cat-${cat.id}`}
                  animate={highlighted ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col overflow-hidden rounded-[26px] bg-white ring-2 transition-shadow ${highlighted ? "ring-orange" : "ring-transparent"} ${selected ? "shadow-[0_0_0_3px_rgba(255,92,0,0.25)]" : "shadow-[0_18px_40px_-30px_rgba(47,28,26,0.6)]"}`}
                >
                  <div className="flex items-center justify-between gap-3 px-5 py-4 text-white" style={{ background: cat.tone }}>
                    <h3 className="font-display text-[1.35rem] font-semibold leading-tight">{cat.title}</h3>
                    <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[0.9rem] font-bold">
                      {full && <Check className="size-4" strokeWidth={3} />}
                      {items.length}/{total}
                    </span>
                  </div>
                  <button
                    onClick={() => drop(cat.id)}
                    disabled={!selected}
                    aria-label={selected ? `Place ${selCard?.name} on the ${cat.title} shelf` : `${cat.title} shelf`}
                    className={`relative min-h-[118px] border-b-[10px] px-4 pb-3 pt-4 text-left transition-colors ${selected ? "cursor-pointer bg-orange/5 hover:bg-orange/10" : "cursor-default"}`}
                    style={{ borderBottomColor: "#C9AB8C" }}
                  >
                    <div className="flex flex-wrap items-end gap-2">
                      {items.map((p) => (
                        <motion.div key={p.id} layoutId={`prod-${p.id}`} className="relative size-[76px] overflow-hidden rounded-xl ring-1 ring-line" title={p.name}>
                          <Image src={p.image} alt={p.name} fill sizes="80px" className="object-cover" />
                        </motion.div>
                      ))}
                      {!items.length && <span className="py-6 text-[0.98rem] text-cocoa-2/70">{selected ? "Place it here?" : "Empty shelf"}</span>}
                    </div>
                  </button>
                  <AnimatePresence>
                    {full && (
                      <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-1.5 overflow-hidden px-5 py-4">
                        {cat.points.map((pt) => (
                          <li key={pt} className="flex gap-2.5 text-[1.02rem] leading-snug text-cocoa">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: cat.tone }} />
                            {pt}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* brand claims */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          className="mt-10 rounded-[28px] bg-cocoa p-6 text-cream sm:p-9"
        >
          <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-haldi">What the brand says about its snacks</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {BRAND_CLAIMS.map((c, i) => (
              <motion.div
                key={c}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 200, damping: 18 }}
                className="rounded-2xl border border-cream/20 px-5 py-5 text-center font-display text-[1.5rem] font-semibold"
              >
                {c}
              </motion.div>
            ))}
          </div>
          <p className="mt-5 text-[0.98rem] leading-relaxed text-cream/75">
            These are Eat Better Co&apos;s own brand claims, as stated by the company. This chapter presents them as what the brand says — not as independently tested nutrition or health facts.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
