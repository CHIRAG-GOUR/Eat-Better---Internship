"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor, RoundedBox } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { useMediaQuery } from "@/lib/useClient";
import { BhujiaPile, Laddoos, NutPile } from "@/features/packaging/three/StudioSet";
import { makeBowl, makeKatori } from "@/features/packaging/three/geometry";

/**
 * One persistent 3D world behind the whole chapter: a long Jaipur kitchen table.
 * The camera travels along it as the student scrolls, passing a scene for each part of
 * the chapter — family kitchen → ingredients → delivery boxes → the four categories →
 * festive gifting → a final katori of laddoos. One Canvas, mounted once.
 */

const TRAVEL = 58; // world units travelled from top to bottom of the page
const FOG = "#F9DCC4";

/* ── materials & textures (created once) ──────────────────────── */

function makeWoodTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#C79A70";
  g.fillRect(0, 0, 512, 512);
  let s = 42;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let plank = 0; plank < 4; plank++) {
    const x0 = plank * 128;
    g.fillStyle = `rgba(${120 + rnd() * 30},${78 + rnd() * 20},${45 + rnd() * 15},0.25)`;
    g.fillRect(x0, 0, 128, 512);
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = `rgba(90,55,30,${0.05 + rnd() * 0.12})`;
      g.lineWidth = 0.6 + rnd() * 1.6;
      const x = x0 + rnd() * 128;
      g.beginPath();
      g.moveTo(x, 0);
      g.bezierCurveTo(x + rnd() * 10 - 5, 170, x + rnd() * 10 - 5, 340, x + rnd() * 6 - 3, 512);
      g.stroke();
    }
    g.fillStyle = "rgba(60,35,20,0.35)";
    g.fillRect(x0, 0, 2, 512);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 22);
  t.anisotropy = 8;
  return t;
}

/* ── props ────────────────────────────────────────────────────── */

function Scatter({ count, area, kind, seed = 1 }: { count: number; area: [number, number, number, number]; kind: "almond" | "date" | "hazelnut" | "seed"; seed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geo, mat } = useMemo(() => {
    let g: THREE.BufferGeometry;
    let m: THREE.Material;
    if (kind === "almond") {
      g = new THREE.SphereGeometry(0.06, 12, 8);
      g.scale(1.5, 0.45, 0.9);
      m = new THREE.MeshStandardMaterial({ color: "#A8673A", roughness: 0.6 });
    } else if (kind === "date") {
      g = new THREE.SphereGeometry(0.065, 14, 10);
      g.scale(1.7, 0.75, 0.8);
      m = new THREE.MeshPhysicalMaterial({ color: "#4A1E10", roughness: 0.35, clearcoat: 0.6 });
    } else if (kind === "hazelnut") {
      g = new THREE.SphereGeometry(0.06, 12, 10);
      g.scale(1, 1.1, 1);
      m = new THREE.MeshStandardMaterial({ color: "#8F5326", roughness: 0.5 });
    } else {
      g = new THREE.SphereGeometry(0.022, 6, 5);
      g.scale(1.6, 0.6, 1);
      m = new THREE.MeshStandardMaterial({ color: "#EADBC0", roughness: 0.8 });
    }
    return { geo: g, mat: m };
  }, [kind]);
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const o = new THREE.Object3D();
    const [x0, x1, z0, z1] = area;
    for (let i = 0; i < count; i++) {
      o.position.set(x0 + rnd() * (x1 - x0), kind === "seed" ? 0.012 : 0.03, z0 + rnd() * (z1 - z0));
      o.rotation.set(0, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.3);
      o.scale.setScalar(0.85 + rnd() * 0.3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, area, kind, seed]);
  return <instancedMesh ref={ref} args={[geo, mat, count]} castShadow receiveShadow />;
}

