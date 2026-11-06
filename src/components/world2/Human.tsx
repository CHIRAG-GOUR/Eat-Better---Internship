"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Realistic-proportion people for the Module 2 street (Brand Boulevard): adult proportions (~1.7 m, small head),
 * a modelled face (eye whites + irises, lash line, brows, nose bridge + tip, ears, two lips, chin), real hairstyles,
 * Indian everyday clothing (shirt, T-shirt, kurta, salwar suit with dupatta, saree with pallu, hoodie) and
 * jointed limbs (hips, knees, shoulders, elbows) so walking and riding look natural.
 * Faces +z, feet at y = 0. Geometries and materials are shared to keep draw cost low.
 */

export type HumanLook = {
  skin: string;
  hair: string;
  hairStyle: "short" | "side" | "curly" | "long" | "bun" | "braid" | "bald";
  outfit: "shirt" | "tshirt" | "kurta" | "salwar" | "saree" | "hoodie";
  top: string;
  bottom: string;
  /** collar / dupatta / pallu / print colour */
  accent?: string;
  shoe?: string;
  facial?: "beard" | "moustache" | "stubble";
  bindi?: boolean;
  glasses?: string;
  bag?: { kind: "backpack" | "sling" | "shoulder"; color: string };
  /** open-face helmet colour (riders) */
  helmet?: string;
  /** body scale, 1 ≈ 1.7 m */
  height?: number;
  /** slimmer, narrower shoulders */
  slim?: boolean;
};

export type HumanMode = "walk" | "ride" | "drive" | "stand";

/* ── shared resources ─────────────────────────────────────────── */

const M = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: string, roughness = 0.75, metalness = 0, opacity = 1) {
  const k = `${color}|${roughness}|${metalness}|${opacity}`;
  let m = M.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness, metalness, transparent: opacity < 1, opacity });
    M.set(k, m);
  }
  return m;
}

let G: ReturnType<typeof makeGeos> | null = null;
function makeGeos() {
  return {
    thigh: new THREE.CapsuleGeometry(0.068, 0.32, 4, 12),
    shin: new THREE.CapsuleGeometry(0.054, 0.34, 4, 12),
    shoe: new THREE.BoxGeometry(0.1, 0.07, 0.25),
    pelvis: new THREE.SphereGeometry(1, 18, 12),
    torso: new THREE.CylinderGeometry(0.175, 0.15, 0.46, 18),
    shoulder: new THREE.CapsuleGeometry(0.07, 0.22, 4, 12),
    upper: new THREE.CapsuleGeometry(0.05, 0.2, 4, 10),
    fore: new THREE.CapsuleGeometry(0.042, 0.19, 4, 10),
    hand: new THREE.SphereGeometry(1, 12, 10),
    neck: new THREE.CylinderGeometry(0.045, 0.05, 0.1, 12),
    head: new THREE.SphereGeometry(0.105, 28, 22),
    jaw: new THREE.SphereGeometry(0.078, 20, 14),
    ear: new THREE.SphereGeometry(0.03, 10, 8),
    eyeWhite: new THREE.SphereGeometry(0.0155, 12, 10),
    iris: new THREE.SphereGeometry(0.0098, 10, 8),
    lash: new THREE.BoxGeometry(0.028, 0.0032, 0.004),
    brow: new THREE.BoxGeometry(0.036, 0.0085, 0.008),
    noseBridge: new THREE.BoxGeometry(0.013, 0.046, 0.018),
    noseTip: new THREE.SphereGeometry(0.0165, 12, 10),
    lip: new THREE.CapsuleGeometry(0.0085, 0.028, 3, 8),
    moustache: new THREE.CapsuleGeometry(0.009, 0.042, 3, 8),
    beard: new THREE.SphereGeometry(0.08, 22, 12, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58),
    hairCap: new THREE.SphereGeometry(0.111, 26, 14, 0, Math.PI * 2, 0, Math.PI * 0.37),
    hairBack: new THREE.SphereGeometry(0.112, 22, 14, Math.PI, Math.PI, 0, Math.PI * 0.64),
    hairRing: new THREE.SphereGeometry(0.111, 22, 8, Math.PI * 0.85, Math.PI * 1.3, Math.PI * 0.34, Math.PI * 0.24),
    bump: new THREE.SphereGeometry(0.038, 10, 8),
    bun: new THREE.SphereGeometry(0.045, 14, 10),
    braid: new THREE.SphereGeometry(0.03, 10, 8),
    longHair: new THREE.BoxGeometry(0.2, 0.34, 0.05),
    helmet: new THREE.SphereGeometry(0.135, 26, 16, 0, Math.PI * 2, 0, Math.PI * 0.56),
    visor: new THREE.SphereGeometry(0.14, 22, 8, Math.PI * 0.2, Math.PI * 0.6, Math.PI * 0.34, Math.PI * 0.14),
    lens: new THREE.TorusGeometry(0.021, 0.0032, 6, 18),
    bindi: new THREE.SphereGeometry(0.0055, 8, 6),
    tunic: new THREE.CylinderGeometry(0.18, 0.25, 0.86, 18, 1, true),
    skirt: new THREE.CylinderGeometry(0.17, 0.3, 0.88, 20),
    collar: new THREE.TorusGeometry(0.06, 0.016, 6, 18),
    band: new THREE.BoxGeometry(0.15, 0.95, 0.02),
    pack: new THREE.BoxGeometry(0.3, 0.4, 0.14),
    strap: new THREE.BoxGeometry(0.035, 0.62, 0.012),
    bag: new THREE.BoxGeometry(0.2, 0.17, 0.08),
    hood: new THREE.SphereGeometry(0.11, 14, 10),
  };
}
const geos = () => (G ??= makeGeos());

