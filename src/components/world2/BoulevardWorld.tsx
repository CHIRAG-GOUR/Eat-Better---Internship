"use client";
/* eslint-disable react-hooks/immutability -- three.js materials and the camera are updated inside useFrame by design */

import { createContext, Suspense, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, RoundedBox, useTexture } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { useMediaQuery } from "@/lib/useClient";
import { StreetLife } from "./StreetLife";

/**
 * Module 2 world — "Brand Boulevard": an Indian high street the camera glides down as the student
 * scrolls. Each chapter of Module 2 is a different time of day (2.1 golden hour → 2.2 sunset →
 * 2.3 dusk → 2.4 neon night) and passes its own district props as `scenes`, placed along the street:
 * z from about 0 (top of page) to -travel (end of page); sidewalks at |x| 3.6–6, road |x| < 3.
 * Shop names on the street are generic (no real brands). Wrap the chapter's World in <WorldShell>.
 */

export type Chapter2 = "2.1" | "2.2" | "2.3" | "2.4";
export type BoulevardKit = {
  /** phone-size viewport: use fewer/smaller props */
  compact: boolean;
  /** prefers-reduced-motion: no idle animation */
  reduced: boolean;
  /** 0 = daylight … 1 = full night for this chapter (use for emissive signs) */
  night: number;
};

/**
 * Optional external "drive" for previews: provide a ref holding 0..1 and the camera follows it instead
 * of the page scroll. Chapters don't use this.
 */
export const BoulevardDrive = createContext<React.RefObject<number> | null>(null);

const LOOK: Record<Chapter2, { top: string; horizon: string; fog: string; sun: string; sunI: number; hemi: number; night: number }> = {
  "2.1": { top: "#F2A86B", horizon: "#FFE6C4", fog: "#F8D7B4", sun: "#FFD39A", sunI: 2.3, hemi: 0.95, night: 0.12 },
  "2.2": { top: "#C9768A", horizon: "#FFC9A1", fog: "#EDB9A2", sun: "#FFB27A", sunI: 1.7, hemi: 0.8, night: 0.4 },
  "2.3": { top: "#5E4A86", horizon: "#F09A86", fog: "#B98C99", sun: "#FF9C7A", sunI: 1.0, hemi: 0.6, night: 0.7 },
  "2.4": { top: "#141530", horizon: "#4A2F63", fog: "#2E2445", sun: "#9AA6FF", sunI: 0.35, hemi: 0.4, night: 1 },
};

const WALLS = ["#E8A87C", "#F2C14E", "#7FB7A6", "#F4E1C1", "#E98A7B", "#B5838D", "#9DC3C2", "#F6BD60", "#C97C5D", "#E4C59E"];
const SHOPS = ["CHAI CORNER", "BOOK HOUSE", "TAILORS", "MOBILE REPAIR", "FLOWERS", "STATIONERY", "BAKERY", "CHEMIST", "SHOE MART", "OPTICIANS", "HARDWARE", "FRESH FRUITS", "PHOTO STUDIO", "SAREE HOUSE"];

