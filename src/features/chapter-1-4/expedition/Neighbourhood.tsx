"use client";
/* eslint-disable react-hooks/refs -- the shared walker (sim/walk) is a stable bundle of refs; it is only read inside useFrame and event handlers */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard, RoundedBox } from "@react-three/drei";
import { Person, still, type Look, type Pose } from "@/components/sim/Person";
import { FollowCamera, useKeyboardWalk, useWalker, WalkerController, WalkGround, type Walker } from "@/components/sim/walk";
import { CONSUMERS, LOCATIONS, STUDIO_POS, type Consumer, type LocationId } from "./data";
import { InspectObject, useTextTexture } from "./objects";

export type Pending = { type: "talk" | "inspect"; id: string } | { type: "studio" } | null;

const RESEARCHER: Look = { skin: "#C68B59", top: "#FFF5EE", bottom: "#2F1C1A", hair: "#1E1410", hairStyle: "short", extra: "backpack", extraColor: "#FF5C00" };
const TALK_RANGE = 2.6;


/* ── buildings ────────────────────────────────────────────────── */

function Sign({ text, sub, color, position, rotation = 0, w = 3.4 }: { text: string; sub?: string; color: string; position: [number, number, number]; rotation?: number; w?: number }) {
  const tex = useTextTexture(
    768,
    sub ? 220 : 170,
    "#FFF8EE",
    sub
      ? [
          { text, size: 86, color, y: 90 },
          { text: sub, size: 40, color: "#4A3230", y: 172 },
        ]
      : [{ text, size: 86, color, y: 88 }],
    color,
  );
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <planeGeometry args={[w, (w * (sub ? 220 : 170)) / 768]} />
      <meshStandardMaterial map={tex} roughness={0.7} />
    </mesh>
  );
}

/**
 * An open room the follow-camera can look into (it always looks north, so every room opens towards +z).
 * No roof. `lowBack` = a half-height back wall with a doorway (used where the back faces the plaza).
 */
function Room({ center, w = 8, d = 6, wall, accent, lowBack = false, lite }: { center: [number, number]; w?: number; d?: number; wall: string; accent: string; lowBack?: boolean; lite: boolean }) {
  const [cx, cz] = center;
  const back = cz - d / 2;
  const seg = (w - 1.8) / 2;
  const sideH = lowBack ? 2.2 : 3.2;
  return (
    <group>
      <mesh position={[cx, 0.02, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#EFE3D2" roughness={0.9} />
      </mesh>
      {lowBack ? (
        [-1, 1].map((sx) => (
          <mesh key={sx} position={[cx + sx * (0.9 + seg / 2), 0.55, back]} castShadow={!lite} receiveShadow>
            <boxGeometry args={[seg, 1.1, 0.2]} />
            <meshStandardMaterial color={wall} roughness={0.9} />
          </mesh>
        ))
      ) : (
        <mesh position={[cx, 1.6, back]} castShadow={!lite} receiveShadow>
          <boxGeometry args={[w, 3.2, 0.2]} />
          <meshStandardMaterial color={wall} roughness={0.9} />
        </mesh>
      )}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[cx + sx * (w / 2), sideH / 2, cz]} castShadow={!lite} receiveShadow>
          <boxGeometry args={[0.2, sideH, d]} />
          <meshStandardMaterial color={wall} roughness={0.9} />
        </mesh>
      ))}
      {/* accent trim along the top of the side walls */}
      {[-1, 1].map((sx) => (
        <mesh key={`t${sx}`} position={[cx + sx * (w / 2), sideH + 0.06, cz]}>
          <boxGeometry args={[0.28, 0.12, d + 0.1]} />
          <meshStandardMaterial color={accent} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** a sign on two posts (faces the camera) */
function PostSign({ text, sub, color, x, z, y = 2.3, w = 3.4 }: { text: string; sub?: string; color: string; x: number; z: number; y?: number; w?: number }) {
  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[x + s * (w / 2 - 0.15), y / 2, z - 0.05]}>
          <cylinderGeometry args={[0.05, 0.05, y, 8]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      ))}
      <Sign text={text} sub={sub} color={color} position={[x, y, z]} w={w} />
    </group>
  );
}