const darken = (hex: string, k: number) => {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return `#${c.getHexString()}`;
};

/* ── the person ───────────────────────────────────────────────── */

export function Human({ look, mode = "walk", speed = 1, phase = 0, lean }: { look: HumanLook; mode?: HumanMode; speed?: number; phase?: number; lean?: number }) {
  const g = geos();
  const root = useRef<THREE.Group>(null);
  const upper = useRef<THREE.Group>(null);
  const headG = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const shL = useRef<THREE.Group>(null);
  const shR = useRef<THREE.Group>(null);
  const elL = useRef<THREE.Group>(null);
  const elR = useRef<THREE.Group>(null);

  const seated = mode === "ride" || mode === "drive";
  const bodyLean = lean ?? (mode === "ride" ? 0.3 : mode === "drive" ? 0.18 : 0.04);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed * 5.6 + phase;
    if (seated) {
      const reach = mode === "ride" ? -0.86 : -0.7;
      hipL.current?.rotation.set(-1.42, 0, 0.06);
      hipR.current?.rotation.set(-1.42, 0, -0.06);
      kneeL.current?.rotation.set(1.42, 0, 0);
      kneeR.current?.rotation.set(1.42, 0, 0);
      shL.current?.rotation.set(reach, 0, -0.14);
      shR.current?.rotation.set(reach, 0, 0.14);
      elL.current?.rotation.set(mode === "ride" ? -0.12 : -0.7, 0, 0);
      elR.current?.rotation.set(mode === "ride" ? -0.12 : -0.7, 0, 0);
      if (upper.current) upper.current.rotation.x = bodyLean + Math.sin(clock.elapsedTime * 2.1 + phase) * 0.01;
      if (headG.current) headG.current.rotation.set(-bodyLean * 0.8, Math.sin(clock.elapsedTime * 0.5 + phase) * 0.12, 0);
      return;
    }
    const w = mode === "walk" ? 1 : 0;
    const s = Math.sin(t);
    const c = Math.cos(t);
    // legs: negative x-rotation swings the foot forward; knees bend while the leg swings through
    hipL.current?.rotation.set(-s * 0.42 * w, 0, 0.02);
    hipR.current?.rotation.set(s * 0.42 * w, 0, -0.02);
    kneeL.current?.rotation.set((0.08 + Math.max(0, c) * 0.72) * w, 0, 0);
    kneeR.current?.rotation.set((0.08 + Math.max(0, -c) * 0.72) * w, 0, 0);
    // arms swing opposite the legs, with a soft elbow bend
    shL.current?.rotation.set(s * 0.34 * w, 0, -0.07);
    shR.current?.rotation.set(-s * 0.34 * w, 0, 0.07);
    elL.current?.rotation.set(-0.18 - Math.max(0, -s) * 0.35 * w, 0, 0);
    elR.current?.rotation.set(-0.18 - Math.max(0, s) * 0.35 * w, 0, 0);
    if (root.current) {
      root.current.position.y = Math.abs(c) * 0.028 * w;
      root.current.rotation.z = s * 0.02 * w;
    }
    if (upper.current) upper.current.rotation.set(bodyLean, -s * 0.06 * w, 0);
    if (headG.current) headG.current.rotation.set(-bodyLean * 0.6, s * 0.05 * w, 0);
  });

  const L = look;
  const skin = mat(L.skin, 0.55);
  const skinShade = mat(darken(L.skin, 0.82), 0.6);
  const hair = mat(L.hair, 0.88);
  const top = mat(L.top, 0.8);
  const bottom = mat(L.bottom, 0.82);
  const accent = mat(L.accent ?? "#F4EFE9", 0.8);
  const shoe = mat(L.shoe ?? "#2A1E18", 0.55);
  const lipM = mat(darken(L.skin, 0.62), 0.45);
  const lipZ = L.facial === "beard" || L.facial === "stubble" ? 0.104 : 0.094;
  const stubble = `#${new THREE.Color(L.skin).lerp(new THREE.Color(L.hair), 0.45).getHexString()}`;
  const longSleeve = L.outfit !== "tshirt" && L.outfit !== "saree";
  const legColor = L.outfit === "saree" ? mat(darken(L.top, 0.8)) : bottom;
  const sw = L.slim ? 0.9 : 1;

  const face = useMemo(
    () => (
      <>
        {/* skull + chin + ears */}
        <mesh geometry={g.head} material={skin} scale={[0.92, 1.1, 1]} castShadow />
        <mesh geometry={g.jaw} material={skin} position={[0, -0.074, 0.022]} scale={[0.74, 0.7, 0.85]} />
        {[-1, 1].map((x) => (
          <mesh key={x} geometry={g.ear} material={skinShade} position={[x * 0.096, -0.004, -0.008]} scale={[0.42, 1, 0.72]} />
        ))}
        {/* eyes */}
        {[-1, 1].map((x) => (
          <group key={x} position={[x * 0.036, 0.016, 0.084]}>
            <mesh geometry={g.eyeWhite} material={mat("#F2ECE6", 0.35)} scale={[1, 0.72, 0.6]} />
            <mesh geometry={g.iris} material={mat("#2B1810", 0.25)} position={[0, -0.001, 0.0085]} scale={[1, 1, 0.5]} />
            <mesh geometry={g.lash} material={mat("#160D08", 0.6)} position={[0, 0.0105, 0.011]} rotation={[0, 0, x * -0.08]} />
            <mesh geometry={g.brow} material={L.hairStyle === "bald" ? hair : mat(darken(L.hair, 0.9), 0.9)} position={[x * 0.002, 0.03, 0.012]} rotation={[0.1, 0, x * -0.1]} />
          </group>
        ))}
        {/* nose */}
        <mesh geometry={g.noseBridge} material={skinShade} position={[0, -0.008, 0.096]} rotation={[-0.3, 0, 0]} />
        <mesh geometry={g.noseTip} material={skin} position={[0, -0.03, 0.108]} scale={[1.15, 0.9, 1]} />
        {/* lips */}
        <mesh geometry={g.lip} material={lipM} position={[0, -0.056, lipZ]} rotation={[0, 0, Math.PI / 2]} scale={[0.85, 1, 0.8]} />
        <mesh geometry={g.lip} material={lipM} position={[0, -0.066, lipZ - 0.002]} rotation={[0, 0, Math.PI / 2]} scale={[1, 0.92, 0.85]} />
        {L.facial === "moustache" && <mesh geometry={g.moustache} material={hair} position={[0, -0.046, 0.1]} rotation={[0, 0, Math.PI / 2]} />}
        {L.facial === "beard" && (
          <>
            <mesh geometry={g.beard} material={hair} position={[0, -0.058, 0.02]} scale={[0.98, 0.95, 1.02]} />
            <mesh geometry={g.moustache} material={hair} position={[0, -0.046, 0.1]} rotation={[0, 0, Math.PI / 2]} />
          </>
        )}
        {L.facial === "stubble" && <mesh geometry={g.beard} material={mat(stubble, 0.9)} position={[0, -0.058, 0.019]} scale={[0.96, 0.93, 1.0]} />}
        {L.bindi && <mesh geometry={g.bindi} material={mat("#B3122E", 0.4)} position={[0, 0.052, 0.098]} />}
        {L.glasses &&
          [-1, 1].map((x) => (
            <mesh key={x} geometry={g.lens} material={mat(L.glasses!, 0.35, 0.5)} position={[x * 0.036, 0.016, 0.104]} />
          ))}
        {/* hair or helmet */}
        {L.helmet ? (
          <>
            <mesh geometry={g.helmet} material={mat(L.helmet, 0.3, 0.2)} position={[0, 0.012, -0.006]} scale={[0.96, 1.04, 1.06]} castShadow />
            <mesh geometry={g.visor} material={mat("#1E2A33", 0.1, 0.6, 0.55)} position={[0, 0.012, 0.0]} rotation={[0, -Math.PI / 2, 0]} />
          </>
        ) : (
          <Hair look={L} hair={hair} />
        )}
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [L],
  );

  return (
    <group scale={L.height ?? 1}>
      <group ref={root}>
        {/* legs (hip joints at y 0.9) */}
        {[
          [-0.088, hipL, kneeL],
          [0.088, hipR, kneeR],
        ].map(([x, hip, knee]) => (
          <group key={x as number} ref={hip as React.RefObject<THREE.Group>} position={[x as number, 0.9, 0]}>
            <mesh geometry={g.thigh} material={legColor} position={[0, -0.22, 0]} castShadow />
            <group ref={knee as React.RefObject<THREE.Group>} position={[0, -0.44, 0]}>
              <mesh geometry={g.shin} material={legColor} position={[0, -0.21, 0]} castShadow />
              <mesh geometry={g.shoe} material={shoe} position={[0, -0.43, 0.045]} castShadow />
            </group>
          </group>
        ))}
        <mesh geometry={g.pelvis} material={L.outfit === "saree" ? top : bottom} position={[0, 0.93, 0]} scale={[0.17 * sw, 0.11, 0.115]} />
        {L.outfit === "saree" && !seated && <mesh geometry={g.skirt} material={top} position={[0, 0.5, 0]} castShadow />}

        {/* upper body pivots at the waist */}
        <group ref={upper} position={[0, 0.95, 0]}>
          <mesh geometry={g.torso} material={L.outfit === "saree" ? accent : top} position={[0, 0.24, 0]} scale={[sw, 1, 0.64]} castShadow />
          <mesh geometry={g.shoulder} material={L.outfit === "saree" ? accent : top} position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.95, sw, 0.9]} />
          {(L.outfit === "kurta" || L.outfit === "salwar") && <mesh geometry={g.tunic} material={top} position={[0, -0.12, 0]} scale={[sw, seated ? 0.55 : 1, 0.72]} />}
          {L.outfit === "shirt" && (
            <>
              <mesh geometry={g.collar} material={accent} position={[0, 0.46, 0.012]} rotation={[Math.PI / 2 - 0.25, 0, 0]} scale={[1, 1.15, 1]} />
              <mesh geometry={g.strap} material={accent} position={[0, 0.25, 0.103]} scale={[0.35, 0.68, 1]} />
            </>
          )}
          {L.outfit === "hoodie" && <mesh geometry={g.hood} material={top} position={[0, 0.46, -0.1]} scale={[1.05, 0.7, 0.7]} />}
          {L.outfit === "salwar" && (
            <>
              <mesh geometry={g.band} material={accent} position={[0.085, 0.24, 0.1]} rotation={[0.06, 0, 0.32]} scale={[0.85, 0.42, 1]} />
              <mesh geometry={g.band} material={accent} position={[-0.085, 0.24, 0.1]} rotation={[0.06, 0, -0.32]} scale={[0.85, 0.42, 1]} />
              <mesh geometry={g.band} material={accent} position={[0, 0.2, -0.1]} scale={[1.6, 0.45, 1]} />
            </>
          )}
          {L.outfit === "saree" && (
            <>
              {/* pallu: from the waist, across the chest, over the left shoulder and down the back */}
              <mesh geometry={g.band} material={top} position={[-0.03, 0.22, 0.11]} rotation={[0.05, 0, -0.42]} scale={[1.25, 0.62, 1]} />
              <mesh geometry={g.band} material={top} position={[-0.12, 0.08, -0.11]} scale={[1.2, 0.9, 1]} />
              <mesh geometry={g.torso} material={skinShade} position={[0, 0.06, 0]} scale={[0.95, 0.18, 0.6]} />
            </>
          )}
          {L.bag?.kind === "backpack" && <mesh geometry={g.pack} material={mat(L.bag.color, 0.8)} position={[0, 0.27, -0.16]} castShadow />}
          {(L.bag?.kind === "sling" || L.bag?.kind === "shoulder") && (
            <>
              <mesh geometry={g.strap} material={mat(darken(L.bag.color, 0.7), 0.7)} position={[0.0, 0.22, 0.106]} rotation={[0, 0, L.bag.kind === "sling" ? 0.62 : -0.55]} scale={[0.6, 1, 1]} />
              <mesh geometry={g.bag} material={mat(L.bag.color, 0.6)} position={[L.bag.kind === "sling" ? -0.17 : -0.2, 0.0, 0.03]} castShadow />
            </>
          )}

          {/* arms (shoulders at y 0.43 above the waist) */}
          {[
            [-0.215 * sw, shL, elL],
            [0.215 * sw, shR, elR],
          ].map(([x, sh, el]) => (
            <group key={x as number} ref={sh as React.RefObject<THREE.Group>} position={[x as number, 0.43, 0]}>
              <mesh geometry={g.upper} material={L.outfit === "saree" ? accent : top} position={[0, -0.15, 0]} castShadow />
              <group ref={el as React.RefObject<THREE.Group>} position={[0, -0.3, 0]}>
                <mesh geometry={g.fore} material={longSleeve ? top : skin} position={[0, -0.13, 0]} castShadow />
                <mesh geometry={g.hand} material={skin} position={[0, -0.28, 0.008]} scale={[0.036, 0.062, 0.026]} />
              </group>
            </group>
          ))}

          {/* neck + head */}
          <mesh geometry={g.neck} material={skin} position={[0, 0.5, 0]} />
          <group ref={headG} position={[0, 0.645, 0.008]}>
            {face}
          </group>
        </group>
      </group>
    </group>
  );
}

