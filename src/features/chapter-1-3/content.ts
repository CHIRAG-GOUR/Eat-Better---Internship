/**
 * Chapter 1.3 — Origin Story & Founders.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-02).
 * The supplied text repeats its key takeaway and Think & Discuss at the end; each appears once here
 * (the three-question set from section 10 is used, plus the optional mini activity from section 11).
 */

export const CHAPTER = {
  module: "Module 1",
  number: "1.3",
  title: ["Origin Story", "& Founders"] as [string, string],
  subtitle: "From a family's snack problem to a national brand — one careful step at a time.",
  objective:
    "Trace the journey of the three founders (Mridula Kanoria, Shaurya Kanoria, Vidushi Kajaria), the early model of exhibitions and direct selling, and how leadership roles evolved.",
};

export const VIDEOS = {
  sharkTank: {
    id: "x09Y94ksOY0",
    title: "Eat Better Co के Product पर क्यों हुआ Sharks को Doubt? | Shark Tank India S4 | 100 Crore Valuation",
    caption: "Shark Tank India, Season 4 (Sony LIV on YouTube) — plays from YouTube.",
  },
  gifting: {
    title: "Diwali Corporate Gifting, Done Thoughtfully | Inside Eat Better Co",
    av1: "/chapter-1-3/video/diwali-gifting-av1.mp4",
    h264: "/chapter-1-3/video/diwali-gifting-h264.mp4",
    poster: "/chapter-1-3/video/gifting-poster.jpg",
    caption: "Inside Eat Better Co today — from the brand's own channel.",
  },
};

/* 1–3 · the origin story */
export const STORY = [
  {
    id: "spark",
    kicker: "1 · The spark: a family problem",
    text:
      "Founder Mridula Kanoria says she started the kitchen because she was tired of choosing between tasty and healthy for her own family. She asked why laddoos could not have protein, and why bhujia could not be roasted yet still delicious. In her family everyone worked, travelled and kept odd hours, so snacks were always in demand.",
    lesson: "Many strong businesses start with a problem the founder faces personally.",
    img: "/chapter-1-3/home-kitchen.webp",
  },
  {
    id: "experiments",
    kicker: "2 · Small experiments in a home kitchen",
    text:
      "The brand began with small experiments using dates, millets and real masalas. The first aim was simple: make familiar snacks with cleaner ingredients, and check whether people still loved them.",
    img: "/chapter-1-3/kitchen-experiments.webp",
  },
  {
    id: "bigger",
    kicker: "3 · A bigger problem than they first thought",
    text:
      "Over the years, the founders realised they were solving a much bigger problem. People across India wanted delicious, healthy snacks they could trust. This realisation turned a family kitchen into a brand.",
    img: "/chapter-1-1/art/across-india.webp",
  },
];

/* 4 · exhibitions & direct selling */
export const EXHIBITIONS = {
  points: [
    "The founders sold at exhibitions and directly to customers.",
    "Meeting customers face to face gave honest, immediate feedback on taste, price and packaging.",
    "This built a loyal community from the ground up, before the brand went online.",
  ],
  why: "A brand that has already listened to real customers makes fewer expensive mistakes later.",
};

/* ── Stall Day game ───────────────────────────────────────────────
 * The customers and their questions are PRACTICE SCENARIOS invented for learning (labelled in the UI).
 * Every product fact in a correct answer comes from the official pack or eatbetterco.com
 * (see src/lib/brand.ts) or from Chapters 1.1–1.3. Wrong answers are deliberately wrong.
 */

/** Official packs on the stall (fronts cut from official product photos). */
export const STALL_PACKS = {
  "hazelnut-laddoo": { name: "Hazelnut Chocolate Laddoos", color: "#2B1A14", kind: "sachet" },
  "coffee-almond-laddoo": { name: "Coffee Almond Laddoos", color: "#2B1A14", kind: "sachet" },
  "peanut-laddoo": { name: "Peanut Chocolate Laddoos", color: "#2B1A14", kind: "sachet" },
  "protein-laddoo": { name: "Protein Laddoos", color: "#2B1A14", kind: "sachet" },
  "millet-bhujia": { name: "Millet Bhujia · Pudina Masti", color: "#B9D23A", kind: "pouch" },
  "millet-bhel": { name: "Millet Bhel · Bombay Bhelpuri", color: "#9DBA3A", kind: "pouch" },
  "millet-namkeen": { name: "Millet Namkeen · Pudina Punch", color: "#3DAE48", kind: "pouch" },
  "quinoa-namkeen": { name: "Quinoa Namkeen · Chilli Lime", color: "#D81F45", kind: "pouch" },
  "ragi-chips": { name: "Ragi Chips · Achari Masti", color: "#F4C21B", kind: "pouch" },
  "nut-mix": { name: "Premium Nut Mix", color: "#1E2A5A", kind: "pouch" },
  "trail-mix": { name: "Better Trail Mix", color: "#E8622C", kind: "pouch" },
  "seed-mix": { name: "Spiced Jaggery Seed Mix", color: "#6E8B3D", kind: "pouch" },
} as const;
export type PackId = keyof typeof STALL_PACKS;

