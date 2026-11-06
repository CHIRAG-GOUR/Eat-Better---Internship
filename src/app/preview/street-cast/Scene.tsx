"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Human, type HumanLook } from "@/components/world2/Human";
import { AutoRickshaw, Scooter } from "@/components/world2/StreetLife";

const CAST: HumanLook[] = [
  { skin: "#B98157", hair: "#1E1410", hairStyle: "side", outfit: "shirt", top: "#DCE6F0", bottom: "#2B3A55", accent: "#F4F7FA", facial: "stubble", bag: { kind: "shoulder", color: "#3E2B22" } },
  { skin: "#9C6644", hair: "#140C08", hairStyle: "braid", outfit: "saree", top: "#C2185B", bottom: "#C2185B", accent: "#F2A900", bindi: true, slim: true, height: 0.95 },
  { skin: "#D1A276", hair: "#2A1A12", hairStyle: "curly", outfit: "tshirt", top: "#3E8E41", bottom: "#33475B", shoe: "#EDEDED", bag: { kind: "backpack", color: "#35401D" } },
  { skin: "#A86B45", hair: "#CFC8C0", hairStyle: "bald", outfit: "kurta", top: "#F4EFE6", bottom: "#F4EFE6", facial: "moustache", glasses: "#3A2A1E", height: 0.97 },
  { skin: "#B5764A", hair: "#140C08", hairStyle: "long", outfit: "salwar", top: "#26A69A", bottom: "#F3E5D0", accent: "#FED300", bindi: true, slim: true, height: 0.94 },
  { skin: "#C68B59", hair: "#1E1410", hairStyle: "side", outfit: "kurta", top: "#7B2D26", bottom: "#E8DCC8", facial: "beard", glasses: "#1A1A1A" },
];

function Spin({ children, speed = 0.25 }: { children: React.ReactNode; speed?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * speed;
  });
  return <group ref={g}>{children}</group>;
}

export default function Scene() {
  const spin = useRef(0);
  const [view] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("v") ?? "people" : "people"));
  const cam: Record<string, [number, number, number]> = { people: [0, 1.5, 4.2], face: [0, 1.6, 0.9], scooter: [2.6, 1.6, 2.6], auto: [3.6, 2.2, 3.6] };
  const target: Record<string, [number, number, number]> = { people: [0, 1.0, 0], face: [0, 1.58, 0], scooter: [0, 0.8, 0], auto: [0, 1.0, 0] };
  return (
    <Canvas shadows camera={{ position: cam[view], fov: 40 }}>
      <color attach="background" args={["#e9e2d8"]} />
      <hemisphereLight args={["#fff4e6", "#7a5c48", 0.9]} />
      <directionalLight position={[3, 6, 4]} intensity={2.2} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#cbbfae" />
      </mesh>
      {view === "people" && CAST.map((l, i) => <group key={i} position={[(i - 2.5) * 0.75, 0, 0]}><Human look={l} mode="walk" phase={i} /></group>)}
      {view === "face" && <group position={[0, 0, 0]}><Human look={CAST[Number(new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("i") ?? 0)]} mode="stand" /></group>}
      {view === "scooter" && <Spin><Scooter spin={spin} /></Spin>}
      {view === "auto" && <Spin><AutoRickshaw spin={spin} /></Spin>}
      <OrbitControls target={target[view]} />
    </Canvas>
  );
}
