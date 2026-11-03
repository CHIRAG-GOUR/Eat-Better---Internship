/**
 * The Consumer Insight Expedition — data.
 * Every consumer here is FICTIONAL (a practice scenario, labelled in the UI). Their words are written
 * for learning; they are not real reviews or quotes. Each consumer's underlying problem maps to one row
 * of the chapter's Problem table (content.ts → FIT_TABLE).
 */
import type { Look } from "@/components/sim/Person";

export type ProblemId = "tasty" | "boring" | "unsure" | "nearby";
export type LocationId = "supermarket" | "kitchen" | "office" | "canteen";
export type ObjectKind = "basket" | "packet" | "chai" | "tiffin" | "vending" | "plate";

export type Question = {
  id: "habit" | "occasion" | "frustration" | "why" | "leading";
  q: string;
  a: string;
  /** what kind of evidence this answer gives the notebook */
  tag: string;
};

export type Consumer = {
  id: string;
  name: string;
  role: string;
  segment: string;
  location: LocationId;
  /** position inside the neighbourhood */
  pos: [number, number];
  face: number;
  look: Look;
  /** what they SAY they want */
  says: string;
  questions: Question[];
  object: { kind: ObjectKind; title: string; facts: string[]; pos: [number, number, number] };
  /** short observed behaviour for the evidence card */
  observed: string;
  /** the problem that keeps driving their buying decision (correct wall group) */
  problem: ProblemId;
  /** one-line driver for the report */
  driver: string;
};

export const LOCATIONS: Record<LocationId, { name: string; center: [number, number]; color: string }> = {
  supermarket: { name: "Supermarket", center: [-11, -9], color: "#2E7D32" },
  kitchen: { name: "Family kitchen", center: [11, -9], color: "#C2185B" },
  office: { name: "Office break area", center: [-11, 9], color: "#1E3A8A" },
  canteen: { name: "College canteen", center: [11, 9], color: "#E65100" },
};

export const STUDIO_POS: [number, number] = [0, -19];
export const EVIDENCE_NEEDED = 5;

const LEADING_NOTE = "Leading question: it suggests the answer you want instead of finding out what they think.";
export const LEADING_FEEDBACK = LEADING_NOTE;

