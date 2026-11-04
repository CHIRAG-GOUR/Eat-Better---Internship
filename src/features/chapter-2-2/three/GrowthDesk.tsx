"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Briefcase,
  Camera,
  Check,
  Clapperboard,
  Globe,
  Mail,
  MessagesSquare,
  Play,
  RotateCcw,
  ShoppingCart,
  Star,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { LeafBulb, Sprout } from "@/components/icons/EbIcons";
import { LiteToggle, ObjectiveTracker, RoleBadge, SimReport, liteCanvasProps, useLiteMode, type Objective, type ReportData } from "@/components/sim";
import { OFFERS } from "../content";
import { usePractice22 } from "../practice";

/**
 * D2C Growth Desk — the student plays a Junior Digital Marketer running a FICTIONAL two-week launch of a
 * practice snack. Every number, review and result here is simulated for learning (labelled in the UI);
 * the channel purposes and trade-offs come from the chapter text.
 */

/* ── simulation data (fictional) ──────────────────────────────── */

type Goal = "reach" | "trust" | "buy" | "keep";
const GOALS: { id: Goal; label: string; short: string; color: string }[] = [
  { id: "reach", label: "Reach new people", short: "Reach", color: "#FF5C00" },
  { id: "trust", label: "Build trust", short: "Trust", color: "#C8963E" },
  { id: "buy", label: "Make buying easy", short: "Buying", color: "#00A341" },
  { id: "keep", label: "Bring them back", short: "Return", color: "#7B4BB7" },
];

type Ch = { id: string; name: string; group: "Owned" | "Social" | "Sell"; icon: LucideIcon; does: string; pts: Record<Goal, number>; fee?: boolean };
const CHANNELS: Ch[] = [
  { id: "website", name: "Website", group: "Owned", icon: Globe, does: "Products, prices, ingredients, buying", pts: { reach: 2, trust: 10, buy: 25, keep: 6 } },
  { id: "email", name: "Email list", group: "Owned", icon: Mail, does: "New products, offers, updates", pts: { reach: 0, trust: 4, buy: 6, keep: 20 } },
  { id: "blog", name: "Blog", group: "Owned", icon: BookOpen, does: "Educates about conscious snacking", pts: { reach: 6, trust: 14, buy: 0, keep: 6 } },
  { id: "squad", name: "Squad", group: "Owned", icon: Users, does: "Customer community", pts: { reach: 2, trust: 8, buy: 0, keep: 18 } },
  { id: "instagram", name: "Instagram", group: "Social", icon: Camera, does: "Visuals, reels, collaborations", pts: { reach: 30, trust: 6, buy: 3, keep: 4 } },
  { id: "youtube", name: "YouTube", group: "Social", icon: Clapperboard, does: "Longer videos, founder stories", pts: { reach: 18, trust: 16, buy: 0, keep: 3 } },
  { id: "facebook", name: "Facebook", group: "Social", icon: MessagesSquare, does: "Community, promotions, reach", pts: { reach: 18, trust: 6, buy: 2, keep: 8 } },
  { id: "linkedin", name: "LinkedIn", group: "Social", icon: Briefcase, does: "Business updates, founder insights", pts: { reach: 5, trust: 6, buy: 0, keep: 0 } },
  { id: "amazon", name: "Amazon", group: "Sell", icon: ShoppingCart, does: "Marketplace discovery and buying", pts: { reach: 12, trust: 6, buy: 20, keep: 2 }, fee: true },
  { id: "quick", name: "Quick commerce", group: "Sell", icon: Zap, does: "Blinkit, Zepto, Swiggy Instamart", pts: { reach: 8, trust: 2, buy: 22, keep: 4 }, fee: true },
];
const MAX_CH = 5;

type Reply = { text: string; q: 1 | 0 | -1; result: string };
const REVIEWS: { id: string; stars: number; text: string; replies: Reply[] }[] = [
  {
    id: "r1",
    stars: 5,
    text: "Loved the crunch with my evening tea. Ordering again!",
    replies: [
      { text: "Thank them and invite them to join the Squad", q: 1, result: "A happy customer now hears about every launch." },
      { text: "Skip it — it's already positive", q: 0, result: "No harm done, but a chance to build community was missed." },
      { text: "Reply with a 50% code for everyone", q: -1, result: "A huge discount nobody asked for cuts your margin." },
    ],
  },
  {
    id: "r2",
    stars: 2,
    text: "Tasty, but the pouch arrived crushed.",
    replies: [
      { text: "Delete the review", q: -1, result: "Other shoppers notice missing reviews — trust drops." },
      { text: "Apologise, send a replacement and check delivery packing", q: 1, result: "The problem gets fixed, and shoppers see a brand that cares." },
      { text: "Say delivery isn't your fault", q: 0, result: "Technically true, but the customer still feels ignored." },
    ],
  },
  {
    id: "r3",
    stars: 3,
    text: "A bit too salty for me.",
    replies: [
      { text: "Argue that the taste is perfect", q: -1, result: "Arguing in public makes the brand look defensive." },
      { text: "Suggest another snack, no follow-up", q: 0, result: "Polite, but the feedback goes nowhere." },
      { text: "Thank them and share it with the kitchen team", q: 1, result: "Negative feedback becomes a product improvement." },
    ],
  },
];

