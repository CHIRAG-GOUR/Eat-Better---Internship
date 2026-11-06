"use client";
 

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Scooter } from "@/components/world2/StreetLife";
import type { HumanLook } from "@/components/world2/Human";
import { Hoverable } from "@/components/world/hover";
import { along, mat, roadY, signTex } from "./kit";
import { Instanced, SACK, Wheel, type Inst } from "./parts";

/**
 * Logistics on the valley road: generic goods trucks and mini pickups (no brands) running between the
 * farms, the facility and the town; delivery scooters leaving the warehouse for the customer town.
 */

/** Medium goods truck with a covered cargo box. Faces +z, origin at the middle of the wheelbase. */
export function Truck({ spin, cab = "#E8A33C", cargo = "#2E5E8A", label = "FARM  TO  KITCHEN" }: { spin?: React.RefObject<number>; cab?: string; cargo?: string; label?: string }) {
  const side = useMemo(() => signTex(label, cargo, "#FFFFFF", 1024, 256), [label, cargo]);
  useEffect(() => () => side.dispose(), [side]);
  const paint = mat(cab, 0.35, 0.3);
  return (
    <group>
      {[2.1, -1.2, -2.2].flatMap((z) =>
        [-0.95, 0.95].map((x) => (
          <group key={`${x}${z}`} position={[x, 0.46, z]}>
            <Wheel r={0.46} w={0.3} spin={spin} />
          </group>
        )),
      )}
      {/* chassis */}
      <mesh position={[0, 0.72, -0.2]} material={mat("#2A2827", 0.6, 0.4)}>
        <boxGeometry args={[1.4, 0.22, 6.0]} />
      </mesh>
      {/* cab */}
      <RoundedBox args={[2.2, 1.9, 1.7]} radius={0.16} position={[0, 1.85, 2.15]} material={paint} castShadow />
      <mesh position={[0, 2.25, 3.01]} rotation={[-0.08, 0, 0]} material={mat("#22313B", 0.08, 0.6)}>
        <planeGeometry args={[1.9, 0.75]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.105, 2.2, 2.2]} rotation={[0, s * Math.PI / 2, 0]} material={mat("#22313B", 0.08, 0.6)}>
          <planeGeometry args={[0.9, 0.6]} />
        </mesh>
      ))}
      <mesh position={[0, 1.15, 3.02]} material={mat("#3A3A3A", 0.5, 0.5)}>
        <boxGeometry args={[1.6, 0.35, 0.05]} />
      </mesh>
      {[-0.82, 0.82].map((x) => (
        <mesh key={x} position={[x, 1.25, 3.03]} material={mat("#FFF3C4", 0.3, 0, { emissive: "#FFE08A", ei: 0.5 })}>
          <boxGeometry args={[0.3, 0.18, 0.04]} />
        </mesh>
      ))}
      {/* cargo box */}
      <RoundedBox args={[2.35, 2.4, 4.4]} radius={0.06} position={[0, 2.05, -1.05]} material={mat(cargo, 0.65)} castShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.18, 2.1, -1.05]} rotation={[0, (s * Math.PI) / 2, 0]}>
          <planeGeometry args={[4.0, 1.0]} />
          <meshStandardMaterial map={side} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 2.05, -3.26]} rotation={[0, Math.PI, 0]} material={mat("#D9D4CC", 0.6)}>
        <planeGeometry args={[2.2, 2.2]} />
      </mesh>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.95, -3.27]} rotation={[0, Math.PI, 0]} material={mat("#C62828", 0.4, 0, { emissive: "#FF3B30", ei: 0.6 })}>
          <planeGeometry args={[0.25, 0.14]} />
        </mesh>
      ))}
    </group>
  );
}

/** Mini pickup with an open bed of sacks. Faces +z. */
export function Pickup({ spin, color = "#F4F1EA" }: { spin?: React.RefObject<number>; color?: string }) {
  const paint = mat(color, 0.35, 0.25);
  const sacks = useMemo<Inst[]>(
    () => [
      { p: [-0.38, 1.05, -0.6], s: [0.42, 0.22, 0.28], c: "#C9A66B" },
      { p: [0.38, 1.05, -0.6], s: [0.42, 0.22, 0.28], r: [0, 0.2, 0], c: "#D8BC86" },
      { p: [-0.38, 1.05, -1.3], s: [0.42, 0.22, 0.28], c: "#D8BC86" },
      { p: [0.38, 1.05, -1.3], s: [0.42, 0.22, 0.28], c: "#C9A66B" },
      { p: [0, 1.42, -0.95], s: [0.42, 0.22, 0.28], r: [0, 1.5, 0], c: "#C9A66B" },
    ],
    [],
  );
  return (
    <group>
      {[1.15, -1.1].flatMap((z) =>
        [-0.68, 0.68].map((x) => (
          <group key={`${x}${z}`} position={[x, 0.33, z]}>
            <Wheel r={0.33} w={0.2} spin={spin} />
          </group>
        )),
      )}
      <RoundedBox args={[1.55, 1.35, 1.25]} radius={0.14} position={[0, 1.15, 1.1]} material={paint} castShadow />
      <mesh position={[0, 1.42, 1.735]} rotation={[-0.12, 0, 0]} material={mat("#22313B", 0.08, 0.6)}>
        <planeGeometry args={[1.35, 0.55]} />
      </mesh>
      <mesh position={[0, 0.62, -0.5]} material={mat("#2A2827", 0.6, 0.4)}>
        <boxGeometry args={[1.0, 0.18, 3.6]} />
      </mesh>
      <mesh position={[0, 0.8, -0.95]} material={paint} castShadow>
        <boxGeometry args={[1.6, 0.12, 2.3]} />
      </mesh>
      {[-0.78, 0.78].map((x) => (
        <mesh key={x} position={[x, 1.02, -0.95]} material={paint}>
          <boxGeometry args={[0.06, 0.42, 2.3]} />
        </mesh>
      ))}
      <mesh position={[0, 1.02, -2.08]} material={paint}>
        <boxGeometry args={[1.6, 0.42, 0.06]} />
      </mesh>
      <Instanced geometry={SACK} material={mat("#FFFFFF", 0.95)} items={sacks} castShadow />
    </group>
  );
}