export type Look = {
  skin: string;
  top: string;
  bottom: string;
  hair: string;
  hairStyle: "short" | "long" | "bun";
  dress?: boolean;
  extra?: "glasses" | "cap" | "dupatta" | "backpack" | "apron";
  extraColor?: string;
};

export type StallCustomer = {
  id: string;
  who: string;
  look: Look;
  pack: PackId;
  says: string;
  options: { text: string; good: boolean; reply: string; hint?: string }[];
  fact: string;
};

export const STALL_CUSTOMERS: StallCustomer[] = [
  {
    id: "sugar",
    who: "A man buying for his father",
    look: { skin: "#C68B59", top: "#2E6F95", bottom: "#3B3B3B", hair: "#1E1410", hairStyle: "short", extra: "glasses", extraColor: "#2F1C1A" },
    pack: "coffee-almond-laddoo",
    says: "My father avoids refined sugar. What's in these laddoos?",
    options: [
      { text: "Just a little sugar — he won't even notice.", good: false, reply: "Hmm… that's not what the pack says. Now I'm not sure I can trust you.", hint: "Look at the red strip on the pack. How are these laddoos sweetened?" },
      { text: "They're sweetened with dates — no added sugar. Here, read the pack.", good: true, reply: "Dates instead of sugar? Perfect — I'll take some for him!" },
      { text: "Sugar-free sweets never taste good. Buy something else.", good: false, reply: "Oh. Then why are you selling them?", hint: "Eat Better's belief: you shouldn't have to choose between tasty and healthy." },
    ],
    fact: "From the pack: “Sweetened with dates” · “No added sugar”. Chapter 1.2: Natural Sweetening.",
  },
  {
    id: "fried",
    who: "A mother packing her kids' tiffin",
    look: { skin: "#B5764A", top: "#C2185B", bottom: "#C2185B", hair: "#140C08", hairStyle: "long", dress: true, extra: "dupatta", extraColor: "#FED300" },
    pack: "millet-bhujia",
    says: "Is this bhujia fried? I want something lighter for my kids' tiffin.",
    options: [
      { text: "All tasty namkeen is fried. That's normal.", good: false, reply: "Then it's not right for my kids' tiffin…", hint: "Check the bottom of the pack: is it fried or roasted? Which oil is not used?" },
      { text: "Don't worry about what's inside, just taste it!", good: false, reply: "But I do worry — that's why I asked!", hint: "Answer her real question with a fact from the pack." },
      { text: "It's roasted, not fried — and made with no palm oil.", good: true, reply: "Roasted? Then the kids can have it. Two packs, please!" },
    ],
    fact: "From the pack: “Roasted not fried” · “No palm oil”. Chapter 1.2: Oil & Cooking Innovation.",
  },
  {
    id: "spicy",
    who: "A college student who just tasted a sample",
    look: { skin: "#D9A066", top: "#3E8E41", bottom: "#2B3A55", hair: "#2A1A12", hairStyle: "short", extra: "cap", extraColor: "#FF5C00" },
    pack: "quinoa-namkeen",
    says: "I tasted the Chilli Lime namkeen. It's a bit too spicy for me.",
    options: [
      { text: "Thanks for telling me! Try the Premium Nut Mix — it's sweet & savoury. I'll pass your feedback to our kitchen.", good: true, reply: "You actually listened! I'll take the nut mix." },
      { text: "Spicy is the best part. You'll get used to it.", good: false, reply: "No thanks — I came here to enjoy a snack.", hint: "Face-to-face feedback is a gift. Listen, and suggest something milder." },
      { text: "Nobody else has complained, so it must be fine.", good: false, reply: "Well, I'm complaining now…", hint: "One honest comment can save many future customers. What would a good listener say?" },
    ],
    fact: "Premium Nut Mix is “Sweet & Savoury” (official product page). Chapter 1.3: exhibitions gave honest, immediate feedback on taste.",
  },
  {
    id: "size",
    who: "A grandmother trying Eat Better for the first time",
    look: { skin: "#A86B45", top: "#7B1FA2", bottom: "#7B1FA2", hair: "#BDB6B0", hairStyle: "bun", dress: true, extra: "glasses", extraColor: "#C8963E" },
    pack: "hazelnut-laddoo",
    says: "The 240 g pack is too much before I know if I like it.",
    options: [
      { text: "Bigger packs are better value — take the biggest one.", good: false, reply: "You're not listening to me, beta.", hint: "She wants to try first. Is there a smaller size?" },
      { text: "Start with the 40 g pack. If you love it, come back for a bigger one!", good: true, reply: "A small pack to try? That's just right." },
      { text: "Sorry, it's 240 g or nothing.", good: false, reply: "Then I'll leave it, thank you.", hint: "These laddoos come in 40 g, 120 g and 240 g packs." },
    ],
    fact: "Hazelnut Chocolate Laddoos come in 40 g, 120 g and 240 g (official website). Chapter 1.3: customers gave feedback on price.",
  },
  {
    id: "online",
    who: "A visitor from another city",
    look: { skin: "#8D5A3B", top: "#F2A900", bottom: "#4E342E", hair: "#1A110C", hairStyle: "short", extra: "backpack", extraColor: "#35401D" },
    pack: "trail-mix",
    says: "I love this trail mix, but I live in another city. Can I buy it after today?",
    options: [
      { text: "Ask a shop near your home to order it for you.", good: false, reply: "That sounds like a lot of running around…", hint: "Eat Better is internet-first. Where can anyone in India buy it?" },
      { text: "No — you can only buy it here at the stall today.", good: false, reply: "Oh no. I'll never find it again!", hint: "Remember Chapter 1.1: what does D2C mean?" },
      { text: "Yes! Order online from our website and it's delivered to your door.", good: true, reply: "Delivered home? I'll order more next week!" },
    ],
    fact: "Chapter 1.1: Eat Better is an internet-first, direct-to-consumer (D2C) brand — it sells straight to customers online.",
  },
];

