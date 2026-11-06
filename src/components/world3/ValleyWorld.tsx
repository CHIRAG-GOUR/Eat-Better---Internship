"use client";
/* eslint-disable react-hooks/immutability -- three.js camera and lights are updated inside useFrame by design */

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { useMediaQuery } from "@/lib/useClient";
import { Hoverable } from "@/components/world/hover";
import { groundHeight, mat, signTex } from "./kit";
import { Clouds, FarHills, Ground, River, Road, Sky, Vegetation } from "./Terrain";
import { Crops, CollectionShed, FarmLife } from "./Fields";
import { Facility, Warehouse } from "./Facility";
import { DockTruck, Traffic } from "./Traffic";
import { Town } from "./Town";
import { BmcTerrace } from "./BmcTerrace";

/**
 * Module 3 world — "Value Chain Valley": a scroll-driven glide through a green valley on the edge of
 * Rajasthan that tells the business-model story as a place: supplier fields → logistics road and river
 * bridge → the kitchen & production facility (glass-walled kitchen, quality lab, packing line, loading
 * dock, solar roof) → warehouse & dispatch → the town of customers (homes, college + co-working, festive
 * market, office tower, quick-commerce dark store, review billboard). A giant Business Model Canvas lies
 * on the hillside like a terrace map with the chapter's blocks lit.
 *
 * 3.1 (bright late morning) travels from the canvas terrace through dispatch into the customer town.
 * 3.2 (early golden morning) travels fields → bridge → facility → warehouse and ends on the canvas.
 * Layout lives in ./kit.ts (road along x = 0, valley along -z). Wrap the chapter's World in <WorldShell>.
 */

export type Chapter3 = "3.1" | "3.2";
export type ValleyKit = {
  /** phone-size viewport: use fewer/smaller props */
  compact: boolean;
  /** prefers-reduced-motion: no idle animation */
  reduced: boolean;
  chapter: Chapter3;
  /** ground height of the valley at (x, z) — put props on the ground with it */
  ground: (x: number, z: number) => number;
};

/**
 * Optional external "drive" for previews: provide a ref holding 0..1 and the camera follows it instead
 * of the page scroll. Chapters don't use this.
 */
export const ValleyDrive = createContext<React.RefObject<number> | null>(null);

type Look = { top: string; horizon: string; low: string; fog: string; fogNear: number; fogFar: number; sun: string; sunI: number; sunDir: [number, number, number]; hemiSky: string; hemiGround: string; hemi: number; amb: number; cloud: string; hillNear: string; hillFar: string; exposure: number };

const LOOK: Record<Chapter3, Look> = {
  // bright late morning
  "3.1": { top: "#5B9FDA", horizon: "#D9ECF2", low: "#E4EEE6", fog: "#D6E7EA", fogNear: 45, fogFar: 175, sun: "#FFF3DE", sunI: 2.7, sunDir: [0.45, 0.85, 0.28], hemiSky: "#CFE6F7", hemiGround: "#7C6C4A", hemi: 0.95, amb: 0.18, cloud: "#FFFFFF", hillNear: "#9FB9A6", hillFar: "#BCD3D6", exposure: 1.0 },
  // early golden morning
  "3.2": { top: "#7FA2CC", horizon: "#FFD8A3", low: "#F6E1C2", fog: "#F0D9BA", fogNear: 35, fogFar: 150, sun: "#FFC37A", sunI: 2.6, sunDir: [0.62, 0.36, 0.7], hemiSky: "#F6D7B0", hemiGround: "#5E4F3A", hemi: 0.8, amb: 0.2, cloud: "#FFE9D2", hillNear: "#C7B79A", hillFar: "#E3CDAF", exposure: 1.02 },
};

type Key = { pos: [number, number, number]; look: [number, number, number] };

