"use client";

import NextImage from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Camera, Check, FlaskConical, Lightbulb, Plus, RotateCcw, X } from "lucide-react";
import { LeafBadge } from "@/components/icons/EbIcons";
import { InspectPanel, LiteToggle, ObjectiveTracker, RoleBadge, SimReport, liteCanvasProps, useLiteMode, type Objective, type ReportData } from "@/components/sim";
import {
  CATEGORIES,
  CUSTOMERS,
  DIFFERENTIATORS,
  FORMATS,
  FORMAT_FIT,
  INGREDIENTS,
  OCCASIONS,
  PACK_COLORS,
  ZONE_PRODUCTS,
  type CategoryId,
  type Format,
  type IngredientId,
  type OccasionId,
} from "../content";
import { StudioScene } from "./studio/StudioScene";
import type { PackArt } from "./studio/packArt";

/**
 * The Eat Better Product Innovation Studio — role: Junior Product Developer.
 * A guided, 6-step product-development simulation that ends in a Product Concept Portfolio.
 * Everything the student makes is a design exercise; product facts are quoted from official sources only.
 */

type State = {
  step: number;
  visited: CategoryId[];
  ingredients: IngredientId[];
  ingredientWhy: string;
  category: CategoryId | null;
  customer: string | null;
  occasion: OccasionId | null;
  diffs: string[];
  name: string;
  format: Format | null;
  color: string;
  namePos: "top" | "middle" | "bottom";
  claims: string[];
  testEnv: OccasionId | null;
  fitWhy: string;
  launchWhy: string;
  snapshot: string | null;
};
const INIT: State = {
  step: 0,
  visited: [],
  ingredients: [],
  ingredientWhy: "",
  category: null,
  customer: null,
  occasion: null,
  diffs: [],
  name: "",
  format: null,
  color: "#FF5C00",
  namePos: "middle",
  claims: [],
  testEnv: null,
  fitWhy: "",
  launchWhy: "",
  snapshot: null,
};
const KEY = "ebc-1.5-studio";

const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, (typeof CATEGORIES)[number]>;
const ING = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i])) as Record<IngredientId, (typeof INGREDIENTS)[number]>;
const OCC = Object.fromEntries(OCCASIONS.map((o) => [o.id, o])) as Record<OccasionId, (typeof OCCASIONS)[number]>;
const FMT = Object.fromEntries(FORMATS.map((f) => [f.id, f])) as Record<Format, (typeof FORMATS)[number]>;
const BRIEF = "Develop a new Eat Better snack concept for a clearly defined customer and occasion. It must fit the brand's better-snacking positioning.";
const STEP_TITLES = ["The brief", "Explore the product universe", "Explore ingredients", "Develop the concept", "Create the product", "Design the packaging", "Test the concept", "Your Concept Portfolio"];
const EXERCISE_NOTE = "Concept-design exercise — not a real recipe or nutritional formulation.";

function fitChecks(s: State) {
  const ingOk = !!s.category && s.ingredients.some((i) => ING[i].fits.includes(s.category!));
  const diffOk = !!s.category && s.diffs.some((d) => DIFFERENTIATORS.find((x) => x.text === d)?.cat === s.category || d === "No added sugar");
  const who = !!s.customer && !!s.occasion;
  const fmt = !!s.format && !!s.occasion && FORMAT_FIT[s.occasion].good.includes(s.format);
  return [
    { ok: ingOk, label: "Ingredients Eat Better already uses in this category", why: ingOk ? "Your base fits the category." : "Pick at least one ingredient Eat Better uses in this category." },
    { ok: diffOk, label: "Differentiator matches the category's positioning", why: diffOk ? "Your promise matches how this category is positioned." : `The ${s.category ? CAT[s.category].name : "category"} positioning is “${s.category ? CAT[s.category].positioning : "—"}”.` },
    { ok: who, label: "Clear customer and occasion", why: who ? `${s.customer} · ${OCC[s.occasion!].name}` : "Choose who it is for and when they eat it." },
    { ok: fmt, label: "Format suits the occasion", why: s.format && s.occasion ? (fmt ? FORMAT_FIT[s.occasion].why : FORMAT_FIT[s.occasion].fix) : "Choose a format in step 4." },
  ];
}

