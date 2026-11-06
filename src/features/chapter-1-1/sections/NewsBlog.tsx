"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, ExternalLink, Globe, Lock, Newspaper, PackageCheck, Quote, TrendingDown, TrendingUp, Tv, Users, Zap } from "lucide-react";

/**
 * The Startup Trends article on Eat Better Co's ₹17 crore pre-Series A round, shown as a blog page.
 * Figures are as reported by the publication (posted 11 April 2025); the live page can be loaded in place.
 */

const URL = "https://thestartuptrends.com/Blog/4924/D2C-healthy-snacking-brand-Eat-Better-Co-raises-Rs17Cr-in-a-pre-Series-A-funding-round.aspx";

const STATS = [
  { icon: TrendingUp, big: "₹17 crore", small: "raised in a pre-Series A round (about $2 million)" },
  { icon: Users, big: "2 co-leads", small: "Prath Ventures and Spring Marketing Capital, with existing investors joining" },
  { icon: Tv, big: "₹50 lakh", small: "committed by Namita Thapar on Shark Tank India, at a ₹100 crore valuation" },
  { icon: PackageCheck, big: "2,00,000+", small: "orders a month through its own website and marketplaces" },
];

export function NewsBlog() {
  const [live, setLive] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      className="mb-10 overflow-hidden rounded-2xl border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]"
      aria-label="News article from The Startup Trends"
    >
      {/* browser bar */}
      <div className="flex items-center gap-3 border-b border-cocoa/15 bg-cream px-3 py-2.5 sm:px-4">
        <span className="hidden gap-1.5 sm:flex" aria-hidden>
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[0.85rem] text-cocoa-2">
          <Lock className="size-3.5 shrink-0 text-success" />
          <span className="truncate">thestartuptrends.com/Blog/4924/…</span>
        </span>
        <div className="flex shrink-0 overflow-hidden rounded-full border border-cocoa/20 bg-white text-[0.82rem] font-bold" role="tablist" aria-label="How to view the article">
          <button role="tab" aria-selected={!live} onClick={() => setLive(false)} className={`px-3 py-1 ${!live ? "bg-cocoa text-cream" : "text-cocoa-2"}`}>
            Article
          </button>
          <button role="tab" aria-selected={live} onClick={() => setLive(true)} className={`px-3 py-1 ${live ? "bg-cocoa text-cream" : "text-cocoa-2"}`}>
            Live page
          </button>
        </div>
      </div>

      {live ? (
        <div className="bg-cream">
          <iframe
            src={URL}
            title="The Startup Trends: Eat Better Co raises Rs 17 Cr in a pre-Series A funding round"
            className="block h-[70vh] min-h-[480px] w-full border-0 bg-white"
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
          <p className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[0.88rem] text-cocoa-2">
            <span>The original page from The Startup Trends, shown inside this chapter.</span>
            <a href={URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-orange hover:underline">
              Open in a new tab <ExternalLink className="size-3.5" />
            </a>
          </p>
        </div>
      ) : (
        <div>
          {/* masthead */}
          <header className="px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.85rem] font-bold text-cocoa-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-2.5 py-0.5 text-orange">
                <Newspaper className="size-3.5" /> The Startup Trends · Funding news
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" /> Posted 11 April 2025
              </span>
              <span>By Ishika Agarwal</span>
            </div>
            <h3 className="mt-3 max-w-4xl font-display text-[clamp(1.5rem,3.2vw,2.3rem)] font-semibold leading-[1.12] text-cocoa">
              D2C healthy snacking brand Eat Better Co raises Rs 17 Cr in a pre-Series A funding round
            </h3>
          </header>

          <figure className="relative aspect-[1640/924] w-full border-y border-cocoa/15">
            <Image src="/chapter-1-1/founders.webp" alt="The founding team of Eat Better Co with the brand's laddoo box, snack box and pouches" fill sizes="(max-width: 1200px) 100vw, 1150px" className="object-cover" />
            <figcaption className="absolute bottom-3 left-3 rounded-lg bg-cream/95 px-3 py-1.5 text-[0.9rem] font-bold text-cocoa">Mridula, Vidushi and Shaurya Kanoria · Image: The Startup Trends</figcaption>
          </figure>

          <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            {/* the story */}
            <div className="min-w-0 space-y-5 text-[1.05rem] leading-relaxed text-cocoa">
              <p>
                <strong>Jaipur-based Eat Better Co</strong>, founded in 2020 by Mridula, Vidushi and Shaurya Kanoria, makes clean-label snacks — dry-fruit laddoos, roasted namkeens, and nut and seed mixes. The article describes it as a modern alternative to traditional Indian snacks that balances indulgence with wellness.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {STATS.map(({ icon: Icon, big, small }) => (
                  <div key={big} className="rounded-2xl border border-cocoa/15 bg-cream p-4">
                    <Icon className="size-5 text-orange" />
                    <div className="mt-2 font-display text-[1.55rem] font-semibold leading-none text-cocoa">{big}</div>
                    <div className="mt-1.5 text-[0.95rem] leading-snug text-cocoa-2">{small}</div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="flex items-center gap-2 font-display text-[1.2rem] font-semibold text-cocoa">
                  <Zap className="size-5 text-orange" /> Where the money goes
                </h4>
                <p className="mt-1.5">New products, and scaling up on quick-commerce apps that deliver in minutes:</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {["Zepto", "Blinkit", "Swiggy Instamart"].map((q) => (
                    <span key={q} className="rounded-full border border-cocoa bg-white px-3 py-1 text-[0.95rem] font-bold text-cocoa">
                      {q}
                    </span>
                  ))}
                </div>
              </div>

              <blockquote className="relative rounded-2xl bg-cocoa px-5 pb-5 pt-7 text-cream">
                <Quote className="absolute -top-3 left-5 size-7 rounded-full bg-haldi p-1.5 text-cocoa" />
                <p className="font-display text-[1.15rem] leading-snug">
                  “When we started, it was just about making great snacks for friends and family. But over the years, we realised we were solving a much bigger problem — people wanted delicious, healthy snacks they could trust.”
                </p>
                <footer className="mt-3 text-[0.92rem] font-bold text-haldi">Mridula Kanoria, co-founder</footer>
              </blockquote>
            </div>

            {/* the numbers */}
            <aside className="min-w-0 space-y-4">
              <div className="rounded-2xl border border-cocoa bg-white p-5 shadow-[2px_2px_0_0_#2f1c1a]">
                <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">Revenue (standalone)</div>
                <div className="mt-4 space-y-3">
                  {[
                    { y: "FY23", v: 5.33, w: 37 },
                    { y: "FY24", v: 14.47, w: 100 },
                  ].map((r) => (
                    <div key={r.y}>
                      <div className="flex items-baseline justify-between text-[0.95rem] font-bold text-cocoa">
                        <span>{r.y}</span>
                        <span className="tabular-nums">₹{r.v} crore</span>
                      </div>
                      <div className="mt-1 h-3 overflow-hidden rounded-full bg-cream">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${r.w}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full bg-orange" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[0.95rem] font-bold text-success">
                  <TrendingUp className="size-4" /> Nearly tripled in one year
                </p>
              </div>

              <div className="rounded-2xl border border-cocoa bg-white p-5 shadow-[2px_2px_0_0_#2f1c1a]">
                <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">Net loss</div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-[1.05rem] text-cocoa-2 line-through">₹1.18 crore</span>
                  <span className="font-display text-[1.6rem] font-semibold leading-none text-cocoa">₹63 lakh</span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[0.95rem] font-bold text-success">
                  <TrendingDown className="size-4" /> Down 46% — better cost control while growing
                </p>
              </div>

              <div className="rounded-2xl bg-peach/60 p-4 text-[0.92rem] leading-snug text-cocoa">
                <strong>Reading the news like a business student:</strong> revenue grew while losses shrank. That combination is what convinces investors a young brand can grow sustainably.
              </div>
            </aside>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-cocoa/15 bg-cream px-5 py-3.5 sm:px-8">
            <span className="text-[0.88rem] text-cocoa-2">Figures as reported by The Startup Trends. Financial year ends 31 March.</span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setLive(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-cocoa bg-white px-3 py-1.5 text-[0.9rem] font-bold text-cocoa hover:bg-peach">
                <Globe className="size-4" /> View the live page
              </button>
              <a href={URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-orange px-3 py-1.5 text-[0.9rem] font-bold text-white hover:bg-cocoa">
                Read the original <ExternalLink className="size-4" />
              </a>
            </div>
          </footer>
        </div>
      )}
    </motion.article>
  );
}
