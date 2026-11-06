"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Ban, Link2, Play, Unlink, Zap } from "lucide-react";
import { GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";
import { shuffle } from "./shared";

/**
 * Activity 1 · Dependency Map & Stress Test.
 * Research basis: Business Model Canvas classroom practice (fill the Key Partners / Activities / Resources blocks
 * for a real company and connect them to the value delivered) and supply-chain "map the network, then knock out a
 * node" stress tests used in supply-chain risk training. The student WIRES the map from evidence cards (each card
 * proves exactly one link; one card about investors proves no day-to-day link), then predicts which activities and
 * customer promises break when one node fails. Predictions are checked against the graph itself, so only following
 * the arrows works — guessing a set of nodes is marked wrong and explained.
 */

type Kind = "need" | "act" | "promise";
type N = { id: string; label: string; kind: Kind; sub?: "partner" | "resource" };
const NODES: N[] = [
  { id: "sup", label: "Ingredient suppliers", kind: "need", sub: "partner" },
  { id: "kit", label: "50,000 sq. ft. kitchen", kind: "need", sub: "resource" },
  { id: "rec", label: "Recipes & know-how", kind: "need", sub: "resource" },
  { id: "inv", label: "Investors", kind: "need", sub: "partner" },
  { id: "corp", label: "Corporate clients", kind: "need", sub: "partner" },
  { id: "team", label: "Team (about 70)", kind: "need", sub: "resource" },
  { id: "brand", label: "Brand & customer trust", kind: "need", sub: "resource" },
  { id: "web", label: "Website & online store", kind: "need", sub: "resource" },
  { id: "mkt", label: "Marketplaces & quick-commerce", kind: "need", sub: "partner" },
  { id: "log", label: "Logistics & delivery", kind: "need", sub: "partner" },
  { id: "src", label: "Source & check ingredients", kind: "act" },
  { id: "cook", label: "Cook small batches, test each", kind: "act" },
  { id: "pack", label: "Pack & fulfil orders", kind: "act" },
  { id: "newp", label: "New products & festive ranges", kind: "act" },
  { id: "mktg", label: "Marketing, community & care", kind: "act" },
  { id: "home", label: "Website orders delivered home", kind: "promise" },
  { id: "qc", label: "Packs on marketplace & quick-commerce apps", kind: "promise" },
  { id: "gift", label: "Festive & corporate gift boxes", kind: "promise" },
  { id: "care", label: "Help & community for customers", kind: "promise" },
];
const node = (id: string) => NODES.find((n) => n.id === id)!;
const COL: Record<Kind, number> = { need: 0, act: 1, promise: 2 };

type L = [string, string];
/** Links already drawn on the map (practice model). */
const GIVEN: L[] = [
  ["rec", "cook"],
  ["rec", "newp"],
  ["pack", "home"],
  ["pack", "qc"],
  ["pack", "gift"],
  ["web", "home"],
  ["log", "gift"],
  ["team", "mktg"],
  ["brand", "mktg"],
  ["mktg", "care"],
];

type Card = { id: string; link?: L; text: string; img?: string; imgAlt?: string; hint: string; why: string };
const CARDS: Card[] = [
  {
    id: "c-sup",
    link: ["sup", "src"],
    text: "Millet Bhujia is made with chana daal, jowar, rice, ragi and rice bran oil. These ingredients come from Eat Better’s ingredient suppliers.",
    img: "/chapter-3-2/act-bhujia-ingredients.webp",
    imgAlt: "Millet Bhujia ingredient grid: chana daal, jowar, rice, ragi and rice bran oil",
    hint: "Which key partner sends these ingredients, and which key activity brings them in and checks them?",
    why: "Ingredient suppliers → Source & check ingredients. The suppliers send the ingredients; sourcing and quality checks bring them in.",
  },
  {
    id: "c-src",
    link: ["src", "cook"],
    text: "A batch can only be cooked from ingredients that have already been sourced and checked.",
    hint: "Two key activities are in this sentence. Which one has to happen first?",
    why: "Source & check ingredients → Cook small batches. No checked ingredients, no batch.",
  },
  {
    id: "c-kit",
    link: ["kit", "cook"],
    text: "Eat Better’s 50,000 sq. ft. kitchen and production facility is where its snacks are cooked in small batches.",
    hint: "This is a key resource. Which key activity happens inside it?",
    why: "50,000 sq. ft. kitchen → Cook small batches, test each.",
  },
  {
    id: "c-cook",
    link: ["cook", "pack"],
    text: "Only a batch that has been cooked and tested can move on to packaging.",
    hint: "Two key activities again. Which one feeds the other?",
    why: "Cook small batches, test each → Pack & fulfil orders.",
  },
  {
    id: "c-log",
    link: ["log", "home"],
    text: "A packed website order still has to travel to the customer’s door. Delivery partners carry it there.",
    hint: "This partner is needed for one promise to a customer. Which promise ends at the customer’s door?",
    why: "Logistics & delivery → Website orders delivered home.",
  },
  {
    id: "c-mkt",
    link: ["mkt", "qc"],
    text: "Shoppers on marketplaces and quick-commerce apps buy through the platform, so the platform has to list Eat Better’s packs.",
    hint: "Which partner owns those apps, and which customer promise depends on them?",
    why: "Marketplaces & quick-commerce → Packs on marketplace & quick-commerce apps.",
  },
  {
    id: "c-newp",
    link: ["newp", "gift"],
    text: "A festive hamper like this one (“What’s inside the box: 10 item combo”) is a range that has to be developed for the season.",
    img: "/chapter-3-2/act-tyohaar-inside.webp",
    imgAlt: "Tyohaar Diwali gift hamper: what's inside the box, a 10 item combo",
    hint: "Which key activity creates festive ranges, and which promise does it deliver?",
    why: "New products & festive ranges → Festive & corporate gift boxes.",
  },
  {
    id: "c-corp",
    link: ["corp", "gift"],
    text: "Companies order boxes like this Ultimate Snack Box in bulk to gift their teams and clients.",
    img: "/chapter-3-2/act-snackbox-contents.webp",
    imgAlt: "Ultimate Snack Box contents table listing 12 products and their pack sizes",
    hint: "Which key partner places bulk gifting orders, and which promise is it part of?",
    why: "Corporate clients → Festive & corporate gift boxes.",
  },
  {
    id: "c-inv",
    text: "Investors (Java Capital, Mumbai Angels, Prath Ventures, Spring Marketing Capital and others) back the company with money to grow. They don’t source, cook, pack or deliver anything day to day.",
    hint: "Read the last sentence again. Does this card prove a day-to-day link on the map?",
    why: "Investors are key partners, but on a day-to-day map they don’t feed any activity directly. The right answer is “No day-to-day link”.",
  },
];

type Scenario = { id: string; fail: string; text: string };
const SCENARIOS: Scenario[] = [
  { id: "sup", fail: "sup", text: "The main millet supplier can’t deliver for two weeks." },
  { id: "kit", fail: "kit", text: "The kitchen has to shut for a week for repairs." },
  { id: "mkt", fail: "mkt", text: "A quick-commerce platform stops listing Eat Better." },
  { id: "log", fail: "log", text: "The delivery partners go on strike for three days." },
  { id: "web", fail: "web", text: "The website and online store go down for a day." },
];

const key = (a: string, b: string) => [a, b].sort().join("|");
const ALL_LINKS: L[] = [...GIVEN, ...CARDS.filter((c) => c.link).map((c) => c.link!)];

/** Everything downstream of the failed node (a node breaks if anything it needs breaks), with the depth it breaks at. */
function cascade(fail: string): Map<string, number> {
  const depth = new Map<string, number>([[fail, 0]]);
  let frontier = [fail];
  let d = 0;
  while (frontier.length) {
    d++;
    const next: string[] = [];
    for (const [a, b] of ALL_LINKS) {
      if (frontier.includes(a) && !depth.has(b)) {
        depth.set(b, d);
        next.push(b);
      }
    }
    frontier = next;
  }
  depth.delete(fail);
  return depth;
}
const needsOf = (id: string) => ALL_LINKS.filter(([, b]) => b === id).map(([a]) => node(a).label);

type Box = { l: number; r: number; t: number; b: number };

export default function DependencyMap({ onDone }: { onDone: (summary: string) => void }) {
  const [cards, setCards] = useState(() => shuffle(CARDS));
  const [ci, setCi] = useState(0);
  const [wired, setWired] = useState<L[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);
  const [scen, setScen] = useState<Scenario[]>(() => pickScenarios());
  const [si, setSi] = useState(0);
  const [pred, setPred] = useState<string[]>([]);
  const [runTries, setRunTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ text: string; n: number }[]>([]);
  const [pos, setPos] = useState<Record<string, Box>>({});
  const wrap = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const wiring = ci < cards.length;
  const S = scen[si];
  const done = !wiring && si >= scen.length;
  const step = wiring ? 0 : done ? 4 : 1 + si;

  function pickScenarios() {
    const others = shuffle(SCENARIOS.filter((s) => s.id !== "sup")).slice(0, 2);
    return shuffle([SCENARIOS[0], ...others]);
  }

  const measure = useCallback(() => {
    const w = wrap.current;
    if (!w) return;
    const o = w.getBoundingClientRect();
    const next: Record<string, Box> = {};
    for (const n of NODES) {
      const el = refs.current[n.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      next[n.id] = { l: r.left - o.left, r: r.right - o.left, t: r.top - o.top, b: r.bottom - o.top };
    }
    setPos(next);
  }, []);
  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [measure]);

  const reset = () => {
    setCards(shuffle(CARDS));
    setCi(0);
    setWired([]);
    setSel(null);
    setTries(0);
    setMistakes(0);
    setFb(null);
    setScen(pickScenarios());
    setSi(0);
    setPred([]);
    setRunTries(0);
    setRevealed(false);
    setResults([]);
  };

  const C = cards[ci];
  const miss = (text: string) => {
    setMistakes((m) => m + 1);
    setTries((t) => t + 1);
    setFb({ tone: "bad", text });
  };
  const nextCard = (text: string) => {
    setFb({ tone: "good", text });
    setTries(0);
    setSel(null);
    const n = ci + 1;
    setCi(n);
    if (n >= cards.length) setFb({ tone: "info", text: `${text} The map is wired. Now the stress test: one thing fails. Mark every key activity and customer promise you think will break, then run the test.` });
  };
  const tryLink = (a: string, b: string) => {
    setSel(null);
    if (!C) return;
    if (GIVEN.some(([x, y]) => key(x, y) === key(a, b))) return miss("That link is already drawn on the map. This card proves a different one.");
    if (!C.link) return miss(tries === 0 ? C.hint : C.why);
    if (key(a, b) !== key(...C.link)) return miss(tries === 0 ? C.hint : `${C.why} Draw that link.`);
    setWired((w) => [...w, C.link!]);
    nextCard(C.why);
  };
  const noLink = () => {
    if (!C) return;
    if (C.link) return miss(tries === 0 ? `This card does prove a link. ${C.hint}` : C.why);
    nextCard("Right. Investors matter for growth, but nothing on the day-to-day map stops if you leave them out of it.");
  };

  const tapNode = (id: string) => {
    if (done) return;
    if (wiring) {
      if (!sel) return setSel(id);
      if (sel === id) return setSel(null);
      if (node(sel).kind === node(id).kind && node(id).kind !== "act") {
        setSel(id);
        return setFb({ tone: "info", text: "Links on this map always connect to a key activity or a customer promise. Pick the other end in a different column." });
      }
      return tryLink(sel, id);
    }
    if (!S || revealed) return;
    const n = node(id);
    if (n.kind === "need") return setFb({ tone: "info", text: "In the stress test, mark key activities and customer promises (the middle and right columns)." });
    setPred((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const broken = S ? cascade(S.fail) : new Map<string, number>();
  const run = () => {
    if (!S) return;
    const truth = [...broken.keys()];
    const missed = truth.filter((x) => !pred.includes(x));
    const extra = pred.filter((x) => !truth.includes(x));
    if (!missed.length && !extra.length) {
      setRevealed(true);
      setRunTries(0);
      const still = NODES.filter((n) => n.kind !== "need" && !broken.has(n.id)).map((n) => n.label);
      setFb({ tone: "good", text: `${truth.length} of 9 break. Still running: ${still.join(", ")}.` });
      setResults((r) => [...r, { text: S.text, n: truth.length }]);
      return;
    }
    setMistakes((m) => m + 1);
    setRunTries((t) => t + 1);
    if (runTries === 0) {
      setFb({ tone: "bad", text: `${missed.length ? `${missed.length} thing${missed.length === 1 ? "" : "s"} you didn’t mark will break` : "You found everything that breaks"}${extra.length ? `, and ${extra.length} you marked will keep running` : ""}. Start at the failed node and follow every arrow out of it, then every arrow out of those.` });
    } else {
      const lines = [
        ...missed.map((x) => `“${node(x).label}” breaks: it needs ${needsOf(x).join(" + ")}.`),
        ...extra.map((x) => `“${node(x).label}” keeps running: it only needs ${needsOf(x).join(" + ")}, and none of those broke.`),
      ];
      setFb({ tone: "bad", text: lines.join(" ") });
    }
  };
  const nextScenario = () => {
    const n = si + 1;
    setSi(n);
    setPred([]);
    setRevealed(false);
    setRunTries(0);
    if (n >= scen.length) {
      const all = results;
      const sup = all.find((r) => r.text === SCENARIOS[0].text);
      setFb({ tone: "good", text: `A failed ingredient supplier broke ${sup?.n ?? 6} of the 9 activities and promises, more than any other single failure you tested. That is why sourcing and supplier relationships are a key part of the canvas.` });
      onDone(`Dependency Map: wired 8 links from evidence and spotted the investor card; stress tests: ${all.map((r) => `${r.text.replace(/\.$/, "")} → ${r.n} of 9 break`).join("; ")} (${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}).`);
    } else setFb(null);
  };

  const links: { a: string; b: string; given: boolean }[] = [...GIVEN.map(([a, b]) => ({ a, b, given: true })), ...wired.map(([a, b]) => ({ a, b, given: false }))];
  const path = (a: string, b: string) => {
    const A = pos[a];
    const B = pos[b];
    if (!A || !B) return "";
    if (COL[node(a).kind] === COL[node(b).kind]) {
      const x = (A.l + A.r) / 2;
      return `M ${x} ${A.b} L ${(B.l + B.r) / 2} ${B.t - 4}`;
    }
    const x1 = A.r;
    const y1 = (A.t + A.b) / 2;
    const x2 = B.l - 4;
    const y2 = (B.t + B.b) / 2;
    const dx = (x2 - x1) / 2;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };
  const isBroken = (id: string) => revealed && broken.has(id);

  const nodeCls = (n: N) => {
    const failed = !wiring && S && S.fail === n.id;
    const predicted = !wiring && pred.includes(n.id) && !revealed;
    const br = isBroken(n.id);
    const runs = revealed && n.kind !== "need" && !br;
    const base = "relative z-10 w-full rounded-xl border-2 px-1.5 py-1.5 text-left text-[0.72rem] font-bold leading-tight transition-colors sm:px-2.5 sm:py-2 sm:text-[0.9rem]";
    if (failed) return `${base} border-error bg-error text-white`;
    if (br) return `${base} border-error bg-[#FBE1DE] text-cocoa`;
    if (runs) return `${base} border-success bg-[#E3F3E8] text-cocoa`;
    if (predicted) return `${base} border-dashed border-error bg-white text-cocoa ring-2 ring-error/40`;
    if (sel === n.id) return `${base} border-orange bg-[#FFE9DC] text-cocoa ring-2 ring-orange/40`;
    if (n.kind === "act") return `${base} border-cocoa bg-cream text-cocoa hover:border-orange`;
    if (n.kind === "promise") return `${base} border-cocoa/30 bg-peach text-cocoa hover:border-orange`;
    return `${base} ${n.sub === "partner" ? "border-[#2E7D6B]/50" : "border-orange/50"} bg-white text-cocoa hover:border-cocoa`;
  };

  const column = (kind: Kind, title: string) => (
    <div className="flex min-w-0 flex-col">
      <div className="mb-2 text-center text-[0.68rem] font-extrabold uppercase tracking-[0.06em] text-cocoa-2 sm:text-[0.78rem] sm:tracking-[0.1em]">{title}</div>
      <div className={`flex flex-1 flex-col gap-1.5 ${kind === "need" ? "" : "justify-around"}`}>
        {NODES.filter((n) => n.kind === kind).map((n) => (
          <motion.button
            key={n.id}
            ref={(el: HTMLButtonElement | null) => {
              refs.current[n.id] = el;
            }}
            onClick={() => tapNode(n.id)}
            aria-pressed={sel === n.id || pred.includes(n.id)}
            animate={isBroken(n.id) ? { x: [0, -3, 3, 0] } : { x: 0 }}
            transition={{ delay: (broken.get(n.id) ?? 0) * 0.25 }}
            className={nodeCls(n)}
          >
            {n.kind === "need" && <span className={`mb-0.5 block text-[0.6rem] font-extrabold uppercase tracking-[0.08em] sm:text-[0.66rem] ${!wiring && S?.fail === n.id ? "text-white/80" : n.sub === "partner" ? "text-[#2E7D6B]" : "text-orange"}`}>{n.sub === "partner" ? "Key partner" : "Key resource"}</span>}
            {n.label}
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <GameFrame
      kicker="Activity 1 · Dependency Map"
      title="Wire the business, then break it"
      mission="Every business depends on things it has and people it works with. Wire Eat Better’s map from the evidence cards, then run stress tests: one thing fails, and you predict exactly what breaks."
      steps={["Wire the map", "Stress test 1", "Stress test 2", "Stress test 3"]}
      step={step}
      stars={done ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note={{
        real: "Every resource, activity and partner on the map is from this chapter. The pictures are official Eat Better product images.",
        practice: "The links and the failures are a simplified practice model for this exercise, not a description of Eat Better’s real operations.",
        tip: "A node breaks if anything it needs breaks. Follow the arrows one step at a time.",
      }}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
        {/* task panel */}
        <div className="min-w-0 lg:sticky lg:top-20">
          <AnimatePresence mode="wait">
            {wiring && C && (
              <motion.div key={C.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="rounded-[20px] border-2 border-cocoa bg-white p-4 shadow-[3px_3px_0_0_#2f1c1a]">
                <div className="flex items-center justify-between text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-orange">
                  <span>Evidence card {ci + 1} of {cards.length}</span>
                  <Link2 className="size-4" />
                </div>
                {C.img && (
                  <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-xl border border-cocoa/20">
                    <Image src={C.img} alt={C.imgAlt ?? ""} fill sizes="320px" className="object-cover" />
                  </div>
                )}
                <p className="mt-3 text-[1rem] leading-snug text-cocoa">{C.text}</p>
                <p className="mt-3 text-[0.9rem] text-cocoa-2">
                  Tap the two boxes this card links{sel ? <> — first end: <strong className="text-orange">{node(sel).label}</strong></> : "."}
                </p>
                <button onClick={noLink} className="eb-btn eb-btn-secondary mt-3 !py-2 !text-[0.9rem] !normal-case">
                  <Unlink className="size-4" /> No day-to-day link
                </button>
              </motion.div>
            )}
            {!wiring && S && (
              <motion.div key={S.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[20px] bg-cocoa p-4 text-cream">
                <div className="flex items-center gap-2 text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-haldi">
                  <Zap className="size-4" /> Stress test {si + 1} of {scen.length} · practice
                </div>
                <p className="mt-2 font-display text-[1.3rem] font-semibold leading-snug">{S.text}</p>
                <p className="mt-2 text-[0.92rem] text-cream/85">
                  The red box has failed. Tap every key activity and customer promise that will break ({pred.length} marked).
                </p>
                {!revealed ? (
                  <button onClick={run} className="eb-btn eb-btn-primary mt-3 !normal-case">
                    <Play className="size-4" /> Run the test
                  </button>
                ) : (
                  <button onClick={nextScenario} className="eb-btn eb-btn-primary mt-3 !normal-case">
                    {si + 1 < scen.length ? "Next failure" : "Finish"} <ArrowRight className="size-4" />
                  </button>
                )}
              </motion.div>
            )}
            {done && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[20px] bg-cream p-4">
                <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-orange">Your stress tests</div>
                <ul className="mt-2 grid gap-2">
                  {results.map((r) => (
                    <li key={r.text} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-[0.92rem] text-cocoa">
                      <span>{r.text}</span>
                      <span className="flex shrink-0 items-center gap-1 font-display text-[1.1rem] font-semibold text-error">
                        <Ban className="size-4" /> {r.n}/9
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem] font-bold text-cocoa-2">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-5 border-t-2 border-dashed border-cocoa/40" /> already on the map
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-5 rounded bg-orange" /> wired by you
            </span>
          </div>
        </div>

        {/* the map */}
        <div ref={wrap} className="relative grid min-w-0 grid-cols-3 gap-3 sm:gap-8">
          <svg className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible" aria-hidden>
            <defs>
              <marker id="dm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="context-stroke" />
              </marker>
            </defs>
            {links.map(({ a, b, given }) => {
              const hot = !wiring && S && (S.fail === a || isBroken(a)) && revealed;
              return <path key={`${a}-${b}`} d={path(a, b)} fill="none" stroke={hot ? "#C62828" : given ? "rgba(47,28,26,0.35)" : "#FF5C00"} strokeWidth={given ? 1.6 : 2.6} strokeDasharray={given && !hot ? "5 4" : undefined} markerEnd="url(#dm-arrow)" />;
            })}
          </svg>
          {column("need", "Has & works with")}
          {column("act", "Key activities")}
          {column("promise", "Customer promise")}
        </div>
      </div>
    </GameFrame>
  );
}
