"use client";
/* eslint-disable react-hooks/immutability --
   refs shared between R3F components (sieve wobble, scene clock) are written every frame
   inside useFrame by design; they never drive React rendering. */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, RotateCcw, X } from "lucide-react";
import { makeKatori } from "@/features/packaging/three/geometry";
import { GlossaryText } from "@/components/chapter/Glossary";
import { FILTER_DECISIONS } from "../content";

/**
 * The Vision Filter. The brand's vision is a brass chalni (sieve). For each decision the student
 * predicts "passes" or "blocked"; then the decision token drops: decisions that fit the vision
 * fall through into the katori, the rest bounce off the mesh into the reject tray.
 */

type Drop = { id: number; passes: boolean; t0: number } | null;

/* perforated brass mesh texture (generated once) */
function useMeshTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#000";
    for (let y = 8; y < 256; y += 16) for (let x = 8 + ((y / 16) % 2) * 8; x < 256; x += 16) {
      g.beginPath();
      g.arc(x, y, 5.6, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  }, []);
}

function Chalni({ wobble }: { wobble: React.RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const alpha = useMeshTexture();
  useEffect(() => () => alpha.dispose(), [alpha]);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const w = wobble.current ?? 0;
    g.current.rotation.z = Math.sin(clock.elapsedTime * 22) * 0.06 * w;
    g.current.rotation.x = Math.cos(clock.elapsedTime * 19) * 0.04 * w;
  });
  return (
    <group ref={g} position={[0, 1.55, 0]}>
      {/* brass rim */}
      <mesh castShadow>
        <cylinderGeometry args={[1.25, 1.18, 0.32, 64, 1, true]} />
        <meshStandardMaterial color="#C8963E" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.04, 10, 64]} />
        <meshStandardMaterial color="#E3B45C" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* perforated mesh */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.18, 64]} />
        <meshStandardMaterial color="#D9A84E" metalness={0.8} roughness={0.35} alphaMap={alpha} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Stand() {
  return (
    <group>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.15, 0.75, Math.sin(a) * 1.15]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 1.5, 10]} />
            <meshStandardMaterial color="#6B4126" />
          </mesh>
        );
      })}
    </group>
  );
}

/** Laddoos that have passed the filter, piling up in the katori. */
function Kept({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.17, 2), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6A3D27", roughness: 0.9 }), []);
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < 6; i++) {
      const a = i * 2.4;
      const r = i === 0 ? 0 : 0.28;
      o.position.set(Math.cos(a) * r, 0.25 + (i > 3 ? 0.18 : 0), Math.sin(a) * r);
      o.scale.setScalar(i < count ? 1 : 0.0001);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count]);
  return <instancedMesh ref={ref} args={[geo, mat, 6]} castShadow />;
}

function Rejected({ count }: { count: number }) {
  return (
    <group position={[2.6, 0, 0.6]}>
      <RoundedBox args={[1.5, 0.12, 1.1]} radius={0.04} position={[0, 0.06, 0]} receiveShadow>
        <meshStandardMaterial color="#8A5A36" roughness={0.8} />
      </RoundedBox>
      {Array.from({ length: count }, (_, i) => (
        <RoundedBox key={i} args={[0.34, 0.12, 0.34]} radius={0.04} position={[-0.45 + (i % 3) * 0.45, 0.19, -0.25 + Math.floor(i / 3) * 0.45]} rotation={[0, i * 0.7, 0]} castShadow>
          <meshStandardMaterial color="#5A4A44" roughness={0.9} />
        </RoundedBox>
      ))}
    </group>
  );
}

