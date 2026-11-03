/**
 * Virtual Quality & Packaging Facility — SIMULATION DATA.
 * Every batch, lot, fault, reading and acceptance criterion here is FICTIONAL, invented for learning
 * and labelled as simulated in the UI. Nothing here describes a real Eat Better batch, recipe,
 * operating parameter or fault. Station names, process descriptions and objectives come from the
 * chapter's "6 Layers Quality Promise" table (see ../../content.ts).
 */

export type StationId = "sourcing" | "check" | "prepping" | "cooking" | "testing" | "packaging";
export const ORDER: StationId[] = ["sourcing", "check", "prepping", "cooking", "testing", "packaging"];

/** world x position of each station along the facility walkway (z = 0 line) */
export const STATION_X: Record<StationId, number> = { sourcing: -13, check: -7.8, prepping: -2.6, cooking: 2.6, testing: 7.8, packaging: 13 };
export const REVIEW_X = 18.6;

export const BATCH_ID = "SIM-0617";

/* 01 · Sourcing — incoming lots on the receiving dock */
export const LOTS = [
  { id: "A", name: "Lot A · Almonds", sack: "#B9905E", fill: "#C98E5A", finding: "Even colour, dry, sealed sack, supplier tag complete.", fault: false },
  { id: "B", name: "Lot B · Dates", sack: "#9C7A4C", fill: "#5B2E1C", finding: "Damp patch on the sack and grey-green spots on the dates — a freshness problem.", fault: true },
  { id: "C", name: "Lot C · Millets", sack: "#C2A070", fill: "#E2B866", finding: "Clean, dry grains, sealed sack, supplier tag complete.", fault: false },
] as const;

/* 02 · Quality Check — sample trays under the magnifier, with simulated inspection criteria */
export const QC_CRITERIA = ["Size: even, no very small pieces", "Freshness: no dull, shrivelled or spotted pieces", "Consistency: same colour across the tray", "Impurities: nothing that isn't the ingredient"];
export const TRAYS = [
  { id: "T1", name: "Tray 1", finding: "Even size, fresh colour, no impurities.", fault: null },
  { id: "T2", name: "Tray 2", finding: "Small stones and husk pieces mixed in with the almonds.", fault: "Visible foreign particles (impurities)" },
  { id: "T3", name: "Tray 3", finding: "Pieces of very different sizes, many too small.", fault: "Uneven size" },
] as const;

/* 03 · Prepping — the chapter's order: hygienic cleaning → dry roasting → meticulous sorting */
export const MACHINES = [
  { id: "clean", name: "Cleaning" },
  { id: "roast", name: "Dry roasting" },
  { id: "sort", name: "Sorting" },
] as const;
export const PREP_ORDER = ["clean", "roast", "sort"];
export const PARTICLES = 4;

/* 04 · Cooking — abstract, simulated dials (NOT real recipes or operating settings) */
export const DIALS = [
  { id: "heat", name: "Heat", stops: ["Low", "Medium", "High"] },
  { id: "time", name: "Time", stops: ["Short", "Medium", "Long"] },
  { id: "size", name: "Batch size", stops: ["Small", "Large"] },
] as const;
export const COOK_TARGET = { heat: 1, time: 1, size: 0 };

/* 05 · Batch testing — fictional samples and fictional acceptance criteria */
export const TEST_CRITERIA = [
  { k: "Moisture", rule: "Level 3 or lower (on a simulated 1–5 scale)" },
  { k: "Texture", rule: "Crunchy in every sample" },
  { k: "Taste", rule: "Matches the reference sample" },
  { k: "Consistency", rule: "Same colour in every sample" },
];
export const SAMPLES = [
  { id: "A", moisture: 2, texture: "Crunchy", taste: "Matches", colour: "Even golden" },
  { id: "B", moisture: 2, texture: "Crunchy", taste: "Matches", colour: "Even golden" },
  { id: "C", moisture: 4, texture: "Soft", taste: "Matches", colour: "Slightly pale" },
  { id: "D", moisture: 3, texture: "Crunchy", taste: "Matches", colour: "Even golden" },
] as const;
export const TEST_RULES = [
  { d: "release", label: "Release", rule: "Every sample meets every criterion." },
  { d: "rework", label: "Rework", rule: "A quality criterion is missed (e.g. texture or moisture), but there is no safety problem." },
  { d: "reject", label: "Reject", rule: "There is a safety problem, such as foreign matter or spoilage." },
] as const;

