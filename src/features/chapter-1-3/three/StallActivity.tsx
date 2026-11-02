"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MessageCircle, RotateCcw } from "lucide-react";
import { makeKatori } from "@/features/packaging/three/geometry";
import { Laddoos } from "@/components/world/props";
import { EXHIBITIONS, VISITORS, type Fix } from "../content";

/**
 * Exhibition-stall activity (practice scenarios). Visitors give face-to-face feedback; the student
 * decides what it is about. Correct fixes visibly change the 3D stall.
 */

type Fixed = Record<Exclude<Fix, "ignore">, boolean>;

function Pouch({ color, zip }: { color: string; zip: boolean }) {
  return (
    <group>
      <RoundedBox args={[0.42, 0.62, 0.16]} radius={0.06} position={[0, 0.31, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.52, 0.085]}>
        <planeGeometry args={[0.36, 0.05]} />
        <meshStandardMaterial color={zip ? "#00A341" : "#d9c9b6"} emissive={zip ? "#00A341" : "#000"} emissiveIntensity={zip ? 0.6 : 0} />
      </mesh>
      <mesh position={[0, 0.3, 0.085]}>
        <planeGeometry args={[0.28, 0.16]} />
        <meshStandardMaterial color="#FFF5EE" />
      </mesh>
    </group>
  );
}

function Stall({ fixed, pulseRef }: { fixed: Fixed; pulseRef: React.RefObject<number> }) {
  const katori = useMemo(() => makeKatori(0.42, 0.22), []);
  useEffect(() => () => katori.dispose(), [katori]);
  const glow = useRef<THREE.Mesh>(null);
  const garland = useMemo(() => Array.from({ length: 15 }, (_, i) => i), []);
  useFrame(({ clock }) => {
    if (glow.current) {
      const m = glow.current.material as THREE.MeshStandardMaterial;
      m.opacity = fixed.recipe ? 0.35 + Math.sin(clock.elapsedTime * 3) * 0.15 : 0;
    }
    pulseRef.current = Math.max(0, (pulseRef.current ?? 0) - 0.02);
  });
  return (
    <group>
      {/* table with an orange cloth */}
      <RoundedBox args={[4.2, 0.12, 1.7]} radius={0.04} position={[0, 0.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#FF5C00" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0.45, 0.86]}>
        <planeGeometry args={[4.2, 0.9]} />
        <meshStandardMaterial color="#E8540A" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* canopy poles + roof */}
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, 1.6, -0.75]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 3.2, 10]} />
          <meshStandardMaterial color="#6B4126" />
        </mesh>
      ))}
      <mesh position={[0, 3.15, -0.2]} rotation={[0.25, 0, 0]} castShadow>
        <boxGeometry args={[4.5, 0.06, 1.6]} />
        <meshStandardMaterial color="#FFF5EE" roughness={0.8} />
      </mesh>
      {/* marigold garland */}
      {garland.map((i) => {
        const x = -2 + (i / 14) * 4;
        const y = 2.85 - Math.sin((i / 14) * Math.PI) * 0.35;
        return (
          <mesh key={i} position={[x, y, 0.42]}>
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshStandardMaterial color={i % 2 ? "#FF9A12" : "#F57C00"} roughness={0.7} />
          </mesh>
        );
      })}
      {/* blank signboard */}
      <RoundedBox args={[1.6, 0.5, 0.06]} radius={0.03} position={[0, 2.35, -0.72]}>
        <meshStandardMaterial color="#FFF5EE" />
      </RoundedBox>

      {/* laddoo tray (taste) */}
      <group position={[-1.3, 0.96, 0.1]}>
        <mesh geometry={katori}>
          <meshStandardMaterial color="#C8963E" metalness={1} roughness={0.25} />
        </mesh>
        <Laddoos count={7} spread={0.22} height={0.25} seed={91} />
        <mesh ref={glow} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.48, 0.62, 40]} />
          <meshStandardMaterial color="#00A341" emissive="#00A341" emissiveIntensity={1} transparent opacity={0} />
        </mesh>
        {/* tasting cups */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0.55 + i * 0.16, 0.06, 0.45]}>
            <cylinderGeometry args={[0.05, 0.04, 0.1, 12]} />
            <meshStandardMaterial color="#FFF5EE" />
          </mesh>
        ))}
      </group>

      {/* pouches (packaging) */}
      <group position={[0.15, 0.96, -0.1]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[(i - 1) * 0.5, 0, (i % 2) * 0.12]} rotation={[0, (i - 1) * 0.15, 0]}>
            <Pouch color={["#C6CC3D", "#D39F5B", "#282946"][i]} zip={fixed.packaging} />
          </group>
        ))}
      </group>

      {/* price tag + trial packs (price) */}
      <group position={[1.5, 0.96, 0.25]}>
        <RoundedBox args={[0.5, 0.32, 0.04]} radius={0.02} position={[0, 0.35, 0]} rotation={[-0.2, -0.3, 0]}>
          <meshStandardMaterial color={fixed.price ? "#FED300" : "#FFF5EE"} />
        </RoundedBox>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.25, 6]} />
          <meshStandardMaterial color="#6B4126" />
        </mesh>
        {fixed.price &&
          [0, 1, 2, 3].map((i) => (
            <group key={i} position={[-0.3 + (i % 2) * 0.28, 0, 0.25 + Math.floor(i / 2) * 0.22]} scale={0.55}>
              <Pouch color="#D39F5B" zip={fixed.packaging} />
            </group>
          ))}
      </group>
    </group>
  );
}

