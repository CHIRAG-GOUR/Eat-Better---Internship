"use client";
/* eslint-disable react-hooks/immutability -- three.js objects, refs and DOM nodes are mutated inside useFrame by design (per-frame animation without React re-renders) */

import NextImage from "next/image";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox, useTexture } from "@react-three/drei";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Frown, Lightbulb, RotateCcw, Smile, Star, Store, Trophy, User, X } from "lucide-react";
import { makeBowl, makeKatori } from "@/features/packaging/three/geometry";
import { BhujiaPile, Laddoos } from "@/components/world/props";
import { EXHIBITIONS, STALL_CUSTOMERS, STALL_PACKS, STALL_RANKS, type Look, type PackId } from "../content";

/**
 * Stall Day — a game set at a busy food exhibition. The student runs the Eat Better stall;
 * five customers walk up with questions (practice scenarios). The right answer — a fact from the
 * official pack or from Chapters 1.1–1.3 — sends the customer away happy with a pack.
 */

type Phase = "idle" | "arrive" | "ask" | "oops" | "happy" | "leave" | "won";
type Pose = { walk: number; mood: number; arm: number; shake: number; jump: number; holding: boolean };

const PACK_IDS = Object.keys(STALL_PACKS) as PackId[];
const PACK_URLS = Object.fromEntries(PACK_IDS.map((id) => [id, `/chapter-1-3/packs/${id}.webp`])) as Record<PackId, string>;

const ENTRY = new THREE.Vector3(8.5, 0, 2.35);
const SPOT = new THREE.Vector3(2.45, 0, 1.2);
const EXIT = new THREE.Vector3(-8.5, 0, 2.35);
const FACE = -0.85; // customer turned towards the seller, cheated towards the camera
const SELLER_POS: [number, number, number] = [0.12, 0, -0.95];

const DUR = { arrive: 2600, oops: 1500, happy: 2100, leave: 2300 };
const SELLER: Look = { skin: "#C68B59", top: "#FFF5EE", bottom: "#4A3230", hair: "#1E1410", hairStyle: "bun", extra: "apron", extraColor: "#FF5C00" };

const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/* ── canvas textures ──────────────────────────────────────────── */

function brandFont() {
  if (typeof document === "undefined") return "sans-serif";
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

function textTexture(w: number, h: number, bg: string, lines: { text: string; size: number; color: string; y: number; weight?: number }[], border?: string) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  if (border) {
    g.strokeStyle = border;
    g.lineWidth = Math.max(6, w * 0.012);
    g.strokeRect(g.lineWidth, g.lineWidth, w - g.lineWidth * 2, h - g.lineWidth * 2);
  }
  const fam = brandFont();
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const l of lines) {
    g.fillStyle = l.color;
    g.font = `${l.weight ?? 800} ${l.size}px ${fam}`;
    g.fillText(l.text, w / 2, l.y);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function stripeTexture(a: string, b: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 32;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? a : b;
    g.fillRect(i * 32, 0, 32, 32);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function tileTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#E9C9A4";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#E1BC94";
  g.fillRect(0, 0, 128, 128);
  g.fillRect(128, 128, 128, 128);
  g.strokeStyle = "rgba(120,70,30,0.18)";
  g.lineWidth = 3;
  g.strokeRect(0, 0, 256, 256);
  g.beginPath();
  g.moveTo(128, 0);
  g.lineTo(128, 256);
  g.moveTo(0, 128);
  g.lineTo(256, 128);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 9);
  t.anisotropy = 8;
  return t;
}

/** Official logo on a cream board (from the brand SVG). */
function useLogoTexture(w: number, h: number, tagline?: string) {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d")!;
      g.fillStyle = "#FFF5EE";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#FF5C00";
      g.lineWidth = h * 0.05;
      g.strokeRect(g.lineWidth, g.lineWidth, w - g.lineWidth * 2, h - g.lineWidth * 2);
      const lh = tagline ? h * 0.52 : h * 0.66;
      const lw = lh * (83 / 40);
      g.drawImage(img, (w - lw) / 2, tagline ? h * 0.12 : (h - lh) / 2, lw, lh);
      if (tagline) {
        g.fillStyle = "#4A3230";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = `700 ${Math.round(h * 0.13)}px ${brandFont()}`;
        g.fillText(tagline, w / 2, h * 0.8);
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
    };
    img.src = "/brand/eat-better-logo.svg";
    return () => {
      alive = false;
    };
  }, [w, h, tagline]);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

/** Stall backdrop: logo card on the left, the brand line on the right, space for the seller between. */
function useBackdropTexture() {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const c = document.createElement("canvas");
      c.width = 1600;
      c.height = 500;
      const g = c.getContext("2d")!;
      g.fillStyle = "#FF5C00";
      g.fillRect(0, 0, 1600, 500);
      const card = (x: number) => {
        g.fillStyle = "#FFF5EE";
        g.beginPath();
        g.roundRect(x, 50, 540, 330, 28);
        g.fill();
      };
      card(40);
      card(1020);
      const lw = 440;
      g.drawImage(img, 40 + (540 - lw) / 2, 50 + (330 - lw * (40 / 83)) / 2, lw, lw * (40 / 83));
      g.fillStyle = "#4A3230";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `800 62px ${brandFont()}`;
      ["THE JOY OF", "SNACKING,", "MADE BETTER."].forEach((t, i) => g.fillText(t, 1290, 135 + i * 82, 500));
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
    };
    img.src = "/brand/eat-better-logo.svg";
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

/* ── people ───────────────────────────────────────────────────── */