/** Camera journeys (evenly spaced keyframes along the page scroll). */
const JOURNEY: Record<Chapter3, Key[]> = {
  "3.1": [
    { pos: [7, 9, -60], look: [-26, 4.5, -66] }, // the canvas terrace: people-side blocks lit
    { pos: [4, 6.5, -68], look: [14, 1.5, -78] }, // dispatch: scooters leave the warehouse
    { pos: [1, 6.2, -80], look: [6, 1.5, -96] }, // into town: quick-commerce dark store
    { pos: [-1, 6.5, -92], look: [-24, 4.5, -106] }, // hillside homes: families
    { pos: [1, 5.5, -100], look: [14, 3.5, -112] }, // college + co-working: students, young pros
    { pos: [-1, 5, -114], look: [-8, 2, -130] }, // festive market: gift buyers
    { pos: [1, 6.5, -122], look: [16, 9, -136] }, // office tower: corporate buyers
    { pos: [0.5, 6, -132], look: [6.5, 6, -150] }, // review billboard: relationships
  ],
  "3.2": [
    { pos: [3, 8, 24], look: [4, 0.5, 2] }, // over the supplier fields
    { pos: [1.5, 6, 10], look: [14, 0.8, -4] }, // millet rows, farmers, tractor
    { pos: [-0.5, 5.5, -2], look: [-11, 1, -15] }, // collection centre + bullock cart
    { pos: [0.5, 6.5, -16], look: [2, 0.2, -34] }, // the road to the river bridge
    { pos: [-0.5, 8, -28], look: [20, 3, -50] }, // the facility: solar roof, glass kitchen
    { pos: [3.5, 4.2, -38], look: [22, 2.2, -50] }, // inside the glass: kettles + lab
    { pos: [2, 4.4, -50], look: [12, 2, -57] }, // packing line + loading dock
    { pos: [3, 5.5, -62], look: [14, 2, -76] }, // warehouse + dispatch
    { pos: [7, 9, -62], look: [-26, 4.5, -66] }, // the canvas terrace: partner-side blocks lit
  ],
};

/** A signpost with a board (for chapter scenes). Faces +z; rotate with `rotation`. */
export function Signpost({ text, position, rotation = 0, color = "#2F1C1A", fg = "#FED300", width = 3.2, height = 2.6, label }: { text: string; position: [number, number, number]; rotation?: number; color?: string; fg?: string; width?: number; height?: number; label?: string }) {
  const ch = text.includes("\n") ? 400 : 220;
  const tex = useMemo(() => signTex(text, color, fg, 1024, ch), [text, color, fg, ch]);
  useEffect(() => () => tex.dispose(), [tex]);
  const boardH = (width * ch) / 1024;
  const body = (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * width * 0.38, height / 2, -0.04]} material={mat("#5B3A28", 0.8)} castShadow>
          <cylinderGeometry args={[0.06, 0.07, height, 8]} />
        </mesh>
      ))}
      <mesh position={[0, height + boardH / 2 - 0.2, -0.02]} material={mat("#3A2618", 0.8)} castShadow>
        <boxGeometry args={[width + 0.14, boardH + 0.14, 0.06]} />
      </mesh>
      <mesh position={[0, height + boardH / 2 - 0.2, 0.015]}>
        <planeGeometry args={[width, boardH]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.2} roughness={0.7} />
      </mesh>
    </group>
  );
  return label ? <Hoverable label={label}>{body}</Hoverable> : body;
}

