"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { useMediaQuery } from "@/lib/useClient";
import { makeBowl, makeKatori } from "@/features/packaging/three/geometry";
import { Hall, TABLE_HALF } from "./Hall";
import { makeWoodTexture } from "./props";

/**
 * Shared chapter world: the long table in the dining hall. The camera travels down the table
 * as the student scrolls (scroll progress × travel units). Each chapter passes its own `scenes`.
 */

const FOG = "#F9DCC4";

export type WorldKit = {
  katori: THREE.BufferGeometry;
  bowl: THREE.BufferGeometry;
  small: THREE.BufferGeometry;
  mats: { table: THREE.Material; brass: THREE.Material; ceramic: THREE.Material; board: THREE.Material; runner: THREE.Material };
  compact: boolean;
  reduced: boolean;
};

/* ── the scene ────────────────────────────────────────────────── */

function TableScene({ reduced, compact, travel, scenes }: { reduced: boolean; compact: boolean; travel: number; scenes: (kit: WorldKit) => ReactNode }) {
  const { camera } = useThree();
  const wood = useMemo(() => makeWoodTexture(), []);
  const mats = useMemo(
    () => ({
      table: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.72 }),
      brass: new THREE.MeshStandardMaterial({ color: "#C8963E", metalness: 1, roughness: 0.25 }),
      ceramic: new THREE.MeshStandardMaterial({ color: "#F4EEE6", roughness: 0.5 }),
      board: new THREE.MeshStandardMaterial({ color: "#8A5A36", roughness: 0.7 }),
      runner: new THREE.MeshStandardMaterial({ color: "#E9773A", roughness: 0.95 }),
    }),
    [wood],
  );
  const katori = useMemo(() => makeKatori(0.62, 0.32), []);
  const bowl = useMemo(() => makeBowl(0.74, 0.38), []);
  const small = useMemo(() => makeBowl(0.54, 0.27), []);
  useEffect(() => () => {
    wood.dispose();
    Object.values(mats).forEach((m) => m.dispose());
    katori.dispose();
    bowl.dispose();
    small.dispose();
  }, [wood, mats, katori, bowl, small]);


  const key = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const z = useRef(0);
  const t = useRef(0);
  useFrame((_, dt) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const goal = 2 - p * travel;
    z.current = reduced ? goal : THREE.MathUtils.damp(z.current, goal, 3.2, dt);
    t.current += dt;
    const sway = reduced ? 0 : Math.sin(t.current * 0.22) * 0.35;
    const lift = reduced ? 0 : Math.sin(t.current * 0.31) * 0.08;
    const x = compact ? 0.4 : 1.1;
    camera.position.set(x + sway, 1.75 + lift, z.current + 5.2);
    camera.lookAt(x * 0.55 + sway * 0.4, 0.45, z.current - 2.4);
    // shadow-casting key light travels with the camera
    if (key.current) {
      key.current.position.set(-3, 6, z.current + 3);
      target.position.set(0, 0, z.current - 1);
    }
  });

  return (
    <>
      <color attach="background" args={[FOG]} />
      <fog attach="fog" args={[FOG, 8, 30]} />
      <hemisphereLight args={["#FFF4E6", "#7A4A2C", 0.75]} />
      <directionalLight
        ref={key}
        target={target}
        intensity={2.3}
        color="#FFF0DC"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
      />
      <primitive object={target} />
      <Environment resolution={128} frames={1}>
        <color attach="background" args={["#3a2418"]} />
        <Lightformer form="rect" intensity={3} color="#FFF4E6" position={[-3, 3, 3]} scale={[4, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} color="#FFE2C4" position={[4, 1.5, 2]} scale={[1.5, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2} position={[0, 5, 0]} scale={[6, 6, 1]} rotation-x={Math.PI / 2} />
      </Environment>

      {/* the long kitchen table + an orange runner down its centre */}
      <Hall compact={compact} />
      <mesh material={mats.table} position={[0, 0.001, -30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[TABLE_HALF * 2, 76]} />
      </mesh>
      <mesh material={mats.runner} position={[0, 0.004, -30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.85, 76]} />
      </mesh>

      {scenes({ katori, bowl, small, mats, compact, reduced })}
    </>
  );
}

export default function TableWorld({ scenes, travel = 58 }: { scenes: (kit: WorldKit) => ReactNode; travel?: number }) {
  const reduced = !!useReducedMotion();
  const [dpr, setDpr] = useState(1.5);
  const compact = useMediaQuery("(max-width: 767px)");

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, compact ? Math.min(dpr, 1.25) : dpr]}
      camera={{ position: [1, 3.1, 8], fov: 40, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.04;
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <TableScene reduced={reduced} compact={compact} travel={travel} scenes={scenes} />
    </Canvas>
  );
}