function Person({ look, pose, holdColor }: { look: Look; pose: React.RefObject<Pose>; holdColor?: string }) {
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const held = useRef<THREE.Group>(null);
  const seed = useMemo(() => look.top.charCodeAt(1) * 0.37, [look.top]);

  useFrame(({ clock }) => {
    const p = pose.current;
    if (!p) return;
    const t = clock.elapsedTime + seed;
    const sw = Math.sin(t * 8.5) * 0.6 * p.walk;
    if (legL.current) legL.current.rotation.x = sw;
    if (legR.current) legR.current.rotation.x = -sw;
    if (armL.current) {
      armL.current.rotation.x = -sw * 0.7 - p.arm * 2.7;
      armL.current.rotation.z = p.arm * 0.35;
    }
    if (armR.current) {
      armR.current.rotation.x = sw * 0.7 - p.arm * 2.7 - (p.holding && p.arm < 0.1 ? 0.5 : 0);
      armR.current.rotation.z = -p.arm * 0.35;
    }
    if (body.current) body.current.position.y = Math.abs(Math.sin(t * 8.5)) * 0.045 * p.walk + p.jump + Math.sin(t * 1.6) * 0.008;
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 15) * 0.5 * p.shake;
      head.current.rotation.x = p.mood < 0 ? 0.12 : p.mood > 0 ? -0.08 : 0;
    }
    if (mouth.current) {
      mouth.current.rotation.z = p.mood < 0 ? 0 : Math.PI;
      mouth.current.scale.y = p.mood === 0 ? 0.25 : 1;
      mouth.current.position.y = p.mood < 0 ? -0.075 : -0.055;
    }
    if (held.current) held.current.visible = p.holding;
  });

  const skirt = look.dress;
  return (
    <group ref={body}>
      {/* legs */}
      {[
        [-0.1, legL],
        [0.1, legR],
      ].map(([x, r]) => (
        <group key={x as number} ref={r as React.RefObject<THREE.Group>} position={[x as number, 0.82, 0]}>
          <mesh position={[0, -0.38, 0]} castShadow>
            <capsuleGeometry args={[0.072, 0.6, 4, 10]} />
            <meshStandardMaterial color={skirt ? look.skin : look.bottom} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.78, 0.05]} castShadow>
            <boxGeometry args={[0.13, 0.08, 0.25]} />
            <meshStandardMaterial color="#2B1E18" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {skirt && (
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.34, 0.86, 18]} />
          <meshStandardMaterial color={look.bottom} roughness={0.75} />
        </mesh>
      )}
      {/* torso */}
      <mesh position={[0, 1.15, 0]} scale={[1, 1, 0.72]} castShadow>
        <capsuleGeometry args={[0.2, 0.44, 4, 14]} />
        <meshStandardMaterial color={look.top} roughness={0.75} />
      </mesh>
      {look.extra === "apron" && (
        <group>
          <mesh position={[0, 1.0, 0.152]}>
            <boxGeometry args={[0.34, 0.7, 0.02]} />
            <meshStandardMaterial color={look.extraColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.24, 0.163]}>
            <planeGeometry args={[0.2, 0.08]} />
            <meshStandardMaterial color="#FFF5EE" />
          </mesh>
        </group>
      )}
      {look.extra === "dupatta" && (
        <mesh position={[0.02, 1.2, 0.15]} rotation={[0, 0, 0.62]}>
          <boxGeometry args={[0.13, 0.82, 0.03]} />
          <meshStandardMaterial color={look.extraColor} roughness={0.85} />
        </mesh>
      )}
      {look.extra === "backpack" && (
        <RoundedBox args={[0.34, 0.44, 0.16]} radius={0.05} position={[0, 1.17, -0.22]} castShadow>
          <meshStandardMaterial color={look.extraColor} roughness={0.8} />
        </RoundedBox>
      )}
      {/* arms */}
      {[
        [-0.27, armL],
        [0.27, armR],
      ].map(([x, r]) => (
        <group key={x as number} ref={r as React.RefObject<THREE.Group>} position={[x as number, 1.36, 0]}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[0.062, 0.4, 4, 10]} />
            <meshStandardMaterial color={look.top} roughness={0.75} />
          </mesh>
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.066, 12, 10]} />
            <meshStandardMaterial color={look.skin} roughness={0.6} />
          </mesh>
          {(x as number) > 0 && (
            <group ref={held} position={[0, -0.56, 0.1]} visible={false}>
              <RoundedBox args={[0.2, 0.28, 0.06]} radius={0.02} castShadow>
                <meshStandardMaterial color={holdColor ?? "#FF5C00"} roughness={0.5} />
              </RoundedBox>
            </group>
          )}
        </group>
      ))}
      {/* neck + head */}
      <mesh position={[0, 1.47, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.14, 12]} />
        <meshStandardMaterial color={look.skin} roughness={0.6} />
      </mesh>
      <group ref={head} position={[0, 1.68, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 24, 18]} />
          <meshStandardMaterial color={look.skin} roughness={0.55} />
        </mesh>
        {/* hair */}
        <mesh position={[0, 0.02, -0.015]} scale={[1.04, 1, 1.04]}>
          <sphereGeometry args={[0.205, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
          <meshStandardMaterial color={look.hair} roughness={0.9} />
        </mesh>
        {look.hairStyle === "long" && (
          <mesh position={[0, -0.16, -0.12]}>
            <boxGeometry args={[0.38, 0.5, 0.1]} />
            <meshStandardMaterial color={look.hair} roughness={0.9} />
          </mesh>
        )}
        {look.hairStyle === "bun" && (
          <mesh position={[0, 0.17, -0.12]}>
            <sphereGeometry args={[0.085, 14, 10]} />
            <meshStandardMaterial color={look.hair} roughness={0.9} />
          </mesh>
        )}
        {/* face */}
        {[-0.07, 0.07].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.02, 0.18]}>
              <sphereGeometry args={[0.026, 10, 8]} />
              <meshStandardMaterial color="#1A0F0A" roughness={0.3} />
            </mesh>
            <mesh position={[x, 0.075, 0.178]} rotation={[0, 0, x > 0 ? -0.15 : 0.15]}>
              <boxGeometry args={[0.06, 0.012, 0.01]} />
              <meshStandardMaterial color={look.hair === "#BDB6B0" ? "#8E8780" : "#1A0F0A"} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.02, 0.2]}>
          <sphereGeometry args={[0.024, 10, 8]} />
          <meshStandardMaterial color={look.skin} roughness={0.55} />
        </mesh>
        <mesh ref={mouth} position={[0, -0.055, 0.183]}>
          <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#7A2E22" roughness={0.5} />
        </mesh>
        {look.extra === "glasses" &&
          [-0.07, 0.07].map((x) => (
            <mesh key={x} position={[x, 0.02, 0.19]}>
              <torusGeometry args={[0.045, 0.008, 6, 20]} />
              <meshStandardMaterial color={look.extraColor} metalness={0.4} roughness={0.4} />
            </mesh>
          ))}
        {look.extra === "cap" && (
          <group position={[0, 0.12, 0]}>
            <mesh>
              <sphereGeometry args={[0.215, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.3]} />
              <meshStandardMaterial color={look.extraColor} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.0, 0.2]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.24, 0.02, 0.17]} />
              <meshStandardMaterial color={look.extraColor} roughness={0.7} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

