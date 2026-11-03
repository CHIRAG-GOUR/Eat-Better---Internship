"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { BhujiaPile } from "@/components/world/props";
import type { ObjectKind } from "./data";

/** Canvas text texture for fictional packaging and signs. */
export function useTextTexture(w: number, h: number, bg: string, lines: { text: string; size: number; color: string; y: number }[], border?: string) {
  const key = JSON.stringify([w, h, bg, lines, border]);
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    if (border) {
      g.strokeStyle = border;
      g.lineWidth = Math.max(6, h * 0.06);
      g.strokeRect(g.lineWidth, g.lineWidth, w - g.lineWidth * 2, h - g.lineWidth * 2);
    }
    const fam = getComputedStyle(document.body).fontFamily || "sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (const l of lines) {
      g.fillStyle = l.color;
      g.font = `800 ${l.size}px ${fam}`;
      g.fillText(l.text, w / 2, l.y, w * 0.92);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key captures all inputs
  }, [key]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

const steel = <meshStandardMaterial color="#C9CCD1" metalness={0.9} roughness={0.25} />;

function Basket() {
  return (
    <group>
      {/* wire basket */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.9, 0.4, 0.55]} />
        <meshStandardMaterial color="#D32F2F" wireframe />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.9, 0.02, 0.55]} />
        <meshStandardMaterial color="#B71C1C" />
      </mesh>
      <mesh position={[0, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.18, 0.02, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#B71C1C" />
      </mesh>
      {/* mithai box + biscuits (fictional) */}
      <RoundedBox args={[0.42, 0.14, 0.32]} radius={0.02} position={[-0.18, 0.1, 0]} rotation={[0, 0.15, 0]}>
        <meshStandardMaterial color="#F9A825" />
      </RoundedBox>
      {[0, 1].map((i) => (
        <RoundedBox key={i} args={[0.12, 0.3, 0.12]} radius={0.03} position={[0.2 + i * 0.15, 0.16, -0.05]} rotation={[0, 0, 0.1]}>
          <meshStandardMaterial color={i ? "#1565C0" : "#6A1B9A"} />
        </RoundedBox>
      ))}
    </group>
  );
}

function Packet() {
  const front = useTextTexture(256, 384, "#7CB342", [
    { text: "SNACKO", size: 54, color: "#FFFFFF", y: 70 },
    { text: "HEALTHY!", size: 58, color: "#FFEB3B", y: 180 },
    { text: "PROTEIN*", size: 40, color: "#FFFFFF", y: 260 },
    { text: "fictional brand", size: 22, color: "#E8F5E9", y: 345 },
  ]);
  const back = useTextTexture(256, 384, "#F1F8E9", [
    { text: "INGREDIENTS", size: 28, color: "#33691E", y: 40 },
    ...Array.from({ length: 9 }, (_, i) => ({ text: ["maltodextrin, INS 471,", "hydrogenated fat,", "sugar, invert syrup,", "INS 322, flavour,", "INS 150d, salt,", "emulsifier, INS 500,", "palm oil, glucose,", "colour, stabiliser,", "INS 330, INS 211…"][i], size: 21, color: "#33691E", y: 90 + i * 30 })),
  ]);
  return (
    <group position={[0, 0.36, 0]}>
      <RoundedBox args={[0.48, 0.72, 0.12]} radius={0.03}>
        <meshStandardMaterial color="#7CB342" roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 0, 0.061]}>
        <planeGeometry args={[0.46, 0.69]} />
        <meshStandardMaterial map={front} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0, -0.061]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.46, 0.69]} />
        <meshStandardMaterial map={back} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Chai() {
  return (
    <group>
      {/* plate of namkeen */}
      <mesh position={[0.22, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.3, 0.26, 0.04, 32]} />
        {steel}
      </mesh>
      <mesh position={[0.22, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 24]} />
        <meshStandardMaterial color="#F1E6C8" />
      </mesh>
      <mesh position={[0.28, 0.048, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 20]} />
        <meshStandardMaterial color="#C9A24A" transparent opacity={0.6} />
      </mesh>
      <group position={[0.22, 0.05, 0]} scale={0.45}>
        <BhujiaPile count={140} spread={0.42} height={0.14} />
      </group>
      {/* chai */}
      <group position={[-0.25, 0, 0]}>
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.03, 24]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.18, 24, 1, true]} />
          <meshPhysicalMaterial color="#FFFFFF" transmission={0.4} roughness={0.1} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.085, 24]} />
          <meshStandardMaterial color="#B87A44" />
        </mesh>
      </group>
    </group>
  );
}