function Scene({ fixed, pulseRef }: { fixed: Fixed; pulseRef: React.RefObject<number> }) {
  return (
    <>
      <hemisphereLight args={["#FFF4E6", "#7A4A2C", 0.9]} />
      <directionalLight position={[-3, 7, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 2.8, 0.8]} intensity={4} color="#FFC56B" distance={6} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3} color="#FFF4E6" position={[-3, 4, 4]} scale={[5, 4, 1]} target={[0, 1, 0]} />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[7, 48]} />
        <meshStandardMaterial color="#E8C9A6" roughness={0.9} />
      </mesh>
      <Stall fixed={fixed} pulseRef={pulseRef} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={10} blur={2} far={3} resolution={512} frames={1} />
    </>
  );
}

const CHOICES: { id: Fix; label: string }[] = [
  { id: "recipe", label: "It's about taste — tweak the recipe" },
  { id: "price", label: "It's about price — try a smaller pack" },
  { id: "packaging", label: "It's about packaging — improve the pouch" },
  { id: "ignore", label: "Ignore it and keep selling" },
];

export default function StallActivity({ onComplete }: { onComplete: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<Fix | null>(null);
  const [fixed, setFixed] = useState<Fixed>({ recipe: false, price: false, packaging: false });
  const [ignored, setIgnored] = useState(0);
  const pulseRef = useRef(0);
  const v = VISITORS[i];
  const done = i >= VISITORS.length;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "150px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const choose = (f: Fix) => {
    if (pick || !v) return;
    setPick(f);
    if (f === v.about) {
      setFixed((x) => ({ ...x, [v.about]: true }));
      pulseRef.current = 1;
    } else if (f === "ignore") setIgnored((n) => n + 1);
  };

  return (
    <div ref={host} className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative h-[330px] overflow-hidden rounded-[24px] border border-cocoa bg-[#FBE6D3] shadow-[3px_3px_0_0_#2f1c1a] sm:h-[430px]">
        {visible && (
          <Canvas shadows="percentage" dpr={[1, 1.5]} camera={{ position: [0.4, 2.6, 5.6], fov: 40 }} onCreated={({ camera }) => camera.lookAt(0, 1.2, 0)}>
            <color attach="background" args={["#FBE6D3"]} />
            <Scene fixed={fixed} pulseRef={pulseRef} />
          </Canvas>
        )}
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-cocoa/85 px-2.5 py-1 text-[0.85rem] font-bold text-cream">Your exhibition stall</div>
        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1.5 text-[0.82rem] font-bold">
          {(["recipe", "price", "packaging"] as const).map((k) => (
            <span key={k} className={`rounded-lg px-2 py-1 ${fixed[k] ? "bg-success text-white" : "bg-white/80 text-cocoa-2"}`}>
              {k === "recipe" ? "Taste" : k === "price" ? "Price" : "Packaging"} {fixed[k] ? "improved" : "—"}
            </span>
          ))}
        </div>
        {!reduce && v && !pick && (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="pointer-events-none absolute right-3 top-3 max-w-[60%] rounded-2xl rounded-br-sm border border-cocoa bg-haldi px-3 py-2 text-[0.92rem] font-bold leading-snug text-cocoa shadow-[2px_2px_0_0_#2f1c1a]"
          >
            &ldquo;{v.says}&rdquo;
          </motion.div>
        )}
      </div>

      <div className="flex flex-col rounded-[24px] bg-cream p-5 sm:p-6">
        {!done && v ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">
                Visitor {i + 1} of {VISITORS.length} · practice scenario
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-orange text-white">
                  <MessageCircle className="size-5" />
                </span>
                <p className="font-display text-[1.3rem] font-medium leading-snug text-cocoa">&ldquo;{v.says}&rdquo;</p>
              </motion.div>
            </AnimatePresence>
            <p className="mt-3 text-[1rem] text-cocoa-2">What is this feedback about — and what will you do?</p>
            <div className="mt-3 grid gap-2">
              {CHOICES.map((c) => {
                const chosen = pick === c.id;
                const right = c.id === v.about;
                return (
                  <button
                    key={c.id}
                    onClick={() => choose(c.id)}
                    disabled={!!pick}
                    className={`rounded-xl border-2 px-3.5 py-2.5 text-left text-[1rem] font-bold transition-colors ${pick ? (right ? "border-success bg-success/10 text-cocoa" : chosen ? "border-error bg-error/10 text-cocoa" : "border-cocoa/10 text-cocoa-2/60") : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa"}`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {pick && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
                  <p className={`rounded-2xl px-4 py-3 text-[1rem] leading-relaxed ${pick === v.about ? "bg-success/10" : "bg-error/10"}`}>
                    {pick === v.about
                      ? v.good
                      : pick === "ignore"
                        ? "The visitor walks away. If you ignore feedback now, the same problem could cost you many customers later."
                        : `That's not quite what they meant — this feedback is about ${v.about === "recipe" ? "taste" : v.about}.`}
                  </p>
                  <button
                    onClick={() => {
                      setI((x) => x + 1);
                      setPick(null);
                    }}
                    className="eb-btn eb-btn-primary !normal-case"
                  >
                    {i + 1 < VISITORS.length ? "Next visitor" : "Close the stall"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-1 flex-col justify-center">
            <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-success">Stall closed for the day</div>
            <p className="mt-2 font-display text-[1.5rem] font-semibold leading-tight text-cocoa">
              You improved {Object.values(fixed).filter(Boolean).length} of 3 things{ignored ? ` and ignored ${ignored} visitor${ignored > 1 ? "s" : ""}` : ""}.
            </p>
            <p className="mt-3 text-[1.05rem] leading-relaxed text-cocoa">{EXHIBITIONS.why}</p>
            <button
              onClick={() => {
                setI(0);
                setPick(null);
                setFixed({ recipe: false, price: false, packaging: false });
                setIgnored(0);
              }}
              className="mt-5 flex items-center gap-1.5 self-start rounded-xl px-3 py-2 text-[1rem] font-bold text-cocoa-2 hover:bg-peach"
            >
              <RotateCcw className="size-4" /> Run the stall again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