const still = (o: Partial<Pose> = {}): Pose => ({ walk: 0, mood: 0, arm: 0, shake: 0, jump: 0, holding: false, ...o });

/** The customer currently at the stall: walks in, asks, reacts, walks off with a pack. */
function Customer({ look, phase, holdColor, anchor, reduce }: { look: Look; phase: Phase; holdColor: string; anchor: React.RefObject<THREE.Object3D | null>; reduce: boolean }) {
  const g = useRef<THREE.Group>(null);
  const pose = useRef<Pose>(still());
  const t0 = useRef<number | null>(null);
  const seen = useRef<Phase>(phase);
  const speed = reduce ? 4 : 1;

  useFrame(({ clock }) => {
    const grp = g.current;
    if (!grp) return;
    const t = clock.elapsedTime;
    if (seen.current !== phase || t0.current === null) {
      seen.current = phase;
      t0.current = t;
    }
    const dt = (t - t0.current) * 1000 * speed;
    const p = pose.current;
    grp.visible = phase !== "idle" && phase !== "won";
    if (phase === "arrive") {
      const k = Math.min(1, dt / DUR.arrive);
      grp.position.lerpVectors(ENTRY, SPOT, ease(k));
      grp.rotation.y = k < 0.82 ? -Math.PI / 2 : THREE.MathUtils.lerp(-Math.PI / 2, FACE, (k - 0.82) / 0.18);
      Object.assign(p, still({ walk: k < 0.97 ? 1 : 0 }));
    } else if (phase === "ask") {
      grp.position.copy(SPOT);
      grp.rotation.y = FACE;
      Object.assign(p, still());
    } else if (phase === "oops") {
      grp.position.copy(SPOT);
      grp.rotation.y = FACE;
      Object.assign(p, still({ mood: -1, shake: Math.max(0, 1 - dt / 1100) }));
    } else if (phase === "happy") {
      grp.position.copy(SPOT);
      grp.rotation.y = FACE;
      const celebrating = dt < 1300;
      Object.assign(p, still({ mood: 1, jump: celebrating ? Math.abs(Math.sin(dt / 140)) * 0.16 : 0, arm: celebrating ? 1 : 0, holding: dt > 700 }));
    } else if (phase === "leave") {
      const k = Math.min(1, dt / DUR.leave);
      grp.position.lerpVectors(SPOT, EXIT, ease(k));
      grp.rotation.y = k < 0.12 ? THREE.MathUtils.lerp(FACE, -Math.PI / 2, k / 0.12) : -Math.PI / 2;
      Object.assign(p, still({ mood: 1, walk: 1, holding: true }));
    }
  });

  return (
    <group ref={g} position={ENTRY.toArray()} visible={false}>
      <Person look={look} pose={pose} holdColor={holdColor} />
      <object3D ref={anchor} position={[0, 2.12, 0]} />
    </group>
  );
}

function Seller({ phase, reduce }: { phase: Phase; reduce: boolean }) {
  const pose = useRef<Pose>(still());
  const g = useRef<THREE.Group>(null);
  const t0 = useRef<number | null>(null);
  const seen = useRef<Phase>(phase);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (seen.current !== phase || t0.current === null) {
      seen.current = phase;
      t0.current = t;
    }
    const dt = (t - t0.current) * 1000 * (reduce ? 4 : 1);
    const p = pose.current;
    if (phase === "happy") {
      // hand the pack over
      const k = dt < 700 ? dt / 700 : Math.max(0, 1 - (dt - 700) / 400);
      Object.assign(p, still({ mood: 1, holding: dt < 700, arm: k * 0.42 }));
    } else if (phase === "oops") Object.assign(p, still({ mood: -1 }));
    else if (phase === "arrive" && dt > DUR.arrive * 0.6) Object.assign(p, still({ mood: 1, arm: Math.abs(Math.sin(dt / 160)) * 0.6 }));
    else if (phase === "won") Object.assign(p, still({ mood: 1, jump: Math.abs(Math.sin(t * 5)) * 0.1, arm: 1 }));
    else Object.assign(p, still({ mood: phase === "leave" ? 1 : 0 }));
    if (g.current) g.current.rotation.y = phase === "idle" || phase === "won" ? 0 : 0.42;
  });
  return (
    <group ref={g} position={SELLER_POS} scale={1.04}>
      <Person look={SELLER} pose={pose} holdColor="#FF5C00" />
    </group>
  );
}