function cropSquare(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const c = document.createElement("canvas");
      c.width = c.height = 640;
      const g = c.getContext("2d")!;
      g.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 640, 640);
      resolve(c.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const chip = (on: boolean) => `rounded-full border-2 px-3 py-1.5 text-[0.9rem] font-bold transition-colors ${on ? "border-orange bg-orange text-white" : "border-cocoa/20 bg-white text-cocoa hover:border-cocoa"}`;

export default function InnovationStudio({ onComplete, three = true }: { onComplete: () => void; three?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const rot = useRef(0);
  const snap = useRef<(() => string) | null>(null);
  const drag = useRef<{ x: number; r: number } | null>(null);
  const reduce = !!useReducedMotion();
  const lite = useLiteMode();
  const [visible, setVisible] = useState(false);
  const [s, setS] = useState<State>(INIT);
  const [restored, setRestored] = useState(false);
  const [focusZone, setFocusZone] = useState<CategoryId | null>(null);
  const [inspect, setInspect] = useState<IngredientId | null>(null);
  const [rotUi, setRotUi] = useState(0);
  const [saving, setSaving] = useState(false);
  const set = (p: Partial<State>) => setS((x) => ({ ...x, ...p }));

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
      /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore from localStorage */
      if (v) setS({ ...INIT, ...v });
    } catch {
      /* storage unavailable */
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage full or blocked */
    }
  }, [s, restored]);
  useEffect(() => {
    if (s.step === 7) onComplete();
  }, [s.step, onComplete]);

  const art: PackArt = useMemo(
    () => ({ name: s.name, color: s.color, namePos: s.namePos, claims: s.claims, category: s.category, format: s.format ?? "pouch", ingredientColors: s.ingredients.map((i) => ING[i].color) }),
    [s.name, s.color, s.namePos, s.claims, s.category, s.format, s.ingredients],
  );
  const checks = fitChecks(s);

  const gates = [
    true,
    s.visited.length === 4,
    s.ingredients.length >= 2 && s.ingredientWhy.trim().length >= 15,
    !!s.category && !!s.customer && !!s.occasion && s.diffs.length > 0,
    s.name.trim().length >= 3 && !!s.format,
    s.claims.length > 0 && !!s.snapshot,
    !!s.testEnv && s.fitWhy.trim().length >= 20 && s.launchWhy.trim().length >= 20,
  ];
  const missing = [
    "",
    `Visit all four zones (${s.visited.length}/4).`,
    s.ingredients.length < 2 ? "Add at least 2 ingredients to your concept." : "Explain why you chose them (a sentence).",
    "Choose a category, customer, occasion and at least one differentiator.",
    "Name your product (3+ letters) and choose a format.",
    s.claims.length === 0 ? "Put at least one claim on the pack." : "Save a snapshot of your pack.",
    !s.testEnv ? "Choose a test environment." : "Explain the fit and justify the launch (a sentence each).",
  ];

  const objectives: Objective[] = [
    { id: "zones", label: "Explore the 4 product zones", done: gates[1] && s.step > 1, detail: `${s.visited.length}/4 visited` },
    { id: "ing", label: "Inspect ingredients and pick 2–4", done: gates[2] && s.step > 2 },
    { id: "concept", label: "Define customer, occasion and differentiator", done: gates[3] && s.step > 3 },
    { id: "create", label: "Name it and choose a format", done: gates[4] && s.step > 4 },
    { id: "pack", label: "Design the pack and save a snapshot", done: gates[5] && s.step > 5 },
    { id: "test", label: "Test it at an occasion and justify the launch", done: s.step === 7 },
  ];

  const go = (n: number) => {
    setInspect(null);
    if (n !== 1) setFocusZone(null);
    set({ step: n });
  };
  const onZone = (c: CategoryId) => {
    if (s.step !== 1) return;
    setFocusZone(c);
    if (!s.visited.includes(c)) set({ visited: [...s.visited, c] });
  };
  const onIngredient = (i: IngredientId) => {
    if (s.step !== 2) return;
    setInspect(i);
  };
  const toggleIng = (i: IngredientId) => set({ ingredients: s.ingredients.includes(i) ? s.ingredients.filter((x) => x !== i) : s.ingredients.length >= 4 ? s.ingredients : [...s.ingredients, i] });
  const setRot = (v: number) => {
    rot.current = v;
    setRotUi(v);
  };
  const saveSnapshot = async () => {
    if (!snap.current) return;
    setSaving(true);
    setRot(0);
    await new Promise((r) => setTimeout(r, 700));
    const raw = snap.current();
    const sq = await cropSquare(raw);
    set({ snapshot: sq });
    setSaving(false);
  };
  const moveClaim = (i: number, d: -1 | 1) => {
    const c = [...s.claims];
    const j = i + d;
    if (j < 0 || j >= c.length) return;
    [c[i], c[j]] = [c[j], c[i]];
    set({ claims: c });
  };

  const verdict = (() => {
    if (!s.testEnv || !s.format || !s.occasion) return null;
    const fmtOk = FORMAT_FIT[s.testEnv].good.includes(s.format);
    const planned = s.testEnv === s.occasion;
    if (fmtOk && planned) return { tone: "pass" as const, title: "Strong fit", text: `${FORMAT_FIT[s.testEnv].why} Your ${FMT[s.format].name.toLowerCase()} suits it.` };
    if (fmtOk) return { tone: "info" as const, title: "Fits — but not the occasion you planned", text: `It works here, but you planned it for ${OCC[s.occasion].name}. Test it there too, or change your plan.` };
    return { tone: "fail" as const, title: "Weak fit", text: `${FORMAT_FIT[s.testEnv].fix} Go back to packaging to change the format if you want to.` };
  })();

  const report: ReportData = useMemo(
    () => ({
      title: `Product Concept Portfolio: ${s.name.trim() || "Untitled"}`,
      chapter: "Chapter 1.5 · The Eat Better Product Innovation Studio",
      role: "Junior Product Developer",
      image: s.snapshot ? { src: s.snapshot, alt: `3D packaging mockup of ${s.name}` } : undefined,
      sections: [
        { heading: "Product name and category", body: `${s.name.trim() || "—"} — ${s.category ? CAT[s.category].name : "—"} (${s.format ? FMT[s.format].name : "—"})` },
        { heading: "Target customer and occasion", body: `${s.customer ?? "—"} · ${s.occasion ? `${OCC[s.occasion].name} (${OCC[s.occasion].example})` : "—"}` },
        { heading: "Ingredient choices and rationale", items: s.ingredients.map((i) => `${ING[i].name} — ${ING[i].usedIn}`), body: `${s.ingredientWhy.trim() || "—"} (${EXERCISE_NOTE})` },
        { heading: "Product differentiator", items: s.diffs.map((d) => `${d} (${DIFFERENTIATORS.find((x) => x.text === d)?.source ?? ""})`) },
        {
          heading: "Packaging",
          items: [`Format: ${s.format ? FMT[s.format].name : "—"}`, `Colour: ${PACK_COLORS.find((c) => c.hex === s.color)?.name ?? s.color}`, `Name position: ${s.namePos}`, `Front-of-pack claims: ${s.claims.join(" · ") || "—"}`],
        },
        { heading: `Occasion test${s.testEnv ? `: ${OCC[s.testEnv].name}` : ""}`, status: verdict?.tone, body: `${verdict ? `${verdict.title}. ` : ""}${s.fitWhy.trim() || "—"}` },
        { heading: "Brand-fit check", items: checks.map((c) => `${c.ok ? "Yes" : "Not yet"} — ${c.label}`) },
        { heading: "Launch justification", body: s.launchWhy.trim() || "—" },
      ],
      footnote: "Student design exercise — not an Eat Better product. Product facts are quoted from Eat Better's official packs and website",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- derived from state
    [s, verdict?.tone],
  );

  const insp = inspect ? ING[inspect] : null;

  return (
    <div ref={host}>
      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        {/* 3D studio */}
        <div
          className={`relative h-[340px] overflow-hidden rounded-[24px] border border-cocoa bg-[#FBEFE3] shadow-[3px_3px_0_0_#2f1c1a] sm:h-[500px] lg:static lg:h-[640px] ${s.step >= 1 && s.step <= 6 ? "sticky top-2 z-20" : ""}`}
          style={s.step === 5 ? { touchAction: "pan-y" } : undefined}
          onPointerDown={(e) => {
            if (s.step !== 5) return;
            drag.current = { x: e.clientX, r: rot.current };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setRot(drag.current.r + (e.clientX - drag.current.x) * 0.012);
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerLeave={() => (drag.current = null)}
        >
          {!three && <NextImage src="/chapter-1-5/frames/jar-hamper.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />}
          {visible && three && (
            <Canvas {...liteCanvasProps(lite)} gl={{ ...liteCanvasProps(lite).gl, preserveDrawingBuffer: true }} camera={{ position: [3, 5, 13], fov: 40 }}>
              <StudioScene
                step={s.step}
                focusZone={focusZone}
                visited={s.visited}
                inspect={inspect}
                chosen={s.ingredients}
                category={s.category}
                format={s.format}
                art={art}
                testEnv={s.testEnv}
                rot={rot}
                lite={lite}
                reduce={reduce}
                onZone={onZone}
                onIngredient={onIngredient}
                snap={snap}
              />
            </Canvas>
          )}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
            <RoleBadge role="Junior Product Developer" icon={<FlaskConical className="size-4 text-haldi" />} />
            <div className="pointer-events-auto">
              <LiteToggle />
            </div>
          </div>
          {s.step >= 1 && s.step <= 6 && (
            <div className="pointer-events-none absolute bottom-3 left-3 z-20 max-w-[70%] rounded-xl bg-cream/90 px-3 py-1.5 text-[0.85rem] font-bold text-cocoa">
              Step {s.step} of 6 · {STEP_TITLES[s.step]}
            </div>
          )}
          {s.step === 1 && !focusZone && <Hint text="Click a product zone to look closer." />}
          {s.step === 2 && !inspect && <Hint text="Click a bowl to pick it up and inspect it." />}
          {s.step === 5 && <Hint text="Drag sideways to turn your pack." />}

          <InspectPanel
            open={!!insp}
            kicker="Ingredient · official information only"
            title={insp?.name ?? ""}
            facts={insp ? [insp.usedIn] : []}
            note={insp ? `Source: ${insp.source}. ${EXERCISE_NOTE}` : undefined}
            onClose={() => setInspect(null)}
            actions={
              insp ? (
                <button onClick={() => toggleIng(insp.id)} disabled={!s.ingredients.includes(insp.id) && s.ingredients.length >= 4} className={`eb-btn !py-1.5 !text-[0.85rem] !normal-case ${s.ingredients.includes(insp.id) ? "eb-btn-secondary" : "eb-btn-primary"}`}>
                  {s.ingredients.includes(insp.id) ? (
                    <>
                      <X className="size-4" /> Remove from concept
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" /> Add to my concept
                    </>
                  )}
                </button>
              ) : undefined
            }
          />

          <AnimatePresence>
            {s.step === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 grid place-items-center bg-cocoa/35 p-4">
                <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="max-w-md rounded-[22px] border border-cocoa bg-cream p-5 shadow-[4px_4px_0_0_#2f1c1a] sm:p-6">
                  <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-orange">Product brief</div>
                  <p className="mt-2 font-display text-[1.3rem] font-medium leading-snug text-cocoa">&ldquo;{BRIEF}&rdquo;</p>
                  <p className="mt-2 text-[0.95rem] text-cocoa-2">Your product is a student design exercise, not an Eat Better product.</p>
                  <button onClick={() => go(1)} className="eb-btn eb-btn-primary mt-4 w-full justify-center">
                    Enter the studio
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* side panel */}
        <div className="flex min-w-0 flex-col gap-3 rounded-[24px] bg-cream p-4 sm:p-5">
          <ObjectiveTracker objectives={objectives} title="Development steps" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={s.step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }} className="flex min-w-0 flex-col gap-3">
              {s.step === 0 && (
                <div className="text-[1rem] leading-relaxed text-cocoa">
                  <p>
                    You are a <strong>Junior Product Developer</strong>. Walk through the studio: study the four product zones, inspect ingredients, shape a concept, design the pack and test it at a real occasion.
                  </p>
                  <p className="mt-2 text-[0.92rem] text-cocoa-2">At the end you get a Product Concept Portfolio you can copy, download or print.</p>
                </div>
              )}

              {s.step === 1 && (
                <>
                  <StepHead n={1} title={STEP_TITLES[1]} text="Click each zone in the studio — or use the buttons. Learn what each category includes and how it is positioned." />
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button key={c.id} onClick={() => onZone(c.id)} aria-pressed={focusZone === c.id} className={`flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-2 text-left text-[0.88rem] font-bold ${focusZone === c.id ? "border-orange bg-orange/10" : "border-cocoa/15 bg-white hover:border-cocoa"}`}>
                        {s.visited.includes(c.id) ? <Check className="size-4 shrink-0 text-success" strokeWidth={3} /> : <span className="size-3 shrink-0 rounded-full" style={{ background: c.color }} />}
                        {c.name}
                      </button>
                    ))}
                  </div>
                  {focusZone && (
                    <div className="rounded-2xl bg-white p-3">
                      <div className="font-display text-[1.15rem] font-semibold" style={{ color: CAT[focusZone].color }}>
                        {CAT[focusZone].name}
                      </div>
                      <p className="mt-1 text-[0.95rem] leading-snug text-cocoa">{CAT[focusZone].includes}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cocoa px-2.5 py-1 text-[0.82rem] font-bold text-cream">
                        <LeafBadge className="size-3.5 text-haldi" /> {CAT[focusZone].positioning}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {ZONE_PRODUCTS[focusZone].map((p) => (
                          <div key={p.id} className="text-center">
                            <span className="relative mx-auto block aspect-square w-full overflow-hidden rounded-lg bg-peach">
                              <NextImage src={p.tex} alt="" fill sizes="80px" className="object-contain" />
                            </span>
                            <span className="mt-0.5 block text-[0.7rem] font-bold leading-tight text-cocoa">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {s.step === 2 && (
                <>
                  <StepHead n={2} title={STEP_TITLES[2]} text="Pick up bowls to inspect them. Add 2–4 ingredients to your concept." />
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                    {INGREDIENTS.map((i) => {
                      const on = s.ingredients.includes(i.id);
                      return (
                        <button key={i.id} onClick={() => setInspect(i.id)} aria-pressed={on} className={`flex items-center gap-1.5 rounded-xl border-2 px-2 py-1.5 text-left text-[0.8rem] font-bold leading-tight ${inspect === i.id ? "border-orange" : on ? "border-success/60 bg-success/10" : "border-cocoa/15 bg-white hover:border-cocoa"}`}>
                          <span className="size-3 shrink-0 rounded-full" style={{ background: i.color }} />
                          {i.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[0.88rem] font-bold text-cocoa-2">In your concept: {s.ingredients.length ? s.ingredients.map((i) => ING[i].name).join(", ") : "none yet"}</div>
                  <textarea value={s.ingredientWhy} onChange={(e) => set({ ingredientWhy: e.target.value })} rows={2} aria-label="Why these ingredients?" placeholder="Why these ingredients? e.g. Dates, because…" className="w-full rounded-2xl border border-line-strong bg-white px-3 py-2 text-[0.98rem] text-cocoa outline-none focus:border-orange" />
                  <p className="text-[0.8rem] text-cocoa-2">{EXERCISE_NOTE}</p>
                </>
              )}

              {s.step === 3 && (
                <>
                  <StepHead n={3} title={STEP_TITLES[3]} text="Who is it for, when will they eat it, and what makes it better?" />
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button key={c.id} onClick={() => set({ category: c.id })} aria-pressed={s.category === c.id} className={`rounded-xl border-2 px-2.5 py-1.5 text-left ${s.category === c.id ? "border-orange bg-orange/10" : "border-cocoa/15 bg-white hover:border-cocoa"}`}>
                        <span className="block text-[0.88rem] font-bold text-cocoa">{c.name}</span>
                        <span className="block text-[0.75rem] text-cocoa-2">{c.positioning}</span>
                      </button>
                    ))}
                  </div>
                  <Label>Target customer</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {CUSTOMERS.map((c) => (
                      <button key={c} onClick={() => set({ customer: c })} aria-pressed={s.customer === c} className={chip(s.customer === c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <Label>Occasion</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {OCCASIONS.map((o) => (
                      <button key={o.id} onClick={() => set({ occasion: o.id })} aria-pressed={s.occasion === o.id} className={chip(s.occasion === o.id)}>
                        {o.name}
                      </button>
                    ))}
                  </div>
                  {s.occasion && <p className="text-[0.85rem] text-cocoa-2">Examples: {OCC[s.occasion].example}. Why it works: {OCC[s.occasion].why}.</p>}
                  <Label>Differentiator (up to 2)</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIFFERENTIATORS.map((d) => {
                      const on = s.diffs.includes(d.text);
                      return (
                        <button key={d.text} onClick={() => set({ diffs: on ? s.diffs.filter((x) => x !== d.text) : s.diffs.length >= 2 ? s.diffs : [...s.diffs, d.text] })} aria-pressed={on} className={chip(on)} title={d.source}>
                          {d.text}
                        </button>
                      );
                    })}
                  </div>
                  <FitMeter checks={checks.slice(0, 3)} />
                </>
              )}

              {s.step === 4 && (
                <>
                  <StepHead n={4} title={STEP_TITLES[4]} text="Name your product and choose its format. It appears on the design table." />
                  <label className="text-[0.92rem] font-bold text-cocoa">
                    Product name
                    <input value={s.name} onChange={(e) => set({ name: e.target.value })} maxLength={28} placeholder="e.g. Tiffin Crunch" className="mt-1 w-full rounded-2xl border border-line-strong bg-white px-3 py-2 text-[1.02rem] font-medium text-cocoa outline-none focus:border-orange" />
                  </label>
                  <Label>Format</Label>
                  <div className="grid gap-1.5">
                    {FORMATS.map((f) => (
                      <button key={f.id} onClick={() => set({ format: f.id })} aria-pressed={s.format === f.id} className={`rounded-xl border-2 px-3 py-2 text-left ${s.format === f.id ? "border-orange bg-orange/10" : "border-cocoa/15 bg-white hover:border-cocoa"}`}>
                        <span className="block text-[0.95rem] font-bold text-cocoa">{f.name}</span>
                        <span className="block text-[0.8rem] text-cocoa-2">{f.note}</span>
                      </button>
                    ))}
                  </div>
                  <FitMeter checks={checks} />
                </>
              )}

              {s.step === 5 && (
                <>
                  <StepHead n={5} title={STEP_TITLES[5]} text="Style the pack, place your name and arrange the front-of-pack claims. Then save a snapshot." />
                  <Label>Pack</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {FORMATS.map((f) => (
                      <button key={f.id} onClick={() => set({ format: f.id, snapshot: null })} aria-pressed={s.format === f.id} className={chip(s.format === f.id)}>
                        {f.id === "box" ? "Box" : f.id === "pouch" ? "Pouch" : "Sachet"}
                      </button>
                    ))}
                  </div>
                  <Label>Colour</Label>
                  <div className="flex flex-wrap gap-2">
                    {PACK_COLORS.map((c) => (
                      <button key={c.hex} onClick={() => set({ color: c.hex, snapshot: null })} aria-pressed={s.color === c.hex} aria-label={c.name} title={c.name} className={`size-9 rounded-full border-2 ${s.color === c.hex ? "border-cocoa ring-2 ring-orange ring-offset-2" : "border-cocoa/30"}`} style={{ background: c.hex }} />
                    ))}
                  </div>
                  <Label>Name position</Label>
                  <div className="flex gap-1.5">
                    {(["top", "middle", "bottom"] as const).map((p) => (
                      <button key={p} onClick={() => set({ namePos: p, snapshot: null })} aria-pressed={s.namePos === p} className={chip(s.namePos === p)}>
                        {p[0].toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                  <Label>Front-of-pack claims (up to 3 — claims that appear on real Eat Better packs)</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIFFERENTIATORS.map((d) => {
                      const on = s.claims.includes(d.text);
                      return (
                        <button key={d.text} onClick={() => set({ claims: on ? s.claims.filter((x) => x !== d.text) : s.claims.length >= 3 ? s.claims : [...s.claims, d.text], snapshot: null })} aria-pressed={on} className={chip(on)}>
                          {d.text}
                        </button>
                      );
                    })}
                  </div>
                  {s.claims.length > 1 && (
                    <ol className="space-y-1">
                      {s.claims.map((c, i) => (
                        <li key={c} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1 text-[0.88rem] font-bold text-cocoa">
                          {i + 1}. {c}
                          <span className="flex gap-1">
                            <button onClick={() => moveClaim(i, -1)} disabled={i === 0} aria-label={`Move ${c} up`} className="grid size-7 place-items-center rounded-md border border-cocoa/20 disabled:opacity-30">
                              <ArrowUp className="size-4" />
                            </button>
                            <button onClick={() => moveClaim(i, 1)} disabled={i === s.claims.length - 1} aria-label={`Move ${c} down`} className="grid size-7 place-items-center rounded-md border border-cocoa/20 disabled:opacity-30">
                              <ArrowDown className="size-4" />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                  <label className="text-[0.88rem] font-bold text-cocoa">
                    Turn the pack
                    <input type="range" min={-3.14} max={3.14} step={0.02} value={rotUi} onChange={(e) => setRot(+e.target.value)} className="mt-1 w-full accent-[#ff5c00]" />
                  </label>
                  <p className="text-[0.8rem] text-cocoa-2">On a real pack, every claim must be true for that product. Yours is a design exercise.</p>
                  <div className="flex items-center gap-3">
                    <button onClick={saveSnapshot} disabled={saving || !three || s.claims.length === 0} className="eb-btn eb-btn-dark !py-2 !text-[0.9rem] !normal-case">
                      <Camera className="size-4" /> {saving ? "Saving…" : s.snapshot ? "Retake snapshot" : "Save pack snapshot"}
                    </button>
                    {s.snapshot && (
                      // eslint-disable-next-line @next/next/no-img-element -- data-URL snapshot of the student's 3D pack
                      <img src={s.snapshot} alt="Your pack snapshot" className="size-14 rounded-lg border border-cocoa/30 object-cover" />
                    )}
                  </div>
                  {!three && <p className="text-[0.85rem] text-cocoa-2">3D isn&apos;t available on this device, so a snapshot can&apos;t be taken — your report will list the pack details instead.</p>}
                </>
              )}

              {s.step === 6 && (
                <>
                  <StepHead n={6} title={STEP_TITLES[6]} text="Place your concept in a real-life moment. Does it fit?" />
                  <div className="grid grid-cols-2 gap-1.5">
                    {OCCASIONS.map((o) => (
                      <button key={o.id} onClick={() => set({ testEnv: o.id })} aria-pressed={s.testEnv === o.id} className={`rounded-xl border-2 px-2.5 py-2 text-left text-[0.9rem] font-bold ${s.testEnv === o.id ? "border-orange bg-orange/10" : "border-cocoa/15 bg-white hover:border-cocoa"}`}>
                        {o.name}
                        {s.occasion === o.id && <span className="block text-[0.72rem] font-bold text-orange">Your planned occasion</span>}
                      </button>
                    ))}
                  </div>
                  {verdict && (
                    <div className={`rounded-xl px-3 py-2 text-[0.92rem] leading-snug text-cocoa ${verdict.tone === "pass" ? "bg-success/10" : verdict.tone === "fail" ? "bg-error/10" : "bg-haldi/25"}`} aria-live="polite">
                      <strong className={verdict.tone === "pass" ? "text-success" : verdict.tone === "fail" ? "text-error" : "text-[#8A6D00]"}>{verdict.title}. </strong>
                      {verdict.text}
                    </div>
                  )}
                  <textarea value={s.fitWhy} onChange={(e) => set({ fitWhy: e.target.value })} rows={2} aria-label="Why does it fit this occasion?" placeholder="Why does your concept fit this occasion?" className="w-full rounded-2xl border border-line-strong bg-white px-3 py-2 text-[0.98rem] text-cocoa outline-none focus:border-orange" />
                  <textarea value={s.launchWhy} onChange={(e) => set({ launchWhy: e.target.value })} rows={2} aria-label="Launch justification" placeholder="Launch justification: why should Eat Better launch it?" className="w-full rounded-2xl border border-line-strong bg-white px-3 py-2 text-[0.98rem] text-cocoa outline-none focus:border-orange" />
                </>
              )}

              {s.step === 7 && (
                <div className="rounded-2xl bg-success/10 p-3 text-[0.98rem] text-cocoa">
                  <div className="font-display text-[1.15rem] font-semibold text-success">Concept Portfolio ready</div>
                  <p className="mt-1">Scroll down to copy, download or print it. You can still go back and improve your concept.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => go(6)} className="eb-btn eb-btn-secondary !py-1.5 !text-[0.85rem] !normal-case">
                      <ArrowLeft className="size-4" /> Edit concept
                    </button>
                    <button
                      onClick={() => {
                        setS({ ...INIT, step: 1 });
                        setRot(0);
                      }}
                      className="eb-btn eb-btn-secondary !py-1.5 !text-[0.85rem] !normal-case"
                    >
                      <RotateCcw className="size-4" /> Start a new concept
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {s.step >= 1 && s.step <= 6 && (
            <div className="mt-auto border-t border-cocoa/10 pt-3">
              {!gates[s.step] && (
                <p className="mb-2 flex gap-1.5 text-[0.85rem] text-cocoa-2">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#B38F00]" /> {missing[s.step]}
                </p>
              )}
              <div className="flex items-center justify-between gap-2">
                <button onClick={() => go(s.step - 1)} className="eb-btn eb-btn-secondary !py-2 !text-[0.88rem] !normal-case">
                  <ArrowLeft className="size-4" /> Back
                </button>
                <button onClick={() => go(s.step + 1)} disabled={!gates[s.step]} className="eb-btn eb-btn-primary !py-2 !text-[0.88rem] !normal-case">
                  {s.step === 6 ? "Create my Concept Portfolio" : "Next"} <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {s.step === 7 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <SimReport data={report} storageKey="ebc-1.5-portfolio" ready />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Hint({ text }: { text: string }) {
  return <div className="pointer-events-none absolute bottom-3 right-3 z-20 hidden rounded-xl bg-cocoa/85 px-3 py-1.5 text-[0.82rem] font-bold text-cream sm:block">{text}</div>;
}

function StepHead({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div>
      <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-orange">Step {n} of 6</div>
      <div className="font-display text-[1.25rem] font-semibold leading-tight text-cocoa">{title}</div>
      <p className="mt-1 text-[0.95rem] leading-snug text-cocoa">{text}</p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.08em] text-cocoa-2">{children}</div>;
}

function FitMeter({ checks }: { checks: { ok: boolean; label: string; why: string }[] }) {
  const n = checks.filter((c) => c.ok).length;
  return (
    <div className="rounded-2xl border border-cocoa/15 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-orange">Brand-fit check</span>
        <span className="text-[0.85rem] font-bold text-cocoa-2">
          {n}/{checks.length}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cocoa/10">
        <motion.div className="h-full rounded-full bg-success" animate={{ width: `${(n / checks.length) * 100}%` }} />
      </div>
      <ul className="mt-2 space-y-1">
        {checks.map((c) => (
          <li key={c.label} className="flex gap-1.5 text-[0.82rem] leading-snug text-cocoa">
            {c.ok ? <Check className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={3} /> : <X className="mt-0.5 size-3.5 shrink-0 text-error" strokeWidth={3} />}
            <span>
              <strong>{c.label}.</strong> {c.why}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
