import { BadgeCheck, Ear, Eye, Gem, HandHeart, Heart, Layers, MessageCircle, Package, Palette, PenLine, ScanEye, ShoppingBag, Smile, Sparkles, Type, Zap } from "lucide-react";
import type { LabSpec } from "@/components/learn/LearnLab";

/**
 * Chapter 2.1 learnable labs — one per area of the source table. Rules come from the chapter's
 * key learnings, Eat Better's own brand facts (src/lib/brand.ts: official lines, palette roles,
 * pack claims and formats) or are labelled "general explanation". Practice names/lines are fictional.
 */

const GEN = "General explanation";
const CH = "From the chapter";
const BR = "Eat Better brand fact";

export const LABS_21: Record<"name" | "logo" | "colour" | "pack" | "tone" | "perception", LabSpec> = {
  name: {
    id: "21-name",
    skill: "explain how a short brand name carries a promise, and test any name against three checks.",
    rules: [
      { id: "simple", title: "Simple", text: "Easy to say, spell and share — short, everyday words.", icon: Type, source: GEN },
      { id: "memorable", title: "Memorable", text: "Sticks after hearing it once, often thanks to a familiar phrase.", icon: Sparkles, source: GEN },
      { id: "promise", title: "Carries a promise", text: "A simple, memorable name communicates a brand promise.", icon: HandHeart, source: CH },
      { id: "tagline", title: "The tagline finishes the job", text: "“The joy of snacking, made better.” adds what the name alone can’t say.", icon: PenLine, source: BR },
    ],
    task: {
      kind: "choose",
      prompt: "Decode Eat Better’s name and tagline, then test two practice names.",
      cases: [
        {
          id: "taste",
          title: "Which part of the tagline promises taste and enjoyment?",
          options: [
            { id: "a", text: "“The joy of snacking”", best: true, why: "“Joy” is about enjoying the snack — the taste half of the promise.", rule: "tagline" },
            { id: "b", text: "“made better”", best: false, why: "“Made better” is the upgrade half (ingredients and process), not the taste half.", rule: "tagline" },
            { id: "c", text: "“Eat”", best: false, why: "“Eat” sets the topic (food) but doesn’t promise how it tastes.", rule: "promise" },
          ],
        },
        {
          id: "better",
          title: "What does “made better” promise, going by Eat Better’s own belief?",
          context: "Brand belief (Chapter 1.2): never choose between tasty and healthy.",
          options: [
            { id: "a", text: "Better ingredients and production processes, while keeping the crunch and flavour", best: true, why: "That is exactly the core belief from Chapter 1.2: upgrade ingredients and processes, keep the taste.", rule: "promise" },
            { id: "b", text: "Cheaper than other snacks", best: false, why: "Nothing in the name or belief talks about price — don’t read in promises the brand doesn’t make.", rule: "promise" },
            { id: "c", text: "Fewer calories than every other snack", best: false, why: "That’s an unsupported claim. A name can carry a promise, but only one the brand can keep.", rule: "promise" },
          ],
        },
        {
          id: "p1",
          title: "Practice name: “NutriMaxx Pro Formula Bites”. Which check does it fail most?",
          options: [
            { id: "a", text: "Simple", best: true, why: "Four words, a made-up spelling and lab-like jargon — hard to say, spell or share.", rule: "simple" },
            { id: "b", text: "Carries a promise", best: false, why: "It does hint at nutrition — its bigger problem is that it isn’t simple.", rule: "simple" },
            { id: "c", text: "Memorable", best: false, why: "It may be hard to remember, but that’s caused by it not being simple first.", rule: "simple" },
          ],
        },
        {
          id: "p2",
          title: "Practice name: “Snacko”. Which check is weakest?",
          options: [
            { id: "a", text: "Carries a promise", best: true, why: "Short and catchy, but it says nothing about what’s better — no promise.", rule: "promise" },
            { id: "b", text: "Simple", best: false, why: "It’s very simple: one short word.", rule: "simple" },
            { id: "c", text: "Memorable", best: false, why: "Short and rhythmic — likely easy to remember.", rule: "memorable" },
          ],
        },
      ],
    },
    note: "“NutriMaxx Pro Formula Bites” and “Snacko” are practice names, not real brands.",
    create: {
      prompt: "Name a practice better-for-you chai-time snack brand and write its tagline.",
      placeholder: "Name: … · Tagline: …",
      checklist: ["The name is simple to say and spell", "It’s memorable", "The name carries a promise", "The tagline adds what the name can’t say"],
      minChars: 20,
    },
  },

  logo: {
    id: "21-logo",
    skill: "audit brand touchpoints for consistency and explain why consistency builds recognition.",
    rules: [
      { id: "logo", title: "Same logo, untouched", text: "Never stretch, squash or recolour the logo.", icon: BadgeCheck, source: GEN },
      { id: "type", title: "Same typography", text: "Headlines and the wordmark keep the brand’s lettering.", icon: Type, source: GEN },
      { id: "palette", title: "Same palette", text: "Brand colours repeat everywhere; range colours can change, the brand marks don’t.", icon: Palette, source: GEN },
      { id: "everywhere", title: "Everywhere, every time", text: "Consistency across website, packaging and social media builds recognition and differentiates a brand.", icon: Eye, source: CH },
    ],
    task: {
      kind: "classify",
      prompt: "Audit these touchpoints: does each one keep the identity consistent?",
      buckets: [
        { id: "ok", label: "Consistent" },
        { id: "break", label: "Breaks the identity" },
      ],
      items: [
        { id: "web", label: "eatbetterco.com header", sub: "Official website", img: "/chapter-2-1/lms-1.png", answer: "ok", why: "Logo untouched, brand lettering and the orange underline from the palette.", rule: "everywhere" },
        { id: "pack", label: "Coffee Almond Laddoos sachet", sub: "Official pack", img: "/brand/products/coffee-almond-laddoo-0.webp", answer: "ok", why: "The same logo and wordmark sit at the top of the pack.", rule: "logo" },
        { id: "range", label: "Millet Namkeen pouch in green", sub: "Official pack", img: "/brand/products/millet-namkeen-0.webp", answer: "ok", why: "The range colour changes (green for millets) but the logo and lettering stay the same — still consistent.", rule: "palette" },
        { id: "stretch", label: "Banner where the logo is stretched wide to fill the space", sub: "Practice mock-up", answer: "break", why: "A stretched logo looks like a different (or fake) brand.", rule: "logo" },
        { id: "script", label: "Post with the brand name set in a curly script font", sub: "Practice mock-up", answer: "break", why: "Changing the lettering breaks recognition — the wordmark’s typography is part of the identity.", rule: "type" },
        { id: "neon", label: "Poster with the logo recoloured neon green", sub: "Practice mock-up", answer: "break", why: "Recolouring the logo outside the palette breaks recognition.", rule: "palette" },
      ],
    },
    note: "Mock-ups are practice examples, not real Eat Better materials.",
    create: {
      prompt: "Describe a social post for Eat Better that keeps the identity consistent (what goes where, which colours, how the logo appears).",
      placeholder: "Top left: … · Colours: … · Headline lettering: …",
      checklist: ["Logo used untouched", "Brand typography for the headline", "Colours from the brand palette", "It would match the website and the pack"],
    },
  },

  colour: {
    id: "21-colour",
    skill: "choose colours for packs and creatives using Eat Better’s own colour system, and explain the feeling each creates.",
    rules: [
      { id: "orange", title: "Better Orange = action", text: "Eat Better’s primary colour for buttons and calls to action on its website.", icon: Zap, source: BR },
      { id: "cream", title: "Cream & peach = calm backgrounds", text: "The website’s background tones let products stand out.", icon: Layers, source: BR },
      { id: "ranges", title: "Each range has a tone", text: "In official photos: forest green behind millet snacks, festive maroon behind laddoos and gifting, terracotta behind nut mixes, mustard behind the laddoo tin.", icon: Palette, source: BR },
      { id: "feel", title: "Colours carry feelings", text: "Greens suggest fresh and natural; warm oranges suggest taste and energy; deep maroons feel festive and premium.", icon: Heart, source: GEN },
    ],
    task: {
      kind: "classify",
      prompt: "You’re briefing a designer. Pick the brand colour for each job.",
      buckets: [
        { id: "forest", label: "Forest green" },
        { id: "maroon", label: "Festive maroon" },
        { id: "terracotta", label: "Terracotta" },
        { id: "mustard", label: "Mustard" },
        { id: "orange", label: "Better Orange" },
        { id: "cream", label: "Cream" },
      ],
      items: [
        { id: "millet", label: "Backdrop for a millet bhujia photo", img: "/brand/products/millet-bhujia-0.webp", answer: "forest", why: "Eat Better’s millet range is shot on forest green — it also signals fresh and natural.", rule: "ranges" },
        { id: "gift", label: "Diwali laddoo gift creative", img: "/brand/products/diwali-hamper-0.webp", answer: "maroon", why: "Festive maroon sits behind laddoo and gifting photos — festive and premium.", rule: "ranges" },
        { id: "nuts", label: "Nut mix product photo", img: "/brand/products/nut-mix-0.webp", answer: "terracotta", why: "Terracotta is the nut-mix backdrop — warm and earthy.", rule: "ranges" },
        { id: "tin", label: "Assorted laddoo tin shot", img: "/brand/products/laddoo-tin-0.webp", answer: "mustard", why: "Mustard is used behind the laddoo tin.", rule: "ranges" },
        { id: "cta", label: "“Add to cart” button on the website", answer: "orange", why: "Better Orange is the action colour — it tells shoppers where to tap.", rule: "orange" },
        { id: "bg", label: "Website page background", answer: "cream", why: "Calm cream lets the colourful packs stand out.", rule: "cream" },
      ],
    },
    create: {
      prompt: "Pick a colour for a practice “monsoon chai-time namkeen” pack and explain the feeling it should create.",
      placeholder: "Colour: … · Because …",
      checklist: ["The colour fits the brand palette or a range tone", "I explained the feeling (taste, freshness, quality or health)", "The product name would still be easy to read on it", "It still looks like part of the Eat Better range"],
    },
  },

  pack: {
    id: "21-pack",
    skill: "match a pack format to how people will snack, and plan the front of a pack that sells in seconds.",
    rules: [
      { id: "glance", title: "Sell at a glance", text: "On a shelf or app, the front must say who made it, what it is and why it’s better — in seconds.", icon: ScanEye, source: GEN },
      { id: "claim", title: "One true claim", text: "A short claim such as “Sweetened with dates” answers the health question fast.", icon: BadgeCheck, source: BR },
      { id: "format", title: "Format fits the moment", text: "Eat Better ships laddoos in single-serve sachets, namkeens in pouches, and assortments in boxes and tins.", icon: Package, source: BR },
      { id: "value", title: "Packaging communicates value", text: "Packaging attracts attention, communicates value and influences purchase decisions.", icon: Gem, source: CH },
    ],
    task: {
      kind: "classify",
      prompt: "Which pack format fits each snacking moment?",
      buckets: [
        { id: "sachet", label: "Single-serve sachet" },
        { id: "pouch", label: "Pouch" },
        { id: "box", label: "Box or tin" },
      ],
      items: [
        { id: "college", label: "One laddoo to carry to college", img: "/brand/products/hazelnut-laddoo-0.webp", answer: "sachet", why: "A slim sachet is made for one serving on the go.", rule: "format" },
        { id: "family", label: "Namkeen for the family to share at tea time", img: "/brand/products/millet-bhel-0.webp", answer: "pouch", why: "Pouches hold enough to share, like Eat Better’s namkeens.", rule: "format" },
        { id: "gift", label: "A gift for a colleague at Diwali", img: "/brand/products/laddoo-box-24-0.webp", answer: "box", why: "Boxes and tins present an assortment as a gift — value you can see.", rule: "value" },
        { id: "office", label: "A box of 24 assorted laddoos for an office treat", img: "/brand/products/laddoo-box-42-0.webp", answer: "box", why: "Assortments come in boxes so everyone can pick a flavour.", rule: "format" },
        { id: "trail", label: "A trail mix to snack from over a few days", img: "/brand/products/trail-mix-0.webp", answer: "pouch", why: "A pouch suits a snack you dip into more than once.", rule: "format" },
      ],
    },
    create: {
      prompt: "Plan the front of a practice seed-mix pouch: list what goes on it, top to bottom.",
      placeholder: "1. … 2. … 3. … 4. …",
      checklist: ["Brand logo first", "A clear product name", "Real snack imagery", "One short claim that is true", "The format suits how it will be eaten"],
    },
  },

  tone: {
    id: "21-tone",
    skill: "rewrite copy in Eat Better’s voice and explain what makes a brand’s tone trustworthy.",
    rules: [
      { id: "warm", title: "Warm and joyful", text: "Like “The joy of snacking, made better.”", icon: Smile, source: BR },
      { id: "simple", title: "Simple, everyday words", text: "Like “Eat what you love”.", icon: MessageCircle, source: BR },
      { id: "taste", title: "Taste first, then the better part", text: "Like “All indulgence. No guilt.”", icon: Heart, source: BR },
      { id: "honest", title: "Honest and specific", text: "Talk about real ingredients; no scare tactics, attacks or miracle claims. Tone creates trust.", icon: BadgeCheck, source: GEN },
    ],
    task: {
      kind: "choose",
      prompt: "Each practice line is off-tone. Pick the best rewrite in Eat Better’s voice.",
      cases: [
        {
          id: "tech",
          title: "“Our snacks contain optimised macronutrient ratios for metabolic efficiency.”",
          options: [
            { id: "a", text: "“Roasted, not fried — all the crunch you love.”", best: true, why: "Simple words, taste first, and a true pack claim (Millet Bhujia: roasted not fried).", rule: "taste" },
            { id: "b", text: "“Scientifically engineered snacks for peak performance!”", best: false, why: "Still technical and hype-y — the opposite of simple, everyday words.", rule: "simple" },
            { id: "c", text: "“Buy now or regret it later!”", best: false, why: "Pressure isn’t warm, and it says nothing about the snack.", rule: "warm" },
          ],
        },
        {
          id: "fear",
          title: "“WARNING: other snacks are poisoning your family.”",
          options: [
            { id: "a", text: "“Snacks your whole family will love — sweetened with dates.”", best: true, why: "Warm, family-friendly and specific (laddoos are sweetened with dates).", rule: "honest" },
            { id: "b", text: "“Other brands are lying to you.”", best: false, why: "Attacking others is still a scare tactic — it doesn’t build trust.", rule: "honest" },
            { id: "c", text: "“Zero sugar, zero calories, zero worries!”", best: false, why: "Miracle claims that aren’t true break trust instantly.", rule: "honest" },
          ],
        },
        {
          id: "formal",
          title: "“Kindly procure our premium-grade comestibles.”",
          options: [
            { id: "a", text: "“Grab your favourite snack — made better.”", best: true, why: "Everyday words, warm, and it echoes the tagline.", rule: "simple" },
            { id: "b", text: "“Acquire superior snacking solutions today.”", best: false, why: "Still stiff, corporate words — not how Eat Better talks.", rule: "simple" },
            { id: "c", text: "“Snacks.”", best: false, why: "Too flat — no joy and no reason to choose it.", rule: "warm" },
          ],
        },
      ],
    },
    note: "The off-tone lines and the wrong options are practice examples written for this activity.",
    create: {
      prompt: "Write a 1–2 line Instagram caption for Millet Bhujia in Eat Better’s voice.",
      placeholder: "Your caption…",
      checklist: ["Warm and joyful", "Simple, everyday words", "Taste first, then the better part", "Only true claims (e.g. “Roasted not fried”, “No palm oil”)"],
    },
  },

  perception: {
    id: "21-perception",
    skill: "predict how a brand’s identity shapes a shopper’s expectation, purchase intent and recall.",
    rules: [
      { id: "expect", title: "Expectation", text: "What the pack makes you expect before you taste it — shaped by imagery and claims.", icon: Eye, source: GEN },
      { id: "intent", title: "Purchase intent", text: "How likely you are to buy now — rises when the brand answers your need.", icon: ShoppingBag, source: GEN },
      { id: "recall", title: "Recall", text: "Remembering the brand later — built by a distinctive name, logo and colours seen again and again.", icon: Ear, source: GEN },
      { id: "different", title: "People read brands differently", text: "Different customers interpret the same identity and messaging in their own way.", icon: Layers, source: CH },
    ],
    task: {
      kind: "choose",
      prompt: "Four fictional shoppers meet the Eat Better identity. What happens?",
      cases: [
        {
          id: "parent",
          title: "A parent who avoids refined sugar picks up Hazelnut Chocolate Laddoos.",
          context: "Which element most raises purchase intent for this parent?",
          img: "/brand/products/hazelnut-laddoo-0.webp",
          options: [
            { id: "a", text: "The “Sweetened with dates” claim", best: true, why: "It directly answers this parent’s need — that’s what lifts intent.", rule: "intent" },
            { id: "b", text: "The cocoa-brown colour", best: false, why: "Colour shapes mood and recall, but it doesn’t answer the sugar question.", rule: "recall" },
            { id: "c", text: "The sachet format", best: false, why: "Format matters for convenience, not for this parent’s main need.", rule: "intent" },
          ],
        },
        {
          id: "student",
          title: "A student sees the Eat Better logo on a quick-commerce app, then again on a shelf.",
          context: "What does seeing the same logo twice mainly build?",
          options: [
            { id: "a", text: "Recall", best: true, why: "Repeated, consistent exposure to the same mark is how brands get remembered.", rule: "recall" },
            { id: "b", text: "An expectation of a low price", best: false, why: "A logo alone doesn’t signal price.", rule: "expect" },
            { id: "c", text: "Nothing — logos don’t matter", best: false, why: "Recognition is exactly what a consistent logo builds.", rule: "recall" },
          ],
        },
        {
          id: "photo",
          title: "A shopper sees the close-up laddoo photo on the front of the pack.",
          context: "What does the snack imagery mainly shape?",
          options: [
            { id: "a", text: "The expectation of how it will taste", best: true, why: "Imagery sets expectations before the first bite.", rule: "expect" },
            { id: "b", text: "Recall of the brand next month", best: false, why: "Imagery helps a little, but its main job is setting expectation.", rule: "expect" },
            { id: "c", text: "The price", best: false, why: "A photo doesn’t tell you the price.", rule: "expect" },
          ],
        },
        {
          id: "two",
          title: "A fitness fan notices “made better”; a foodie notices “the joy of snacking”.",
          context: "What does this show?",
          options: [
            { id: "a", text: "Different customers read the same identity differently — the message works for both", best: true, why: "That’s the chapter’s point on consumer perception.", rule: "different" },
            { id: "b", text: "The tagline is confusing and should be changed", best: false, why: "Two readings that both attract buyers is a strength, not confusion.", rule: "different" },
            { id: "c", text: "Only the fitness fan matters", best: false, why: "The brand serves both taste and health — both readings matter.", rule: "different" },
          ],
        },
      ],
    },
    note: "The shoppers are fictional practice scenarios.",
    create: {
      prompt: "Invent a fictional shopper and predict their expectation, intent and recall for one Eat Better pack.",
      placeholder: "Shopper: … · Pack: … · Expectation: … · Intent: … · Recall: …",
      checklist: ["I named the shopper’s need", "I linked an identity element to their expectation", "…and to their purchase intent", "…and to whether they’ll recall the brand"],
    },
  },
};