/** Background visitors at the neighbouring stalls and walking the far aisle. */
function Crowd() {
  const looks: Look[] = useMemo(
    () => [
      { skin: "#B98157", top: "#00897B", bottom: "#37474F", hair: "#1A110C", hairStyle: "short" },
      { skin: "#9C6644", top: "#F06292", bottom: "#F06292", hair: "#120A06", hairStyle: "long", dress: true },
      { skin: "#D4A373", top: "#5C6BC0", bottom: "#263238", hair: "#3E2723", hairStyle: "short", extra: "cap", extraColor: "#FBC02D" },
      { skin: "#A47148", top: "#FFB300", bottom: "#795548", hair: "#9E9E9E", hairStyle: "bun", dress: true },
      { skin: "#C68B59", top: "#8D6E63", bottom: "#3E2723", hair: "#1A110C", hairStyle: "short", extra: "backpack", extraColor: "#1565C0" },
      { skin: "#B5764A", top: "#26A69A", bottom: "#26A69A", hair: "#140C08", hairStyle: "long", dress: true },
    ],
    [],
  );
  const poses = useMemo(() => looks.map(() => ({ current: still() })), [looks]);
  const walkers = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    [4, 5].forEach((i, n) => {
      const w = walkers.current[n];
      if (!w) return;
      const dir = n === 0 ? 1 : -1;
      const x = (((t * 0.55 + n * 9) % 20) - 10) * dir;
      w.position.set(x, 0, -3.9 - n * 0.6);
      w.rotation.y = dir * (Math.PI / 2);
      poses[i].current.walk = 1;
    });
  });
  const idle: [number, number, number, number][] = [
    [-4.6, 0, 1.0, -2.6],
    [-5.9, 0, 1.2, 2.7],
    [5.2, 0, 1.15, 2.5],
    [6.4, 0, 1.0, -2.8],
  ];
  return (
    <group>
      {idle.map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, r, 0]}>
          <Person look={looks[i]} pose={poses[i]} />
        </group>
      ))}
      {[4, 5].map((i, n) => (
        <group
          key={i}
          ref={(el) => {
            walkers.current[n] = el;
          }}
        >
          <Person look={looks[i]} pose={poses[i]} />
        </group>
      ))}
    </group>
  );
}

/* ── the market ───────────────────────────────────────────────── */

function NeighbourStall({ x, z, cloth, label }: { x: number; z: number; cloth: string; label: string }) {
  const sign = useMemo(() => textTexture(512, 160, "#FFF8EE", [{ text: label, size: 70, color: "#4A3230", y: 84 }], cloth), [label, cloth]);
  const stripes = useMemo(() => {
    const t = stripeTexture(cloth, "#FFF8EE");
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(2, 1);
    return t;
  }, [cloth]);
  useEffect(
    () => () => {
      sign.dispose();
      stripes.dispose();
    },
    [sign, stripes],
  );
  const goods = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[3, 0.1, 1]} radius={0.03} position={[0, 0.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={cloth} roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0.45, 0.51]}>
        <planeGeometry args={[3, 0.9]} />
        <meshStandardMaterial color={cloth} roughness={0.9} />
      </mesh>
      {[-1.45, 1.45].map((px) => (
        <mesh key={px} position={[px, 1.5, -0.45]}>
          <cylinderGeometry args={[0.035, 0.035, 3, 8]} />
          <meshStandardMaterial color="#6B4126" />
        </mesh>
      ))}
      <mesh position={[0, 3.0, 0]} rotation={[-1.32, 0, 0]}>
        <planeGeometry args={[3.2, 1.3]} />
        <meshStandardMaterial map={stripes} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.5, 0.6]}>
        <planeGeometry args={[1.8, 0.56]} />
        <meshStandardMaterial map={sign} roughness={0.7} />
      </mesh>
      {goods.map((i) => (
        <mesh key={i} position={[-1.2 + (i % 7) * 0.4, 1.0 + Math.floor(i / 7) * 0.02, -0.25 + Math.floor(i / 7) * 0.4]} castShadow>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color={["#E53935", "#FB8C00", "#FDD835", "#8D6E63", "#43A047"][i % 5]} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function StringLights({ z, y = 3.6, from = -9, to = 9, sag = 0.5 }: { z: number; y?: number; from?: number; to?: number; sag?: number }) {
  const n = 34;
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1);
      const span = ((k * (to - from)) % 6) / 6; // three swoops across the hall
      o.position.set(from + k * (to - from), y - Math.sin(span * Math.PI) * sag, z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [z, y, from, to, sag]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]}>
      <sphereGeometry args={[0.055, 10, 8]} />
      <meshStandardMaterial color="#FFE6A8" emissive="#FFC24D" emissiveIntensity={2.2} toneMapped={false} />
    </instancedMesh>
  );
}

function Hall() {
  const floor = useMemo(() => tileTexture(), []);
  const banner = useMemo(
    () =>
      textTexture(1400, 220, "#550D10", [
        { text: "FOOD & CRAFTS EXHIBITION", size: 104, color: "#FED300", y: 98 },
        { text: "HALL A · STALLS 1–40", size: 44, color: "#FFF5EE", y: 178, weight: 600 },
      ]),
    [],
  );
  useEffect(
    () => () => {
      floor.dispose();
      banner.dispose();
    },
    [floor, banner],
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 26]} />
        <meshStandardMaterial map={floor} roughness={0.85} />
      </mesh>
      <mesh position={[0, 4, -7.5]}>
        <planeGeometry args={[40, 8]} />
        <meshStandardMaterial color="#F3D3B2" roughness={0.95} />
      </mesh>
      <mesh position={[0, 4.6, -7.4]}>
        <planeGeometry args={[9, 1.42]} />
        <meshStandardMaterial map={banner} roughness={0.8} />
      </mesh>
      <StringLights z={2.9} />
      <StringLights z={-2.6} y={3.9} sag={0.4} />
      <NeighbourStall x={-5.6} z={-0.4} cloth="#00897B" label="SPICES" />
      <NeighbourStall x={6.1} z={-0.4} cloth="#3949AB" label="HANDLOOM" />
      <NeighbourStall x={-4.2} z={-4.8} cloth="#8E24AA" label="POTTERY" />
      <NeighbourStall x={4.6} z={-4.8} cloth="#F9A825" label="FRESH JUICE" />
    </group>
  );
}

