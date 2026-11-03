/**
 * Chapter 1.4 — Problem–Solution Fit.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-03).
 * Brand claims stay labelled "(brand claim)" exactly as in the source; "2 lakh+ orders a month"
 * stays "reported". No customer reviews or quotes are invented anywhere in this chapter.
 * Consumers in the Consumer Insight Expedition are FICTIONAL (labelled in the UI) — see expedition/data.ts.
 */

export const CHAPTER = {
  module: "Module 1",
  number: "1.4",
  title: ["Problem–Solution", "Fit"] as [string, string],
  subtitle: "A real problem, a product that solves it — and customers who keep coming back.",
  objective:
    "Identify the consumer problem (snacks that force a choice between taste and health) and analyse how Eat Better’s products solve it.",
};

export const VIDEO = {
  title: "Eat Better - The Better Laddoos",
  h264: "/chapter-1-4/video/better-laddoos-h264.mp4",
  poster: "/chapter-1-4/video/better-laddoos-poster.jpg",
  caption: "An early ad from Eat Better Co’s own YouTube channel (older packaging). Watch how it names a problem first — then shows the answer.",
};

export const DEFINITION =
  "Problem–Solution Fit exists when a defined group of target customers faces a recurring challenge, and a product addresses it effectively enough to drive continuous repeat purchases.";

/** The definition, split into its three parts (same words as the source). */
export const FIT_PARTS = [
  { id: "who", label: "Who", text: "A defined group of target customers", img: "/chapter-1-3/kitchen-experiments.webp" },
  { id: "problem", label: "Problem", text: "faces a recurring challenge", img: "/chapter-1-1/art/balance.webp" },
  { id: "product", label: "Product", text: "and a product addresses it effectively", img: "/chapter-1-4/frames/natural-laddoos.webp" },
  { id: "result", label: "Result", text: "enough to drive continuous repeat purchases", img: "/chapter-1-2/frames/shipping-box.webp" },
];

/* Core market dynamics */
export const MARKET = {
  problem:
    "Traditional Indian snacks and sweets are daily staples, but they rely heavily on deep-frying, refined sugar, and palm oil. Existing healthy alternatives often sacrifice taste or offer unfamiliar profiles.",
  solution:
    "Re-engineering nostalgic Indian snack flavours using cleaner ingredients, natural sweetening, and oil-free processing methods.",
};

/** "Re-engineer it" switches — each pair is taken from the problem and solution sentences above. */
export const SWITCHES = [
  { id: "process", from: "Deep-frying", to: "Oil-free processing methods" },
  { id: "sweet", from: "Refined sugar", to: "Natural sweetening" },
  { id: "ingredients", from: "Palm oil", to: "Cleaner ingredients" },
];

/* Problem → Eat Better's answer → proof point (the table, word for word) */
export type FitRow = { id: string; problem: string; answer: string; proof: string };
export const FIT_TABLE: FitRow[] = [
  {
    id: "tasty",
    problem: "Tasty snacks are not healthy",
    answer: "Dates-sweetened laddoos, roasted namkeens, millet and quinoa options",
    proof: "Zero palm oil, refined sugar and bad fats (brand claim)",
  },
  {
    id: "boring",
    problem: "Healthy snacks taste boring",
    answer: "Familiar Indian flavours such as bhujia, bhel and chatpata",
    proof: "Customer reviews on the website",
  },
  {
    id: "unsure",
    problem: "Not sure what is in the packet",
    answer: "Clean, simple ingredients and lab-tested nutrition",
    proof: "FSSAI certified; lab tested nutrition (brand claim)",
  },
  {
    id: "nearby",
    problem: "Hard to find healthy snacks nearby",
    answer: "Available online and on quick-commerce apps",
    proof: "Reported 2 lakh+ orders a month",
  },
];

/* ── "Is it fit?" signal sorter (grounded in the key takeaway) ───── */
export const SIGNALS: { id: string; text: string; real: boolean; note: string }[] = [
  { id: "repeat-customers", text: "Repeat customers", real: true, note: "Named in the key takeaway as a real signal." },
  { id: "ad", text: "A big advertising campaign", real: false, note: "The takeaway says fit is proven by repeat customers, “not by advertising”." },
  { id: "reviews", text: "Reviews", real: true, note: "Named in the key takeaway as a real signal." },
  { id: "billboard", text: "A billboard in the city", real: false, note: "A billboard is a kind of advertising (general explanation) — it shows the brand, not that customers come back." },
  { id: "repeat-orders", text: "Repeat orders", real: true, note: "Named in the key takeaway as a real signal." },
  { id: "family-packs", text: "Family-size packs", real: true, note: "Named in the key takeaway as a real signal. (General explanation: a family buying the bigger pack is planning to keep eating it.)" },
  { id: "tv-ad", text: "A TV commercial", real: false, note: "A TV commercial is advertising (general explanation). It can bring a first purchase, but it doesn't prove fit." },
];

export const TAKEAWAY =
  "Fit is proven by repeat customers, not by advertising. Reviews, repeat orders and family-size packs are the real signals.";

export const THINK = {
  q1: "Interview five people at home or school about their snack choices. What problem do they mention most?",
  q2: "Is there a customer group Eat Better does not yet solve a problem for?",
};