function MailerBox({ size = [0.9, 0.42, 0.65], color = "#FF5C00" }: { size?: [number, number, number]; color?: string }) {
  const [w, h, d] = size;
  return (
    <group>
      <RoundedBox args={[w, h, d]} radius={0.02} position={[0, h / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.6} />
      </RoundedBox>
      {/* paper tape */}
      <mesh position={[0, h + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.98, 0.09]} />
        <meshStandardMaterial color="#E9D3B4" roughness={0.9} />
      </mesh>
    </group>
  );
}

function GiftBox({ color = "#FF5C00", lid = "#E8540A", s = 1 }: { color?: string; lid?: string; s?: number }) {
  return (
    <group scale={s}>
      <RoundedBox args={[0.7, 0.42, 0.7]} radius={0.02} position={[0, 0.21, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[0.74, 0.1, 0.74]} radius={0.02} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color={lid} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.745, 0.52, 0.07]} />
        <meshStandardMaterial color="#C8963E" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.07, 0.52, 0.745]} />
        <meshStandardMaterial color="#C8963E" metalness={0.6} roughness={0.35} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.09, 0.53, 0]} rotation={[Math.PI / 2, k * 0.5, 0]}>
          <torusGeometry args={[0.08, 0.022, 10, 24]} />
          <meshStandardMaterial color="#C8963E" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Marigold({ s = 1 }: { s?: number }) {
  const petals = useMemo(() => Array.from({ length: 26 }, (_, i) => i), []);
  return (
    <group scale={s}>
      {petals.map((i) => {
        const ring = i < 14 ? 0 : 1;
        const n = ring ? 12 : 14;
        const a = ((i % n) / n) * Math.PI * 2 + ring * 0.3;
        const r = ring ? 0.06 : 0.1;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.06 + ring * 0.04, Math.sin(a) * r]} rotation={[0.6 * (ring ? 0.6 : 1), -a, 0]}>
            <sphereGeometry args={[0.055, 8, 6]} />
            <meshStandardMaterial color={ring ? "#FF9A12" : "#F57C00"} roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

function Diya({ flicker }: { flicker: boolean }) {
  const flame = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => makeBowl(0.16, 0.08), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(({ clock }) => {
    if (!flame.current || !flicker) return;
    const t = clock.elapsedTime;
    flame.current.scale.set(1 + Math.sin(t * 13) * 0.06, 1 + Math.sin(t * 9.3) * 0.12, 1);
  });
  return (
    <group>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color="#B5652F" roughness={0.6} />
      </mesh>
      <mesh ref={flame} position={[0.05, 0.13, 0]}>
        <coneGeometry args={[0.03, 0.11, 12]} />
        <meshStandardMaterial color="#FFC14D" emissive="#FF8A00" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[0.05, 0.2, 0]} color="#FFB04A" intensity={0.9} distance={2.2} />
    </group>
  );
}

function Mint({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.06, 0.05, 0.12, 0.1, 0.2, 0);
    s.bezierCurveTo(0.12, -0.1, 0.06, -0.05, 0, 0);
    const g = new THREE.ShapeGeometry(s, 10);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={position} rotation={[0, rotation, 0]} castShadow>
      <meshStandardMaterial color="#3E8F3A" roughness={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── the scene ────────────────────────────────────────────────── */

function Scene({ reduced, compact }: { reduced: boolean; compact: boolean }) {
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
    const goal = 2 - p * TRAVEL;
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
      <fog attach="fog" args={[FOG, 6, 19]} />
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
      <mesh material={mats.table} position={[0, -0.02, -28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 90]} />
      </mesh>
      <mesh material={mats.runner} position={[0, 0.001, -28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.85, 90]} />
      </mesh>

      {/* 1 · the family kitchen (opening + company at a glance) */}
      <group position={[0, 0, 0]}>
        <RoundedBox args={[2.2, 0.06, 1.3]} radius={0.03} position={[3.1, 0.03, -0.4]} rotation={[0, 0.15, 0]} material={mats.board} castShadow receiveShadow />
        <group position={[3.2, 0.06, -0.5]}>
          <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
          <Laddoos count={12} spread={0.34} height={0.36} />
        </group>
        <Scatter kind="date" count={6} area={[2.2, 4.2, 0.1, 0.8]} seed={2} />
        <group position={[-3.4, 0, -2]}>
          <mesh geometry={bowl} material={mats.ceramic} castShadow receiveShadow />
          <BhujiaPile count={compact ? 260 : 420} spread={0.54} height={0.27} />
        </group>
        <Mint position={[4.3, 0.02, 0.6]} rotation={0.6} />
        <Mint position={[4.5, 0.02, 0.4]} rotation={2.1} />
      </group>

      {/* 2 · ingredients — what goes in (what is Eat Better / story) */}
      <group>
        <Scatter kind="almond" count={compact ? 18 : 34} area={[-5, -2, -16, -10]} seed={3} />
        <Scatter kind="hazelnut" count={compact ? 14 : 26} area={[2.2, 5, -17, -11]} seed={4} />
        <Scatter kind="seed" count={compact ? 60 : 140} area={[-1.6, 1.6, -18, -9]} seed={5} />
        <group position={[3.8, 0, -14]}>
          <mesh geometry={small} material={mats.ceramic} castShadow receiveShadow />
          <NutPile count={70} spread={0.4} height={0.2} />
        </group>
        <group position={[-3.6, 0, -19.5]}>
          <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
          <Laddoos count={10} spread={0.32} height={0.36} seed={6} />
        </group>
      </group>

      {/* 3 · direct to the customer — stacked delivery boxes (D2C) */}
      <group>
        <group position={[-3.8, 0, -27]} rotation={[0, 0.3, 0]}>
          <MailerBox />
          <group position={[0.05, 0.42, 0]} rotation={[0, -0.2, 0]}>
            <MailerBox size={[0.8, 0.36, 0.6]} color="#E8540A" />
          </group>
          <group position={[0, 0.78, 0.02]} rotation={[0, 0.25, 0]}>
            <MailerBox size={[0.6, 0.3, 0.5]} color="#FF7A2A" />
          </group>
        </group>
        <group position={[3.9, 0, -29.5]} rotation={[0, -0.5, 0]}>
          <MailerBox size={[1, 0.46, 0.7]} color="#E9D3B4" />
          <group position={[0.9, 0, 0.4]} rotation={[0, 0.6, 0]}>
            <MailerBox size={[0.7, 0.34, 0.5]} />
          </group>
        </group>
      </group>

      {/* 4 · the four categories, side by side */}
      <group position={[0, 0, -38]}>
        <group position={[-4.4, 0.06, 0]}>
          <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
          <Laddoos count={11} spread={0.33} height={0.36} seed={8} />
        </group>
        <group position={[-2.6, 0, -1.2]}>
          <mesh geometry={bowl} material={mats.ceramic} castShadow receiveShadow />
          <BhujiaPile count={compact ? 220 : 360} spread={0.52} height={0.27} />
        </group>
        <group position={[2.8, 0, -0.9]}>
          <mesh geometry={small} material={mats.ceramic} castShadow receiveShadow />
          <NutPile count={70} spread={0.38} height={0.2} />
        </group>
        <group position={[4.5, 0, 0.2]} rotation={[0, -0.4, 0]}>
          <GiftBox />
        </group>
      </group>

      {/* 5 · festive gifting (takeaway + think & discuss) */}
      <group position={[0, 0, -48]}>
        <group position={[-4.2, 0, 0]} rotation={[0, 0.4, 0]}>
          <GiftBox s={1.2} />
          <group position={[0.85, 0, 0.4]}>
            <GiftBox color="#550D10" lid="#6E1316" s={0.85} />
          </group>
        </group>
        <group position={[4, 0, -1]}>
          <Diya flicker={!reduced} />
          <group position={[0.6, 0, 0.4]}>
            <Diya flicker={!reduced} />
          </group>
        </group>
        <group position={[3.2, 0, 0.8]}>
          <Marigold />
        </group>
        <group position={[-2.8, 0, 1]}>
          <Marigold s={0.8} />
        </group>
        <group position={[4.8, 0, 1.2]}>
          <Marigold s={0.9} />
        </group>
      </group>

      {/* 6 · the end — one katori, laddoos to share */}
      <group position={[0.9, 0.06, -58.6]}>
        <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
        <Laddoos count={13} spread={0.36} height={0.36} seed={12} />
      </group>
      <Scatter kind="date" count={5} area={[-0.6, 1.8, -57.8, -56.8]} seed={13} />

      {/* ingredients scattered along the whole table so every gap between sections has life */}
      <Scatter kind="almond" count={compact ? 40 : 80} area={[2.2, 5.5, -60, 4]} seed={21} />
      <Scatter kind="almond" count={compact ? 40 : 80} area={[-5.5, -2.2, -60, 4]} seed={22} />
      <Scatter kind="hazelnut" count={compact ? 30 : 60} area={[-5.5, -2.4, -60, 2]} seed={23} />
      <Scatter kind="date" count={compact ? 20 : 40} area={[2.4, 5.5, -60, 2]} seed={24} />
      <Scatter kind="seed" count={compact ? 160 : 360} area={[-4.5, 4.5, -60, 4]} seed={25} />
      {[-8, -23, -33, -43, -53].map((zz, i) => (
        <group key={zz} position={[i % 2 ? 3.6 : -3.7, 0.06, zz]}>
          <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
          <Laddoos count={7} spread={0.28} height={0.36} seed={30 + i} />
        </group>
      ))}
    </>
  );
}

export default function World() {
  const reduced = !!useReducedMotion();
  const [dpr, setDpr] = useState(1.5);
  const compact = useMediaQuery("(max-width: 767px)");

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, compact ? Math.min(dpr, 1.25) : dpr]}
      camera={{ position: [1, 3.1, 8], fov: 40, near: 0.1, far: 40 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.04;
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <Scene reduced={reduced} compact={compact} />
    </Canvas>
  );
}