/* ── the Eat Better stall ─────────────────────────────────────── */

function Pack({ id, tex, position, rotation = 0, active }: { id: PackId; tex: THREE.Texture; position: [number, number, number]; rotation?: number; active: boolean }) {
  const meta = STALL_PACKS[id];
  const img = tex.image as { width: number; height: number } | undefined;
  const aspect = img ? img.width / img.height : 0.7;
  const h = meta.kind === "sachet" ? 0.46 : 0.44;
  const w = h * aspect;
  const g = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (g.current) {
      const target = active ? 0.1 + Math.sin(t * 3) * 0.03 : 0;
      g.current.position.y = THREE.MathUtils.damp(g.current.position.y, target, 6, delta);
    }
    if (marker.current) {
      marker.current.visible = active;
      marker.current.position.y = h + 0.28 + Math.sin(t * 4) * 0.05;
      marker.current.rotation.y = t * 2;
    }
  });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group ref={g}>
        <RoundedBox args={[w, h, 0.07]} radius={0.02} position={[0, h / 2, 0]} castShadow>
          <meshStandardMaterial color={meta.color} roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, h / 2, 0.0365]}>
          <planeGeometry args={[w * 0.985, h * 0.985]} />
          <meshStandardMaterial map={tex} roughness={0.45} />
        </mesh>
        <mesh ref={marker} rotation={[Math.PI, 0, 0]} visible={false}>
          <coneGeometry args={[0.08, 0.16, 4]} />
          <meshStandardMaterial color="#FF5C00" emissive="#FF5C00" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

const BACK_ROW: [PackId, number][] = [
  ["millet-bhujia", -1.68],
  ["millet-namkeen", -1.2],
  ["millet-bhel", -0.72],
  ["quinoa-namkeen", 0.86],
  ["ragi-chips", 1.3],
  ["nut-mix", 1.72],
];
const SACHETS: [PackId, number][] = [
  ["hazelnut-laddoo", -1.7],
  ["coffee-almond-laddoo", -1.43],
  ["peanut-laddoo", -1.16],
  ["protein-laddoo", -0.89],
];

function Stall({ active }: { active: PackId | null }) {
  const tex = useTexture(PACK_URLS) as Record<PackId, THREE.Texture>;
  useMemo(() => {
    for (const t of Object.values(tex)) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
  }, [tex]);
  const fascia = useLogoTexture(1200, 280);
  const backdrop = useBackdropTexture();
  const drape = useLogoTexture(900, 300);
  const roof = useMemo(() => {
    const t = stripeTexture("#FF5C00", "#FFF5EE");
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(3, 1);
    return t;
  }, []);
  const tent = useMemo(
    () =>
      textTexture(400, 240, "#2F1C1A", [
        { text: "FREE", size: 70, color: "#FED300", y: 80 },
        { text: "TASTING", size: 70, color: "#FFF5EE", y: 160 },
      ]),
    [],
  );
  const katori = useMemo(() => makeKatori(0.3, 0.16), []);
  const bowl = useMemo(() => makeBowl(0.26, 0.15), []);
  useEffect(
    () => () => {
      roof.dispose();
      tent.dispose();
      katori.dispose();
      bowl.dispose();
    },
    [roof, tent, katori, bowl],
  );
  const garland = useMemo(() => Array.from({ length: 19 }, (_, i) => i), []);

  return (
    <group>
      {/* table + cloth */}
      <RoundedBox args={[3.9, 0.1, 1.05]} radius={0.03} position={[0, 0.88, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#FF5C00" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0.44, 0.53]} receiveShadow>
        <planeGeometry args={[3.9, 0.88]} />
        <meshStandardMaterial color="#E8540A" roughness={0.9} />
      </mesh>
      {drape && (
        <mesh position={[0, 0.5, 0.535]}>
          <planeGeometry args={[1.35, 0.45]} />
          <meshStandardMaterial map={drape} roughness={0.7} />
        </mesh>
      )}
      {/* riser */}
      <mesh position={[0, 1.0, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[3.7, 0.16, 0.36]} />
        <meshStandardMaterial color="#B98A5E" roughness={0.6} />
      </mesh>
      {BACK_ROW.map(([id, x]) => (
        <Pack key={id} id={id} tex={tex[id]} position={[x, 1.08, -0.3]} rotation={x < 0 ? 0.12 : -0.12} active={active === id} />
      ))}
      {SACHETS.map(([id, x]) => (
        <Pack key={id} id={id} tex={tex[id]} position={[x, 0.93, 0.18]} rotation={0.1} active={active === id} />
      ))}
      <Pack id="trail-mix" tex={tex["trail-mix"]} position={[1.0, 0.93, 0.16]} rotation={-0.2} active={active === "trail-mix"} />
      <Pack id="seed-mix" tex={tex["seed-mix"]} position={[1.38, 0.93, 0.2]} rotation={-0.25} active={active === "seed-mix"} />

      {/* tasting */}
      <group position={[-0.3, 0.93, 0.15]}>
        <mesh geometry={katori} castShadow>
          <meshStandardMaterial color="#C8963E" metalness={1} roughness={0.25} />
        </mesh>
        <Laddoos count={6} spread={0.17} height={0.18} seed={77} />
      </group>
      <group position={[0.32, 0.93, 0.2]}>
        <mesh geometry={bowl} castShadow>
          <meshStandardMaterial color="#F4ECE2" roughness={0.4} />
        </mesh>
        <group position={[0, 0.05, 0]} scale={0.6}>
          <BhujiaPile count={200} spread={0.36} height={0.12} />
        </group>
      </group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0.05 + i * 0.09, 0.97, 0.43]}>
          <cylinderGeometry args={[0.035, 0.028, 0.07, 10]} />
          <meshStandardMaterial color="#FFF5EE" />
        </mesh>
      ))}
      <group position={[1.73, 0.93, 0.25]} rotation={[0, -0.35, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0.12, s * 0.05]} rotation={[s * 0.38, 0, 0]}>
            <planeGeometry args={[0.32, 0.22]} />
            <meshStandardMaterial map={tent} side={THREE.DoubleSide} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* backdrop with the brand line */}
      <mesh position={[0, 1.85, -1.45]} receiveShadow>
        <boxGeometry args={[4.2, 2.6, 0.06]} />
        <meshStandardMaterial color="#FF5C00" roughness={0.85} />
      </mesh>
      {backdrop && (
        <mesh position={[0, 2.02, -1.41]}>
          <planeGeometry args={[3.9, 1.22]} />
          <meshStandardMaterial map={backdrop} roughness={0.7} />
        </mesh>
      )}

      {/* canopy */}
      {[-2.05, 2.05].flatMap((x) =>
        [-1.42, 0.82].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 1.55, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 3.1, 10]} />
            <meshStandardMaterial color="#6B4126" roughness={0.6} />
          </mesh>
        )),
      )}
      <mesh position={[0, 3.2, -0.3]} rotation={[-1.42, 0, 0]} castShadow>
        <planeGeometry args={[4.4, 2.5]} />
        <meshStandardMaterial map={roof} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.85, 0.86]}>
        <boxGeometry args={[4.25, 0.6, 0.05]} />
        <meshStandardMaterial color="#FFF5EE" />
      </mesh>
      {fascia && (
        <mesh position={[0, 2.85, 0.89]}>
          <planeGeometry args={[2.3, 0.54]} />
          <meshStandardMaterial map={fascia} roughness={0.7} />
        </mesh>
      )}
      {garland.map((i) => {
        const k = i / 18;
        return (
          <mesh key={i} position={[-2 + k * 4, 2.56 - Math.sin(k * Math.PI) * 0.1, 0.9]}>
            <sphereGeometry args={[0.065, 10, 8]} />
            <meshStandardMaterial color={i % 2 ? "#FF9A12" : "#F57C00"} roughness={0.7} />
          </mesh>
        );
      })}
      <pointLight position={[0, 2.6, 0.2]} intensity={6} distance={5} color="#FFD08A" />
    </group>
  );
}