export const STALL_RANKS = [
  { min: 13, title: "Star Seller" },
  { min: 9, title: "Great Seller" },
  { min: 0, title: "Learning Seller" },
];

/* 5 · going national */
export const NATIONAL = [
  { text: "The brand moved online and became internet-first.", img: "/chapter-1-1/art/order-online.webp" },
  { text: "It raised funding from investors.", img: "/chapter-1-3/funding.webp" },
  { text: "It appeared on Shark Tank India (Season 4).", img: "/chapter-1-3/shark-tank-thumb.jpg" },
  { text: "It grew from a home kitchen to a 50,000 sq. ft. facility.", img: "/chapter-1-3/frames/warehouse.webp" },
];

/* 6 · leadership team (role column = general explanation, per the supplied note) */
export const LEADERS = [
  { name: "Mridula Kanoria", role: "Founder", does: "Started the kitchen and shaped the product philosophy" },
  { name: "Shaurya Kanoria", role: "Co-founder & CEO", does: "Leads the company’s overall direction and growth" },
  { name: "Vidushi Kajaria", role: "Co-founder & CMO (Chief Marketing Officer)", does: "Leads brand and marketing" },
  { name: "Pulkit Kanoria", role: "Chief Growth Officer (as listed in business databases)", does: "Focuses on growth" },
];
export const LEADERS_NOTE =
  "Note: the role descriptions are general explanations of what such roles usually do, not statements from the brand.";

/* 7 · how roles evolved */
export const EVOLUTION = {
  early: { title: "In the early days", text: "The founders did everything themselves:", tasks: ["Making", "Selling", "Answering customers"] },
  later: {
    title: "As the company grew",
    text: "Roles became specialised:",
    roles: [
      { role: "CEO", task: "Overall direction" },
      { role: "CMO", task: "Marketing" },
      { role: "Growth role", task: "Scaling sales" },
    ],
  },
  note: "This is how most startups mature.",
};

/* 8 · journey timeline */
export const TIMELINE = [
  { when: "August 2020", what: "Eat Better Co founded in Jaipur; early sales through exhibitions and direct selling" },
  { when: "2021", what: "First external funding recorded (GetVantage, amount undisclosed)" },
  { when: "2022", what: "Seed round of about Rs 5.5 crore led by Java Capital and Mumbai Angels" },
  {
    when: "Shark Tank India, Season 4",
    what: "Founders asked for Rs 50 lakh for 0.5% equity (a Rs 100 crore valuation) and chose Namita Thapar’s offer, which included a 1% royalty until her investment was recouped",
    shark: true,
  },
  { when: "April 2025", what: "Pre-Series A round of Rs 17 crore co-led by Prath Ventures and Spring Marketing Capital" },
];

export const TAKEAWAY =
  "The founders did not start with a big factory. They started with a real family problem, tested recipes with real customers, and scaled step by step.";

export const THINK = {
  questions: [
    "What is the advantage of selling at exhibitions before selling online?",
    "Which founder role (CEO, CMO, Founder) would you want to shadow, and why?",
    "Why do you think the founders chose a deal with a royalty on Shark Tank India instead of one with more equity?",
  ],
  mini: "Prepare 5 interview questions you would ask the founders about their first year. Share them with a mentor, then pick the best question and explain why it would teach you the most.",
};
