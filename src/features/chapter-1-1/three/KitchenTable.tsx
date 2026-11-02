"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { BhujiaPile, Laddoos, NutPile } from "@/features/packaging/three/StudioSet";
import { makeBowl, makeCyclorama, makeKatori } from "@/features/packaging/three/geometry";
import type { CategoryId } from "../content";

/* ── ingredients ──────────────────────────────────────────────── */

function Dates({ positions }: { positions: [number, number, number][] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(0.07, 20, 14);
    g.scale(1.6, 0.75, 0.8);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setY(i, p.getY(i) * (1 + Math.sin(x * 60) * 0.06)); // wrinkled skin
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#4a1e10", roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 }), []);
  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    positions.forEach((p, i) => {
      o.position.set(...p);
      o.rotation.set(0, i * 1.7, 0.1 * i);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [positions]);
  return <instancedMesh ref={ref} args={[geo, mat, positions.length]} castShadow />;
}

/** Plain, unbranded gift box — stands for "combos & gifting" without imitating real packaging. */
function GiftBox() {
  const ribbon = useMemo(() => new THREE.MeshStandardMaterial({ color: "#C8963E", metalness: 0.6, roughness: 0.35 }), []);
  const paper = useMemo(() => new THREE.MeshStandardMaterial({ color: "#FF5C00", roughness: 0.55 }), []);
  const lid = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E8540A", roughness: 0.5 }), []);
  useEffect(() => () => {
    ribbon.dispose();
    paper.dispose();
    lid.dispose();
  }, [ribbon, paper, lid]);
  return (
    <group>
      <RoundedBox args={[0.7, 0.42, 0.7]} radius={0.02} position={[0, 0.21, 0]} material={paper} castShadow receiveShadow />
      <RoundedBox args={[0.74, 0.1, 0.74]} radius={0.02} position={[0, 0.45, 0]} material={lid} castShadow />
      <mesh material={ribbon} position={[0, 0.25, 0]}>
        <boxGeometry args={[0.745, 0.52, 0.07]} />
      </mesh>
      <mesh material={ribbon} position={[0, 0.25, 0]}>
        <boxGeometry args={[0.07, 0.52, 0.745]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={ribbon} position={[s * 0.09, 0.53, 0]} rotation={[Math.PI / 2, s * 0.5, 0]}>
          <torusGeometry args={[0.08, 0.022, 10, 24]} />
        </mesh>
      ))}
    </group>
  );
}

/* ── interactive stations ─────────────────────────────────────── */

export const STATIONS: { id: CategoryId; label: string; pos: [number, number, number] }[] = [
  { id: "sweets", label: "Sweets & laddoos", pos: [-0.95, 0, 0.25] },
  { id: "namkeens", label: "Namkeens", pos: [0.55, 0, -0.35] },
  { id: "nuts", label: "Nuts & mixes", pos: [1.45, 0, 0.55] },
  { id: "gifting", label: "Combos & gifting", pos: [2.05, 0, -1.45] },
];

function Station({
  id,
  pos,
  hovered,
  onHover,
  onPick,
  children,
}: {
  id: CategoryId;
  pos: [number, number, number];
  hovered: CategoryId | null;
  onHover: (id: CategoryId | null) => void;
  onPick: (id: CategoryId) => void;
  children: React.ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const on = hovered === id;
  useFrame((_, dt) => {
    if (!g.current) return;
    const s = THREE.MathUtils.damp(g.current.scale.x, on ? 1.07 : 1, 8, dt);
    g.current.scale.setScalar(s);
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, on ? 0.05 : 0, 8, dt);
  });
  return (
    <group position={pos}>
      <group
        ref={g}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onPick(id);
        }}
      >
        {children}
      </group>
    </group>
  );
}

