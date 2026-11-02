import { getProduct, type PackFormat, type ProductRef } from "@/lib/brand";
import type { ArtElement, ElementKind, PackDesign, TemplateId, TypefaceId, FinishId } from "./types";

/* ── Pack formats ─────────────────────────────────────────────── */

export type FormatSpec = {
  id: PackFormat;
  label: string;
  blurb: string;
  /** used by: real Eat Better Co products that ship in this format */
  usedFor: string;
  /** front-panel aspect (width / height) */
  aspect: number;
  /** safe-area insets as fractions of the front panel */
  safe: { top: number; bottom: number; left: number; right: number };
};

export const FORMATS: Record<PackFormat, FormatSpec> = {
  pouch: {
    id: "pouch",
    label: "Stand-up pouch",
    blurb: "Flexible film with a gusseted base so it stands on a shelf. Light, resealable, cheap to ship.",
    usedFor: "Millet Bhujia, Millet Bhel, nut & seed mixes",
    aspect: 1 / 1.45,
    safe: { top: 0.14, bottom: 0.06, left: 0.07, right: 0.07 },
  },
  sachet: {
    id: "sachet",
    label: "Pillow sachet",
    blurb: "A slim single-serve pack sealed at both ends. Made for one portion, a tiffin or a desk drawer.",
    usedFor: "Single laddoo packs (40 g)",
    aspect: 0.62 / 1.4,
    safe: { top: 0.13, bottom: 0.13, left: 0.08, right: 0.08 },
  },
  carton: {
    id: "carton",
    label: "Gift carton",
    blurb: "A rigid printed box with a hinged lid. Protects what's inside and makes opening feel special.",
    usedFor: "Assorted Laddoo Box (24 & 42), Ultimate Snack Box",
    aspect: 1.05 / 1.4,
    safe: { top: 0.05, bottom: 0.05, left: 0.06, right: 0.06 },
  },
  tin: {
    id: "tin",
    label: "Round tin",
    blurb: "A printed metal tin. Premium, reusable and giftable — the pack becomes part of the present.",
    usedFor: "Assorted Laddoo Tin (festive gifting)",
    aspect: 1.0,
    // the label wraps a cylinder: keep text away from the panel edges, which curve out of view
    safe: { top: 0.1, bottom: 0.1, left: 0.12, right: 0.12 },
  },
};

/* ── Templates / typefaces / finishes ─────────────────────────── */

export const TEMPLATES: { id: TemplateId; label: string; hint: string }[] = [
  { id: "block", label: "Colour block", hint: "Two-tone split. Strong shelf presence; name sits in the lower band." },
  { id: "ribbon", label: "Ribbon", hint: "Full colour with a diagonal ribbon that carries the claims." },
  { id: "window", label: "Soft window", hint: "Light base with a big organic shape. Calm and premium." },
];

export const TYPEFACES: { id: TypefaceId; label: string; hint: string }[] = [
  { id: "rounded", label: "Rounded", hint: "Friendly and bold — closest to the brand's own lettering." },
  { id: "clean", label: "Clean sans", hint: "Modern and neutral. Reads well at small sizes." },
  { id: "classic", label: "Classic serif", hint: "Traditional and premium — think mithai shops." },
];

export const FINISHES: { id: FinishId; label: string; hint: string }[] = [
  { id: "gloss", label: "Gloss film", hint: "Shiny, vivid colours. Catches light on a shelf." },
  { id: "matte", label: "Matte film", hint: "Soft, premium feel. No glare, colours look calmer." },
  { id: "kraft", label: "Kraft paper", hint: "Natural, earthy texture. Signals 'simple ingredients'." },
];

/* ── Colours offered in the editor ────────────────────────────── */