/* ── moving traffic ───────────────────────────────────────────── */

type V = { kind: "truck" | "pickup"; dir: 1 | -1; speed: number; offset: number; cab?: string; cargo?: string; label?: string; color?: string };
const ROAD = { from: 34, to: -158 };

const TRAFFIC: V[] = [
  { kind: "truck", dir: -1, speed: 6.5, offset: 0, cab: "#E8A33C", cargo: "#2E5E8A", label: "FARM  TO  KITCHEN" },
  { kind: "pickup", dir: 1, speed: 7.5, offset: 70, color: "#F4F1EA" },
  { kind: "truck", dir: 1, speed: 6, offset: 140, cab: "#C0392B", cargo: "#3D6B4A", label: "COLD  CHAIN  LOGISTICS" },
  { kind: "pickup", dir: -1, speed: 7, offset: 110, color: "#7FB3D5" },
];

function RoadVehicle({ v, reduced }: { v: V; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const len = ROAD.from - ROAD.to;
  useFrame(({ clock }, dt) => {
    const grp = g.current;
    if (!grp) return;
    const d = ((reduced ? 0 : clock.elapsedTime * v.speed) + v.offset) % len;
    const z = v.dir === -1 ? ROAD.from - d : ROAD.to + d;
    const x = v.dir === -1 ? -1.0 : 1.45;
    // pitch over the bridge ramps
    const ahead = roadY(z + 1.5 * v.dir);
    const behind = roadY(z - 1.5 * v.dir);
    grp.position.set(x, roadY(z), z);
    grp.rotation.set(0, v.dir === -1 ? Math.PI : 0, 0);
    grp.rotateX(-Math.atan2(ahead - behind, 3));
    if (!reduced) spin.current += (v.speed / 0.45) * dt;
  });
  return (
    <group ref={g}>
      {v.kind === "truck" ? <Truck spin={spin} cab={v.cab} cargo={v.cargo} label={v.label} /> : <Pickup spin={spin} color={v.color} />}
    </group>
  );
}

const RIDERS: HumanLook[] = [
  { skin: "#A86F45", hair: "#1A110C", hairStyle: "short", outfit: "tshirt", top: "#FF5C00", bottom: "#2F2A28", facial: "stubble", helmet: "#F4F1EC", bag: { kind: "sling", color: "#3A2F2A" } },
  { skin: "#8D5A3B", hair: "#140C08", hairStyle: "short", outfit: "tshirt", top: "#2E7D6B", bottom: "#2B2B2B", facial: "beard", helmet: "#1E1E1E" },
  { skin: "#C68B59", hair: "#140C08", hairStyle: "bun", outfit: "tshirt", top: "#7B2D8E", bottom: "#2B2B2B", helmet: "#F4F1EC", slim: true, height: 0.95 },
];

/** Delivery scooters riding out of the warehouse bays, onto the road and on to the town. */
const SCOOT_PATH: [number, number][] = [
  [14, -76],
  [8.5, -76],
  [4.5, -79],
  [-2.6, -87],
  [-2.6, -150],
];

function DispatchScooter({ i, reduced }: { i: number; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0);
  useFrame(({ clock }, dt) => {
    const grp = g.current;
    if (!grp) return;
    const first = along(SCOOT_PATH, 0);
    const d = (reduced ? 18 + i * 22 : clock.elapsedTime * 5.5 + i * (first.total / 2)) % first.total;
    const a = along(SCOOT_PATH, d, false);
    grp.position.set(a.x, a.x > 11 ? 0.16 : 0.04, a.z);
    grp.rotation.y = a.heading;
    if (!reduced) spin.current += (5.5 / 0.2) * dt;
  });
  return (
    <group ref={g}>
      <Scooter spin={spin} body={i % 2 ? "#C62828" : "#2E7D6B"} box={i % 2 ? "#FED300" : "#FF5C00"} rider={RIDERS[i % RIDERS.length]} />
    </group>
  );
}

export function Traffic({ compact, reduced }: { compact: boolean; reduced: boolean }) {
  const list = compact ? TRAFFIC.filter((_, i) => i % 2 === 0) : TRAFFIC;
  return (
    <group>
      <Hoverable label="Logistics partners: trucks and pickups move ingredients in and orders out">
        <group>
          {list.map((v, i) => (
            <RoadVehicle key={i} v={v} reduced={reduced} />
          ))}
        </group>
      </Hoverable>
      <Hoverable label="Delivery riders leaving the warehouse (channels reaching customers)">
        <group>
          {(compact ? [0] : [0, 1]).map((i) => (
            <DispatchScooter key={i} i={i} reduced={reduced} />
          ))}
        </group>
      </Hoverable>
    </group>
  );
}

/** A truck backed up to the facility's loading dock, being loaded. */
export function DockTruck() {
  return (
    <group position={[6.35, 0, -60.8]} rotation={[0, -Math.PI / 2, 0]}>
      <Truck cab="#F4F1EA" cargo="#550D10" label="EAT BETTER CO  ·  DISPATCH" />
    </group>
  );
}