/* ── camera + speech-bubble projection ────────────────────────── */

function Rig({ reduce }: { reduce: boolean }) {
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(0.55, 1.3, 0.2), []);
  useFrame(({ clock }) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    cam.fov = aspect < 1 ? 44 : 36;
    const half = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const dist = Math.max(6.2, 3.05 / (half * aspect));
    const sway = reduce ? 0 : Math.sin(clock.elapsedTime * 0.25) * 0.25;
    cam.position.set(0.7 + sway, 1.35 + dist * 0.16, 0.2 + dist);
    cam.lookAt(look);
    cam.updateProjectionMatrix();
  });
  return null;
}

function BubbleProjector({ anchor, el }: { anchor: React.RefObject<THREE.Object3D | null>; el: React.RefObject<HTMLDivElement | null> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  const { camera, size } = useThree();
  useFrame(() => {
    const a = anchor.current;
    const d = el.current;
    if (!a || !d) return;
    a.getWorldPosition(v);
    v.project(camera);
    const half = Math.min(140, size.width * 0.38);
    const x = THREE.MathUtils.clamp((v.x * 0.5 + 0.5) * size.width, half + 8, size.width - half - 8);
    const y = Math.max(70, (-v.y * 0.5 + 0.5) * size.height);
    d.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  });
  return null;
}

function Scene({ phase, idx, anchor, bubble, reduce }: { phase: Phase; idx: number; anchor: React.RefObject<THREE.Object3D | null>; bubble: React.RefObject<HTMLDivElement | null>; reduce: boolean }) {
  const c = STALL_CUSTOMERS[Math.min(idx, STALL_CUSTOMERS.length - 1)];
  const active = phase === "ask" || phase === "oops" || phase === "happy" ? c.pack : null;
  return (
    <>
      <color attach="background" args={["#F6D7B8"]} />
      <fog attach="fog" args={["#F6D7B8", 11, 24]} />
      <hemisphereLight args={["#FFF4E6", "#8A5A3A", 1]} />
      <directionalLight position={[-4, 8, 6]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={6} shadow-camera-bottom={-4} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3} color="#FFF4E6" position={[-3, 5, 5]} scale={[6, 4, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={1.5} color="#FFD7A8" position={[4, 3, 3]} scale={[4, 3, 1]} target={[0, 1, 0]} />
      </Environment>
      <Rig reduce={reduce} />
      <Hall />
      <Crowd />
      <Suspense fallback={null}>
        <Stall active={active} />
      </Suspense>
      <Seller phase={phase} reduce={reduce} />
      <Customer key={c.id} look={c.look} phase={phase} holdColor={STALL_PACKS[c.pack].color} anchor={anchor} reduce={reduce} />
      <BubbleProjector anchor={anchor} el={bubble} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.3} scale={16} blur={2.4} far={3} resolution={512} frames={1} />
    </>
  );
}

/* ── the game (DOM + canvas) ──────────────────────────────────── */

const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 9) * 0.12,
  dur: 2.2 + ((i * 13) % 10) / 8,
  color: ["#FF5C00", "#FED300", "#F57C00", "#00A341", "#FFF5EE"][i % 5],
  rot: (i * 47) % 360,
}));

function Stars({ n, size = "size-4" }: { n: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <Star key={i} className={`${size} ${i < n ? "fill-haldi text-[#C9A400]" : "text-cocoa/25"}`} />
      ))}
    </span>
  );
}