/* 06 · Packaging */
export const MATERIALS = [
  { id: "paper", name: "Single-layer paper bag", ok: false, why: "Paper alone lets moisture and air in — snacks lose crunch and freshness fast." },
  { id: "pouch", name: "Multi-layer, high-barrier food-grade pouch", ok: true, why: "Matches the chapter: protective, multi-layer food-grade packaging that keeps out moisture and air." },
  { id: "tub", name: "Open plastic tub with a loose lid", ok: false, why: "A loose lid is not a seal — air and moisture get straight in." },
] as const;

/** Practice back-of-pack label for the simulated batch (not a real product). One required item is missing. */
export const LABEL_ITEMS = [
  { id: "name", label: "Product name", present: true, value: "Roasted Millet Mix (practice product)" },
  { id: "ingredients", label: "Ingredient list", present: true, value: "Millets, peanuts, curry leaves, spices, salt" },
  { id: "nutrition", label: "Nutrition information", present: true, value: "Per 30 g serving (simulated values)" },
  { id: "net", label: "Net quantity", present: true, value: "150 g" },
  { id: "batch", label: "Batch number", present: true, value: BATCH_ID },
  { id: "bestbefore", label: "Best before / date marking", present: false, value: "" },
  { id: "fssai", label: "FSSAI licence number", present: true, value: "00000000000000 (sample)" },
] as const;

/* Per-station summary used by the tracker, the review board and the report */
export const STATION_INFO: Record<StationId, { n: number; name: string; role: string; objectives: string[]; issue: string; action: string }> = {
  sourcing: {
    n: 1,
    name: "Sourcing",
    role: "Inspect incoming raw materials and decide which lots can proceed.",
    objectives: ["Inspect all three lots", "Accept or reject each lot"],
    issue: "Lot B (dates) showed a freshness problem: damp sack and spotted fruit.",
    action: "Rejected Lot B and returned it to the supplier; Lots A and C accepted.",
  },
  check: {
    n: 2,
    name: "Quality Check",
    role: "Examine samples for size, freshness, consistency and impurities against the criteria.",
    objectives: ["Inspect every tray under the magnifier", "Flag the trays that fail the criteria"],
    issue: "Tray 2 had visible foreign particles; Tray 3 had uneven, undersized pieces.",
    action: "Flagged Trays 2 and 3 so they are held back; Tray 1 passed.",
  },
  prepping: {
    n: 3,
    name: "Prepping",
    role: "Set the preparation sequence and check the sorted output.",
    objectives: ["Set the sequence: cleaning → roasting → sorting", "Find the foreign particles left after sorting", "Decide what happens next"],
    issue: "Sorting was incomplete — foreign particles were still in the output tray.",
    action: "Re-sorted the batch and re-inspected it before cooking.",
  },
  cooking: {
    n: 4,
    name: "Cooking",
    role: "Set up a small batch and adjust the simulated controls until the batch hits target.",
    objectives: ["Adjust heat, time and batch size", "Lock settings that give an even, golden, crunchy batch"],
    issue: "Some settings burned, under-cooked or unevenly cooked the batch (simulated).",
    action: "Locked a small batch at medium heat and medium time (simulated controls).",
  },
  testing: {
    n: 5,
    name: "Batch Testing",
    role: "Test samples against the acceptance criteria and choose release, rework or reject.",
    objectives: ["Test all four samples", "Compare with the acceptance criteria", "Choose release, rework or reject"],
    issue: "Sample C had inconsistent texture (soft) and moisture above the limit.",
    action: "Sent the batch for rework — a quality miss, not a safety problem.",
  },
  packaging: {
    n: 6,
    name: "Packaging",
    role: "Choose the packaging, inspect the seal and label, and run a freshness-protection check.",
    objectives: ["Choose the packaging material", "Find the seal defect", "Find what's missing on the label", "Run the leak test until it passes"],
    issue: "A pouch had a defective seal, and the label was missing its best-before date.",
    action: "Re-packed in a new sealed pouch, added the date marking, and re-ran the leak test.",
  },
};