function Scene({ onHover, hovered, onPick, reduced }: { onHover: (id: CategoryId | null) => void; hovered: CategoryId | null; onPick: (id: CategoryId) => void; reduced: boolean }) {
  const { camera, pointer, gl, size } = useThree();
  const wide = size.width >= 1024;
  const cyc = useMemo(() => makeCyclorama(30, 8, 3, 12), []);
  const katori = useMemo(() => makeKatori(0.5, 0.26), []);
  const bowl = useMemo(() => makeBowl(0.62, 0.32), []);
  const smallBowl = useMemo(() => makeBowl(0.42, 0.22), []);
  const mats = useMemo(
    () => ({
      cove: new THREE.MeshStandardMaterial({ color: "#5a1416", roughness: 0.95 }),
      table: new THREE.MeshStandardMaterial({ color: "#C9AB8C", roughness: 0.78 }),
      brass: new THREE.MeshStandardMaterial({ color: "#C8963E", metalness: 1, roughness: 0.26 }),
      ceramic: new THREE.MeshStandardMaterial({ color: "#F4EEE6", roughness: 0.5 }),
      wood: new THREE.MeshStandardMaterial({ color: "#8a5a36", roughness: 0.7 }),
    }),
    [],
  );
  useEffect(() => () => {
    cyc.dispose();
    katori.dispose();
    bowl.dispose();
    smallBowl.dispose();
    Object.values(mats).forEach((m) => m.dispose());
  }, [cyc, katori, bowl, smallBowl, mats]);

  useEffect(() => {
    gl.domElement.style.setProperty("cursor", hovered ? "pointer" : "");
  }, [hovered, gl]);

  const base = useMemo(() => new THREE.Vector3(wide ? -0.5 : 0.2, 2.5, wide ? 6.6 : 6.2), [wide]);
  // on wide screens the text column covers the left ~45%, so aim the camera left to push the table right
  const look = useMemo(() => new THREE.Vector3(wide ? -1.15 : 0.3, 0.25, 0), [wide]);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    const scroll = Math.min(1, window.scrollY / window.innerHeight);
    const drift = reduced ? 0 : Math.sin(t.current * 0.25) * 0.15;
    const px = reduced ? 0 : pointer.x * 0.35;
    const py = reduced ? 0 : pointer.y * 0.18;
    const target = new THREE.Vector3(base.x + drift + px, base.y + py - scroll * 0.6, base.z - scroll * 1.6);
    camera.position.lerp(target, 1 - Math.exp(-dt * 3));
    camera.lookAt(look);
  });

  const stationProps = { hovered, onHover, onPick };

  return (
    <>
      <hemisphereLight args={["#fff1e2", "#4a2a1c", 0.55]} />
      <directionalLight
        position={[-3, 5, 3.5]}
        intensity={2.5}
        color="#fff0dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <spotLight position={[3, 3, -2.5]} angle={0.7} penumbra={1} intensity={24} color="#ffc996" distance={12} />
      <Environment resolution={128} frames={1}>
        <color attach="background" args={["#2a1a14"]} />
        <Lightformer form="rect" intensity={3} color="#fff4e6" position={[-3, 2.5, 3]} scale={[3.5, 3, 1]} target={[0, 0.3, 0]} />
        <Lightformer form="rect" intensity={1.5} color="#ffe2c4" position={[3.5, 1.2, 2]} scale={[1.2, 4, 1]} target={[0, 0.3, 0]} />
        <Lightformer form="rect" intensity={2} position={[0, 5, 0]} scale={[5, 5, 1]} rotation-x={Math.PI / 2} />
      </Environment>

      <mesh geometry={cyc} material={mats.cove} position={[0, -0.6, 0]} receiveShadow />
      <RoundedBox args={[11, 0.6, 9]} radius={0.06} smoothness={4} position={[0, -0.3, 2]} material={mats.table} receiveShadow />

      {/* a wooden board — the family kitchen */}
      <RoundedBox args={[2.1, 0.06, 1.2]} radius={0.03} smoothness={3} position={[-0.75, 0.03, 0.15]} rotation={[0, 0.12, 0]} material={mats.wood} receiveShadow castShadow />

      <Station id="sweets" pos={STATIONS[0].pos} {...stationProps}>
        <group position={[0, 0.06, 0]}>
          <mesh geometry={katori} material={mats.brass} castShadow receiveShadow />
          <Laddoos count={10} spread={0.27} height={0.29} />
        </group>
        <Dates positions={[[0.62, 0.1, 0.3], [0.78, 0.1, 0.12], [0.55, 0.1, 0.05]]} />
      </Station>

      <Station id="namkeens" pos={STATIONS[1].pos} {...stationProps}>
        <mesh geometry={bowl} material={mats.ceramic} castShadow receiveShadow />
        <BhujiaPile count={520} spread={0.44} height={0.22} />
      </Station>

      <Station id="nuts" pos={STATIONS[2].pos} {...stationProps}>
        <mesh geometry={smallBowl} material={mats.ceramic} castShadow receiveShadow />
        <NutPile count={70} spread={0.3} height={0.16} />
      </Station>

      <Station id="gifting" pos={STATIONS[3].pos} {...stationProps}>
        <group rotation={[0, 0.5, 0]}>
          <GiftBox />
        </group>
      </Station>

      <ContactShadows position={[0, 0.002, 0]} opacity={0.5} scale={9} blur={2.4} far={1.5} resolution={512} color="#2a120a" frames={1} />
    </>
  );
}

export default function KitchenTable({
  onPick,
  onHoverChange,
}: {
  onPick: (id: CategoryId) => void;
  onHoverChange?: (id: CategoryId | null) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState<CategoryId | null>(null);
  const reduced = !!useReducedMotion();

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    // stop rendering entirely once the hero is off-screen
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hover = (id: CategoryId | null) => {
    setHovered(id);
    onHoverChange?.(id);
  };

  return (
    <div ref={host} className="absolute inset-0">
      <Canvas
        shadows="percentage"
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.6]}
        camera={{ position: [0.2, 2.6, 6.4], fov: 34, near: 0.1, far: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        aria-hidden
      >
        <Scene hovered={hovered} onHover={hover} onPick={onPick} reduced={reduced} />
      </Canvas>
    </div>
  );
}