function Shelves({ x, z, lite }: { x: number; z: number; lite: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = lite ? 24 : 48;
  const colors = useMemo(() => ["#E53935", "#FBC02D", "#1E88E5", "#8E24AA", "#43A047", "#FB8C00"].map((c) => new THREE.Color(c)), []);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / (n / 4));
      const col = i % (n / 4);
      o.position.set(x - 2.6 + col * (5.2 / (n / 4)), 0.5 + row * 0.5, z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, colors[(i * 7) % colors.length]);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [n, x, z, colors]);
  return (
    <group>
      <mesh position={[x, 1.1, z - 0.15]}>
        <boxGeometry args={[5.6, 2.2, 0.1]} />
        <meshStandardMaterial color="#B98A5E" />
      </mesh>
      {[0, 1, 2, 3].map((r) => (
        <mesh key={r} position={[x, 0.33 + r * 0.5, z]}>
          <boxGeometry args={[5.6, 0.04, 0.4]} />
          <meshStandardMaterial color="#8D6E63" />
        </mesh>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, n]}>
        <boxGeometry args={[0.16, 0.3, 0.16]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
    </group>
  );
}

function Table({ x, z, h = 0.82, w = 1.4, d = 0.9, color = "#B98A5E" }: { x: number; z: number; h?: number; w?: number; d?: number; color?: string }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[w, 0.06, d]} radius={0.02} position={[0, h, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.6} />
      </RoundedBox>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[(sx * (w - 0.12)) / 2, h / 2, (sz * (d - 0.12)) / 2]}>
            <cylinderGeometry args={[0.03, 0.03, h, 8]} />
            <meshStandardMaterial color="#5D4037" />
          </mesh>
        )),
      )}
    </group>
  );
}

function Tree({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.6, 8]} />
        <meshStandardMaterial color="#6D4C41" />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial color="#558B2F" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function Locations({ lite }: { lite: boolean }) {
  const L = LOCATIONS;
  return (
    <group>
      {/* supermarket — entrance faces the plaza */}
      <Room center={L.supermarket.center} wall="#E8F5E9" accent={L.supermarket.color} lite={lite} />
      <Shelves x={-11} z={-11.6} lite={lite} />
      <RoundedBox args={[1.6, 0.9, 0.7]} radius={0.04} position={[-8.2, 0.45, -7.4]} castShadow={!lite}>
        <meshStandardMaterial color="#455A64" />
      </RoundedBox>
      <PostSign text="SUPERMARKET" color={L.supermarket.color} x={-11} z={-12.2} y={3.6} />

      {/* family kitchen */}
      <Room center={L.kitchen.center} wall="#FCE4EC" accent={L.kitchen.color} lite={lite} />
      <RoundedBox args={[4.4, 0.9, 0.8]} radius={0.03} position={[12.4, 0.45, -11.4]} castShadow={!lite}>
        <meshStandardMaterial color="#FFF5EE" />
      </RoundedBox>
      <mesh position={[13.4, 0.93, -11.4]}>
        <boxGeometry args={[1.0, 0.06, 0.6]} />
        <meshStandardMaterial color="#212121" />
      </mesh>
      <Table x={10.4} z={-10.9} />
      <Table x={12.0} z={-9.9} h={0.9} w={1.2} d={0.7} color="#FFF5EE" />
      <PostSign text="FAMILY KITCHEN" color={L.kitchen.color} x={11} z={-12.2} y={3.6} />

      {/* office break area — low wall with a doorway towards the plaza */}
      <Room center={L.office.center} wall="#E3F2FD" accent={L.office.color} lowBack lite={lite} />
      <Table x={-10} z={11.2} w={1.8} d={1.0} color="#ECEFF1" />
      <RoundedBox args={[0.6, 1.1, 0.5]} radius={0.04} position={[-8.0, 0.55, 11.6]} castShadow={!lite}>
        <meshStandardMaterial color="#212121" />
      </RoundedBox>
      <PostSign text="OFFICE · BREAK AREA" color={L.office.color} x={-11} z={5.7} />

      {/* college canteen */}
      <Room center={L.canteen.center} wall="#FFF3E0" accent={L.canteen.color} lowBack lite={lite} />
      <RoundedBox args={[2.6, 1.0, 0.7]} radius={0.03} position={[12.4, 0.5, 6.9]} castShadow={!lite}>
        <meshStandardMaterial color="#8D6E63" />
      </RoundedBox>
      <Table x={11.2} z={10.8} h={0.9} />
      <PostSign text="COLLEGE CANTEEN" sub="Samosa · Pakora · Chips" color={L.canteen.color} x={11} z={5.7} />
    </group>
  );
}

function Studio({ open, onClick }: { open: boolean; onClick: (e: ThreeEvent<MouseEvent>) => void }) {
  const door = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (door.current) (door.current.material as THREE.MeshStandardMaterial).emissiveIntensity = open ? 0.6 + Math.sin(clock.elapsedTime * 3) * 0.3 : 0.05;
  });
  const [x, z] = STUDIO_POS;
  return (
    <group onClick={onClick}>
      <mesh position={[x, 2, z]} castShadow>
        <boxGeometry args={[9, 4, 5]} />
        <meshStandardMaterial color="#2F1C1A" roughness={0.8} />
      </mesh>
      <mesh ref={door} position={[x, 1.2, z + 2.51]}>
        <planeGeometry args={[1.6, 2.4]} />
        <meshStandardMaterial color={open ? "#FF5C00" : "#5D4037"} emissive="#FF5C00" emissiveIntensity={0.05} />
      </mesh>
      <Sign text="RESEARCH STUDIO" sub={open ? "Evidence ready — come in" : "Collect 5 pieces of evidence"} color="#FF5C00" position={[x, 3.2, z + 2.52]} w={4} />
    </group>
  );
}