export default function StallDay({ onComplete, three = true }: { onComplete: () => void; three?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const anchor = useRef<THREE.Object3D | null>(null);
  const reduce = !!useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const [stars, setStars] = useState<number[]>([]);
  const c = STALL_CUSTOMERS[Math.min(idx, STALL_CUSTOMERS.length - 1)];
  const total = stars.reduce((a, b) => a + b, 0);
  const rank = STALL_RANKS.find((r) => total >= r.min)!;
  const speed = reduce ? 4 : 1;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // phase timeline
  useEffect(() => {
    let to: ReturnType<typeof setTimeout> | undefined;
    if (phase === "arrive") to = setTimeout(() => setPhase("ask"), DUR.arrive / speed);
    else if (phase === "oops") to = setTimeout(() => setPhase("ask"), DUR.oops / speed);
    else if (phase === "happy") to = setTimeout(() => setPhase("leave"), DUR.happy / speed);
    else if (phase === "leave")
      to = setTimeout(() => {
        if (idx + 1 < STALL_CUSTOMERS.length) {
          setIdx(idx + 1);
          setWrong([]);
          setLast(null);
          setPhase("arrive");
        } else setPhase("won");
      }, DUR.leave / speed);
    return () => clearTimeout(to);
  }, [phase, idx, speed]);

  useEffect(() => {
    if (phase === "won") onComplete();
  }, [phase, onComplete]);

  const start = () => {
    setIdx(0);
    setWrong([]);
    setLast(null);
    setStars([]);
    setPhase("arrive");
  };
  const pick = (i: number) => {
    if (phase !== "ask" || wrong.includes(i)) return;
    setLast(i);
    if (c.options[i].good) {
      setStars((s) => [...s, Math.max(1, 3 - wrong.length)]);
      setPhase("happy");
    } else {
      setWrong((w) => [...w, i]);
      setPhase("oops");
    }
  };

  const lastOpt = last !== null ? c.options[last] : null;
  const bubbleText = phase === "ask" ? c.says : phase === "oops" ? lastOpt?.reply : phase === "happy" || phase === "leave" ? lastOpt?.reply : null;
  const bubbleTone = phase === "oops" ? "bg-white border-error" : phase === "happy" || phase === "leave" ? "bg-[#E3F6EA] border-success" : "bg-haldi border-cocoa";
  const inGame = phase !== "idle" && phase !== "won";

  return (
    <div ref={host} className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
      {/* 3D market */}
      <div className="relative h-[380px] overflow-hidden rounded-[24px] border border-cocoa bg-[#F6D7B8] shadow-[3px_3px_0_0_#2f1c1a] sm:h-[480px] lg:h-[580px]">
        {!three && <NextImage src="/chapter-1-3/exhibition-stall.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />}
        {visible && three && (
          <Canvas shadows="percentage" dpr={[1, 1.6]} camera={{ position: [0.7, 2.5, 7.5], fov: 36 }} gl={{ antialias: true }}>
            <Scene phase={phase} idx={idx} anchor={anchor} bubble={bubble} reduce={reduce} />
          </Canvas>
        )}

        {/* speech bubble above the customer */}
        <div ref={bubble} className="pointer-events-none absolute left-0 top-0 z-10" aria-hidden>
          <AnimatePresence mode="popLayout">
            {bubbleText && (
              <motion.div
                key={`${idx}-${phase}-${last}`}
                initial={{ opacity: 0, y: 10, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative w-max max-w-[min(260px,70vw)] rounded-2xl border-2 px-3 py-2 text-[0.92rem] font-bold leading-snug text-cocoa shadow-[2px_2px_0_0_#2f1c1a] ${bubbleTone}`}
              >
                &ldquo;{bubbleText}&rdquo;
                <span className={`absolute -bottom-[9px] left-1/2 size-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 ${bubbleTone}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HUD */}
        {inGame && (
          <>
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-xl bg-cocoa/90 px-3 py-1.5 text-[0.85rem] font-bold text-cream">
              <Store className="size-4 text-haldi" />
              <span className="hidden sm:inline">Customer {idx + 1} of {STALL_CUSTOMERS.length}</span>
              <span className="sm:hidden">
                {idx + 1}/{STALL_CUSTOMERS.length}
              </span>
            </div>
            <div className="pointer-events-none absolute right-3 top-3 z-10 flex gap-1.5 rounded-xl bg-cream/90 p-1.5">
              {STALL_CUSTOMERS.map((x, i) => {
                const done = i < stars.length;
                const cur = i === idx && !done;
                return (
                  <span
                    key={x.id}
                    className={`grid size-7 place-items-center rounded-full border-2 sm:size-8 ${done ? "border-success bg-success text-white" : cur ? "border-orange bg-white text-orange" : "border-cocoa/15 bg-white/60 text-cocoa/30"}`}
                  >
                    {done ? <Smile className="size-4" /> : cur && phase === "oops" ? <Frown className="size-4" /> : <User className="size-4" />}
                  </span>
                );
              })}
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-xl bg-cream/90 px-2.5 py-1.5 text-[0.85rem] font-bold text-cocoa">
              <Star className="size-4 fill-haldi text-[#C9A400]" /> {total} / {STALL_CUSTOMERS.length * 3}
            </div>
          </>
        )}

        {/* start screen */}
        <AnimatePresence>
          {phase === "idle" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 grid place-items-center bg-cocoa/35 p-4">
              <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="max-w-sm rounded-[22px] border border-cocoa bg-cream p-5 text-center shadow-[4px_4px_0_0_#2f1c1a] sm:p-6">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-orange text-white">
                  <Store className="size-6" />
                </div>
                <h3 className="mt-3 font-display text-[1.6rem] font-semibold leading-tight text-cocoa">Stall Day</h3>
                <p className="mt-1.5 text-[1rem] leading-snug text-cocoa">The exhibition is open. Five customers are heading to your Eat Better stall.</p>
                <button onClick={start} className="eb-btn eb-btn-primary mt-4 w-full justify-center">
                  Open the stall
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* win screen */}
        <AnimatePresence>
          {phase === "won" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 grid place-items-center overflow-hidden bg-cocoa/40 p-4">
              {!reduce &&
                CONFETTI.map((p, i) => (
                  <motion.span
                    key={i}
                    className="absolute top-0 h-3 w-2 rounded-[2px]"
                    style={{ left: `${p.left}%`, background: p.color, rotate: p.rot }}
                    initial={{ y: -20, opacity: 1 }}
                    animate={{ y: 640, rotate: p.rot + 540, opacity: [1, 1, 0] }}
                    transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
                  />
                ))}
              <motion.div initial={{ y: 24, scale: 0.9 }} animate={{ y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 16 }} className="relative max-w-sm rounded-[22px] border border-cocoa bg-cream p-5 text-center shadow-[4px_4px_0_0_#2f1c1a] sm:p-6">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-haldi text-cocoa">
                  <Trophy className="size-7" />
                </div>
                <div className="mt-3 text-[0.85rem] font-extrabold uppercase tracking-[0.14em] text-success">You win!</div>
                <h3 className="font-display text-[1.6rem] font-semibold leading-tight text-cocoa">5 happy customers</h3>
                <div className="mt-2 flex items-center justify-center gap-2 text-[1.05rem] font-bold text-cocoa">
                  <Star className="size-5 fill-haldi text-[#C9A400]" /> {total} / {STALL_CUSTOMERS.length * 3} stars · {rank.title}
                </div>
                <button onClick={start} className="eb-btn eb-btn-secondary mt-4 w-full justify-center">
                  <RotateCcw className="size-4" /> Play again
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* customer card + answers */}
      <div className="flex flex-col rounded-[24px] bg-cream p-4 sm:p-5">
        {phase === "idle" && (
          <div>
            <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-orange">How to play</div>
            <ol className="mt-3 space-y-2.5 text-[1.02rem] leading-snug text-cocoa">
              {[
                "A customer walks up to your stall with a question.",
                "Read the pack they ask about, then pick the answer that would make them happy.",
                "First try earns 3 stars, second try 2, third try 1.",
                "Make all 5 customers happy to win the day.",
              ].map((s, i) => (
                <li key={s} className="flex gap-2.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-orange font-display text-[0.85rem] font-semibold text-white">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-xl bg-peach/70 px-3 py-2 text-[0.9rem] text-cocoa-2">
              The customers are practice scenarios. The packs and product facts are Eat Better&apos;s own.
            </p>
          </div>
        )}

        {inGame && (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">
                Customer {idx + 1} of {STALL_CUSTOMERS.length} · practice scenario
              </span>
              {stars.length > idx && <Stars n={stars[idx]} />}
            </div>
            <div className="mt-1 font-display text-[1.15rem] font-semibold text-cocoa">{c.who}</div>

            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-cocoa/15 bg-white p-2.5">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-peach sm:size-20">
                <NextImage src={`/brand/products/${c.pack}-0.webp`} alt={`${STALL_PACKS[c.pack].name} — official Eat Better pack`} fill sizes="80px" className="object-cover" />
              </span>
              <div>
                <div className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-orange">They&apos;re asking about</div>
                <div className="font-display text-[1.05rem] font-semibold leading-tight text-cocoa">{STALL_PACKS[c.pack].name}</div>
              </div>
            </div>

            {phase === "arrive" ? (
              <p className="mt-4 text-[1.05rem] text-cocoa-2">A customer is walking up to your stall…</p>
            ) : (
              <>
                <p className="mt-4 font-display text-[1.2rem] font-medium leading-snug text-cocoa">&ldquo;{c.says}&rdquo;</p>
                <div className="mt-3 grid gap-2">
                  {c.options.map((o, i) => {
                    const bad = wrong.includes(i);
                    const won = (phase === "happy" || phase === "leave") && o.good;
                    return (
                      <button
                        key={i}
                        onClick={() => pick(i)}
                        disabled={phase !== "ask" || bad}
                        className={`flex items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-[0.98rem] font-bold leading-snug transition-colors ${won ? "border-success bg-success/10 text-cocoa" : bad ? "border-error/40 bg-error/5 text-cocoa-2/60 line-through" : phase === "ask" ? "border-cocoa/15 bg-white text-cocoa hover:border-orange" : "border-cocoa/10 bg-white/60 text-cocoa-2/70"}`}
                      >
                        <span className="mt-0.5 shrink-0">{won ? <Check className="size-4 text-success" strokeWidth={3} /> : bad ? <X className="size-4 text-error" strokeWidth={3} /> : <span className="grid size-4 place-items-center rounded-full border-2 border-cocoa/30" />}</span>
                        {o.text}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-3 min-h-[3rem]" aria-live="polite">
              {phase === "oops" || (phase === "ask" && wrong.length > 0) ? (
                lastOpt && !lastOpt.good && lastOpt.hint ? (
                  <p className="flex gap-2 rounded-xl bg-haldi/25 px-3 py-2 text-[0.95rem] leading-snug text-cocoa">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#B38F00]" /> {lastOpt.hint}
                  </p>
                ) : null
              ) : phase === "happy" || phase === "leave" ? (
                <p className="rounded-xl bg-success/10 px-3 py-2 text-[0.95rem] leading-snug text-cocoa">
                  <strong className="text-success">Happy customer!</strong> {c.fact}
                </p>
              ) : null}
            </div>
          </>
        )}

        {phase === "won" && (
          <div>
            <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-success">Stall closed for the day</div>
            <ul className="mt-3 space-y-2">
              {STALL_CUSTOMERS.map((x, i) => (
                <li key={x.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-[0.95rem] text-cocoa">
                  <span className="flex items-center gap-2">
                    <Smile className="size-4 shrink-0 text-success" /> {x.who}
                  </span>
                  <Stars n={stars[i] ?? 0} />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-cocoa">{EXHIBITIONS.why}</p>
          </div>
        )}
      </div>
    </div>
  );
}