function Hair({ look, hair }: { look: HumanLook; hair: THREE.Material }) {
  const g = geos();
  const s = look.hairStyle;
  if (s === "bald")
    return <mesh geometry={g.hairRing} material={hair} position={[0, 0.006, -0.004]} scale={[0.95, 1.08, 1.04]} />;
  return (
    <group>
      <mesh geometry={g.hairCap} material={hair} position={[0, 0.012, -0.006]} scale={[0.95, 1.07, 1.03]} castShadow />
      <mesh geometry={g.hairBack} material={hair} position={[0, 0.004, -0.01]} scale={[0.95, 1.07, 1.03]} />
      {s === "side" && <mesh geometry={g.bump} material={hair} position={[0.045, 0.085, 0.06]} scale={[1.4, 0.55, 0.8]} />}
      {s === "curly" &&
        [
          [-0.06, 0.08, 0.04],
          [0.0, 0.1, 0.05],
          [0.06, 0.08, 0.04],
          [-0.08, 0.05, -0.04],
          [0.08, 0.05, -0.04],
          [0, 0.08, -0.07],
        ].map((p, i) => <mesh key={i} geometry={g.bump} material={hair} position={p as [number, number, number]} />)}
      {s === "long" && (
        <>
          <mesh geometry={g.longHair} material={hair} position={[0, -0.16, -0.075]} />
          {[-1, 1].map((x) => (
            <mesh key={x} geometry={g.longHair} material={hair} position={[x * 0.088, -0.11, -0.04]} scale={[0.14, 0.7, 0.8]} />
          ))}
        </>
      )}
      {s === "bun" && <mesh geometry={g.bun} material={hair} position={[0, 0.0, -0.118]} />}
      {s === "braid" &&
        [0, 1, 2, 3, 4, 5].map((k) => <mesh key={k} geometry={g.braid} material={hair} position={[0, -0.07 - k * 0.055, -0.105 - (k < 2 ? 0 : 0.012)]} scale={1 - k * 0.07} />)}
    </group>
  );
}
