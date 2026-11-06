"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Frown, ListChecks, Meh, Smile } from "lucide-react";
import { CheckRow, GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";
import { VALUE_PROPS, type VpId } from "../content";
import { EvidenceImage, NumIn, inside, pick, rnd, shuffle, toNum, type Flash, type Rect } from "./shared";

/**
 * Activity 1 · Fit Lab.
 * Research basis: the Value Proposition Canvas (Strategyzer) as taught in entrepreneurship courses: interview
 * customers, sort what they say into jobs, pains and gains, keep only what several customers share, then check
 * "fit" by linking each need to a promise that answers it. Here the five FICTIONAL customers change on every
 * attempt; the promises and the proof are Eat Better's real ones.
 * Shortcut blockers: statements are tagged one by one (wrong tags are explained and cost stars), pains are
 * COUNTED by typing (the same person saying a thing twice counts once), two themes map to the same promise,
 * and the proof must be tapped on the exact printed words of a real image, with decoy claims beside it.
 */

type Tag = "job" | "pain" | "gain" | "chatter";
type ThemeId = "palm" | "sugar" | "taste" | "gift" | "speed" | "trust";

const TAGS: { id: Tag; label: string; icon: typeof ListChecks; def: string }[] = [
  { id: "job", label: "Job", icon: ListChecks, def: "what they are trying to get done" },
  { id: "pain", label: "Pain", icon: Frown, def: "something that annoys, worries or blocks them" },
  { id: "gain", label: "Gain", icon: Smile, def: "a result they would love" },
  { id: "chatter", label: "Chatter", icon: Meh, def: "nothing to do with choosing a snack" },
];

const THEMES: Record<ThemeId, { label: string; vp: VpId; about: string; kw: RegExp; lines: { t: "pain" | "gain"; text: string }[] }> = {
  palm: {
    label: "Palm oil worry",
    vp: "clean",
    about: "what oil is in the snack",
    kw: /(palm|oil|label|ingredient)/i,
    lines: [
      { t: "pain", text: "I read the label on every packet and half of them list palm oil, which I would rather avoid." },
      { t: "pain", text: "Palm oil hides in almost every namkeen and I only find out after I flip the pack." },
      { t: "pain", text: "My doctor told us to cut down on cheap oils, so most shelf snacks are out for us." },
    ],
  },
  sugar: {
    label: "Sweets without refined sugar",
    vp: "clean",
    about: "what sweetens the snack",
    kw: /(sugar|sweet|dates)/i,
    lines: [
      { t: "gain", text: "I would love a laddoo that is sweet but not loaded with refined sugar." },
      { t: "pain", text: "Most sweets taste like pure sugar and I feel bad after even one piece." },
      { t: "gain", text: "If a sweet used dates instead of white sugar, I would happily buy it." },
    ],
  },
  taste: {
    label: "Healthy that still tastes familiar",
    vp: "taste",
    about: "how the snack tastes",
    kw: /(taste|cardboard|bhel|namkeen|familiar|chatpata)/i,
    lines: [
      { t: "pain", text: "Healthy snacks taste like cardboard, so nobody at home will touch them." },
      { t: "gain", text: "I want it to taste like the chatpata namkeen I grew up with." },
      { t: "gain", text: "If it tastes like bhel at tea time, the whole family will finish it." },
    ],
  },
  gift: {
    label: "Gifts that are ready to give",
    vp: "gifting",
    about: "putting a gift together",
    kw: /(gift|box|hamper|wrap|ready)/i,
    lines: [
      { t: "pain", text: "I have no time to put a gift together; packing and wrapping takes my whole evening." },
      { t: "gain", text: "A box that arrives ready to hand over would save me so much effort." },
      { t: "pain", text: "Buying twenty loose items and wrapping them for the team is a nightmare." },
    ],
  },
  speed: {
    label: "Needing it fast and easy to order",
    vp: "convenience",
    about: "how quickly and easily they can order",
    kw: /(today|minutes|quick|fast|deliver|order|app|online)/i,
    lines: [
      { t: "pain", text: "When I want a snack I want it today, not a week from now." },
      { t: "gain", text: "I would order it on the app I already use for groceries, in minutes." },
      { t: "pain", text: "Walking to three shops to find one healthy snack is not happening." },
    ],
  },
  trust: {
    label: "Proof that it is checked",
    vp: "quality",
    about: "whether anyone checks the quality",
    kw: /(trust|test|check|proof|certif|licen|healthy)/i,
    lines: [
      { t: "pain", text: "Any brand can print the word healthy; I want to know someone actually checks it." },
      { t: "gain", text: "If the brand shows a quality check and a food-safety certificate, I will trust it faster." },
      { t: "pain", text: "I have been fooled by natural labels that meant nothing." },
    ],
  },
};
const THEME_IDS = Object.keys(THEMES) as ThemeId[];

const JOBS = [
  "I am packing snacks for the kids' school tiffin.",
  "I need something to munch at my desk between meetings.",
  "I am picking a Rakhi gift for my sister.",
  "I am choosing gifts for a client event next month.",
  "I need a snack for late-night study sessions.",
  "I am buying something for the family's evening chai.",
];
const CHATTER = ["It was so hot in Jaipur yesterday.", "My cricket team lost again last night.", "The traffic near my office is terrible.", "I just changed my phone."];
const PEOPLE = [
  { id: "meera", name: "Meera", role: "parent of two" },
  { id: "rohan", name: "Rohan", role: "college student" },
  { id: "sana", name: "Sana", role: "software engineer" },
  { id: "kavita", name: "Kavita", role: "buys festival gifts" },
  { id: "iyer", name: "Mr. Iyer", role: "HR manager" },
  { id: "dev", name: "Dev", role: "analyst" },
];
const EXPLAIN: Record<Tag, string> = {
  job: "It is a job: the task they are trying to get done, not a problem or a wish.",
  pain: "It is a pain: something that annoys, worries or blocks them.",
  gain: "It is a gain: a result they would love to have.",
  chatter: "It is chatter: nothing to do with choosing a snack, so it is not evidence.",
};

type Stmt = { id: string; person: string; type: Tag; theme?: ThemeId; text: string };
function build(seed: number) {
  const r = rnd(seed);
  const order = shuffle(r, THEME_IDS);
  const confirmed = order.slice(0, 3);
  const trap = order[3];
  const single = order[4];
  const people = shuffle(r, PEOPLE).slice(0, 5);
  const stmts: Stmt[] = [];
  let n = 0;
  const add = (person: string, type: Tag, text: string, theme?: ThemeId) => stmts.push({ id: `s${n++}`, person, type, theme, text });
  for (const t of confirmed) {
    const k = pick(r, [2, 3]);
    const who = shuffle(r, people).slice(0, k);
    const lines = shuffle(r, THEMES[t].lines);
    who.forEach((p, i) => add(p.id, lines[i].t, lines[i].text, t));
  }
  const tl = shuffle(r, THEMES[trap].lines);
  const tp = pick(r, people);
  add(tp.id, tl[0].t, tl[0].text, trap);
  add(tp.id, tl[1].t, tl[1].text, trap);
  const sl = pick(r, THEMES[single].lines);
  add(pick(r, people).id, sl.t, sl.text, single);
  shuffle(r, JOBS)
    .slice(0, 5)
    .forEach((j, i) => add(people[i].id, "job", j));
  shuffle(r, CHATTER)
    .slice(0, 2)
    .forEach((c, i) => add(people[i + 1].id, "chatter", c));
  const truth: Partial<Record<ThemeId, number>> = {};
  const mentions: Partial<Record<ThemeId, number>> = {};
  for (const t of [...confirmed, trap, single]) {
    const s = stmts.filter((x) => x.theme === t);
    truth[t] = new Set(s.map((x) => x.person)).size;
    mentions[t] = s.length;
  }
  return { people, stmts: shuffle(r, stmts), confirmed, themes: [...confirmed, trap, single] as ThemeId[], truth, mentions };
}

/* proof images + hotspots */
type Img = { id: string; src: string; w: number; h: number; title: string };
const IMGS: Img[] = [
  { id: "protein", src: "/chapter-3-1/claim-protein.webp", w: 700, h: 700, title: "Protein Chips · “What makes it better” card" },
  { id: "quinoa", src: "/chapter-3-1/claim-quinoa.webp", w: 700, h: 700, title: "Quinoa Namkeen · “What makes it better” card" },
  { id: "ginger", src: "/chapter-3-1/claim-ginger.webp", w: 700, h: 700, title: "Orange Ginger Laddoos · “What makes it better” card" },
  { id: "compare", src: "/chapter-3-1/compare-protein.webp", w: 700, h: 700, title: "Protein Chips · comparison card" },
  { id: "pack", src: "/chapter-3-1/pack-quinoa.webp", w: 700, h: 700, title: "Quinoa Namkeen pack" },
  { id: "hamper", src: "/chapter-3-1/gift-hamper.webp", w: 700, h: 700, title: "Diwali gift hamper" },
  { id: "kitchen", src: "/chapter-3-1/web-kitchen.webp", w: 1200, h: 511, title: "Made in the Better Kitchen · eatbetterco.com" },
  { id: "apps", src: "/chapter-3-1/web-channels.webp", w: 1376, h: 225, title: "“Also available on” · eatbetterco.com" },
];
type Spot = { img: string; r: Rect; theme?: ThemeId; says: string };
const SPOTS: Spot[] = [
  { img: "protein", r: [0.08, 0.5, 0.4, 0.62], theme: "palm", says: "“No Palm Oil” on the Protein Chips card." },
  { img: "quinoa", r: [0.14, 0.48, 0.38, 0.57], theme: "palm", says: "“No Palm Oil” on the Quinoa Namkeen card." },
  { img: "compare", r: [0.09, 0.68, 0.32, 0.75], theme: "palm", says: "“No Palm Oil” in Eat Better’s column of the comparison card." },
  { img: "ginger", r: [0.16, 0.51, 0.4, 0.63], theme: "sugar", says: "“Sweetened With Dates” on the Orange Ginger Laddoos card." },
  { img: "pack", r: [0.33, 0.05, 0.72, 0.11], theme: "taste", says: "“Chatpata Crunchy Namkeen” printed on the pack: a familiar Indian snack style." },
  { img: "hamper", r: [0.29, 0.3, 0.76, 0.76], theme: "gift", says: "The ready-made gift box with the snacks and extras around it." },
  { img: "apps", r: [0.23, 0.42, 0.545, 1], theme: "speed", says: "The Blinkit, Zepto and Instamart quick-commerce icons." },
  { img: "kitchen", r: [0.02, 0.5, 0.25, 0.59], theme: "trust", says: "“6-layer quality protocol” in the kitchen section of the website (a brand claim)." },
  // decoys: real claims that prove something else
  { img: "protein", r: [0.08, 0.36, 0.42, 0.49], says: "“Baked and Not Fried” is a claim about cooking, not about oil, sugar or fats." },
  { img: "protein", r: [0.08, 0.65, 0.42, 0.77], says: "“High Protein & Fibre” is a nutrition claim, not one of the five promises." },
  { img: "quinoa", r: [0.14, 0.6, 0.47, 0.71], says: "“No Cholesterol, No Transfat” is a fats claim: it answers a fats worry, not palm oil." },
  { img: "ginger", r: [0.16, 0.35, 0.48, 0.46], says: "“Only 46 calories per laddoo” is a calorie claim." },
  { img: "ginger", r: [0.16, 0.66, 0.48, 0.78], says: "“Made with 88% dry fruits & nuts” is an ingredients claim, not a sweetener claim." },
  { img: "compare", r: [0.43, 0.65, 0.67, 0.74], says: "That says an ordinary bhujia CONTAINS palm oil. It is the competitor’s column, not Eat Better’s proof." },
  { img: "compare", r: [0.69, 0.65, 0.93, 0.74], says: "That says fried chips CONTAIN palm oil. It is the competitor’s column." },
  { img: "kitchen", r: [0.02, 0.24, 0.3, 0.35], says: "“50,000 sq ft factory” describes size, not a quality check." },
  { img: "apps", r: [0.567, 0.42, 0.657, 1], says: "Amazon is a marketplace, not a quick-commerce app." },
  { img: "apps", r: [0.68, 0.42, 0.77, 1], says: "BigBasket is not one of the apps named in this chapter." },
];
const VP_TOPIC: Record<VpId, string> = { taste: "familiar taste", clean: "what is left out of the recipe", quality: "quality checks and certification", convenience: "ordering easily online or on apps", gifting: "ready-made gifts" };
const VPKW: Record<VpId, RegExp> = {
  taste: /(familiar|taste|chatpata|namkeen|indian)/i,
  clean: /(palm|sugar|dates|fats|cleaner|clean)/i,
  quality: /(6.?layer|six.?layer|quality|fssai|tested|checked)/i,
  convenience: /(order|app|online|quick|minutes|delivery|blinkit|zepto|instamart)/i,
  gifting: /(gift|hamper|box|ready.?made)/i,
};
const WORD = ["zero", "one", "two", "three", "four", "five"];

export default function FitLab({ onDone }: { onDone: (summary: string) => void }) {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 99999));
  const data = useMemo(() => build(seed), [seed]);
  const [step, setStep] = useState(0);
  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [counts, setCounts] = useState<Partial<Record<ThemeId, string>>>({});
  const [countOk, setCountOk] = useState<Partial<Record<ThemeId, boolean>>>({});
  const [pi, setPi] = useState(0);
  const [vp, setVp] = useState<VpId | null>(null);
  const [linked, setLinked] = useState<Partial<Record<ThemeId, { vp: VpId; says: string; img: string; r: Rect }>>>({});
  const [flash, setFlash] = useState<Record<string, Flash>>({});
  const [chosen, setChosen] = useState<ThemeId | null>(null);
  const [text, setText] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);

  const reset = () => {
    setSeed(1 + Math.floor(Math.random() * 99999));
    setStep(0);
    setTags({});
    setCounts({});
    setCountOk({});
    setPi(0);
    setVp(null);
    setLinked({});
    setFlash({});
    setChosen(null);
    setText("");
    setMistakes(0);
    setFb(null);
  };
  const miss = (t: string) => {
    setMistakes((m) => m + 1);
    setFb({ tone: "bad", text: t });
  };

  /* step 0 */
  const tag = (s: Stmt, t: Tag) => {
    if (tags[s.id]) return;
    if (t !== s.type) return miss(`“${s.text}” is not a ${t}. ${EXPLAIN[s.type]}`);
    const next = { ...tags, [s.id]: t };
    setTags(next);
    setFb({ tone: "good", text: EXPLAIN[s.type] });
    if (data.stmts.every((x) => next[x.id])) {
      setStep(1);
      setFb({ tone: "info", text: "Everything is sorted. Now count: a pain only counts as real when at least two different customers mention it." });
    }
  };

  /* step 1 */
  const checkCounts = () => {
    const ok = { ...countOk };
    let bad = 0;
    let msg = "";
    for (const t of data.themes) {
      if (ok[t]) continue;
      const v = toNum(counts[t] ?? "");
      if (!counts[t]?.trim() || Number.isNaN(v)) continue;
      if (v === data.truth[t]) ok[t] = true;
      else {
        bad++;
        msg = v === data.mentions[t] && data.mentions[t] !== data.truth[t] ? `“${THEMES[t].label}”: that is the number of mentions, but one person said it twice. Count each different customer once.` : `“${THEMES[t].label}”: ${v} is not right. Re-read the tagged cards and count how many different people said it.`;
      }
    }
    setCountOk(ok);
    if (bad) {
      setMistakes((m) => m + bad);
      return setFb({ tone: "bad", text: msg });
    }
    if (data.themes.every((t) => ok[t])) {
      setStep(2);
      setFb({ tone: "good", text: `Real needs (2 or more customers): ${data.confirmed.map((t) => THEMES[t].label).join(", ")}. The others are parked until more customers confirm them. Now connect each real need to an Eat Better promise and find the proof.` });
    } else setFb({ tone: "info", text: "Fill every row, then check." });
  };

  /* step 2 */
  const cur = data.confirmed[pi];
  const tap = (img: string, x: number, y: number) => {
    if (!cur) return;
    const th = THEMES[cur];
    const spot = SPOTS.find((s) => s.img === img && inside(s.r, x, y));
    const ok = !!spot && spot.theme === cur && vp === th.vp;
    setFlash((f) => ({ ...f, [img]: { x, y, k: Date.now(), ok } }));
    if (!vp) return miss("First pick which Eat Better promise answers this need, then tap the proof.");
    if (vp !== th.vp) return miss(`The promise “${VALUE_PROPS.find((v) => v.id === vp)!.text}” is about ${VP_TOPIC[vp]}. “${th.label}” is about ${th.about}.`);
    if (!spot) return miss("There is no printed proof where you tapped. Look for the exact words or object on the image.");
    if (spot.theme !== cur) return miss(`${spot.says} That does not prove the promise for “${th.label}”.`);
    setLinked((l) => ({ ...l, [cur]: { vp: th.vp, says: spot.says, img, r: spot.r } }));
    setFb({ tone: "good", text: `${spot.says} Fit confirmed for “${th.label}”.` });
    setVp(null);
    if (pi + 1 < data.confirmed.length) setPi(pi + 1);
    else {
      setStep(3);
      setFb({ tone: "info", text: "All real needs now have a promise and proof. Last: write one fit statement." });
    }
  };

  /* step 3 */
  const vpOf = chosen ? THEMES[chosen].vp : null;
  const checks = useMemo(() => {
    if (!chosen || !vpOf) return [];
    const t = text.trim();
    const words = t.split(/\s+/).filter(Boolean).length;
    const n = data.truth[chosen]!;
    return [
      { ok: new RegExp(`\\b(${n}|${WORD[n]})\\b`, "i").test(t) && /(customers?|people|interviewed)/i.test(t), label: `Cites your evidence: how many of the 5 customers said it (${n})`, hint: "Say how many customers mentioned this need." },
      { ok: THEMES[chosen].kw.test(t), label: "Names the customer need in their words", hint: "What did customers say they want or worry about?" },
      { ok: VPKW[vpOf].test(t), label: "Names the Eat Better promise that answers it", hint: "Which promise did you connect it to?" },
      { ok: /(pack|label|claim|printed|website|app|says|shows|card|box|hamper|icons?)/i.test(t), label: "Points to the proof you found", hint: "Where can a shopper see it? On the pack, a claim card, the website…" },
      { ok: words >= 14 && words <= 45, label: "14 to 45 words", hint: `${words} words so far.` },
    ];
  }, [text, chosen, vpOf, data.truth]);
  const done = checks.length > 0 && checks.every((c) => c.ok);
  const finish = () => {
    setStep(4);
    setFb({ tone: "good", text: "That is fit: a need confirmed by several customers, an answering promise, and proof a shopper can check." });
    onDone(`Fit Lab: ${data.confirmed.length} real needs found among ${data.themes.length} themes (${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}). My fit statement: “${text.trim()}”`);
  };

  const byPerson = (id: string) => data.stmts.filter((s) => s.person === id);
  const tagged = data.stmts.filter((s) => tags[s.id]).length;

  return (
    <GameFrame
      kicker="Activity 1 · Fit Lab"
      title="Do the customers and the promise fit?"
      mission="You have just interviewed five customers. Sort what they said, count what is really shared, then match each real need to an Eat Better promise and prove it on a real image."
      steps={["Sort the quotes", "Count the evidence", "Match and prove", "Write the fit"]}
      step={step}
      stars={step === 4 ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note={{ real: "The five promises are from this chapter. The packs, claim cards and website pictures are official Eat Better material.", practice: "The five customers and everything they say are made up for this exercise and change every attempt.", tip: "One loud customer is not a market. Look for needs that several different people share." }}
    >
      {step === 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-[0.88rem] text-cocoa">
                <t.icon className="size-4 text-orange" />
                <strong>{t.label}</strong> {t.def}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[1rem] text-cocoa">
            Tag every line. <strong>{tagged}</strong> of {data.stmts.length} done. A wrong tag costs a star.
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {data.people.map((p) => (
              <div key={p.id} className="rounded-2xl border border-cocoa/20 bg-cream/50 p-3">
                <div className="font-display text-[1.1rem] font-semibold text-cocoa">
                  {p.name} <span className="text-[0.85rem] font-normal text-cocoa-2">· {p.role} (practice)</span>
                </div>
                <ul className="mt-2 grid gap-2">
                  {byPerson(p.id).map((s) => (
                    <li key={s.id} className={`rounded-xl border p-2.5 ${tags[s.id] ? "border-success/50 bg-success/10" : "border-cocoa/10 bg-white"}`}>
                      <p className="text-[0.98rem] leading-snug text-cocoa">“{s.text}”</p>
                      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Tag this line">
                        {TAGS.map((t) => {
                          const on = tags[s.id] === t.id;
                          return (
                            <button key={t.id} disabled={!!tags[s.id]} onClick={() => tag(s, t.id)} className={`flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-[0.85rem] font-bold ${on ? "border-success bg-success text-white disabled:opacity-100" : "border-cocoa/15 bg-white text-cocoa-2 hover:border-orange disabled:opacity-40"}`}>
                              {on ? <Check className="size-3.5" strokeWidth={3} /> : <t.icon className="size-3.5" />} {t.label}
                            </button>
                          );
                        })}
                        {tags[s.id] && s.theme && <span className="rounded-full bg-orange/15 px-2.5 py-1 text-[0.82rem] font-bold text-orange">Theme: {THEMES[s.theme].label}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="text-[1rem] text-cocoa">
            Rule: a pain or gain is <strong>real</strong> only when <strong>at least two different customers</strong> say it. Type how many different customers raised each theme.
          </p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {data.people.map((p) => (
                <div key={p.id} className="rounded-xl bg-cream/60 p-2.5">
                  <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.08em] text-cocoa-2">{p.name}</div>
                  <ul className="mt-1 grid gap-1">
                    {byPerson(p.id)
                      .filter((s) => s.theme)
                      .map((s) => (
                        <li key={s.id} className="text-[0.9rem] leading-snug text-cocoa">
                          <span className="mr-1.5 rounded-full bg-orange/15 px-2 py-0.5 text-[0.75rem] font-bold text-orange">{THEMES[s.theme!].label}</span>
                          {s.text}
                        </li>
                      ))}
                    {!byPerson(p.id).some((s) => s.theme) && <li className="text-[0.88rem] text-cocoa-2">No pains or gains raised.</li>}
                  </ul>
                </div>
              ))}
            </div>
            <div className="self-start rounded-2xl border border-cocoa/20 bg-white p-3">
              <div className="font-display text-[1.1rem] font-semibold text-cocoa">Different customers per theme</div>
              <ul className="mt-2 grid gap-2">
                {data
                  .themes
                  .slice()
                  .sort((a, b) => a.localeCompare(b))
                  .map((t) => (
                    <li key={t} className="flex items-center justify-between gap-2">
                      <span className="text-[0.95rem] font-bold text-cocoa">{THEMES[t].label}</span>
                      <NumIn label={`Customers for ${THEMES[t].label}`} value={counts[t] ?? ""} ok={countOk[t]} disabled={countOk[t]} onChange={(v) => setCounts((c) => ({ ...c, [t]: v }))} />
                    </li>
                  ))}
              </ul>
              <button onClick={checkCounts} className="eb-btn eb-btn-primary mt-3 !normal-case">
                <Check className="size-4" /> Check my counts
              </button>
            </div>
          </div>
        </div>
      )}

      {step >= 2 && step < 4 && (
        <div>
          {step === 2 && cur && (
            <div className="rounded-2xl border-2 border-orange bg-orange/5 p-3">
              <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-orange">
                Real need {pi + 1} of {data.confirmed.length}
              </div>
              <div className="font-display text-[1.3rem] font-semibold text-cocoa">
                {THEMES[cur].label} <span className="text-[0.95rem] font-normal text-cocoa-2">· {data.truth[cur]} customers</span>
              </div>
              <p className="mt-1 text-[0.98rem] text-cocoa">1. Pick the Eat Better promise that answers it. 2. Tap the printed proof on one of the images below.</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {VALUE_PROPS.map((v) => (
                  <button key={v.id} aria-pressed={vp === v.id} onClick={() => setVp(v.id)} className={`rounded-xl border-2 px-3 py-2 text-left text-[0.95rem] font-semibold leading-snug ${vp === v.id ? "border-orange bg-orange text-white" : "border-cocoa/15 bg-white text-cocoa hover:border-orange"}`}>
                    {v.text} {v.brand && <span className="text-[0.78rem] font-bold opacity-80">(brand claim)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">Needs you linked</div>
                <ul className="mt-2 grid gap-2">
                  {data.confirmed.map((t) => (
                    <li key={t}>
                      <button onClick={() => setChosen(t)} aria-pressed={chosen === t} className={`w-full rounded-xl border-2 p-3 text-left ${chosen === t ? "border-orange bg-orange/10" : "border-cocoa/15 bg-white hover:border-orange"}`}>
                        <div className="font-bold text-cocoa">
                          {THEMES[t].label} · {data.truth[t]} customers
                        </div>
                        <div className="text-[0.9rem] text-cocoa-2">Promise: {VALUE_PROPS.find((v) => v.id === THEMES[t].vp)!.text}</div>
                        <div className="text-[0.9rem] text-cocoa-2">Proof: {linked[t]?.says}</div>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[0.9rem] text-cocoa-2">
                  Parked (only one customer):{" "}
                  {data.themes
                    .filter((t) => !data.confirmed.includes(t))
                    .map((t) => THEMES[t].label)
                    .join(", ")}
                  .
                </p>
              </div>
              <div>
                <label htmlFor="fit" className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">
                  {chosen ? `Your fit statement for “${THEMES[chosen].label}”` : "Pick a need on the left first"}
                </label>
                <textarea id="fit" disabled={!chosen} value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="e.g. Three of the five customers said … so Eat Better’s … promise answers it, and the pack shows …" className="mt-1 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.02rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
                <ul className="mt-2 grid gap-1.5">
                  {checks.map((c) => (
                    <CheckRow key={c.label} {...c} />
                  ))}
                </ul>
                <button disabled={!done} onClick={finish} className="eb-btn eb-btn-primary mt-3 !normal-case">
                  <Check className="size-4" /> Submit my fit statement
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {IMGS.map((im) => (
                <div key={im.id} className={im.w > im.h * 1.5 ? "sm:col-span-2" : ""}>
                  <EvidenceImage src={im.src} w={im.w} h={im.h} title={im.title} stamped={Object.values(linked).filter((l) => l?.img === im.id).map((l) => l!.r)} flash={flash[im.id]} onTap={(x, y) => tap(im.id, x, y)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <AnimatePresence>
        {step === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-success/10 p-4 text-cocoa">
            <div className="font-display text-[1.2rem] font-semibold">Your fit statement</div>
            <p className="mt-1">“{text.trim()}”</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GameFrame>
  );
}