export const SWATCH_GROUPS: { label: string; note: string; swatches: { name: string; hex: string }[] }[] = [
  {
    label: "Brand core",
    note: "From eatbetterco.com",
    swatches: [
      { name: "Better Orange", hex: "#FF5C00" },
      { name: "Cocoa", hex: "#2F1C1A" },
      { name: "Logo Chocolate", hex: "#603A38" },
      { name: "Peach", hex: "#FEE7D5" },
      { name: "Cream", hex: "#FFF5EE" },
      { name: "Haldi Yellow", hex: "#FED300" },
      { name: "White", hex: "#FFFFFF" },
    ],
  },
  {
    label: "Range colours",
    note: "Sampled from official packs",
    swatches: [
      { name: "Millet Lime", hex: "#C6CC3D" },
      { name: "Millet Green", hex: "#3A864B" },
      { name: "Laddoo Tan", hex: "#D39F5B" },
      { name: "Laddoo Cream", hex: "#EED8C3" },
      { name: "Nut Navy", hex: "#282946" },
      { name: "Lavender", hex: "#B3ADBC" },
      { name: "Carton Red", hex: "#DE5C2B" },
      { name: "Namkeen Yellow", hex: "#F1BD05" },
    ],
  },
  {
    label: "Studio tones",
    note: "From product photography",
    swatches: [
      { name: "Festive Maroon", hex: "#550D10" },
      { name: "Chocolate", hex: "#381C11" },
      { name: "Terracotta", hex: "#AF4300" },
      { name: "Mustard", hex: "#E7BA68" },
      { name: "Forest", hex: "#35401D" },
      { name: "Brass", hex: "#C8963E" },
    ],
  },
];

/* ── Artwork elements ─────────────────────────────────────────── */

export const ELEMENT_LIBRARY: { kind: Exclude<ElementKind, "logo">; label: string; base: number }[] = [
  { kind: "laddoo", label: "Laddoo", base: 0.42 },
  { kind: "hazelnut", label: "Hazelnut", base: 0.18 },
  { kind: "almond", label: "Almond", base: 0.2 },
  { kind: "mint", label: "Mint leaf", base: 0.2 },
  { kind: "chilli", label: "Chilli", base: 0.26 },
  { kind: "bhujia", label: "Bhujia nest", base: 0.48 },
  { kind: "millet", label: "Millet grains", base: 0.3 },
  { kind: "marigold", label: "Marigold", base: 0.28 },
];

/** Base size of each element as a fraction of front-panel width (before user scale). */
export const ELEMENT_BASE: Record<ElementKind, number> = {
  logo: 0.34,
  ...Object.fromEntries(ELEMENT_LIBRARY.map((e) => [e.kind, e.base])),
} as Record<ElementKind, number>;

/** Logo aspect from the official SVG viewBox (83 × 40). */
export const LOGO_ASPECT = 40 / 83;

let uid = 0;
export const newId = (prefix = "el") => `${prefix}-${Date.now().toString(36)}-${(uid++).toString(36)}`;

/* ── Starting designs ─────────────────────────────────────────── */

const heroFor = (p: ProductRef): ArtElement[] => {
  switch (p.line) {
    case "millet":
      return [
        { id: newId(), kind: "bhujia", x: 0.5, y: 0.4, scale: 0.85, rotation: 0 },
        { id: newId(), kind: "mint", x: 0.76, y: 0.33, scale: 0.9, rotation: 24 },
      ];
    case "nuts":
      return [
        { id: newId(), kind: "almond", x: 0.42, y: 0.39, scale: 1.1, rotation: -20 },
        { id: newId(), kind: "hazelnut", x: 0.6, y: 0.42, scale: 1, rotation: 0 },
      ];
    case "gifting":
      return [
        { id: newId(), kind: "marigold", x: 0.27, y: 0.4, scale: 0.9, rotation: 0 },
        { id: newId(), kind: "laddoo", x: 0.62, y: 0.4, scale: 0.7, rotation: 0 },
      ];
    default:
      return [{ id: newId(), kind: "laddoo", x: 0.5, y: 0.39, scale: 0.75, rotation: 0 }];
  }
};

/**
 * A deliberately neutral starting point — NOT a copy of the official pack.
 * Students start from cream + cocoa and make their own decisions.
 */
export function startingDesign(productId: string, format?: PackFormat): PackDesign {
  const p = getProduct(productId);
  return {
    productId: p.id,
    format: format ?? p.officialFormat,
    template: "block",
    typeface: "rounded",
    colors: { base: "#FFF5EE", band: "#2F1C1A", text: "#FFF5EE", accent: "#FF5C00" },
    name: p.name,
    flavour: p.flavour,
    tagline: "Eat what you love",
    claims: [],
    showVegMark: false,
    netQty: null,
    nameScale: 1,
    logoTone: "chocolate",
    finish: "gloss",
    elements: [{ id: newId("logo"), kind: "logo", x: 0.5, y: 0.2, scale: 0.75, rotation: 0 }, ...heroFor(p)],
  };
}
