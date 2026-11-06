"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { CheckRow, GameFrame, starsFor, type Feedback } from "@/components/play/GameFrame";
import { NumIn, rnd, toNum } from "./shared";

/**
 * Activity 2 · Channel Data Desk.
 * Channels are judged with two different questions: REACH (which channel brings the most first-time buyers) and
 * LOYALTY (in which channel do buyers come back). Students compute both from a made-up order log that is
 * re-generated on every attempt (the winner changes), then must write a recommendation that cites their own
 * numbers. A common slip (dividing by the channel's orders instead of the total) is caught and explained.
 */

type Ch = "web" | "market" | "qc" | "bulk";
const CH: { id: Ch; name: string; re: RegExp }[] = [
  { id: "web", name: "Own website", re: /(website|own site|eatbetterco)/i },
  { id: "market", name: "Marketplace (e.g. Amazon)", re: /(amazon|marketplace)/i },
  { id: "qc", name: "Quick-commerce apps", re: /(quick.?commerce|blinkit|zepto|instamart)/i },
  { id: "bulk", name: "Corporate & bulk requests", re: /(corporate|bulk)/i },
];
const RANGE: Record<Ch, [number, number]> = { web: [40, 80], market: [35, 70], qc: [50, 95], bulk: [10, 24] };

function build(seed: number) {
  const r = rnd(seed);
  for (let tries = 0; tries < 400; tries++) {
    const rows = CH.map((c) => {
      const [lo, hi] = RANGE[c.id];
      const orders = lo + Math.floor(r() * (hi - lo));
      const repeat = Math.round(orders * (0.12 + r() * 0.5));
      return { id: c.id, orders, repeat, first: orders - repeat };
    });
    const T = rows.reduce((a, x) => a + x.first, 0);
    const byShare = [...rows].sort((a, b) => b.first - a.first);
    const byRate = [...rows].sort((a, b) => b.repeat / b.orders - a.repeat / a.orders);
    const gap1 = ((byShare[0].first - byShare[1].first) / T) * 100;
    const gap2 = (byRate[0].repeat / byRate[0].orders - byRate[1].repeat / byRate[1].orders) * 100;
    if (byShare[0].id !== byRate[0].id && gap1 >= 3 && gap2 >= 4) {
      return { rows, T, topFirst: byShare[0].id, topLoyal: byRate[0].id };
    }
  }
  const rows = CH.map((c, i) => ({ id: c.id, orders: 50 + i * 3, repeat: 10 + i * 8, first: 40 - i * 5 }));
  return { rows, T: rows.reduce((a, x) => a + x.first, 0), topFirst: "web" as Ch, topLoyal: "bulk" as Ch };
}

const nm = (id: Ch) => CH.find((c) => c.id === id)!.name;
const near = (a: number, b: number) => Math.abs(a - b) <= 0.6;
const numbersIn = (t: string) => (t.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);