function CameraRig({ chapter, travel, compact, reduced, drive, sun, target }: { chapter: Chapter3; travel?: number; compact: boolean; reduced: boolean; drive: React.RefObject<number> | null; sun: React.RefObject<THREE.DirectionalLight | null>; target: THREE.Object3D }) {
  const { camera } = useThree();
  const curves = useMemo(() => {
    const keys = JOURNEY[chapter];
    return {
      pos: new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal"),
      look: new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.look)), false, "centripetal"),
    };
  }, [chapter]);
  const frac = useMemo(() => {
    if (!travel) return 1;
    return Math.min(1, Math.max(0.05, travel / curves.pos.getLength()));
  }, [travel, curves]);
  const prog = useRef<number | null>(null);
  const t = useRef(0);
  const P = useMemo(() => new THREE.Vector3(), []);
  const L = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(...LOOK[chapter].sunDir).normalize(), [chapter]);
  useFrame((_, dt) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = drive ? (drive.current ?? 0) : max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const goal = p * frac;
    prog.current = prog.current === null || reduced ? goal : THREE.MathUtils.damp(prog.current, goal, 2.6, dt);
    t.current += dt;
    curves.pos.getPoint(prog.current, P);
    curves.look.getPoint(prog.current, L);
    if (compact) {
      // portrait phones: sit a little further back and higher so side subjects stay in frame
      const back = P.clone().sub(L).setY(0).normalize();
      P.addScaledVector(back, 3).y += 1.2;
    }
    if (!reduced) {
      P.x += Math.sin(t.current * 0.18) * 0.35;
      P.y += Math.sin(t.current * 0.27) * 0.08;
    }
    P.y = Math.max(P.y, groundHeight(P.x, P.z) + 2);
    camera.position.copy(P);
    camera.lookAt(L);
    // the sun's shadow box follows what the camera looks at
    const mid = P.clone().lerp(L, 0.55);
    target.position.copy(mid);
    sun.current?.position.copy(mid).addScaledVector(dir, 80);
  });
  return null;
}

function ValleyScene({ chapter, travel, compact, reduced, scenes, drive }: { chapter: Chapter3; travel?: number; compact: boolean; reduced: boolean; scenes?: (kit: ValleyKit) => ReactNode; drive: React.RefObject<number> | null }) {
  const look = LOOK[chapter];
  const sun = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = look.exposure;
  }, [gl, look.exposure]);
  return (
    <>
      <color attach="background" args={[look.fog]} />
      <fog attach="fog" args={[look.fog, look.fogNear, look.fogFar]} />
      <Sky top={look.top} horizon={look.horizon} low={look.low} />
      <FarHills near={look.hillNear} far={look.hillFar} />
      <Clouds tint={look.cloud} compact={compact} />
      <hemisphereLight args={[look.hemiSky, look.hemiGround, look.hemi]} />
      <directionalLight
        ref={sun}
        target={target}
        color={look.sun}
        intensity={look.sunI}
        castShadow={!compact}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-near={10}
        shadow-camera-far={180}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <primitive object={target} />
      <ambientLight intensity={look.amb} color="#FFF4E6" />
      <CameraRig chapter={chapter} travel={travel} compact={compact} reduced={reduced} drive={drive} sun={sun} target={target} />

      <Ground compact={compact} />
      <River />
      <Road />
      <Vegetation compact={compact} />
      <Crops compact={compact} />
      <CollectionShed compact={compact} />
      <FarmLife compact={compact} reduced={reduced} />
      <Facility compact={compact} reduced={reduced} />
      <Warehouse compact={compact} />
      <DockTruck />
      <Traffic compact={compact} reduced={reduced} />
      <BmcTerrace chapter={chapter} />
      <Town compact={compact} reduced={reduced} />
      {scenes?.({ compact, reduced, chapter, ground: groundHeight })}
    </>
  );
}

export default function ValleyWorld({ chapter, scenes, travel }: { chapter: Chapter3; scenes?: (kit: ValleyKit) => ReactNode; travel?: number }) {
  const reduced = !!useReducedMotion();
  const compact = useMediaQuery("(max-width: 767px)");
  const [dpr, setDpr] = useState(1.5);
  const drive = useContext(ValleyDrive);
  return (
    <Canvas
      shadows={compact ? false : "percentage"}
      dpr={[1, compact ? Math.min(dpr, 1.25) : dpr]}
      camera={{ position: [3, 8, 24], fov: compact ? 60 : 48, near: 0.2, far: 330 }}
      gl={{ antialias: !compact, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <ValleyScene chapter={chapter} travel={travel} compact={compact} reduced={reduced} scenes={scenes} drive={drive} />
    </Canvas>
  );
}