function Token({ drop, onDone, wobble, reduced }: { drop: Drop; onDone: (passes: boolean) => void; wobble: React.RefObject<number>; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const finished = useRef<number | null>(null);
  useFrame(({ clock }) => {
    const grp = g.current;
    if (!grp) return;
    if (!drop) {
      grp.visible = false;
      return;
    }
    grp.visible = true;
    const t = (clock.elapsedTime - drop.t0) * (reduced ? 4 : 1);
    if (drop.passes) {
      // fall onto the mesh, shrink through the holes, land in the katori
      if (t < 0.6) grp.position.set(0, 3.6 - (t / 0.6) * 2.0, 0);
      else if (t < 1.3) {
        const k = (t - 0.6) / 0.7;
        grp.position.set(0, 1.6 - k * 1.25, 0);
        grp.scale.setScalar(1 - k * 0.55);
        if (mat.current) mat.current.color.lerpColors(new THREE.Color("#FFF5EE"), new THREE.Color("#6A3D27"), k);
      } else if (finished.current !== drop.id) {
        finished.current = drop.id;
        grp.visible = false;
        onDone(true);
      }
    } else {
      // land on the mesh, bounce, slide off into the reject tray
      if (t < 0.6) grp.position.set(0, 3.6 - (t / 0.6) * 1.85, 0);
      else if (t < 1.0) {
        wobble.current = 1 - (t - 0.6) / 0.4;
        const k = (t - 0.6) / 0.4;
        grp.position.set(k * 0.5, 1.75 + Math.sin(k * Math.PI) * 0.5, 0);
      } else if (t < 1.7) {
        wobble.current = 0;
        const k = (t - 1.0) / 0.7;
        grp.position.set(0.5 + k * 2.1, 1.75 - k * 1.5 + Math.sin(k * Math.PI) * 0.3, k * 0.6);
        grp.rotation.z = -k * 2.5;
        if (mat.current) mat.current.color.lerpColors(new THREE.Color("#FFF5EE"), new THREE.Color("#5A4A44"), k);
      } else if (finished.current !== drop.id) {
        finished.current = drop.id;
        grp.visible = false;
        onDone(false);
      }
    }
  });
  useEffect(() => {
    const grp = g.current;
    if (!grp) return;
    grp.scale.setScalar(1);
    grp.rotation.set(0, 0, 0);
    mat.current?.color.set("#FFF5EE");
  }, [drop]);
  return (
    <group ref={g} visible={false}>
      <RoundedBox args={[0.42, 0.16, 0.42]} radius={0.05} castShadow>
        <meshStandardMaterial ref={mat} color="#FFF5EE" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 20]} />
        <meshStandardMaterial color="#FF5C00" />
      </mesh>
    </group>
  );
}

function Scene({ drop, kept, rejected, onDone, reduced }: { drop: Drop; kept: number; rejected: number; onDone: (p: boolean) => void; reduced: boolean }) {
  const katori = useMemo(() => makeKatori(0.75, 0.38), []);
  useEffect(() => () => katori.dispose(), [katori]);
  const wobble = useRef(0);
  return (
    <>
      <hemisphereLight args={["#FFF4E6", "#7A4A2C", 0.85]} />
      <directionalLight position={[-3, 7, 4]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3} color="#FFF4E6" position={[-3, 4, 4]} scale={[5, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.5} color="#FFE2C4" position={[4, 2, 1]} scale={[2, 4, 1]} target={[0, 0, 0]} />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 48]} />
        <meshStandardMaterial color="#E8C9A6" roughness={0.9} />
      </mesh>
      <Stand />
      <Chalni wobble={wobble} />
      <group position={[0, 0.02, 0]}>
        <mesh geometry={katori} castShadow receiveShadow>
          <meshStandardMaterial color="#C8963E" metalness={1} roughness={0.25} />
        </mesh>
        <Kept count={Math.min(6, kept)} />
      </group>
      <Rejected count={Math.min(6, rejected)} />
      <Token drop={drop} onDone={onDone} wobble={wobble} reduced={reduced} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={9} blur={2} far={3} resolution={512} frames={1} />
    </>
  );
}

