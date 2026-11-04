"use client";
/* eslint-disable react-hooks/immutability -- three.js objects, refs and canvas textures are mutated inside effects/useFrame by design */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PresentationControls, RoundedBox, useTexture } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Lightbulb, Megaphone, Palette, Search, Users, Volume2, X } from "lucide-react";
import { InspectPanel, LiteToggle, ObjectiveTracker, RoleBadge, SimReport, liteCanvasProps, useLiteMode, type Objective, type ReportData } from "@/components/sim";
import { Person, still, type Pose } from "@/components/sim/Person";
import { COLOUR_NOTE, ELEMENTS, HOTSPOTS, LAB_COLOURS, NAMES, PERCEPTIONS, SHOPPERS, TONE_LINES, TOUCH_IMAGES } from "../content";
import { useBrand21 } from "../store";

/**
 * Brand Identity Lab — Role: Junior Brand Analyst.
 * Four stations in one 3D studio: (1) spot the identity on a real pack, (2) colour lab,
 * (3) tone tuner, (4) shopper perception → Brand Identity Audit.
 */

type Step = 0 | 1 | 2 | 3 | 4;
const STATION_X = [0, 3.6, -3.6, 7.4, 0];
const PACK_URL = "/chapter-1-3/packs/coffee-almond-laddoo.webp";
const PACK_H = 1.6;
const PACK_W = PACK_H * (268 / 512);
const SHOPPER_CHOICES = ["brandname", "imagery", "claim", "colours"] as const;
const KEY = "ebc-2.1-lab";

type Saved = { step: Step; found: string[]; tried: string[]; colour: string | null; feel: string[]; tone: Record<number, boolean>; toneMiss: number; shop: Record<string, string>; shopMiss: number; pred: Record<string, { buy?: string; recall?: string }>; verdict: string };
const fresh: Saved = { step: 0, found: [], tried: [], colour: null, feel: [], tone: {}, toneMiss: 0, shop: {}, shopMiss: 0, pred: {}, verdict: "" };

/* ── canvas textures ──────────────────────────────────────────── */

function font() {
  return typeof document === "undefined" ? "sans-serif" : getComputedStyle(document.body).fontFamily || "sans-serif";
}