type OfferId = "none" | "combo" | "ship" | "limited";
const OFFER_SIM: Record<OfferId, { name: string; conv: number; aov: number; margin: number; packs: number; note: string }> = {
  none: { name: "No offer", conv: 1, aov: 380, margin: 40, packs: 3, note: "Full price, fewer extra reasons to buy." },
  combo: { name: "Combo discount", conv: 1.1, aov: 520, margin: 34, packs: 4, note: "Customers buy several snacks together." },
  ship: { name: `Free shipping above ₹${OFFERS.threshold}`, conv: 1.15, aov: 510, margin: 36, packs: 4, note: `A ₹${OFFERS.basket} basket adds one more snack to qualify.` },
  limited: { name: "Limited-period 20% off", conv: 1.35, aov: 380, margin: 24, packs: 3, note: "More orders now — but a deep discount squeezes margin." },
};

type Result = { reach: number; visits: number; orders: number; repeat: number; aov: number; margin: number; insights: string[]; score: number };

function simulate(chosen: string[], replies: Record<string, number>, offer: OfferId): Result {
  const chs = CHANNELS.filter((c) => chosen.includes(c.id));
  const sum = (g: Goal) => chs.reduce((a, c) => a + c.pts[g], 0);
  const R = sum("reach"),
    T = sum("trust"),
    B = sum("buy"),
    K = sum("keep");
  const qs = REVIEWS.map((r) => (replies[r.id] !== undefined ? r.replies[replies[r.id]].q : 0));
  const good = qs.filter((q) => q === 1).length;
  const bad = qs.filter((q) => q === -1).length;
  const o = OFFER_SIM[offer];
  const fees = chs.filter((c) => c.fee).length;
  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  const reach = Math.round(1500 + R * 220);
  const visits = Math.round(reach * clamp(0.03 + T * 0.0018 + good * 0.008 - bad * 0.01, 0.01, 0.2));
  const conv = B === 0 ? 0.002 : clamp(0.02 + B * 0.0016, 0, 0.12) * o.conv;
  const orders = Math.round(visits * conv);
  const repeat = Math.round(orders * clamp(0.04 + K * 0.006 + good * 0.04 - bad * 0.03, 0, 0.6));
  const margin = Math.max(5, o.margin - fees * 4);
  const ins: string[] = [];
  if (B === 0) ins.push("No place to buy — people saw you but couldn't order.");
  if (R < 20) ins.push("Low reach — social media helps people discover you.");
  if (chosen.includes("instagram")) ins.push("Instagram reels helped new people discover the snack.");
  if (chosen.includes("linkedin")) ins.push("LinkedIn suits business updates more than snack buyers — pick platforms for your audience.");
  if (fees) ins.push("Marketplaces added convenient orders, but fees cut margin and you own less of the customer relationship.");
  if (K < 15) ins.push("Few buyers came back — owned channels like email and the Squad bring them back.");
  else ins.push("Owned channels brought first-time buyers back for a second order.");
  if (good === 3) ins.push("Thoughtful replies to reviews built trust.");
  if (bad) ins.push("Poor review replies cost you trust.");
  if (offer === "limited") ins.push("The big discount lifted orders but squeezed margin.");
  if (offer === "ship") ins.push("The free-shipping threshold nudged baskets above ₹499.");
  const score = Math.round(Math.min(100, (orders + repeat * 2) / 3 + good * 4 - bad * 6 + (margin - 20) / 2));
  return { reach, visits, orders, repeat, aov: o.aov, margin, insights: ins, score };
}

/* ── 3D: textures ─────────────────────────────────────────────── */

