import type { PackFormat } from "@/lib/brand";

export type TemplateId = "block" | "ribbon" | "window";
export type TypefaceId = "rounded" | "clean" | "classic";
export type FinishId = "gloss" | "matte" | "kraft";
export type LogoTone = "chocolate" | "white" | "cocoa";

export type ElementKind =
  | "logo"
  | "laddoo"
  | "hazelnut"
  | "almond"
  | "mint"
  | "chilli"
  | "bhujia"
  | "millet"
  | "marigold";

/** A placeable artwork element. x/y are normalised (0–1) to the FRONT panel. */
export type ArtElement = {
  id: string;
  kind: ElementKind;
  x: number;
  y: number;
  scale: number;
  rotation: number; // degrees
};

export type PackDesign = {
  productId: string;
  format: PackFormat;
  template: TemplateId;
  typeface: TypefaceId;
  colors: {
    base: string;
    band: string;
    text: string;
    accent: string;
  };
  name: string;
  flavour: string;
  tagline: string;
  claims: string[];
  showVegMark: boolean;
  netQty: string | null;
  nameScale: number;
  logoTone: LogoTone;
  finish: FinishId;
  elements: ArtElement[];
};

export type Rect = { x: number; y: number; w: number; h: number };

/** Measurements taken from the rendered artwork — used by the brief checks. */
export type ArtworkMetrics = {
  front: Rect;
  safe: Rect;
  nameBox: Rect | null;
  namePx: number;
  flavourPx: number;
  taglinePx: number;
  nameContrast: number;
  nameBackgroundBusy: number;
  logoBox: Rect | null;
  elementBoxes: { id: string; kind: ElementKind; box: Rect }[];
};