export const CONSUMERS: Consumer[] = [
  {
    id: "meera",
    name: "Meera",
    role: "Parent of two, doing the weekly shop",
    segment: "Parents",
    location: "supermarket",
    pos: [-12.6, -10.2],
    face: 0.6,
    look: { skin: "#B5764A", top: "#00897B", bottom: "#00897B", hair: "#140C08", hairStyle: "long", dress: true, extra: "dupatta", extraColor: "#FED300" },
    says: "I want something sweet for the kids' snack box.",
    questions: [
      { id: "habit", q: "What do you usually buy for their snack box?", a: "Biscuits and packaged mithai. They love sweet things.", tag: "Buying habit" },
      { id: "occasion", q: "When do they eat it?", a: "In the short break at school, and with milk when they come home.", tag: "Occasion" },
      { id: "frustration", q: "What bothers you about the sweet snacks you buy now?", a: "Most of them are full of refined sugar. I put them back on the shelf… and then pick them up again, because nothing else tastes as good.", tag: "Ingredient concern" },
      { id: "why", q: "Why do you end up buying them anyway?", a: "The kids won't touch sweets that taste 'healthy'. I want sweet and no refined sugar — I just can't find both in one packet.", tag: "What really drives her choice" },
      { id: "leading", q: "Would a famous TV ad make you trust a snack?", a: "Maybe I'd try it once. I'd still turn the packet over and read the back.", tag: "Leading question" },
    ],
    object: {
      kind: "basket",
      title: "Meera's shopping basket",
      pos: [-11.4, 0, -10.6],
      facts: ["A box of mithai and two packs of cream biscuits (fictional brands).", "She turned every pack over to read the ingredients before putting it in.", "Observed: she frowned at the sugar line — and kept the sweet snacks anyway."],
    },
    observed: "Reads labels, frowns at sugar, buys the sweet pack anyway.",
    problem: "tasty",
    driver: "Wants sweet snacks without refined sugar.",
  },
  {
    id: "ravi",
    name: "Ravi",
    role: "Young professional who goes to the gym",
    segment: "Young professionals",
    location: "supermarket",
    pos: [-9.2, -11.2],
    face: -0.4,
    look: { skin: "#C68B59", top: "#455A64", bottom: "#263238", hair: "#1E1410", hairStyle: "short" },
    says: "I just want a high-protein snack.",
    questions: [
      { id: "habit", q: "How do you choose a snack here?", a: "I pick whatever says 'healthy' or 'protein' on the front.", tag: "Buying habit" },
      { id: "occasion", q: "When do you eat it?", a: "After the gym, and on days I skip lunch.", tag: "Occasion" },
      { id: "frustration", q: "What makes choosing hard?", a: "The front says healthy, but the back has a long list of ingredients I can't even pronounce.", tag: "Ingredient concern" },
      { id: "why", q: "So how do you decide in the end?", a: "Honestly, I don't. I stand here comparing packets for ten minutes and often walk away. I'm never sure what's really in the packet.", tag: "What really drives his choice" },
      { id: "leading", q: "You'd buy any snack that says 'protein' on it, right?", a: "I used to. Now I'm not sure what that word even means on a pack.", tag: "Leading question" },
    ],
    object: {
      kind: "packet",
      title: "The packet Ravi keeps picking up",
      pos: [-8.3, 0, -10.4],
      facts: ["A big 'HEALTHY' badge on the front (fictional brand).", "The back lists 19 ingredients, several with chemical-sounding names.", "Observed: he put it back and picked it up again — twice."],
    },
    observed: "Compares packets for ages, then walks away unsure.",
    problem: "unsure",
    driver: "Can't tell what is really inside the packet.",
  },
  {
    id: "dadaji",
    name: "Mr. Sharma (Dadaji)",
    role: "Grandfather, evening chai at home",
    segment: "Older adults",
    location: "kitchen",
    pos: [9.4, -10.4],
    face: -0.5,
    look: { skin: "#A86B45", top: "#F5F5F0", bottom: "#F5F5F0", hair: "#BDB6B0", hairStyle: "short", extra: "glasses", extraColor: "#C8963E" },
    says: "Chai needs something crunchy with it!",
    questions: [
      { id: "habit", q: "What do you usually have with your chai?", a: "Namkeen from the corner shop — bhujia, mathri.", tag: "Buying habit" },
      { id: "occasion", q: "How often?", a: "Every evening at five. Without fail.", tag: "Occasion" },
      { id: "frustration", q: "Is anything about those snacks a problem for you?", a: "My doctor told me to cut down on fried food. But everything crunchy is deep-fried!", tag: "Ingredient concern" },
      { id: "why", q: "So what do you end up doing?", a: "Some days I skip it and the chai feels empty. Most days I eat the fried one anyway. I want the crunch without the deep-frying.", tag: "What really drives his choice" },
      { id: "leading", q: "Wouldn't you just switch to fruit instead?", a: "Fruit with chai? No, no. You're telling me what to eat — not asking what I want.", tag: "Leading question" },
    ],
    object: {
      kind: "chai",
      title: "Dadaji's evening chai plate",
      pos: [10.4, 0.82, -10.9],
      facts: ["A cup of chai and a plate of fried namkeen.", "An oil stain on the paper under the namkeen.", "Observed: he has this every single evening."],
    },
    observed: "Eats fried namkeen daily, though told to cut down.",
    problem: "tasty",
    driver: "Wants crunchy snacks that aren't deep-fried.",
  },
  {
    id: "neha",
    name: "Neha",
    role: "Parent packing tomorrow's tiffins",
    segment: "Parents",
    location: "kitchen",
    pos: [12.8, -8.6],
    face: -0.6,
    look: { skin: "#D4A373", top: "#C2185B", bottom: "#3E2723", hair: "#1A110C", hairStyle: "bun" },
    says: "I want healthy snacks for the family.",
    questions: [
      { id: "habit", q: "What healthy snacks have you tried?", a: "Sprouts chaat and plain makhana last week.", tag: "Buying habit" },
      { id: "occasion", q: "When does the family snack?", a: "School and office tiffins, and the 4 pm hunger at home.", tag: "Occasion" },
      { id: "frustration", q: "How did the family like them?", a: "The kids brought the tiffin back untouched. They call healthy snacks 'boring'.", tag: "Taste preference" },
      { id: "why", q: "What happens after that?", a: "I give up and buy chips so at least they eat something. I need healthy snacks the whole family will actually enjoy.", tag: "What really drives her choice" },
      { id: "leading", q: "Shouldn't snacks just be healthy, even if no one likes the taste?", a: "Then I'm wasting food every day. Taste matters!", tag: "Leading question" },
    ],
    object: {
      kind: "tiffin",
      title: "Neha's tiffin box",
      pos: [12.0, 0.92, -9.9],
      facts: ["A steel tiffin of plain sprouts — it came back full.", "A big bag of chips on the shelf 'for emergencies'.", "Observed: healthy food gets made, but not eaten."],
    },
    observed: "Healthy tiffin comes back uneaten; chips bought as backup.",
    problem: "boring",
    driver: "Healthy snacks her family finds boring.",
  },
  {
    id: "priya",
    name: "Priya",
    role: "Works late at an office",
    segment: "Working professionals",
    location: "office",
    pos: [-10.4, 10.0],
    face: 0.3,
    look: { skin: "#9C6644", top: "#5C6BC0", bottom: "#263238", hair: "#120A06", hairStyle: "long" },
    says: "I need something quick at 4 pm.",
    questions: [
      { id: "habit", q: "What do you usually grab?", a: "Whatever is in the vending machine — chips or cookies.", tag: "Buying habit" },
      { id: "occasion", q: "When do you need it most?", a: "The 4 pm slump, and late meetings.", tag: "Occasion" },
      { id: "frustration", q: "How do you feel about those snacks?", a: "Everything quick and tasty here is fried or sugary. I feel sluggish after.", tag: "Ingredient concern" },
      { id: "why", q: "Why do you keep buying them?", a: "Because tasty and healthy never come in the same packet here. I always have to pick one — and at 4 pm, tasty wins.", tag: "What really drives her choice" },
      { id: "leading", q: "If a snack had a big billboard, you'd buy it, right?", a: "I'd notice it. But at 4 pm I buy whatever is right in front of me.", tag: "Leading question" },
    ],
    object: {
      kind: "vending",
      title: "The office vending machine",
      pos: [-12.6, 0, 11.2],
      facts: ["Rows of fried chips, cream biscuits and sugary drinks.", "Nothing in it that is both tasty and healthy.", "Observed: Priya bought chips — and sighed."],
    },
    observed: "Buys fried chips daily and regrets it.",
    problem: "tasty",
    driver: "Tasty snacks at work are never healthy.",
  },
  {
    id: "kabir",
    name: "Kabir",
    role: "College student living in a hostel",
    segment: "College students",
    location: "canteen",
    pos: [10.2, 9.6],
    face: -0.3,
    look: { skin: "#D9A066", top: "#3E8E41", bottom: "#2B3A55", hair: "#2A1A12", hairStyle: "short", extra: "backpack", extraColor: "#FF5C00" },
    says: "I want a cheap, crunchy snack between classes.",
    questions: [
      { id: "habit", q: "What do you usually eat between classes?", a: "Samosa or chips from the canteen.", tag: "Buying habit" },
      { id: "occasion", q: "When do you snack?", a: "Between classes, and late at night when I'm studying.", tag: "Occasion" },
      { id: "frustration", q: "Do you ever want something different?", a: "All the time. But the canteen only sells fried stuff, and the nearest proper shop is far from the hostel.", tag: "Buying habit" },
      { id: "why", q: "Have you found healthier options anywhere?", a: "Nothing nearby stocks them. If I could order and get them delivered to the hostel, I would. Healthy snacks are just hard to find here.", tag: "What really drives his choice" },
      { id: "leading", q: "Students only care about cheap snacks, right?", a: "Cheap matters. But that's your guess — you didn't ask what I'd buy if I could.", tag: "Leading question" },
    ],
    object: {
      kind: "plate",
      title: "Kabir's canteen plate",
      pos: [11.2, 0.92, 10.8],
      facts: ["Two samosas on a paper plate.", "The canteen menu board lists only fried items.", "Observed: there's no shop within walking distance of the hostel."],
    },
    observed: "Only fried options within reach; no healthy shop nearby.",
    problem: "nearby",
    driver: "Can't find healthy snacks anywhere nearby.",
  },
];

export const SEGMENTS = Array.from(new Set(CONSUMERS.map((c) => c.segment)));

/** evidence is complete when the student asked the root question + the follow-up and inspected the object */
export const evidenceDone = (asked: string[] | undefined, inspected: boolean | undefined) => !!inspected && !!asked?.includes("frustration") && !!asked?.includes("why");