/** Student concept pouch for the colour lab (design exercise, not a real pack). */
function useConceptTexture(hex: string) {
  const [imgs, setImgs] = useState<{ logo: HTMLImageElement; snack: HTMLImageElement } | null>(null);
  useEffect(() => {
    let n = 0;
    const logo = new Image();
    const snack = new Image();
    const done = () => {
      n += 1;
      if (n === 2) setImgs({ logo, snack });
    };
    logo.onload = done;
    snack.onload = done;
    logo.src = "/brand/eat-better-logo.svg";
    snack.src = "/brand/products/millet-bhujia-0.webp";
  }, []);
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 680;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  useEffect(() => {
    const c = tex.image as HTMLCanvasElement;
    const g = c.getContext("2d")!;
    g.fillStyle = hex;
    g.fillRect(0, 0, 512, 680);
    const light = new THREE.Color(hex).getHSL({ h: 0, s: 0, l: 0 }).l > 0.62;
    g.fillStyle = "#FFF5EE";
    g.beginPath();
    g.roundRect(86, 40, 340, 170, 26);
    g.fill();
    if (imgs) g.drawImage(imgs.logo, 126, 62, 260, 260 * (40 / 83));
    g.fillStyle = light ? "#2F1C1A" : "#FFFFFF";
    g.textAlign = "center";
    g.font = `800 66px ${font()}`;
    g.fillText("MILLET", 256, 292);
    g.fillText("BHUJIA", 256, 360);
    g.font = `700 30px ${font()}`;
    g.fillText("PUDINA MASTI", 256, 404);
    g.save();
    g.beginPath();
    g.arc(256, 540, 112, 0, Math.PI * 2);
    g.clip();
    if (imgs) g.drawImage(imgs.snack, 0, 560, 440, 340, 120, 428, 290, 224);
    g.restore();
    g.strokeStyle = "#FFF5EE";
    g.lineWidth = 8;
    g.beginPath();
    g.arc(256, 540, 112, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "rgba(255,245,238,0.92)";
    g.fillRect(0, 650, 512, 30);
    g.fillStyle = "#4A3230";
    g.font = `700 18px ${font()}`;
    g.fillText("STUDENT DESIGN EXERCISE", 256, 671);
    tex.needsUpdate = true;
  }, [hex, imgs, tex]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function boardTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#E9D3B8";
  g.fillRect(0, 0, 1024, 512);
  const sw = ["#FF5C00", "#2F1C1A", "#603A38", "#FEE7D5", "#FFF5EE", "#FED300", "#550D10", "#35401D", "#AF4300"];
  sw.forEach((h, i) => {
    g.fillStyle = h;
    g.fillRect(60 + (i % 5) * 180, 70 + Math.floor(i / 5) * 200, 140, 150);
    g.strokeStyle = "rgba(47,28,26,0.25)";
    g.lineWidth = 4;
    g.strokeRect(60 + (i % 5) * 180, 70 + Math.floor(i / 5) * 200, 140, 150);
  });
  g.fillStyle = "#2F1C1A";
  g.font = `800 44px ${font()}`;
  g.fillText("MOODBOARD", 760, 420);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ── 3D pieces ────────────────────────────────────────────────── */

function Hotspot({ position, found, active, onPick }: { position: [number, number, number]; found: boolean; active: boolean; onPick: () => void }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const s = found ? 1 : 1 + Math.sin(clock.elapsedTime * 4) * 0.18;
    ring.current.scale.setScalar(active ? 1.35 : s);
  });
  return (
    <group position={position}>
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          if (e.delta > 6) return;
          e.stopPropagation();
          onPick();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <circleGeometry args={[0.085, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.045, 0.07, 28]} />
        <meshBasicMaterial color={found ? "#00A341" : "#FF5C00"} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color={found ? "#00A341" : "#FFFFFF"} toneMapped={false} />
      </mesh>
    </group>
  );
}

function RealPack({ found, active, onPick }: { found: string[]; active: string | null; onPick: (id: string) => void }) {
  const tex = useTexture(PACK_URL);
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);
  return (
    <group>
      <RoundedBox args={[PACK_W, PACK_H, 0.12]} radius={0.03} castShadow>
        <meshStandardMaterial color="#3A231C" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0605]}>
        <planeGeometry args={[PACK_W * 0.985, PACK_H * 0.985]} />
        <meshStandardMaterial map={tex} roughness={0.45} />
      </mesh>
      <mesh position={[0, PACK_H / 2 + 0.03, 0]}>
        <boxGeometry args={[PACK_W * 1.02, 0.07, 0.04]} />
        <meshStandardMaterial color="#E8DCCB" roughness={0.6} />
      </mesh>
      {HOTSPOTS.map((h) => (
        <Hotspot key={h.id} position={[(h.u - 0.5) * PACK_W, (0.5 - h.v) * PACK_H + (h.id === "format" ? 0.05 : 0), 0.075]} found={found.includes(h.id)} active={active === h.id} onPick={() => onPick(h.id)} />
      ))}
    </group>
  );
}