/* ── consumers ────────────────────────────────────────────────── */

function Marker({ done }: { done: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) {
      g.current.position.y = 2.35 + Math.sin(clock.elapsedTime * 3) * 0.08;
      g.current.rotation.y = clock.elapsedTime * 1.5;
    }
  });
  return (
    <group ref={g}>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.16, 0.3, 4]} />
        <meshStandardMaterial color={done ? "#00A341" : "#FF5C00"} emissive={done ? "#00A341" : "#FF5C00"} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function NameTag({ text, sub }: { text: string; sub: string }) {
  const tex = useTextTexture(512, 150, "#2F1C1A", [
    { text, size: 58, color: "#FFF5EE", y: 56 },
    { text: sub, size: 32, color: "#FED300", y: 116 },
  ]);
  return (
    <Billboard position={[0, 2.75, 0]}>
      <mesh>
        <planeGeometry args={[1.25, 0.37]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

function ConsumerNPC({ c, done, talking, player, onClick }: { c: Consumer; done: boolean; talking: boolean; player: React.RefObject<THREE.Vector3>; onClick: (e: ThreeEvent<MouseEvent>) => void }) {
  const g = useRef<THREE.Group>(null);
  const pose = useRef<Pose>(still());
  useFrame((_, delta) => {
    const grp = g.current;
    if (!grp) return;
    let target = c.face;
    if (talking && player.current) target = Math.atan2(player.current.x - c.pos[0], player.current.z - c.pos[1]);
    grp.rotation.y = THREE.MathUtils.damp(grp.rotation.y, target, 6, delta);
    pose.current.mood = talking ? 1 : 0;
  });
  return (
    <group
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <group ref={g} position={[c.pos[0], 0, c.pos[1]]} rotation={[0, c.face, 0]}>
        <Person look={c.look} pose={pose} />
        {/* bigger invisible hit area for touch */}
        <mesh position={[0, 1, 0]} visible={false}>
          <cylinderGeometry args={[0.55, 0.55, 2.1, 8]} />
        </mesh>
      </group>
      <group position={[c.pos[0], 0, c.pos[1]]}>
        <Marker done={done} />
        <NameTag text={c.name.split(" (")[0]} sub="Fictional consumer" />
      </group>
    </group>
  );
}

function ObjectNPC({ c, inspected, onClick }: { c: Consumer; inspected: boolean; onClick: (e: ThreeEvent<MouseEvent>) => void }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ring.current) {
      const m = ring.current.material as THREE.MeshStandardMaterial;
      m.opacity = inspected ? 0.35 : 0.45 + Math.sin(clock.elapsedTime * 4) * 0.25;
    }
  });
  const [x, y, z] = c.object.pos;
  const big = c.object.kind === "vending";
  return (
    <group
      position={[x, y, z]}
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <group scale={big ? 1 : 0.8}>
        <InspectObject kind={c.object.kind} />
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={big ? [0.85, 0.98, 40] : [0.42, 0.52, 40]} />
        <meshStandardMaterial color={inspected ? "#00A341" : "#FED300"} emissive={inspected ? "#00A341" : "#FED300"} emissiveIntensity={0.8} transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── proximity ──────────────────────────────────────────────── */

/** reports which consumer / location the player is near (only when it changes) */
function Proximity({ walker, onNear, onLocation }: { walker: Walker; onNear: (id: string | null) => void; onLocation: (id: LocationId | "studio" | null) => void }) {
  const last = useRef<{ near: string | null; loc: string | null }>({ near: "x", loc: "x" });
  useFrame(() => {
    const p = walker.ref.current?.position;
    if (!p) return;
    let near: string | null = null;
    let best = TALK_RANGE;
    for (const c of CONSUMERS) {
      const d = Math.hypot(p.x - c.pos[0], p.z - c.pos[1]);
      if (d < best) {
        best = d;
        near = c.id;
      }
    }
    let loc: LocationId | "studio" | null = null;
    for (const [id, l] of Object.entries(LOCATIONS)) if (Math.abs(p.x - l.center[0]) < 4.6 && Math.abs(p.z - l.center[1]) < 3.8) loc = id as LocationId;
    if (Math.hypot(p.x - STUDIO_POS[0], p.z - (STUDIO_POS[1] + 3.2)) < 2.6) loc = "studio";
    if (near !== last.current.near) {
      last.current.near = near;
      onNear(near);
    }
    if (loc !== last.current.loc) {
      last.current.loc = loc;
      onLocation(loc);
    }
  });
  return null;
}

/* ── the neighbourhood scene ──────────────────────────────────── */

export function Neighbourhood({
  lite,
  frozen,
  talkingId,
  status,
  studioOpen,
  onArrive,
  onNear,
  onLocation,
  goRef,
}: {
  lite: boolean;
  frozen: boolean;
  talkingId: string | null;
  status: Record<string, { done: boolean; inspected: boolean }>;
  studioOpen: boolean;
  onArrive: (p: Pending) => void;
  onNear: (id: string | null) => void;
  onLocation: (id: LocationId | "studio" | null) => void;
  /** lets the DOM ask the player to walk somewhere (e.g. the "Talk" button) */
  goRef: React.RefObject<((p: Pending) => void) | null>;
}) {
  const walker = useWalker({ start: [0, 0, 3], speed: 5.2 });
  useKeyboardWalk(walker, !frozen);
  const playerPos = useMemo(() => ({ current: new THREE.Vector3() }), []);
  useFrame(() => {
    if (walker.ref.current) playerPos.current.copy(walker.ref.current.position);
  });

  const go = (p: Pending) => {
    if (!p) return;
    if (p.type === "studio") walker.goTo([STUDIO_POS[0], 0, STUDIO_POS[1] + 3.4], () => onArrive(p));
    else {
      const c = CONSUMERS.find((x) => x.id === p.id)!;
      if (p.type === "talk") walker.goTo([c.pos[0], 0, c.pos[1]], () => onArrive(p), 1.5);
      else walker.goTo([c.object.pos[0], 0, c.object.pos[2]], () => onArrive(p), c.object.kind === "vending" ? 1.6 : 1.15);
    }
  };
  useEffect(() => {
    goRef.current = go;
  });

  const ignore = (e: ThreeEvent<MouseEvent>) => e.delta > 8 || frozen;
  return (
    <>
      <color attach="background" args={["#F6D7B8"]} />
      <fog attach="fog" args={["#F6D7B8", 26, 52]} />
      <hemisphereLight args={["#FFF4E6", "#7A5A3A", 1.1]} />
      <directionalLight position={[-12, 18, 10]} intensity={1.9} castShadow={!lite} shadow-mapSize={[1024, 1024]} shadow-camera-left={-24} shadow-camera-right={24} shadow-camera-top={24} shadow-camera-bottom={-24} />

      {/* ground + roads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#E6D3B3" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[4, 44]} />
        <meshStandardMaterial color="#9E9E9E" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[40, 4]} />
        <meshStandardMaterial color="#9E9E9E" roughness={0.95} />
      </mesh>
      {!lite &&
        Array.from({ length: 10 }, (_, i) => (
          <group key={i}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-18 + i * 4, 0.003, 0]}>
              <planeGeometry args={[1.4, 0.15]} />
              <meshBasicMaterial color="#FFF8E1" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -20 + i * 4]}>
              <planeGeometry args={[0.15, 1.4]} />
              <meshBasicMaterial color="#FFF8E1" />
            </mesh>
          </group>
        ))}
      <WalkGround walker={walker} size={[80, 80]} enabled={!frozen} />

      <Locations lite={lite} />
      <Studio
        open={studioOpen}
        onClick={(e) => {
          if (ignore(e)) return;
          e.stopPropagation();
          go({ type: "studio" });
        }}
      />
      {!lite &&
        [
          [-4, -4],
          [4, -4],
          [-4, 4],
          [4, 4],
          [-16, 0],
          [16, 0],
          [-5, -15],
          [5, -15],
        ].map(([x, z], i) => <Tree key={i} x={x} z={z} s={0.9 + (i % 3) * 0.15} />)}

      {CONSUMERS.map((c) => (
        <group key={c.id}>
          <ConsumerNPC
            c={c}
            done={!!status[c.id]?.done}
            talking={talkingId === c.id}
            player={playerPos}
            onClick={(e) => {
              if (ignore(e)) return;
              e.stopPropagation();
              go({ type: "talk", id: c.id });
            }}
          />
          <ObjectNPC
            c={c}
            inspected={!!status[c.id]?.inspected}
            onClick={(e) => {
              if (ignore(e)) return;
              e.stopPropagation();
              go({ type: "inspect", id: c.id });
            }}
          />
        </group>
      ))}

      <group ref={walker.ref}>
        <Person look={RESEARCHER} pose={walker.pose} />
      </group>
      <WalkerController walker={walker} bounds={[-16.5, 16.5, -22, 16.5]} />
      <FollowCamera target={walker.ref} offset={talkingId ? [0, 4.6, 7] : [0, 8.5, 11.5]} lookHeight={talkingId ? 1.1 : 2.4} />
      <Proximity walker={walker} onNear={onNear} onLocation={onLocation} />
    </>
  );
}