const ICON_PATHS: Record<string, (g: CanvasRenderingContext2D) => void> = {
  website: (g) => {
    g.beginPath();
    g.arc(128, 100, 52, 0, Math.PI * 2);
    g.moveTo(76, 100);
    g.lineTo(180, 100);
    g.moveTo(128, 48);
    g.bezierCurveTo(98, 70, 98, 130, 128, 152);
    g.moveTo(128, 48);
    g.bezierCurveTo(158, 70, 158, 130, 128, 152);
    g.stroke();
  },
  email: (g) => {
    g.strokeRect(70, 62, 116, 78);
    g.beginPath();
    g.moveTo(70, 62);
    g.lineTo(128, 108);
    g.lineTo(186, 62);
    g.stroke();
  },
  blog: (g) => {
    g.beginPath();
    g.moveTo(128, 70);
    g.lineTo(128, 150);
    g.moveTo(128, 70);
    g.quadraticCurveTo(100, 58, 70, 66);
    g.lineTo(70, 144);
    g.quadraticCurveTo(100, 136, 128, 150);
    g.quadraticCurveTo(156, 136, 186, 144);
    g.lineTo(186, 66);
    g.quadraticCurveTo(156, 58, 128, 70);
    g.stroke();
  },
  squad: (g) => {
    for (const [x, r] of [
      [96, 16],
      [128, 20],
      [160, 16],
    ] as const) {
      g.beginPath();
      g.arc(x, 82, r, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.arc(x, 148, r * 1.9, Math.PI, 0);
      g.stroke();
    }
  },
  instagram: (g) => {
    g.beginPath();
    g.roundRect(78, 52, 100, 100, 26);
    g.stroke();
    g.beginPath();
    g.arc(128, 102, 24, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.arc(158, 72, 5, 0, Math.PI * 2);
    g.fill();
  },
  youtube: (g) => {
    g.beginPath();
    g.roundRect(70, 66, 116, 76, 20);
    g.stroke();
    g.beginPath();
    g.moveTo(116, 86);
    g.lineTo(146, 104);
    g.lineTo(116, 122);
    g.closePath();
    g.fill();
  },
  facebook: (g) => {
    g.beginPath();
    g.roundRect(64, 58, 84, 56, 14);
    g.stroke();
    g.beginPath();
    g.roundRect(110, 92, 84, 56, 14);
    g.stroke();
  },
  linkedin: (g) => {
    g.strokeRect(72, 80, 112, 70);
    g.strokeRect(108, 62, 40, 18);
    g.beginPath();
    g.moveTo(72, 108);
    g.lineTo(184, 108);
    g.stroke();
  },
  amazon: (g) => {
    g.beginPath();
    g.moveTo(62, 62);
    g.lineTo(82, 62);
    g.lineTo(98, 128);
    g.lineTo(178, 128);
    g.lineTo(190, 78);
    g.lineTo(88, 78);
    g.stroke();
    for (const x of [106, 168]) {
      g.beginPath();
      g.arc(x, 146, 9, 0, Math.PI * 2);
      g.fill();
    }
  },
  quick: (g) => {
    g.beginPath();
    g.moveTo(140, 48);
    g.lineTo(96, 110);
    g.lineTo(128, 110);
    g.lineTo(114, 156);
    g.lineTo(162, 92);
    g.lineTo(130, 92);
    g.closePath();
    g.fill();
  },
};

function tileTexture(c: Ch, on: boolean) {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = on ? "#FF5C00" : "#FFF5EE";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = g.fillStyle = on ? "#FFFFFF" : "#2F1C1A";
  g.lineWidth = 9;
  g.lineJoin = g.lineCap = "round";
  ICON_PATHS[c.id]?.(g);
  g.fillStyle = on ? "#FFFFFF" : "#2F1C1A";
  g.textAlign = "center";
  g.font = `800 ${c.name.length > 10 ? 26 : 32}px ${getComputedStyle(document.body).fontFamily}`;
  g.fillText(c.name.toUpperCase(), 128, 208);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function labelTexture(lines: { text: string; size: number; color: string }[], w = 512, h = 160, bg = "rgba(0,0,0,0)") {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.textAlign = "center";
  g.textBaseline = "middle";
  const fam = getComputedStyle(document.body).fontFamily;
  let y = h / 2 - ((lines.length - 1) * lines[0].size * 0.6) / 1;
  for (const l of lines) {
    g.fillStyle = l.color;
    g.font = `800 ${l.size}px ${fam}`;
    g.fillText(l.text, w / 2, y);
    y += l.size * 1.2;
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = test;
  }
  g.fillText(line, x, y);
}

function phoneTexture(r: (typeof REVIEWS)[number] | null, reply: Reply | null) {
  const cv = document.createElement("canvas");
  cv.width = 360;
  cv.height = 720;
  const g = cv.getContext("2d")!;
  const fam = getComputedStyle(document.body).fontFamily;
  g.fillStyle = "#FFF5EE";
  g.fillRect(0, 0, 360, 720);
  g.fillStyle = "#2F1C1A";
  g.font = `800 26px ${fam}`;
  g.fillText("Reviews", 28, 64);
  g.fillStyle = "#4A3230";
  g.font = `600 17px ${fam}`;
  g.fillText("Practice review · fictional", 28, 92);
  if (!r) {
    g.fillStyle = "#4A3230";
    g.font = `600 22px ${fam}`;
    wrap(g, "Reviews will appear here during the launch.", 28, 170, 300, 30);
  } else {
    g.fillStyle = "#FFFFFF";
    g.beginPath();
    g.roundRect(20, 120, 320, 250, 22);
    g.fill();
    for (let i = 0; i < 5; i++) {
      g.fillStyle = i < r.stars ? "#F4B400" : "#E6D9CC";
      const cx = 52 + i * 40,
        cy = 160;
      g.beginPath();
      for (let k = 0; k < 10; k++) {
        const ang = -Math.PI / 2 + (k * Math.PI) / 5;
        const rad = k % 2 ? 7 : 16;
        g.lineTo(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
      }
      g.closePath();
      g.fill();
    }
    g.fillStyle = "#2F1C1A";
    g.font = `700 25px ${fam}`;
    wrap(g, `"${r.text}"`, 40, 216, 280, 34);
    if (reply) {
      g.fillStyle = reply.q === 1 ? "#00A341" : reply.q === 0 ? "#C9A400" : "#F83A3A";
      g.beginPath();
      g.roundRect(56, 400, 284, 190, 22);
      g.fill();
      g.fillStyle = "#FFFFFF";
      g.font = `800 18px ${fam}`;
      g.fillText("YOUR REPLY", 78, 436);
      g.font = `700 22px ${fam}`;
      wrap(g, reply.text, 78, 472, 244, 30);
    }
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ── 3D: objects ──────────────────────────────────────────────── */

const RING_R = 3.0;
const tilePos = (i: number): [number, number, number] => {
  const a = THREE.MathUtils.degToRad(-62 + (i * 124) / (CHANNELS.length - 1));
  return [Math.sin(a) * RING_R, 0, Math.cos(a) * RING_R * 0.62 + 0.4];
};

function ChannelTile({ c, i, on, enabled, onToggle }: { c: Ch; i: number; on: boolean; enabled: boolean; onToggle: () => void }) {
  const tex = useMemo(() => tileTexture(c, on), [c, on]);
  useEffect(() => () => tex.dispose(), [tex]);
  const g = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const pos = tilePos(i);
  useFrame(({ clock }, dt) => {
    if (!g.current) return;
    const lift = on ? 0.32 + Math.sin(clock.elapsedTime * 2 + i) * 0.04 : hover && enabled ? 0.12 : 0;
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, lift, 8, dt);
  });
  const face = Math.atan2(-pos[0], 5 - pos[2]) * 0.6;
  return (
    <group position={[pos[0], 0, pos[2]]} rotation={[0, face, 0]}>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[0.36, 0.42, 0.36, 24]} />
        <meshStandardMaterial color={on ? "#2F1C1A" : "#E7D3BF"} roughness={0.6} />
      </mesh>
      <group ref={g}>
        <group
          position={[0, 0.78, 0]}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            if (enabled) onToggle();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(true);
            if (enabled) document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHover(false);
            document.body.style.cursor = "";
          }}
        >
          <RoundedBox args={[0.66, 0.66, 0.1]} radius={0.06} castShadow>
            <meshStandardMaterial color={on ? "#FF5C00" : "#FFF5EE"} emissive={on ? "#FF5C00" : "#000000"} emissiveIntensity={on ? 0.25 : 0} roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0, 0.052]}>
            <planeGeometry args={[0.6, 0.6]} />
            <meshStandardMaterial map={tex} roughness={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** Beams from active channels to the funnel mouth. */
function Beams({ chosen }: { chosen: string[] }) {
  const items = CHANNELS.map((c, i) => ({ c, i })).filter(({ c }) => chosen.includes(c.id));
  return (
    <group>
      {items.map(({ c, i }) => {
        const [x, , z] = tilePos(i);
        const from = new THREE.Vector3(x, 1.15, z);
        const to = new THREE.Vector3(0, 3.0, 0);
        const mid = from.clone().lerp(to, 0.5);
        const len = from.distanceTo(to);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
        return (
          <mesh key={c.id} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.018, 0.018, len, 6]} />
            <meshBasicMaterial color="#FF9A4D" transparent opacity={0.65} />
          </mesh>
        );
      })}
    </group>
  );
}

const LEVELS = [
  { y: 2.9, r: 1.25, label: "Reach" },
  { y: 2.2, r: 0.95, label: "Visits" },
  { y: 1.5, r: 0.7, label: "Orders" },
  { y: 0.8, r: 0.48, label: "Repeat" },
];

function rand(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** The funnel: four glass stages and a stream of shoppers flowing through them. */
function Funnel({ result, lite }: { result: Result | null; lite: boolean }) {
  const N = lite ? 60 : 120;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const parts = useRef(Array.from({ length: N }, (_, i) => ({ t: rand(i) * 4, ang: rand(i + 7) * Math.PI * 2, fate: 0 })));
  const o = useMemo(() => new THREE.Object3D(), []);
  // fraction of particles that make it to each stage (visual scale, gentler than real rates)
  const pass = useMemo(() => {
    if (!result) return [0.55, 0.3, 0.15];
    const v = result.visits / Math.max(1, result.reach);
    const ord = result.orders / Math.max(1, result.visits);
    const rep = result.repeat / Math.max(1, result.orders);
    return [Math.min(0.9, 0.25 + Math.sqrt(v) * 1.2), Math.min(0.9, 0.12 + Math.sqrt(ord) * 1.4), Math.min(0.9, rep * 1.3)];
  }, [result]);
  const labels = useMemo(
    () =>
      LEVELS.map((l, i) =>
        labelTexture([
          { text: l.label, size: 46, color: "#2F1C1A" },
          ...(result ? [{ text: [result.reach, result.visits, result.orders, result.repeat][i].toLocaleString("en-IN"), size: 52, color: "#FF5C00" }] : []),
        ]),
      ),
    [result],
  );
  useEffect(() => () => labels.forEach((t) => t.dispose()), [labels]);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const speed = result ? 0.55 : 0.25;
    parts.current.forEach((p, i) => {
      p.t += dt * speed;
      if (p.t > 4) {
        p.t = 0;
        // decide how far this shopper gets: 1 reach, 2 visit, 3 order, 4 repeat
        const r1 = rand(i * 3.1 + Math.floor(p.ang * 100));
        p.fate = r1 > pass[0] ? 1 : rand(i + p.ang) > pass[1] ? 2 : rand(i * 5 + p.ang) > pass[2] ? 3 : 4;
        p.ang = (p.ang + 1.3) % (Math.PI * 2);
      }
      const stage = Math.min(3, Math.floor(p.t));
      const k = p.t - Math.floor(p.t);
      const a = LEVELS[stage],
        b = LEVELS[Math.min(3, stage + 1)];
      const alive = stage < (p.fate || 4);
      let y = THREE.MathUtils.lerp(a.y, b.y, k);
      let r = THREE.MathUtils.lerp(a.r, b.r, k) * 0.8;
      let x = Math.cos(p.ang + p.t) * r;
      let z = Math.sin(p.ang + p.t) * r;
      if (!alive) {
        // drops out sideways and fades
        const out = 1 + (p.t - (p.fate || 4)) * 1.4;
        x *= out;
        z *= out;
        y -= (p.t - (p.fate || 4)) * 0.6;
        r = 0;
      }
      if (p.fate === 4 && stage === 3 && k > 0.6) {
        // repeat buyers loop back up the side
        const u = (k - 0.6) / 0.4;
        x = 1.6 + Math.sin(u * Math.PI) * 0.3;
        y = THREE.MathUtils.lerp(0.8, 3.1, u);
        z = 0.2;
      }
      o.position.set(x, y, z);
      const s = alive || p.t - (p.fate || 4) < 0.8 ? (alive ? 0.07 : 0.07 * (1 - (p.t - (p.fate || 4)) / 0.8)) : 0.0001;
      o.scale.setScalar(Math.max(0.0001, s));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {LEVELS.map((l, i) => (
        <group key={l.label}>
          <mesh position={[0, l.y - 0.35, 0]}>
            <cylinderGeometry args={[l.r, (LEVELS[i + 1]?.r ?? l.r * 0.8) + 0.02, 0.7, 40, 1, true]} />
            <meshStandardMaterial color={["#FFB27A", "#F4C98E", "#9BD4A8", "#C7A6E8"][i]} transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} roughness={0.2} />
          </mesh>
          <mesh position={[0, l.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[l.r - 0.03, l.r + 0.03, 48]} />
            <meshStandardMaterial color={GOALS[i].color} emissive={GOALS[i].color} emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[-l.r - 0.95, l.y - 0.1, 0.1]}>
            <planeGeometry args={[1.5, 0.47]} />
            <meshBasicMaterial map={labels[i]} transparent depthWrite={false} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={mesh} args={[undefined, undefined, N]} castShadow={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#FF5C00" emissive="#FF5C00" emissiveIntensity={0.35} />
      </instancedMesh>
    </group>
  );
}

function ReviewPhone({ review, reply }: { review: (typeof REVIEWS)[number] | null; reply: Reply | null }) {
  const tex = useMemo(() => phoneTexture(review, reply), [review, reply]);
  useEffect(() => () => tex.dispose(), [tex]);
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = -0.45 + Math.sin(clock.elapsedTime * 0.8) * 0.04;
  });
  return (
    <group ref={g} position={[2.75, 1.9, -0.6]}>
      <RoundedBox args={[0.98, 1.92, 0.08]} radius={0.1} castShadow>
        <meshStandardMaterial color="#2F1C1A" roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[0.88, 1.76]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** A basket of packs that grows with the offer's average order value. */
function Basket({ packs, margin }: { packs: number; margin: number }) {
  const ring = useMemo(() => new THREE.TorusGeometry(0.62, 0.06, 10, 48, (Math.PI * 2 * margin) / 50), [margin]);
  useEffect(() => () => ring.dispose(), [ring]);
  return (
    <group position={[-2.75, 0, -0.6]}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.38, 0.5, 24, 1, true]} />
        <meshStandardMaterial color="#C8963E" side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.02, 24]} />
        <meshStandardMaterial color="#A97A3A" />
      </mesh>
      {Array.from({ length: packs }, (_, i) => (
        <RoundedBox key={i} args={[0.24, 0.34, 0.08]} radius={0.02} position={[-0.24 + (i % 3) * 0.24, 0.8 + Math.floor(i / 3) * 0.2, (i % 2) * 0.08 - 0.04]} rotation={[0, (i - 1) * 0.2, (i - 1.5) * 0.12]} castShadow>
          <meshStandardMaterial color={["#FF5C00", "#3DAE48", "#D81F45", "#F4C21B"][i % 4]} roughness={0.5} />
        </RoundedBox>
      ))}
      <mesh geometry={ring} position={[0, 1.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color={margin >= 32 ? "#00A341" : margin >= 26 ? "#C9A400" : "#F83A3A"} emissive={margin >= 32 ? "#00A341" : margin >= 26 ? "#C9A400" : "#F83A3A"} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function Rig({ lite }: { lite: boolean }) {
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(0, 1.2, 0), []);
  useFrame(({ clock }) => {
    const aspect = size.width / Math.max(1, size.height);
    const dist = aspect < 1 ? 11 : aspect < 1.3 ? 9.2 : 7.8;
    const sway = lite ? 0 : Math.sin(clock.elapsedTime * 0.2) * 0.4;
    camera.position.set(sway, 3.4 + dist * 0.08, dist);
    camera.lookAt(look);
  });
  return null;
}

function Scene({ chosen, toggle, step, review, reply, packs, margin, result, lite }: { chosen: string[]; toggle: (id: string) => void; step: Step; review: (typeof REVIEWS)[number] | null; reply: Reply | null; packs: number; margin: number; result: Result | null; lite: boolean }) {
  return (
    <>
      <color attach="background" args={["#FBE3CF"]} />
      <fog attach="fog" args={["#FBE3CF", 12, 26]} />
      <hemisphereLight args={["#FFF4E6", "#9A6A48", 1.1]} />
      <directionalLight position={[3, 7, 5]} intensity={1.8} castShadow={!lite} shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 3.6, 1.5]} intensity={6} distance={8} color="#FFD08A" />
      <Rig lite={lite} />
      {/* control-room floor + curved screen wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#F3DCC4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.2, -1.8]}>
        <cylinderGeometry args={[6.2, 6.2, 4.4, 48, 1, true, Math.PI * 0.72, Math.PI * 0.56]} />
        <meshStandardMaterial color="#2F1C1A" side={THREE.BackSide} roughness={0.8} />
      </mesh>
      {!lite &&
        Array.from({ length: 12 }, (_, i) => {
          const a = Math.PI * 0.75 + (i / 11) * Math.PI * 0.5;
          return (
            <mesh key={i} position={[Math.sin(a) * 6.1, 1.4 + (i % 3) * 1.05, Math.cos(a) * 6.1 - 1.8]} rotation={[0, a + Math.PI, 0]}>
              <planeGeometry args={[1.2, 0.8]} />
              <meshBasicMaterial color={["#FF5C00", "#C8963E", "#FEE7D5", "#7B4BB7"][i % 4]} transparent opacity={0.22} />
            </mesh>
          );
        })}
      <Funnel result={result} lite={lite} />
      <Beams chosen={chosen} />
      {CHANNELS.map((c, i) => (
        <ChannelTile key={c.id} c={c} i={i} on={chosen.includes(c.id)} enabled={step === "channels"} onToggle={() => toggle(c.id)} />
      ))}
      <ReviewPhone review={review} reply={reply} />
      <Basket packs={packs} margin={margin} />
    </>
  );
}

/* ── the activity ─────────────────────────────────────────────── */

type Step = "brief" | "channels" | "reviews" | "offer" | "run" | "report";
const KEY = "ebc-2.2-growth-desk";

export default function GrowthDesk({ onComplete }: { onComplete: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const lite = useLiteMode();
  const [step, setStep] = useState<Step>("brief");
  const [chosen, setChosen] = useState<string[]>([]);
  const [replies, setReplies] = useState<Record<string, number>>({});
  const [rIdx, setRIdx] = useState(0);
  const [offer, setOffer] = useState<OfferId | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [next, setNext] = useState("");
  const [warn, setWarn] = useState<string | null>(null);
  const practice = usePractice22((s) => s.notes);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = (id: string) => {
    setWarn(null);
    if (chosen.includes(id)) setChosen(chosen.filter((x) => x !== id));
    else if (chosen.length >= MAX_CH) setWarn(`You can run ${MAX_CH} channels this fortnight — switch one off first.`);
    else setChosen([...chosen, id]);
  };
  const coverage = GOALS.map((g) => ({ ...g, v: Math.min(1, CHANNELS.filter((c) => chosen.includes(c.id)).reduce((a, c) => a + c.pts[g.id], 0) / 30) }));
  const review = step === "reviews" ? REVIEWS[Math.min(rIdx, REVIEWS.length - 1)] : null;
  const reply = review && replies[review.id] !== undefined ? review.replies[replies[review.id]] : null;
  const o = OFFER_SIM[offer ?? "none"];
  const done = step === "report" && next.trim().length >= 10;

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const objectives: Objective[] = [
    { id: "brief", label: "Read the launch brief", done: step !== "brief" },
    { id: "ch", label: `Pick up to ${MAX_CH} channels`, done: ["reviews", "offer", "run", "report"].includes(step), detail: "Cover all four goals" },
    { id: "rev", label: "Reply to 3 practice reviews", done: ["offer", "run", "report"].includes(step) },
    { id: "off", label: "Choose an offer", done: ["run", "report"].includes(step) },
    { id: "run", label: "Run the two-week launch", done: step === "report" },
    { id: "plan", label: "Write your next move", done },
  ];

  const report: ReportData | null = result
    ? {
        title: "Growth Plan",
        chapter: "Chapter 2.2 · D2C Growth Desk",
        role: "Junior Digital Marketer",
        sections: [
          { heading: "Channels", items: CHANNELS.filter((c) => chosen.includes(c.id)).map((c) => `${c.name} (${c.group})`) },
          { heading: "Offer", items: [o.name, `Margin ${result.margin}% (simulated)`] },
          { heading: "Review replies", items: REVIEWS.map((r) => `${r.stars}★ "${r.text}" → ${replies[r.id] !== undefined ? r.replies[replies[r.id]].text : "—"}`) },
          { heading: "Simulated results (2 weeks)", items: [`Reach ${result.reach.toLocaleString("en-IN")}`, `Visits ${result.visits.toLocaleString("en-IN")}`, `Orders ${result.orders}`, `Repeat orders ${result.repeat}`, `Avg order ₹${result.aov}`] },
          { heading: "What happened", items: result.insights },
          ...(Object.keys(practice).length ? [{ heading: "Chapter practice", items: Object.values(practice) }] : []),
          { heading: "My next move", body: next.trim() || "—" },
        ],
        footnote: "Fictional practice launch · all reviews and numbers are simulated",
      }
    : null;

  const reset = () => {
    setStep("brief");
    setChosen([]);
    setReplies({});
    setRIdx(0);
    setOffer(null);
    setResult(null);
    setNext("");
  };

  return (
    <div ref={host}>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* 3D control room */}
        <div className="relative h-[360px] overflow-hidden rounded-[24px] border border-cocoa bg-[#FBE3CF] shadow-[3px_3px_0_0_#2f1c1a] sm:h-[460px] lg:h-[560px]">
          {visible && (
            <Canvas {...liteCanvasProps(lite)} camera={{ position: [0, 3.5, 8], fov: 40 }}>
              <Scene chosen={chosen} toggle={toggle} step={step} review={review} reply={reply} packs={o.packs} margin={result ? result.margin : o.margin} result={result} lite={lite} />
            </Canvas>
          )}
          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <RoleBadge role="Junior Digital Marketer" icon={<Sprout className="size-4 text-haldi" />} />
          </div>
          <div className="absolute right-3 top-3 z-10 hidden sm:block">
            <LiteToggle />
          </div>
          {/* goal coverage meters */}
          <div className="pointer-events-none absolute inset-x-2 bottom-2 z-10 grid grid-cols-4 gap-1 sm:inset-x-3 sm:bottom-3 sm:gap-1.5">
            {coverage.map((c) => (
              <div key={c.id} className="rounded-lg bg-cream/90 px-1.5 py-1 sm:rounded-xl sm:px-2.5 sm:py-1.5">
                <div className="truncate text-[0.68rem] font-extrabold uppercase tracking-[0.04em] text-cocoa-2 sm:text-[0.75rem]">
                  <span className="sm:hidden">{c.short}</span>
                  <span className="hidden sm:inline">{c.label}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-cocoa/10">
                  <motion.div className="h-full rounded-full" style={{ background: c.color }} animate={{ width: `${c.v * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute left-3 top-14 z-10 rounded-lg bg-cocoa/80 px-2 py-0.5 text-[0.75rem] font-bold text-cream">Fictional launch · simulated numbers</div>
        </div>

        {/* control panel */}
        <div className="flex flex-col gap-3 rounded-[24px] bg-cream p-4 sm:p-5">
          <LiteToggle className="self-start sm:hidden" />
          <ObjectiveTracker objectives={objectives} title="Launch checklist" />
          <AnimatePresence mode="wait">
            <motion.div key={step + rIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              {step === "brief" && (
                <>
                  <div className="rounded-2xl border border-cocoa/15 bg-white p-4">
                    <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-orange">Launch brief · fictional</div>
                    <p className="mt-1 font-display text-[1.25rem] font-semibold leading-snug text-cocoa">Launch a practice snack for young working professionals in two weeks.</p>
                    <ul className="mt-2 grid grid-cols-2 gap-1.5 text-[0.92rem] font-semibold text-cocoa">
                      {["First orders", "Trust", "Easy buying", "Second orders"].map((x) => (
                        <li key={x} className="flex items-center gap-1.5 rounded-lg bg-peach/70 px-2 py-1">
                          <Check className="size-4 text-success" /> {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => setStep("channels")} className="eb-btn eb-btn-primary justify-center">
                    Start planning
                  </button>
                </>
              )}

              {step === "channels" && (
                <>
                  <p className="text-[1rem] text-cocoa">
                    Tap channels on the desk or below — <strong>{chosen.length}/{MAX_CH}</strong> picked.
                  </p>
                  {(["Owned", "Social", "Sell"] as const).map((grp) => (
                    <div key={grp}>
                      <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">{grp === "Sell" ? "Marketplaces & quick commerce" : `${grp} channels`}</div>
                      <div className="mt-1 grid grid-cols-2 gap-1.5">
                        {CHANNELS.filter((c) => c.group === grp).map((c) => {
                          const on = chosen.includes(c.id);
                          const Icon = c.icon;
                          return (
                            <button key={c.id} onClick={() => toggle(c.id)} aria-pressed={on} title={c.does} className={`flex items-center gap-2 rounded-xl border-2 px-2.5 py-2 text-left text-[0.92rem] font-bold leading-tight transition-colors ${on ? "border-orange bg-orange text-white" : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa"}`}>
                              <Icon className="size-4 shrink-0" /> {c.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {warn && <p className="text-[0.92rem] font-bold text-error">{warn}</p>}
                  <button disabled={chosen.length < 3} onClick={() => setStep("reviews")} className="eb-btn eb-btn-primary justify-center">
                    {chosen.length < 3 ? "Pick at least 3 channels" : "Next: reviews"}
                  </button>
                </>
              )}

              {step === "reviews" && review && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">
                      Review {rIdx + 1} of {REVIEWS.length} · practice
                    </span>
                    <span className="flex gap-0.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className={`size-4 ${i < review.stars ? "fill-haldi text-[#C9A400]" : "text-cocoa/20"}`} />
                      ))}
                    </span>
                  </div>
                  <p className="font-display text-[1.2rem] font-medium leading-snug text-cocoa">&ldquo;{review.text}&rdquo;</p>
                  <div className="grid gap-1.5">
                    {review.replies.map((rp, i) => {
                      const picked = replies[review.id] === i;
                      return (
                        <button
                          key={i}
                          disabled={replies[review.id] !== undefined}
                          onClick={() => setReplies((r) => ({ ...r, [review.id]: i }))}
                          className={`rounded-xl border-2 px-3 py-2 text-left text-[0.95rem] font-bold leading-snug ${picked ? (rp.q === 1 ? "border-success bg-success/10" : rp.q === 0 ? "border-[#C9A400] bg-haldi/20" : "border-error bg-error/10") : "border-cocoa/15 bg-white hover:border-cocoa disabled:opacity-50"} text-cocoa`}
                        >
                          {rp.text}
                        </button>
                      );
                    })}
                  </div>
                  {reply && (
                    <p className={`rounded-xl px-3 py-2 text-[0.95rem] font-semibold ${reply.q === 1 ? "bg-success/10 text-cocoa" : reply.q === 0 ? "bg-haldi/25 text-cocoa" : "bg-error/10 text-cocoa"}`}>{reply.result}</p>
                  )}
                  {reply && (
                    <button onClick={() => (rIdx + 1 < REVIEWS.length ? setRIdx(rIdx + 1) : setStep("offer"))} className="eb-btn eb-btn-primary justify-center">
                      {rIdx + 1 < REVIEWS.length ? "Next review" : "Next: choose an offer"}
                    </button>
                  )}
                </>
              )}

              {step === "offer" && (
                <>
                  <p className="text-[1rem] text-cocoa">Give visitors a reason to buy — watch the basket and the margin ring.</p>
                  <div className="grid gap-1.5">
                    {(Object.keys(OFFER_SIM) as OfferId[]).map((id) => {
                      const x = OFFER_SIM[id];
                      return (
                        <button key={id} onClick={() => setOffer(id)} aria-pressed={offer === id} className={`rounded-xl border-2 px-3 py-2 text-left ${offer === id ? "border-orange bg-orange/10" : "border-cocoa/15 bg-white hover:border-cocoa"}`}>
                          <span className="block text-[0.98rem] font-bold text-cocoa">{x.name}</span>
                          <span className="block text-[0.88rem] text-cocoa-2">{x.note}</span>
                        </button>
                      );
                    })}
                  </div>
                  {offer && (
                    <div className="grid grid-cols-2 gap-2">
                      <Meter label="Avg order (sim.)" value={`₹${o.aov}`} pct={o.aov / 560} color="#FF5C00" />
                      <Meter label="Margin (sim.)" value={`${o.margin}%`} pct={o.margin / 45} color={o.margin >= 32 ? "#00A341" : o.margin >= 26 ? "#C9A400" : "#F83A3A"} />
                    </div>
                  )}
                  <button disabled={!offer} onClick={() => setStep("run")} className="eb-btn eb-btn-primary justify-center">
                    Next: run the launch
                  </button>
                </>
              )}

              {step === "run" && (
                <>
                  <p className="text-[1rem] text-cocoa">Everything is set. Run two simulated weeks and watch shoppers flow through the funnel.</p>
                  <button
                    onClick={() => {
                      setResult(simulate(chosen, replies, offer ?? "none"));
                      setStep("report");
                    }}
                    className="eb-btn eb-btn-primary justify-center"
                  >
                    <Play className="size-4" /> Run two weeks
                  </button>
                </>
              )}

              {step === "report" && result && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Big label="Reach" v={result.reach} />
                    <Big label="Visits" v={result.visits} />
                    <Big label="Orders" v={result.orders} />
                    <Big label="Repeat orders" v={result.repeat} accent />
                  </div>
                  <ul className="grid gap-1.5">
                    {result.insights.slice(0, 4).map((s) => (
                      <li key={s} className="flex gap-2 rounded-xl bg-white px-3 py-2 text-[0.92rem] font-semibold leading-snug text-cocoa">
                        <LeafBulb className="mt-0.5 size-4 shrink-0 text-orange" /> {s}
                      </li>
                    ))}
                  </ul>
                  <input value={next} onChange={(e) => setNext(e.target.value)} maxLength={160} placeholder="Your next move, in one line…" aria-label="Your next move" className="rounded-xl border border-line-strong bg-white px-3 py-2.5 text-[1rem] text-cocoa outline-none focus:border-orange" />
                  <div className="flex gap-2">
                    <button onClick={() => setStep("channels")} className="eb-btn eb-btn-secondary flex-1 justify-center !normal-case">
                      Change the plan
                    </button>
                    <button onClick={reset} className="flex items-center gap-1 rounded-xl px-3 text-[0.9rem] font-bold text-cocoa-2 hover:bg-peach">
                      <RotateCcw className="size-4" /> Restart
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {report && step === "report" && (
        <div className="mt-5">
          <SimReport data={report} storageKey={KEY} ready={done} />
          {!done && (
            <p className="mt-2 flex items-center gap-1.5 text-[0.92rem] font-bold text-cocoa-2">
              <X className="size-4" /> Write your next move above to unlock copy and download.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Meter({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="rounded-xl bg-white p-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.75rem] font-extrabold uppercase tracking-[0.06em] text-cocoa-2">{label}</span>
        <span className="font-display text-[1.1rem] font-semibold text-cocoa">{value}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-cocoa/10">
        <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${Math.min(1, pct) * 100}%` }} />
      </div>
    </div>
  );
}

function Big({ label, v, accent }: { label: string; v: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-2.5 text-center ${accent ? "bg-orange text-white" : "bg-white text-cocoa"}`}>
      <div className="font-display text-[1.5rem] font-semibold leading-none tabular-nums">{v.toLocaleString("en-IN")}</div>
      <div className={`mt-1 text-[0.75rem] font-extrabold uppercase tracking-[0.06em] ${accent ? "text-white/85" : "text-cocoa-2"}`}>{label}</div>
    </div>
  );
}