function ConceptPouch({ hex }: { hex: string }) {
  const tex = useConceptTexture(hex);
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.35;
  });
  return (
    <group ref={g}>
      <RoundedBox args={[1.05, 1.4, 0.2]} radius={0.06} castShadow>
        <meshStandardMaterial color={hex} roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 0, 0.101]}>
        <planeGeometry args={[1.0, 1.33]} />
        <meshStandardMaterial map={tex} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Speaker({ mood }: { mood: number }) {
  const cone = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const m = useRef(0);
  useFrame(({ clock }, dt) => {
    m.current = THREE.MathUtils.damp(m.current, mood, 3, dt);
    const t = clock.elapsedTime;
    if (cone.current) {
      cone.current.position.z = 0.24 + (m.current > 0 ? Math.sin(t * 22) * 0.015 * m.current : 0);
      cone.current.rotation.z = m.current < 0 ? Math.sin(t * 40) * 0.06 * -m.current : 0;
      (cone.current.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.max(0, m.current) * 0.8;
    }
    rings.current?.children.forEach((r, i) => {
      const k = ((t * 0.8 + i / 3) % 1) * Math.max(0, m.current);
      r.scale.setScalar(0.6 + k * 1.6);
      ((r as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.6 * Math.max(0, m.current);
    });
  });
  return (
    <group>
      <RoundedBox args={[1.0, 1.5, 0.5]} radius={0.06} castShadow>
        <meshStandardMaterial color="#2F1C1A" roughness={0.5} />
      </RoundedBox>
      <mesh ref={cone} position={[0, 0.15, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.36, 0.2, 0.18, 32]} />
        <meshStandardMaterial color="#FF5C00" emissive="#FF5C00" emissiveIntensity={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.48, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.04, 24]} />
        <meshStandardMaterial color="#C8963E" metalness={0.8} roughness={0.3} />
      </mesh>
      <group ref={rings} position={[0, 0.15, 0.3]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <ringGeometry args={[0.38, 0.42, 40]} />
            <meshBasicMaterial color="#FF5C00" transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Shopper({ s, x, state, onPick }: { s: (typeof SHOPPERS)[number]; x: number; state: "idle" | "happy" | "miss"; onPick: () => void }) {
  const pose = useRef<Pose>(still());
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    Object.assign(pose.current, still({ mood: state === "happy" ? 1 : state === "miss" ? -1 : 0, jump: state === "happy" ? Math.abs(Math.sin(t * 6)) * 0.08 : 0, arm: state === "happy" ? 0.6 : 0, shake: state === "miss" ? 0.6 : 0 }));
  });
  return (
    <group position={[x, 0, 0.6]} rotation={[0, (x - STATION_X[3]) * -0.3, 0]} onClick={(e) => (e.delta > 6 ? null : (e.stopPropagation(), onPick()))}>
      <Person look={s.look} pose={pose} />
    </group>
  );
}

function Shelf() {
  const tex = useTexture(PACK_URL);
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 1.0, 0.6]} />
        <meshStandardMaterial color="#B98A5E" roughness={0.6} />
      </mesh>
      {[-0.9, -0.45, 0, 0.45, 0.9].map((x) => (
        <group key={x} position={[x, 1.0 + 0.3, 0.05]} rotation={[0, x * 0.1, 0]}>
          <RoundedBox args={[0.32, 0.6, 0.06]} radius={0.015} castShadow>
            <meshStandardMaterial color="#3A231C" />
          </RoundedBox>
          <mesh position={[0, 0, 0.031]}>
            <planeGeometry args={[0.31, 0.59]} />
            <meshStandardMaterial map={tex} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Rig({ x, far = false }: { x: number; far?: boolean }) {
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const cur = useRef(x);
  useFrame((_, dt) => {
    cur.current = THREE.MathUtils.damp(cur.current, x, 3.5, dt);
    const narrow = size.width / Math.max(1, size.height) < 1;
    camera.position.set(cur.current, narrow ? 1.7 : 1.55, (narrow ? 5.6 : 4.3) + (far ? 1.6 : 0));
    look.set(cur.current, narrow ? 1.05 : 1.0, 0);
    camera.lookAt(look);
  });
  return null;
}

function Studio({ s, lite, active, onHotspot, onShopper, shopState, speakerMood }: { s: Saved; lite: boolean; active: string | null; onHotspot: (id: string) => void; onShopper: (id: string) => void; shopState: Record<string, "idle" | "happy" | "miss">; speakerMood: number }) {
  const board = useMemo(() => boardTexture(), []);
  useEffect(() => () => board.dispose(), [board]);
  const hex = LAB_COLOURS.find((c) => c.id === s.colour)?.hex ?? "#FF5C00";
  return (
    <>
      <color attach="background" args={["#F6E3CF"]} />
      <fog attach="fog" args={["#F6E3CF", 9, 20]} />
      <hemisphereLight args={["#FFF4E6", "#8A5A3A", 1.1]} />
      <directionalLight position={[-3, 6, 5]} intensity={1.8} castShadow={!lite} shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={12} />
      {!lite && (
        <Environment resolution={64} frames={1}>
          <Lightformer form="rect" intensity={3} color="#FFF4E6" position={[-2, 4, 5]} scale={[6, 4, 1]} target={[0, 1, 0]} />
        </Environment>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 14]} />
        <meshStandardMaterial color="#EAD2B6" roughness={0.9} />
      </mesh>
      <mesh position={[2, 2.5, -2.2]}>
        <planeGeometry args={[30, 5]} />
        <meshStandardMaterial color="#F3E1CC" roughness={0.95} />
      </mesh>
      <mesh position={[1.8, 2.4, -2.18]}>
        <planeGeometry args={[3.4, 1.7]} />
        <meshStandardMaterial map={board} roughness={0.8} />
      </mesh>

      {/* station plinths */}
      {[0, 3.6, -3.6].map((x) => (
        <mesh key={x} position={[x, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.7, 0.8, 0.6, 40]} />
          <meshStandardMaterial color={x === 0 ? "#FFF5EE" : x > 0 ? "#FEE7D5" : "#E9D3B8"} roughness={0.6} />
        </mesh>
      ))}

      <Suspense fallback={null}>
        <group position={[0, 1.45, 0]}>
          <PresentationControls global={false} cursor snap={false} polar={[-0.25, 0.25]} azimuth={[-Math.PI * 0.9, Math.PI * 0.9]} speed={1.4}>
            <RealPack found={s.found} active={active} onPick={onHotspot} />
          </PresentationControls>
        </group>
      </Suspense>

      <group position={[3.6, 1.32, 0]}>
        <ConceptPouch hex={hex} />
      </group>
      <group position={[3.6, 0.62, 0.45]}>
        {LAB_COLOURS.map((c, i) => (
          <mesh key={c.id} position={[(i - 2.5) * 0.17, 0, 0]}>
            <boxGeometry args={[0.13, 0.04, 0.13]} />
            <meshStandardMaterial color={c.hex} />
          </mesh>
        ))}
      </group>

      <group position={[-3.6, 1.35, 0]}>
        <Speaker mood={speakerMood} />
      </group>

      <group position={[STATION_X[3], 0, -0.9]}>
        <Suspense fallback={null}>
          <Shelf />
        </Suspense>
      </group>
      {SHOPPERS.map((sh, i) => (
        <Shopper key={sh.id} s={sh} x={STATION_X[3] - 1.25 + i * 1.25} state={shopState[sh.id] ?? "idle"} onPick={() => onShopper(sh.id)} />
      ))}

      {!lite && <ContactShadows position={[2, 0.01, 0]} opacity={0.3} scale={22} blur={2.4} far={3} resolution={512} frames={1} />}
    </>
  );
}

/* ── the lab (DOM + canvas) ───────────────────────────────────── */

type StationId = "pack" | "colour" | "tone" | "perception";

export default function IdentityLab({ onStation }: { onStation: (id: StationId) => void }) {
  const names = useBrand21((x) => x.names);
  const memorable = useBrand21((x) => x.memorable);
  const logoFound = useBrand21((x) => x.logoFound);
  const lite = useLiteMode();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [s, setS] = useState<Saved>(fresh);
  const [restored, setRestored] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [toneLast, setToneLast] = useState<{ i: number; ok: boolean } | null>(null);
  const [shopper, setShopper] = useState<string>(SHOPPERS[0].id);
  const [shopState, setShopState] = useState<Record<string, "idle" | "happy" | "miss">>({});
  const set = (p: Partial<Saved>) => setS((x) => ({ ...x, ...p }));

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
      /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration restore */
      if (v) {
        setS({ ...fresh, ...v });
        setShopState(Object.fromEntries(Object.entries((v.shop ?? {}) as Record<string, string>).map(([k, pick]) => [k, SHOPPERS.find((x) => x.id === k)?.priority === pick ? "happy" : "idle"])));
      }
    } catch {
      /* storage blocked */
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [s, restored]);

  const toneDone = Object.keys(s.tone).length === TONE_LINES.length;
  const toneRight = TONE_LINES.filter((l, i) => s.tone[i] === l.on).length;
  const shopHappy = SHOPPERS.filter((x) => s.shop[x.id] === x.priority).length;
  const predicted = SHOPPERS.filter((x) => s.pred[x.id]?.buy && s.pred[x.id]?.recall).length;
  const objectives: Objective[] = [
    { id: "spot", label: `Spot the identity on the pack (${s.found.length}/${HOTSPOTS.length})`, done: s.found.length === HOTSPOTS.length, detail: "Drag to turn the pack. Tap the orange rings." },
    { id: "colour", label: "Test colours on a concept pack", done: s.tried.length >= 3 && !!s.colour && s.feel.length > 0, detail: "Try 3 colours, keep one, tag how it feels." },
    { id: "tone", label: "Tune the brand voice", done: toneDone, detail: "Sort each line: on-brand or off-tone." },
    { id: "shop", label: `Win over 3 shoppers (${shopHappy}/3)`, done: shopHappy === 3 && predicted === 3, detail: "Pick what each notices first, then predict: buy? remember?" },
    { id: "audit", label: "Sign your Brand Identity Audit", done: s.verdict.trim().length >= 12 },
  ];
  const stepDone = [objectives[0].done, objectives[1].done, objectives[2].done, objectives[3].done, objectives[4].done];
  const doneKey = stepDone.slice(0, 4).join();
  useEffect(() => {
    (["pack", "colour", "tone", "perception"] as const).forEach((id, i) => stepDone[i] && onStation(id));
  }, [doneKey, onStation]); // eslint-disable-line react-hooks/exhaustive-deps

  const hot = HOTSPOTS.find((h) => h.id === active);
  const speakerMood = toneLast ? (toneLast.ok ? 1 : -1) : 0;

  const report: ReportData = useMemo(() => {
    const c = LAB_COLOURS.find((x) => x.id === s.colour);
    return {
      title: "Brand Identity Audit",
      chapter: "Chapter 2.1 · Brand Identity Lab",
      role: "Junior Brand Analyst",
      sections: [
        { heading: "Brand name — what each name promises", items: NAMES.map((n) => `${n.name}${n.real ? "" : " (practice)"}: ${(names[n.id] ?? []).join(", ") || "—"}${memorable === n.id ? " · easiest to remember" : ""}`) },
        { heading: "Visual consistency spotted", items: TOUCH_IMAGES.flatMap((t) => ELEMENTS.filter((e) => logoFound.includes(`${t.id}:${e.id}`)).map((e) => `${t.label}: ${e.id === "logo" ? "logo" : "lettering"}`)) },
        { heading: "Identity elements spotted", items: HOTSPOTS.filter((h) => s.found.includes(h.id)).map((h) => h.label) },
        { heading: "Colour test", items: [c ? c.name : "—", ...s.feel], body: c ? COLOUR_NOTE[c.id] + " (general explanation)" : undefined },
        { heading: "Brand voice", body: `${toneRight}/${TONE_LINES.length} lines sorted right · ${s.toneMiss} ${s.toneMiss === 1 ? "slip" : "slips"} along the way` },
        { heading: "Shopper insights (fictional shoppers)", items: SHOPPERS.map((x) => `${x.who.replace(/^A /, "")}: notices ${HOTSPOTS.find((h) => h.id === x.priority)?.label.toLowerCase()} · buy: ${s.pred[x.id]?.buy ?? "—"} · remembers: ${s.pred[x.id]?.recall ?? "—"}`) },
        { heading: "My one-line verdict", body: s.verdict.trim() || "—" },
      ],
      footnote: "Practice exercise: the concept pack, off-tone lines and shoppers are fictional",
    };
  }, [s, toneRight, names, memorable, logoFound]);

  const step = s.step;
  const go = (n: Step) => set({ step: n });

  return (
    <div ref={host} className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* 3D studio */}
        <div className="relative h-[360px] overflow-hidden rounded-[24px] border border-cocoa bg-[#F6E3CF] shadow-[3px_3px_0_0_#2f1c1a] sm:h-[460px] lg:h-[560px]">
          {visible && (
            <Canvas {...liteCanvasProps(lite)} camera={{ position: [0, 1.6, 4.3], fov: 40 }}>
              <Rig x={STATION_X[step]} far={step === 3} />
              <Studio
                s={s}
                lite={lite}
                active={active}
                onHotspot={(id) => {
                  setActive(id);
                  if (!s.found.includes(id)) set({ found: [...s.found, id] });
                }}
                onShopper={(id) => step === 3 && setShopper(id)}
                shopState={shopState}
                speakerMood={speakerMood}
              />
            </Canvas>
          )}
          <RoleBadge role="Junior Brand Analyst" icon={<Search className="size-4 text-haldi" />} className="absolute left-3 top-3 z-10" />
          <LiteToggle className="absolute right-3 top-14 z-10 sm:top-3" />
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex gap-1.5">
            {["Spot", "Colour", "Voice", "Shoppers", "Audit"].map((l, i) => (
              <span key={l} className={`rounded-full px-2.5 py-1 text-[0.78rem] font-bold ${i === step ? "bg-orange text-white" : stepDone[i] ? "bg-success text-white" : "bg-cream/90 text-cocoa-2"}`}>
                {stepDone[i] && i !== step ? <Check className="inline size-3.5" strokeWidth={3} /> : i + 1}
                <span className="hidden sm:inline"> {l}</span>
              </span>
            ))}
          </div>
          <InspectPanel open={step === 0 && !!hot} kicker="Identity element" title={hot?.label ?? ""} onClose={() => setActive(null)} facts={hot ? [hot.says] : []} note={hot ? hot.why : undefined} />
        </div>

        {/* control panel */}
        <div className="flex flex-col gap-3 rounded-[24px] bg-cream p-4 sm:p-5">
          <ObjectiveTracker objectives={objectives} title="Lab tasks" className="hidden lg:block" />
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-1 flex-col gap-3">
              {step === 0 && (
                <>
                  <StepHead icon={<Search className="size-5" />} n={1} title="Spot the identity" line="Drag to turn the real pack. Tap every orange ring." />
                  <div className="grid grid-cols-2 gap-1.5">
                    {HOTSPOTS.map((h) => (
                      <button key={h.id} onClick={() => setActive(h.id)} disabled={!s.found.includes(h.id)} className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-[0.9rem] font-bold ${s.found.includes(h.id) ? "border-success/40 bg-success/10 text-cocoa" : "border-dashed border-cocoa/20 text-cocoa/40"}`}>
                        {s.found.includes(h.id) ? <Check className="size-4 shrink-0 text-success" strokeWidth={3} /> : <span className="size-4 shrink-0 rounded-full border-2 border-cocoa/20" />}
                        {s.found.includes(h.id) ? h.label : "?"}
                      </button>
                    ))}
                  </div>
                  <Next disabled={!stepDone[0]} onClick={() => go(1)} label="To the colour lab" />
                </>
              )}

              {step === 1 && (
                <>
                  <StepHead icon={<Palette className="size-5" />} n={2} title="Colour lab" line="Dress the concept pack. Try 3 colours, keep one." />
                  <div className="grid grid-cols-6 gap-1.5">
                    {LAB_COLOURS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => set({ colour: c.id, tried: s.tried.includes(c.id) ? s.tried : [...s.tried, c.id], feel: c.id === s.colour ? s.feel : [] })}
                        aria-label={c.name}
                        aria-pressed={s.colour === c.id}
                        className={`aspect-square rounded-xl border-2 ${s.colour === c.id ? "scale-110 border-cocoa shadow-[2px_2px_0_0_#2f1c1a]" : "border-white"}`}
                        style={{ background: c.hex }}
                      />
                    ))}
                  </div>
                  {s.colour && (
                    <>
                      <div className="rounded-xl bg-white p-3">
                        <div className="font-display text-[1.05rem] font-semibold text-cocoa">{LAB_COLOURS.find((c) => c.id === s.colour)?.name}</div>
                        <p className="mt-0.5 text-[0.92rem] leading-snug text-cocoa">{COLOUR_NOTE[s.colour]}</p>
                        <p className="mt-1 text-[0.78rem] text-cocoa-2">General explanation, not Eat Better research.</p>
                        {LAB_COLOURS.find((c) => c.id === s.colour)?.official && <p className="mt-1.5 text-[0.88rem] font-semibold text-orange">{LAB_COLOURS.find((c) => c.id === s.colour)?.official}</p>}
                      </div>
                      <div className="text-[0.9rem] font-bold text-cocoa">How does it feel to you? (pick up to 2)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {PERCEPTIONS.map((p) => {
                          const on = s.feel.includes(p);
                          return (
                            <button key={p} onClick={() => set({ feel: on ? s.feel.filter((x) => x !== p) : [...s.feel, p].slice(-2) })} aria-pressed={on} className={`rounded-full border px-3 py-1.5 text-[0.9rem] font-bold ${on ? "border-orange bg-orange text-white" : "border-cocoa/20 bg-white text-cocoa hover:border-cocoa"}`}>
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <p className="text-[0.85rem] text-cocoa-2">{s.tried.length}/3 colours tried</p>
                  <Next disabled={!stepDone[1]} onClick={() => go(2)} label="To the voice booth" />
                </>
              )}

              {step === 2 && (
                <>
                  <StepHead icon={<Megaphone className="size-5" />} n={3} title="Tune the brand voice" line="Would Eat Better say it? Play each line." />
                  <div className="grid gap-1.5">
                    {TONE_LINES.map((l, i) => {
                      const ans = s.tone[i];
                      const decided = ans !== undefined;
                      return (
                        <div key={i} className={`rounded-xl border px-3 py-2 ${decided ? (ans === l.on ? "border-success/40 bg-success/10" : "border-error/30 bg-error/5") : "border-cocoa/15 bg-white"}`}>
                          <div className="flex items-start gap-2">
                            <Volume2 className="mt-0.5 size-4 shrink-0 text-orange" />
                            <span className="flex-1 text-[0.95rem] font-semibold leading-snug text-cocoa">“{l.text}”</span>
                          </div>
                          {!decided ? (
                            <div className="mt-1.5 flex gap-1.5 pl-6">
                              {[true, false].map((v) => (
                                <button
                                  key={String(v)}
                                  onClick={() => {
                                    const ok = v === l.on;
                                    setToneLast({ i, ok });
                                    setS((w) => ({ ...w, tone: ok ? { ...w.tone, [i]: v } : w.tone, toneMiss: w.toneMiss + (ok ? 0 : 1) }));
                                  }}
                                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[0.85rem] font-bold ${v ? "border-success/50 text-success hover:bg-success/10" : "border-error/40 text-error hover:bg-error/10"}`}
                                >
                                  {v ? <Check className="size-3.5" /> : <X className="size-3.5" />} {v ? "On-brand" : "Off-tone"}
                                </button>
                              ))}
                              {toneLast?.i === i && !toneLast.ok && <span className="self-center text-[0.82rem] font-bold text-error">Listen again…</span>}
                            </div>
                          ) : (
                            <p className="mt-1 pl-6 text-[0.85rem] text-cocoa-2">
                              {l.on ? "Official Eat Better line" : "Practice line"} · {l.why}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Next disabled={!stepDone[2]} onClick={() => go(3)} label="To the shop floor" />
                </>
              )}

              {step === 3 && (
                <>
                  <StepHead icon={<Users className="size-5" />} n={4} title="Win over the shoppers" line="Each fictional shopper looks for one thing first. Which?" />
                  <div className="grid grid-cols-3 gap-1.5">
                    {SHOPPERS.map((x) => (
                      <button key={x.id} onClick={() => setShopper(x.id)} aria-pressed={shopper === x.id} className={`rounded-xl border-2 px-2 py-2 text-[0.82rem] font-bold leading-tight ${shopper === x.id ? "border-orange bg-orange/10 text-cocoa" : "border-cocoa/15 bg-white text-cocoa-2"}`}>
                        {s.shop[x.id] === x.priority && <Check className="mx-auto mb-0.5 size-4 text-success" strokeWidth={3} />}
                        {x.who.replace(/^A /, "")}
                      </button>
                    ))}
                  </div>
                  {(() => {
                    const x = SHOPPERS.find((y) => y.id === shopper)!;
                    const won = s.shop[x.id] === x.priority;
                    const st = shopState[x.id];
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-1.5">
                          {SHOPPER_CHOICES.map((id) => {
                            const h = HOTSPOTS.find((k) => k.id === id)!;
                            return (
                              <button
                                key={id}
                                disabled={won}
                                onClick={() => {
                                  const ok = id === x.priority;
                                  setShopState((m) => ({ ...m, [x.id]: ok ? "happy" : "miss" }));
                                  setS((v) => ({ ...v, shop: ok ? { ...v.shop, [x.id]: id } : v.shop, shopMiss: v.shopMiss + (ok ? 0 : 1) }));
                                }}
                                className={`rounded-xl border px-2.5 py-2 text-[0.9rem] font-bold ${won && id === x.priority ? "border-success bg-success/10 text-cocoa" : "border-cocoa/15 bg-white text-cocoa hover:border-orange disabled:opacity-50"}`}
                              >
                                {h.label}
                              </button>
                            );
                          })}
                        </div>
                        {st && (
                          <p className={`rounded-xl px-3 py-2 text-[0.95rem] font-semibold ${st === "happy" ? "bg-success/10 text-cocoa" : "bg-haldi/25 text-cocoa"}`}>
                            {st === "happy" ? x.happy : <><Lightbulb className="mr-1 inline size-4 text-[#9A7B00]" />{x.miss}</>}
                          </p>
                        )}
                        {won && (
                          <div className="grid gap-1.5 rounded-xl bg-white p-2.5">
                            <div className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-orange">Your prediction</div>
                            {([["buy", "Will they buy it?", ["Yes", "Maybe", "No"]], ["recall", "Will they remember the brand?", ["Yes", "Not sure"]]] as const).map(([k, q, opts]) => (
                              <div key={k} className="flex flex-wrap items-center gap-1.5">
                                <span className="w-full text-[0.9rem] font-semibold text-cocoa sm:w-auto sm:min-w-[11rem]">{q}</span>
                                {opts.map((o) => {
                                  const on = s.pred[x.id]?.[k] === o;
                                  return (
                                    <button key={o} onClick={() => setS((v) => ({ ...v, pred: { ...v.pred, [x.id]: { ...v.pred[x.id], [k]: o } } }))} aria-pressed={on} className={`rounded-full border px-3 py-1 text-[0.85rem] font-bold ${on ? "border-cocoa bg-cocoa text-cream" : "border-cocoa/20 text-cocoa hover:border-cocoa"}`}>
                                      {o}
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-[0.78rem] text-cocoa-2">Fictional shoppers for practice.</p>
                      </>
                    );
                  })()}
                  <Next disabled={!stepDone[3]} onClick={() => go(4)} label="Write the audit" />
                </>
              )}

              {step === 4 && (
                <>
                  <StepHead icon={<Check className="size-5" />} n={5} title="Sign your audit" line="In one line: what does Eat Better’s identity say?" />
                  <input
                    value={s.verdict}
                    onChange={(e) => set({ verdict: e.target.value })}
                    maxLength={140}
                    placeholder="Eat Better’s identity says…"
                    aria-label="Your one-line verdict"
                    className="w-full rounded-xl border border-line-strong bg-white px-4 py-3 text-[1.05rem] text-cocoa outline-none focus:border-orange"
                  />
                  <p className="text-[0.88rem] text-cocoa-2">Your audit appears below the studio.</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-wrap gap-1.5 border-t border-cocoa/10 pt-3">
            {(["Spot", "Colour", "Voice", "Shoppers", "Audit"] as const).map((l, i) => (
              <button key={l} onClick={() => go(i as Step)} disabled={i > 0 && !stepDone[i - 1]} aria-current={i === step} className={`rounded-lg px-2.5 py-1 text-[0.82rem] font-bold disabled:opacity-35 ${i === step ? "bg-cocoa text-cream" : "text-cocoa-2 hover:bg-peach"}`}>
                {i + 1}. {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {step === 4 && <SimReport data={report} storageKey="ebc-2.1-audit" ready={stepDone[4]} />}
    </div>
  );
}

function StepHead({ icon, n, title, line }: { icon: React.ReactNode; n: number; title: string; line: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-orange text-white">{icon}</span>
      <div>
        <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-orange">Station {n}</div>
        <div className="font-display text-[1.25rem] font-semibold leading-tight text-cocoa">{title}</div>
        <p className="text-[0.95rem] leading-snug text-cocoa-2">{line}</p>
      </div>
    </div>
  );
}

function Next({ disabled, onClick, label }: { disabled: boolean; onClick: () => void; label: string }) {
  return (
    <button disabled={disabled} onClick={onClick} className="eb-btn eb-btn-primary mt-auto self-start !py-2 !normal-case disabled:opacity-40">
      {label} <ArrowRight className="size-4" />
    </button>
  );
}