function Tiffin() {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.1 + i * 0.19, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 32]} />
          {steel}
        </mesh>
      ))}
      <mesh position={[0, 0.66, 0]}>
        <torusGeometry args={[0.14, 0.02, 8, 24, Math.PI]} />
        {steel}
      </mesh>
      {/* open top tier with sprouts */}
      <group position={[0.5, 0, 0.1]}>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.16, 32, 1, true]} />
          <meshStandardMaterial color="#C9CCD1" metalness={0.9} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 26 }, (_, i) => (
          <mesh key={i} position={[Math.cos(i * 2.4) * 0.15 * ((i % 5) / 5 + 0.2), 0.15, Math.sin(i * 2.4) * 0.15 * ((i % 5) / 5 + 0.2)]}>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshStandardMaterial color={i % 3 ? "#9CCC65" : "#F0E6C0"} />
          </mesh>
        ))}
      </group>
      {/* chips bag */}
      <RoundedBox args={[0.34, 0.46, 0.1]} radius={0.04} position={[-0.5, 0.23, -0.1]} rotation={[0, 0.3, 0.08]}>
        <meshStandardMaterial color="#FBC02D" roughness={0.3} metalness={0.3} />
      </RoundedBox>
    </group>
  );
}

function Vending() {
  const colors = ["#E53935", "#FBC02D", "#1E88E5", "#8E24AA", "#FB8C00", "#43A047"];
  return (
    <group>
      <RoundedBox args={[1.1, 2.0, 0.8]} radius={0.04} position={[0, 1.0, 0]} castShadow>
        <meshStandardMaterial color="#263238" roughness={0.4} />
      </RoundedBox>
      <mesh position={[-0.12, 1.15, 0.405]}>
        <planeGeometry args={[0.75, 1.5]} />
        <meshStandardMaterial color="#B3E5FC" transparent opacity={0.25} />
      </mesh>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2].map((c) => (
          <RoundedBox key={`${r}-${c}`} args={[0.18, 0.26, 0.1]} radius={0.02} position={[-0.36 + c * 0.24, 0.6 + r * 0.36, 0.3]}>
            <meshStandardMaterial color={colors[(r * 3 + c) % colors.length]} roughness={0.35} />
          </RoundedBox>
        )),
      )}
      <mesh position={[0.4, 1.3, 0.405]}>
        <planeGeometry args={[0.18, 0.5]} />
        <meshStandardMaterial color="#37474F" />
      </mesh>
    </group>
  );
}

function Plate() {
  return (
    <group>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.32, 0.28, 0.03, 32]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.8} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.1, 0.1, 0]} rotation={[0, s * 0.6, 0]} castShadow>
          <coneGeometry args={[0.13, 0.17, 3]} />
          <meshStandardMaterial color="#D4932E" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.2, 0.04, 0.16]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshStandardMaterial color="#2E7D32" />
      </mesh>
    </group>
  );
}

export function InspectObject({ kind }: { kind: ObjectKind }) {
  switch (kind) {
    case "basket":
      return <Basket />;
    case "packet":
      return <Packet />;
    case "chai":
      return <Chai />;
    case "tiffin":
      return <Tiffin />;
    case "vending":
      return <Vending />;
    case "plate":
      return <Plate />;
  }
}

/** how big each object is, so the close-up viewer can frame it */
export const OBJECT_FRAME: Record<ObjectKind, { y: number; dist: number }> = {
  basket: { y: 0.25, dist: 1.8 },
  packet: { y: 0.36, dist: 1.6 },
  chai: { y: 0.1, dist: 1.4 },
  tiffin: { y: 0.3, dist: 1.9 },
  vending: { y: 1.0, dist: 3.4 },
  plate: { y: 0.08, dist: 1.2 },
};