const rng = (seed: number) => {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

function fontFamily() {
  if (typeof document === "undefined") return "sans-serif";
  return getComputedStyle(document.body).fontFamily || "sans-serif";
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Generic text sign (also used by chapters for their own district signage). */
export function signTexture(text: string, bg = "#FFF5EE", fg = "#2F1C1A", w = 512, h = 128) {
  return canvasTexture(w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    let size = h * 0.5;
    g.font = `800 ${size}px ${fontFamily()}`;
    while (g.measureText(text).width > w * 0.88 && size > 10) {
      size -= 2;
      g.font = `800 ${size}px ${fontFamily()}`;
    }
    g.fillText(text, w / 2, h / 2 + 2);
  });
}

function useStreetTextures() {
  const t = useMemo(() => {
    const road = canvasTexture(256, 512, (g) => {
      g.fillStyle = "#77716B";
      g.fillRect(0, 0, 256, 512);
      const r = rng(7);
      for (let i = 0; i < 2600; i++) {
        g.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0.05)`;
        g.fillRect(r() * 256, r() * 512, 2, 2);
      }
      g.fillStyle = "#F4E3B5";
      g.fillRect(124, 40, 8, 180);
      g.fillRect(124, 296, 8, 180);
    });
    road.wrapS = road.wrapT = THREE.RepeatWrapping;
    road.repeat.set(1, 14);
    const pave = canvasTexture(256, 256, (g) => {
      g.fillStyle = "#D9C2A4";
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = "rgba(90,60,30,0.25)";
      g.lineWidth = 4;
      for (let i = 0; i <= 4; i++) {
        g.beginPath();
        g.moveTo(i * 64, 0);
        g.lineTo(i * 64, 256);
        g.moveTo(0, i * 64);
        g.lineTo(256, i * 64);
        g.stroke();
      }
    });
    pave.wrapS = pave.wrapT = THREE.RepeatWrapping;
    pave.repeat.set(2, 60);
    // facade: white wall + window panes (tinted by the material colour); emissive mask = lit windows
    const facades = [11, 23, 37].map((seed) => {
      const r = rng(seed);
      const lit: [number, number][] = [];
      const map = canvasTexture(256, 256, (g) => {
        g.fillStyle = "#FFFFFF";
        g.fillRect(0, 0, 256, 256);
        for (let x = 0; x < 2; x++)
          for (let y = 0; y < 2; y++) {
            const px = 28 + x * 128;
            const py = 26 + y * 128;
            g.fillStyle = "#5C4A42";
            g.fillRect(px - 6, py - 6, 84, 88);
            g.fillStyle = "#33415A";
            g.fillRect(px, py, 72, 76);
            g.fillStyle = "rgba(255,255,255,0.18)";
            g.fillRect(px + 34, py, 4, 76);
            if (r() > 0.45) lit.push([px, py]);
          }
      });
      const emissive = canvasTexture(
        256,
        256,
        (g) => {
          g.fillStyle = "#000";
          g.fillRect(0, 0, 256, 256);
          g.fillStyle = "#FFC46B";
          for (const [px, py] of lit) g.fillRect(px, py, 72, 76);
        },
        false,
      );
      for (const tex of [map, emissive]) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      return { map, emissive };
    });
    const awnings = ["#FF5C00", "#2E7D6B", "#B3261E", "#1E5AA8", "#C9A400"].map((c) =>
      canvasTexture(256, 32, (g) => {
        for (let i = 0; i < 8; i++) {
          g.fillStyle = i % 2 ? c : "#FFF5EE";
          g.fillRect(i * 32, 0, 32, 32);
        }
      }),
    );
    return { road, pave, facades, awnings };
  }, []);
  useEffect(
    () => () => {
      t.road.dispose();
      t.pave.dispose();
      t.facades.forEach((f) => {
        f.map.dispose();
        f.emissive.dispose();
      });
      t.awnings.forEach((a) => a.dispose());
    },
    [t],
  );
  return t;
}

type Building = { side: 1 | -1; z: number; w: number; h: number; wall: string; facade: number; awning: number; shop: string };

function useBuildings(compact: boolean) {
  return useMemo(() => {
    const r = rng(2026);
    const list: Building[] = [];
    for (const side of [-1, 1] as const) {
      let z = 10;
      let i = side === 1 ? 3 : 0;
      while (z > -100) {
        const w = 4 + Math.round(r() * 3);
        list.push({ side, z: z - w / 2, w, h: 5 + Math.round(r() * 4) * 1.6, wall: WALLS[Math.floor(r() * WALLS.length)], facade: Math.floor(r() * 3), awning: Math.floor(r() * 5), shop: SHOPS[i++ % SHOPS.length] });
        z -= w + 0.25;
      }
    }
    return compact ? list.filter((b) => b.z > -70) : list;
  }, [compact]);
}

function BuildingBlock({ b, tex, windows, glass }: { b: Building; tex: ReturnType<typeof useStreetTextures>; windows: THREE.Material[]; glass: THREE.Material }) {
  const sign = useMemo(() => signTexture(b.shop, "#FFF5EE", "#2F1C1A", 512, 112), [b.shop]);
  useEffect(() => () => sign.dispose(), [sign]);
  const x = b.side * (6.6 + 2.5);
  const face = b.side * -2.5 - b.side * 0.01; // front face (towards the road)
  const upper = b.h - 2.6;
  return (
    <group position={[x, 0, b.z]}>
      <mesh position={[0, b.h / 2, 0]}>
        <boxGeometry args={[5, b.h, b.w]} />
        <meshStandardMaterial color={b.wall} roughness={0.9} />
      </mesh>
      {/* windows on the upper floors */}
      <mesh position={[face + b.side * -0.005, 2.6 + upper / 2, 0]} rotation={[0, b.side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]} material={windows[b.facade]}>
        <planeGeometry args={[b.w - 0.3, upper - 0.3]} />
      </mesh>
      {/* shopfront */}
      <mesh position={[face + b.side * -0.02, 1.05, 0]} rotation={[0, b.side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]} material={glass}>
        <planeGeometry args={[b.w - 0.8, 2]} />
      </mesh>
      <mesh position={[face + b.side * -0.04, 2.4, 0]} rotation={[0, b.side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <planeGeometry args={[Math.min(b.w - 0.6, 3.4), 0.6]} />
        <meshStandardMaterial map={sign} roughness={0.7} />
      </mesh>
      <mesh position={[face + b.side * -0.55, 2.05, 0]} rotation={[0, 0, b.side * 0.45]}>
        <boxGeometry args={[1.1, 0.05, b.w - 0.6]} />
        <meshStandardMaterial map={tex.awnings[b.awning]} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Street({ compact, nightRef }: { compact: boolean; nightRef: React.RefObject<number> }) {
  const tex = useStreetTextures();
  const buildings = useBuildings(compact);
  const windows = useMemo(
    () =>
      tex.facades.map(({ map, emissive }) => {
        const m = new THREE.MeshStandardMaterial({ map: map.clone(), emissiveMap: emissive.clone(), emissive: new THREE.Color("#FFC46B"), emissiveIntensity: 0, roughness: 0.6 });
        m.map!.repeat.set(2, 3);
        m.emissiveMap!.repeat.set(2, 3);
        m.map!.needsUpdate = m.emissiveMap!.needsUpdate = true;
        return m;
      }),
    [tex],
  );
  const bulbMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#FFE6B0", emissive: new THREE.Color("#FFC24D"), emissiveIntensity: 0.6, toneMapped: false }), []);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5A6B80", emissive: new THREE.Color("#FFB866"), emissiveIntensity: 0.3, roughness: 0.15, metalness: 0.2 }), []);
  useEffect(
    () => () => {
      windows.forEach((m) => {
        m.map?.dispose();
        m.emissiveMap?.dispose();
        m.dispose();
      });
      bulbMat.dispose();
      glass.dispose();
    },
    [windows, bulbMat, glass],
  );
  useFrame(() => {
    const n = nightRef.current ?? 0;
    for (const m of windows) m.emissiveIntensity = n * 1.6;
    bulbMat.emissiveIntensity = 0.5 + n * 2.2;
    glass.emissiveIntensity = 0.25 + n * 0.9;
  });

  // lamps, string lights and trees as instances
  const lampZ = useMemo(() => Array.from({ length: 14 }, (_, i) => 6 - i * 8), []);
  const poles = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const bulbs = useRef<THREE.InstancedMesh>(null);
  const crowns = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const strings = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 7; k++) {
      const z = 2 - k * 16;
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        pts.push(new THREE.Vector3(-6 + t * 12, 5.2 - Math.sin(t * Math.PI) * 0.9, z));
      }
    }
    return pts;
  }, []);
  const treeZ = useMemo(() => Array.from({ length: 12 }, (_, i) => 2 - i * 9.5), []);
  useEffect(() => {
    const o = new THREE.Object3D();
    lampZ.forEach((z, i) => {
      const side = i % 2 ? 1 : -1;
      o.position.set(side * 3.75, 2.2, z);
      o.rotation.set(0, 0, 0);
      o.scale.set(1, 1, 1);
      o.updateMatrix();
      poles.current?.setMatrixAt(i, o.matrix);
      o.position.set(side * 3.35, 4.35, z);
      o.updateMatrix();
      heads.current?.setMatrixAt(i, o.matrix);
    });
    strings.forEach((p, i) => {
      o.position.copy(p);
      o.updateMatrix();
      bulbs.current?.setMatrixAt(i, o.matrix);
    });
    treeZ.forEach((z, i) => {
      const side = i % 2 ? -1 : 1;
      o.position.set(side * 5.4, 0.9, z);
      o.updateMatrix();
      trunks.current?.setMatrixAt(i, o.matrix);
      o.position.set(side * 5.4, 2.6, z);
      o.scale.setScalar(0.9 + (i % 3) * 0.15);
      o.updateMatrix();
      crowns.current?.setMatrixAt(i, o.matrix);
      o.scale.setScalar(1);
    });
    for (const m of [poles, heads, bulbs, trunks, crowns]) if (m.current) m.current.instanceMatrix.needsUpdate = true;
  }, [lampZ, strings, treeZ]);

  return (
    <group>
      {/* road + pavements + kerbs */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -40]} receiveShadow>
        <planeGeometry args={[6, 120]} />
        <meshStandardMaterial map={tex.road} roughness={0.95} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[s * 5.05, 0.12, -40]} receiveShadow>
            <planeGeometry args={[4.1, 120]} />
            <meshStandardMaterial map={tex.pave} roughness={0.9} />
          </mesh>
          <mesh position={[s * 3.03, 0.06, -40]}>
            <boxGeometry args={[0.12, 0.13, 120]} />
            <meshStandardMaterial color="#B8A58C" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -40]}>
        <planeGeometry args={[80, 160]} />
        <meshStandardMaterial color="#B49A80" roughness={1} />
      </mesh>

      {buildings.map((b) => (
        <BuildingBlock key={`${b.side}${b.z}`} b={b} tex={tex} windows={windows} glass={glass} />
      ))}

      <instancedMesh ref={poles} args={[undefined, undefined, lampZ.length]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 4.4, 8]} />
        <meshStandardMaterial color="#2F2A28" roughness={0.5} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, lampZ.length]} material={bulbMat}>
        <sphereGeometry args={[0.2, 12, 10]} />
      </instancedMesh>
      <instancedMesh ref={bulbs} args={[undefined, undefined, strings.length]} material={bulbMat}>
        <sphereGeometry args={[0.07, 8, 6]} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, treeZ.length]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1.8, 8]} />
        <meshStandardMaterial color="#6B4126" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, treeZ.length]} castShadow>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial color="#5E8C3A" roughness={0.85} flatShading />
      </instancedMesh>
    </group>
  );
}

function Sky({ top, horizon }: { top: string; horizon: string }) {
  const tex = useMemo(
    () =>
      canvasTexture(4, 256, (g) => {
        const grd = g.createLinearGradient(0, 0, 0, 256);
        grd.addColorStop(0, top);
        grd.addColorStop(0.55, horizon);
        grd.addColorStop(1, horizon);
        g.fillStyle = grd;
        g.fillRect(0, 0, 4, 256);
      }),
    [top, horizon],
  );
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh scale={[1, 1, 1]}>
      <sphereGeometry args={[90, 32, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

function BoulevardScene({ chapter, travel, compact, reduced, scenes, drive }: { chapter: Chapter2; travel: number; compact: boolean; reduced: boolean; scenes?: (kit: BoulevardKit) => ReactNode; drive: React.RefObject<number> | null }) {
  const look = LOOK[chapter];
  const { camera } = useThree();
  const z = useRef(0);
  const t = useRef(0);
  const nightRef = useRef(look.night);
  const sun = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = drive ? drive.current : max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const goal = 2 - p * travel;
    z.current = reduced ? goal : THREE.MathUtils.damp(z.current, goal, 3, dt);
    t.current += dt;
    nightRef.current = Math.min(1, look.night + p * 0.18);
    const sway = reduced ? 0 : Math.sin(t.current * 0.2) * 0.4;
    const x = compact ? 0.3 : 1;
    camera.position.set(x + sway, 2.35 + (reduced ? 0 : Math.sin(t.current * 0.3) * 0.06), z.current + 6.5);
    camera.lookAt(x * 0.3 + sway * 0.3, 1.6, z.current - 6);
    if (sun.current) {
      sun.current.position.set(-8, 9, z.current - 2);
      target.position.set(0, 0, z.current - 6);
    }
  });
  return (
    <>
      <color attach="background" args={[look.fog]} />
      <fog attach="fog" args={[look.fog, 14, 46]} />
      <Sky top={look.top} horizon={look.horizon} />
      <hemisphereLight args={[look.top, "#6B4A36", look.hemi]} />
      <directionalLight ref={sun} target={target} color={look.sun} intensity={look.sunI} castShadow={!compact} shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0004} />
      <primitive object={target} />
      <ambientLight intensity={0.25 + look.night * 0.15} color={look.night > 0.6 ? "#8C7BFF" : "#FFE8CF"} />
      <Street compact={compact} nightRef={nightRef} />
      <StreetLife compact={compact} reduced={reduced} />
      {scenes?.({ compact, reduced, night: look.night })}
    </>
  );
}

export default function BoulevardWorld({ chapter, scenes, travel = 60 }: { chapter: Chapter2; scenes?: (kit: BoulevardKit) => ReactNode; travel?: number }) {
  const reduced = !!useReducedMotion();
  const compact = useMediaQuery("(max-width: 767px)");
  const [dpr, setDpr] = useState(1.5);
  const drive = useContext(BoulevardDrive);
  return (
    <Canvas
      shadows={compact ? false : "percentage"}
      dpr={[1, compact ? Math.min(dpr, 1.25) : dpr]}
      camera={{ position: [1, 2.4, 8.5], fov: compact ? 52 : 44, near: 0.1, far: 140 }}
      gl={{ antialias: !compact, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <BoulevardScene chapter={chapter} travel={travel} compact={compact} reduced={reduced} scenes={scenes} drive={drive} />
    </Canvas>
  );
}

/* ── shared district props for Module 2 chapters ──────────────── */

/** A street billboard on two posts showing an image (official creative / photo). Faces +z by default. */
export function Billboard({
  src,
  position,
  rotation = [0, 0, 0],
  width = 4,
  height = 2.25,
  posts = true,
  frame = "#2F1C1A",
}: {
  src: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  posts?: boolean;
  frame?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Suspense fallback={null}>
        <BillboardFace src={src} width={width} height={height} frame={frame} />
      </Suspense>
      {posts &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * width * 0.32, -height / 2 - 0.9, -0.05]} castShadow>
            <cylinderGeometry args={[0.06, 0.07, 1.9, 8]} />
            <meshStandardMaterial color="#3A3330" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
    </group>
  );
}

function BillboardFace({ src, width, height, frame }: { src: string; width: number; height: number; frame: string }) {
  const tex = useTexture(src);
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  }, [tex]);
  return (
    <group>
      <RoundedBox args={[width + 0.16, height + 0.16, 0.1]} radius={0.04} position={[0, 0, -0.06]} castShadow>
        <meshStandardMaterial color={frame} roughness={0.5} />
      </RoundedBox>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={0.18} roughness={0.6} toneMapped={false} />
      </mesh>
    </group>
  );
}