export default function ChannelDesk({ onDone }: { onDone: (summary: string) => void }) {
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 99999));
  const d = useMemo(() => build(seed), [seed]);
  const [step, setStep] = useState(0);
  const [first, setFirst] = useState<Record<string, string>>({});
  const [total, setTotal] = useState("");
  const [share, setShare] = useState<Record<string, string>>({});
  const [rate, setRate] = useState<Record<string, string>>({});
  const [ok, setOk] = useState<Record<string, boolean>>({});
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<Feedback>(null);

  const reset = () => {
    setSeed(1 + Math.floor(Math.random() * 99999));
    setStep(0);
    setFirst({});
    setTotal("");
    setShare({});
    setRate({});
    setOk({});
    setT1("");
    setT2("");
    setMistakes(0);
    setFb(null);
  };

  const sharePct = (id: Ch) => (d.rows.find((x) => x.id === id)!.first / d.T) * 100;
  const ratePct = (id: Ch) => {
    const x = d.rows.find((y) => y.id === id)!;
    return (x.repeat / x.orders) * 100;
  };

  /* generic checker: returns number of wrong cells and the first message */
  const run = (cells: { key: string; val: string; truth: number; tol: number; hint: string }[]) => {
    const nextOk = { ...ok };
    let bad = 0;
    let msg = "";
    let empty = false;
    for (const c of cells) {
      if (ok[c.key]) continue;
      if (!c.val.trim() || Number.isNaN(toNum(c.val))) {
        empty = true;
        continue;
      }
      if (Math.abs(toNum(c.val) - c.truth) <= c.tol) nextOk[c.key] = true;
      else {
        bad++;
        msg = c.hint;
      }
    }
    setOk(nextOk);
    if (bad) {
      setMistakes((m) => m + bad);
      setFb({ tone: "bad", text: msg });
      return false;
    }
    if (empty) {
      setFb({ tone: "info", text: "Fill in every box first." });
      return false;
    }
    return true;
  };

  const check0 = () => {
    const cells = d.rows.map((x) => ({ key: `f-${x.id}`, val: first[x.id] ?? "", truth: x.first, tol: 0, hint: `${nm(x.id)}: first-time orders = all orders minus repeat orders (${x.orders} minus ${x.repeat}).` }));
    cells.push({ key: "T", val: total, truth: d.T, tol: 0, hint: "The total is the sum of the four first-time numbers you just worked out." });
    if (run(cells)) {
      setStep(1);
      setFb({ tone: "good", text: `${d.T} first-time orders in all. Next: reach. What share of ALL first-time orders does each channel bring?` });
    }
  };
  const check1 = () => {
    const cells = d.rows.map((x) => {
      const wrongWay = (x.first / x.orders) * 100;
      const typed = toNum(share[x.id] ?? "");
      const slip = !Number.isNaN(typed) && Math.abs(typed - wrongWay) <= 0.6;
      return { key: `s-${x.id}`, val: share[x.id] ?? "", truth: sharePct(x.id), tol: 0.6, hint: slip ? `${nm(x.id)}: you divided by that channel's own orders. Share of reach divides by the TOTAL first-time orders (${d.T}).` : `${nm(x.id)}: share = first-time orders ÷ ${d.T} × 100. Round to one decimal.` };
    });
    if (run(cells)) {
      setStep(2);
      setFb({ tone: "good", text: `${nm(d.topFirst as Ch)} reaches the most first-time buyers. Now loyalty: in which channel do customers come back?` });
    }
  };
  const check2 = () => {
    const cells = d.rows.map((x) => ({ key: `r-${x.id}`, val: rate[x.id] ?? "", truth: ratePct(x.id), tol: 0.6, hint: `${nm(x.id)}: repeat rate = repeat orders ÷ that channel's orders × 100 (${x.repeat} ÷ ${x.orders}).` }));
    if (run(cells)) {
      setStep(3);
      setFb({ tone: "good", text: `${nm(d.topLoyal as Ch)} has the highest repeat rate. The winner for reach and the winner for loyalty are different channels. Now write your recommendation, citing your own numbers.` });
    }
  };

  const mk = (kind: "first" | "loyal", text: string) => {
    const id = (kind === "first" ? d.topFirst : d.topLoyal) as Ch;
    const val = kind === "first" ? sharePct(id) : ratePct(id);
    const t = text.trim();
    const words = t.split(/\s+/).filter(Boolean).length;
    return [
      { ok: CH.find((c) => c.id === id)!.re.test(t), label: "Names the channel your numbers support", hint: kind === "first" ? "Which channel brings the most first-time buyers?" : "Which channel has the highest repeat rate?" },
      { ok: numbersIn(t).some((n) => near(n, val)), label: `Cites your ${kind === "first" ? "share of first-time orders" : "repeat rate"} number`, hint: "Use the percentage you computed." },
      { ok: /(because|since|so )/i.test(t), label: "Gives a reason", hint: "Say because…" },
      { ok: /(this data|these orders|practice|sample|made.?up)/i.test(t), label: "Says it is practice data", hint: "These numbers are made up; say so honestly." },
      { ok: words >= 12 && words <= 50, label: "12 to 50 words", hint: `${words} words so far.` },
    ];
  };
  const c1 = mk("first", t1);
  const c2 = mk("loyal", t2);
  const done = [...c1, ...c2].every((c) => c.ok) && t1.trim() !== t2.trim();
  const finish = () => {
    setStep(4);
    setFb({ tone: "good", text: "Two different questions, two different answers. That is why a business uses more than one channel." });
    onDone(`Channel Data Desk: first-time reach led by ${nm(d.topFirst as Ch)} (${sharePct(d.topFirst as Ch).toFixed(1)}%), loyalty led by ${nm(d.topLoyal as Ch)} (${ratePct(d.topLoyal as Ch).toFixed(1)}%), ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}. First-time: “${t1.trim()}” Loyal: “${t2.trim()}”`);
  };

  const cellCls = "border-b border-cocoa/10 px-2 py-2 text-[0.95rem] text-cocoa";

  return (
    <GameFrame
      kicker="Activity 2 · Channel Data Desk"
      title="Which channel is best, and for whom?"
      mission="Here is a made-up log of 4 channels. Work out which channel brings the most first-time buyers and which keeps buyers coming back. The two answers are not the same, and the numbers change on every attempt."
      steps={["First-time orders", "Reach share", "Repeat rate", "Recommend"]}
      step={step}
      stars={step === 4 ? starsFor(mistakes) : undefined}
      onReset={reset}
      feedback={fb}
      note={{ real: "The four channels are the ones in this chapter.", practice: "Every order count in this table is invented for the exercise and is not Eat Better data.", tip: "A repeat order is an order from someone who has bought before." }}
    >
      <div className="overflow-x-auto rounded-2xl border border-cocoa/20">
        <table className="w-full min-w-[560px] text-left">
          <thead className="bg-cream text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-cocoa-2">
            <tr>
              <th className="px-2 py-2">Channel (practice data)</th>
              <th className="px-2 py-2">All orders</th>
              <th className="px-2 py-2">Repeat orders</th>
              <th className="px-2 py-2">First-time orders</th>
              <th className="px-2 py-2">Share of all first-time</th>
              <th className="px-2 py-2">Repeat rate</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((x) => (
              <tr key={x.id}>
                <td className={`${cellCls} font-bold`}>{nm(x.id)}</td>
                <td className={`${cellCls} tabular-nums`}>{x.orders}</td>
                <td className={`${cellCls} tabular-nums`}>{x.repeat}</td>
                <td className={cellCls}>{step === 0 ? <NumIn label={`First-time orders ${nm(x.id)}`} value={first[x.id] ?? ""} ok={ok[`f-${x.id}`]} disabled={ok[`f-${x.id}`]} onChange={(v) => setFirst((f) => ({ ...f, [x.id]: v }))} /> : <span className="tabular-nums font-bold">{x.first}</span>}</td>
                <td className={cellCls}>{step === 1 ? <NumIn label={`Share ${nm(x.id)}`} unit="%" value={share[x.id] ?? ""} ok={ok[`s-${x.id}`]} disabled={ok[`s-${x.id}`]} onChange={(v) => setShare((f) => ({ ...f, [x.id]: v }))} /> : step > 1 ? <span className="tabular-nums font-bold">{sharePct(x.id).toFixed(1)}%</span> : <span className="text-cocoa-2/50">?</span>}</td>
                <td className={cellCls}>{step === 2 ? <NumIn label={`Repeat rate ${nm(x.id)}`} unit="%" value={rate[x.id] ?? ""} ok={ok[`r-${x.id}`]} disabled={ok[`r-${x.id}`]} onChange={(v) => setRate((f) => ({ ...f, [x.id]: v }))} /> : step > 2 ? <span className="tabular-nums font-bold">{ratePct(x.id).toFixed(1)}%</span> : <span className="text-cocoa-2/50">?</span>}</td>
              </tr>
            ))}
            <tr className="bg-cream/60">
              <td className={`${cellCls} font-bold`} colSpan={3}>
                Total first-time orders
              </td>
              <td className={cellCls} colSpan={3}>
                {step === 0 ? <NumIn label="Total first-time orders" value={total} ok={ok.T} disabled={ok.T} onChange={setTotal} /> : <span className="tabular-nums font-bold">{d.T}</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {step === 0 && (
        <div className="mt-3">
          <p className="text-[1rem] text-cocoa">Work out first-time orders for each channel (all orders minus repeat orders), then add them up.</p>
          <button onClick={check0} className="eb-btn eb-btn-primary mt-2 !normal-case">
            <Check className="size-4" /> Check
          </button>
        </div>
      )}
      {step === 1 && (
        <div className="mt-3">
          <p className="text-[1rem] text-cocoa">
            <strong>Reach:</strong> what percentage of the {d.T} first-time orders comes from each channel? One decimal place is fine.
          </p>
          <button onClick={check1} className="eb-btn eb-btn-primary mt-2 !normal-case">
            <Check className="size-4" /> Check
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="mt-3">
          <p className="text-[1rem] text-cocoa">
            <strong>Loyalty:</strong> what percentage of each channel&apos;s own orders are repeat orders?
          </p>
          <button onClick={check2} className="eb-btn eb-btn-primary mt-2 !normal-case">
            <Check className="size-4" /> Check
          </button>
        </div>
      )}
      {step >= 3 && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {([["first", "Best channel for FIRST-TIME buyers", t1, setT1, c1], ["loyal", "Best channel for LOYAL buyers", t2, setT2, c2]] as const).map(([k, label, val, set, checks]) => (
            <div key={k}>
              <label htmlFor={`cd-${k}`} className="text-[0.85rem] font-extrabold uppercase tracking-[0.1em] text-orange">
                {label}
              </label>
              <textarea id={`cd-${k}`} value={val} disabled={step === 4} onChange={(e) => set(e.target.value)} rows={3} placeholder="In this data, … because …" className="mt-1 w-full rounded-2xl border border-line-strong bg-cream/50 px-4 py-3 text-[1.02rem] leading-relaxed text-cocoa outline-none focus:border-orange" />
              <ul className="mt-2 grid gap-1.5">
                {checks.map((c) => (
                  <CheckRow key={c.label} {...c} />
                ))}
              </ul>
            </div>
          ))}
          {step === 3 && (
            <div className="lg:col-span-2">
              <button disabled={!done} onClick={finish} className="eb-btn eb-btn-primary !normal-case">
                <Check className="size-4" /> Submit my recommendations
              </button>
            </div>
          )}
        </div>
      )}
    </GameFrame>
  );
}