export default function VisionFilter({ onComplete }: { onComplete: () => void }) {
  const reduced = !!useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [i, setI] = useState(0);
  const [guess, setGuess] = useState<boolean | null>(null);
  const [drop, setDrop] = useState<Drop>(null);
  const [landed, setLanded] = useState(false);
  const [kept, setKept] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [right, setRight] = useState(0);
  const dropId = useRef(0);
  const clockStart = useRef(0);
  const d = FILTER_DECISIONS[i];
  const finished = i >= FILTER_DECISIONS.length;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "150px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (finished) onComplete();
  }, [finished, onComplete]);

  const decide = (passes: boolean) => {
    if (guess !== null || !d) return;
    setGuess(passes);
    if (passes === d.passes) setRight((r) => r + 1);
    dropId.current += 1;
    setDrop({ id: dropId.current, passes: d.passes, t0: clockStart.current });
  };
  const next = () => {
    setI((x) => x + 1);
    setGuess(null);
    setLanded(false);
    setDrop(null);
  };
  const reset = () => {
    setI(0);
    setGuess(null);
    setLanded(false);
    setDrop(null);
    setKept(0);
    setRejected(0);
    setRight(0);
  };

  return (
    <div ref={host} className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
      <div className="relative h-[340px] overflow-hidden rounded-[24px] border border-cocoa bg-[#FBE6D3] shadow-[3px_3px_0_0_#2f1c1a] sm:h-[440px]">
        {visible && (
          <Canvas shadows="percentage" dpr={[1, 1.5]} camera={{ position: [0.6, 4.4, 6.4], fov: 38 }} onCreated={({ camera }) => camera.lookAt(0.4, 1, 0)}>
            <color attach="background" args={["#FBE6D3"]} />
            <ClockSync clockStart={clockStart} />
            <Scene
              drop={drop}
              kept={kept}
              rejected={rejected}
              reduced={reduced}
              onDone={(p) => {
                setLanded(true);
                if (p) setKept((k) => k + 1);
                else setRejected((r) => r + 1);
              }}
            />
          </Canvas>
        )}
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-cocoa/85 px-2.5 py-1 text-[0.85rem] font-bold text-cream">The vision filter</div>
        <div className="pointer-events-none absolute bottom-3 left-3 flex gap-2 text-[0.85rem] font-bold">
          <span className="rounded-lg bg-success px-2.5 py-1 text-white">Passed · {kept}</span>
          <span className="rounded-lg bg-[#5A4A44] px-2.5 py-1 text-white">Blocked · {rejected}</span>
        </div>
      </div>

      <div className="flex flex-col rounded-[24px] bg-cream p-5 sm:p-6">
        {!finished && d ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-cocoa-2">
                Decision {i + 1} of {FILTER_DECISIONS.length}
              </span>
              <span className="flex gap-1" aria-hidden>
                {FILTER_DECISIONS.map((_, k) => (
                  <span key={k} className={`h-1.5 w-4 rounded-full ${k < i ? "bg-orange" : k === i ? "bg-cocoa" : "bg-cocoa/15"}`} />
                ))}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 font-display text-[1.35rem] font-medium leading-snug text-cocoa">
                <GlossaryText>{d.text}</GlossaryText>
              </motion.p>
            </AnimatePresence>
            <p className="mt-3 text-[1rem] text-cocoa-2">Does this help make snacks that are both tasty and better for you?</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => decide(true)} disabled={guess !== null} className={`eb-btn ${guess === true ? "eb-btn-primary" : "eb-btn-secondary"} !normal-case`}>
                <Check className="size-5" /> Passes
              </button>
              <button onClick={() => decide(false)} disabled={guess !== null} className={`eb-btn ${guess === false ? "eb-btn-dark" : "eb-btn-secondary"} !normal-case`}>
                <X className="size-5" /> Blocked
              </button>
            </div>
            <AnimatePresence>
              {landed && guess !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
                  <div className={`rounded-2xl px-4 py-3 text-[1rem] leading-relaxed ${guess === d.passes ? "bg-success/10" : "bg-error/10"}`}>
                    <strong className={guess === d.passes ? "text-success" : "text-error"}>{guess === d.passes ? "You called it." : "Not quite."}</strong> {d.why}
                  </div>
                  <div className="text-[0.92rem] font-bold text-cocoa-2">{d.real ? "This is one of Eat Better's real practices." : "Practice scenario — made up for this activity, not a real Eat Better decision."}</div>
                  <button onClick={next} className="eb-btn eb-btn-primary mt-1 !normal-case">
                    {i + 1 < FILTER_DECISIONS.length ? "Next decision" : "See my result"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-1 flex-col justify-center">
            <div className="text-[0.85rem] font-extrabold uppercase tracking-[0.12em] text-success">Filter complete</div>
            <p className="mt-2 font-display text-[1.6rem] font-semibold leading-tight text-cocoa">
              You judged {right} of {FILTER_DECISIONS.length} decisions correctly.
            </p>
            <p className="mt-3 text-[1.02rem] leading-relaxed text-cocoa">
              Every real Eat Better practice passed the filter — each one keeps snacks tasty <em>and</em> better for you. Every shortcut was blocked.
            </p>
            <button onClick={reset} className="mt-5 flex items-center gap-1.5 self-start rounded-xl px-3 py-2 text-[1rem] font-bold text-cocoa-2 hover:bg-peach">
              <RotateCcw className="size-4" /> Try again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** Keeps a ref with the R3F clock time so drops start "now" in scene time. */
function ClockSync({ clockStart }: { clockStart: React.RefObject<number> }) {
  useFrame(({ clock }) => {
    clockStart.current = clock.elapsedTime;
  });
  return null;
}
