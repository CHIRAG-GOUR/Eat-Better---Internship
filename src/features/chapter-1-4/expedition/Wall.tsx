"use client";
/* eslint-disable react-hooks/immutability -- three.js objects and refs are mutated inside useFrame / pointer handlers by design */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Line, RoundedBox } from "@react-three/drei";
import { FIT_TABLE } from "../content";
import { CONSUMERS, LOCATIONS, type ProblemId } from "./data";

/**
 * The investigation wall in the Research Studio: a corkboard with one column per recurring problem
 * (the chapter's Problem table). Evidence cards can be dragged (mouse or touch) or tapped-then-placed.
 */

export const COLUMNS: ProblemId[] = ["tasty", "boring", "unsure", "nearby"];
const COL_W = 3.1;
const BOARD = { w: 13.2, h: 7.6, y: 3.9 };
const TRAY_Y = 0.95;
const colX = (i: number) => (i - 1.5) * COL_W;
const PROBLEM_TEXT = Object.fromEntries(FIT_TABLE.map((r) => [r.id, r.problem])) as Record<ProblemId, string>;

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines = 4) {
  const words = text.split(" ");
  let line = "";
  let n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (g.measureText(test).width > maxW && line) {
      if (n === maxLines - 1) {
        g.fillText(`${line}…`, x, y + n * lh);
        return y + (n + 1) * lh;
      }
      g.fillText(line, x, y + n * lh);
      n++;
      line = words[i];
    } else line = test;
  }
  g.fillText(line, x, y + n * lh);
  return y + (n + 1) * lh;
}

function useCardTexture(id: string) {
  const c = CONSUMERS.find((x) => x.id === id)!;
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 640;
    cv.height = 400;
    const g = cv.getContext("2d")!;
    const fam = getComputedStyle(document.body).fontFamily || "sans-serif";
    g.fillStyle = "#FFFDF7";
    g.fillRect(0, 0, 640, 400);
    g.fillStyle = LOCATIONS[c.location].color;
    g.fillRect(0, 0, 640, 64);
    g.fillStyle = "#FFFFFF";
    g.font = `800 34px ${fam}`;
    g.textBaseline = "middle";
    g.fillText(c.name.split(" (")[0], 22, 33);
    g.font = `700 22px ${fam}`;
    g.textAlign = "right";
    g.fillText(LOCATIONS[c.location].name.toUpperCase(), 618, 34);
    g.textAlign = "left";
    g.textBaseline = "alphabetic";
    g.fillStyle = "#FF5C00";
    g.font = `800 20px ${fam}`;
    g.fillText("SAYS", 22, 100);
    g.fillStyle = "#2F1C1A";
    g.font = `600 25px ${fam}`;
    let y = wrap(g, `“${c.says}”`, 22, 130, 596, 30, 2);
    g.fillStyle = "#1E3A8A";
    g.font = `800 20px ${fam}`;
    g.fillText("OBSERVED", 22, y + 12);
    g.fillStyle = "#2F1C1A";
    g.font = `600 25px ${fam}`;
    y = wrap(g, c.observed, 22, y + 42, 596, 30, 2);
    g.fillStyle = "#00A341";
    g.font = `800 20px ${fam}`;
    g.fillText("WHY (WHEN ASKED)", 22, y + 12);
    g.fillStyle = "#2F1C1A";
    g.font = `600 23px ${fam}`;
    wrap(g, c.questions.find((q) => q.id === "why")!.a, 22, y + 40, 596, 27, 3);
    g.strokeStyle = "rgba(47,28,26,0.25)";
    g.lineWidth = 4;
    g.strokeRect(2, 2, 636, 396);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [c]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function useHeaderTexture(p: ProblemId, i: number, glow: boolean) {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 640;
    cv.height = 200;
    const g = cv.getContext("2d")!;
    const fam = getComputedStyle(document.body).fontFamily || "sans-serif";
    g.fillStyle = glow ? "#FED300" : "#2F1C1A";
    g.fillRect(0, 0, 640, 200);
    g.fillStyle = glow ? "#2F1C1A" : "#FED300";
    g.font = `800 26px ${fam}`;
    g.fillText(`PROBLEM ${i + 1}`, 24, 44);
    g.fillStyle = glow ? "#2F1C1A" : "#FFF5EE";
    g.font = `800 38px ${fam}`;
    wrap(g, PROBLEM_TEXT[p], 24, 100, 592, 44, 2);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [p, i, glow]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

const CARD = { w: 2.7, h: 1.69 };

function Card({
  id,
  home,
  state,
  selected,
  onDrop,
  onTap,
}: {
  id: string;
  home: THREE.Vector3;
  state: "tray" | "right" | "wrong";
  selected: boolean;
  onDrop: (id: string, col: number | null) => void;
  onTap: (id: string) => void;
}) {
  const tex = useCardTexture(id);
  const g = useRef<THREE.Group>(null);
  const drag = useRef<{ on: boolean; moved: number; off: THREE.Vector3 }>({ on: false, moved: 0, off: new THREE.Vector3() });
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.25), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    const grp = g.current;
    if (!grp || drag.current.on) return;
    grp.position.x = THREE.MathUtils.damp(grp.position.x, home.x, 10, delta);
    grp.position.y = THREE.MathUtils.damp(grp.position.y, home.y, 10, delta);
    grp.position.z = THREE.MathUtils.damp(grp.position.z, selected ? 0.22 : 0.12, 10, delta);
    grp.rotation.z = THREE.MathUtils.damp(grp.rotation.z, state === "tray" ? 0 : ((id.charCodeAt(0) % 5) - 2) * 0.012, 8, delta);
  });
  const border = state === "right" ? "#00A341" : state === "wrong" ? "#FF5C00" : selected ? "#FED300" : "#C9B9A6";
  return (
    <group
      ref={g}
      position={home.toArray()}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        (e.target as Element).setPointerCapture?.(e.pointerId);
        drag.current.on = true;
        drag.current.moved = 0;
        if (e.ray.intersectPlane(plane, hit) && g.current) drag.current.off.copy(g.current.position).sub(hit);
        document.body.style.cursor = "grabbing";
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (!drag.current.on || !g.current) return;
        e.stopPropagation();
        if (e.ray.intersectPlane(plane, hit)) {
          const next = hit.clone().add(drag.current.off);
          drag.current.moved += next.distanceTo(g.current.position);
          g.current.position.set(next.x, next.y, 0.35);
        }
      }}
      onPointerUp={(e: ThreeEvent<PointerEvent>) => {
        if (!drag.current.on || !g.current) return;
        e.stopPropagation();
        drag.current.on = false;
        document.body.style.cursor = "";
        if (drag.current.moved < 0.15) {
          onTap(id);
          return;
        }
        const p = g.current.position;
        if (p.y < TRAY_Y + CARD.h / 2 + 0.25) onDrop(id, null);
        else onDrop(id, THREE.MathUtils.clamp(Math.round(p.x / COL_W + 1.5), 0, 3));
      }}
      onPointerOver={() => (document.body.style.cursor = "grab")}
      onPointerOut={() => {
        if (!drag.current.on) document.body.style.cursor = "";
      }}
    >
      <RoundedBox args={[CARD.w + 0.08, CARD.h + 0.08, 0.03]} radius={0.03} position={[0, 0, -0.02]}>
        <meshStandardMaterial color={border} roughness={0.6} />
      </RoundedBox>
      <mesh>
        <planeGeometry args={[CARD.w, CARD.h]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
      {/* pin */}
      <mesh position={[0, CARD.h / 2 - 0.08, 0.05]}>
        <sphereGeometry args={[0.07, 14, 10]} />
        <meshStandardMaterial color={state === "wrong" ? "#FF5C00" : "#D32F2F"} metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Header({ p, i, glow, onTap }: { p: ProblemId; i: number; glow: boolean; onTap: (i: number) => void }) {
  const tex = useHeaderTexture(p, i, glow);
  return (
    <mesh
      position={[colX(i), BOARD.y + BOARD.h / 2 - 0.62, 0.06]}
      onClick={(e) => {
        e.stopPropagation();
        onTap(i);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <planeGeometry args={[COL_W - 0.2, (COL_W - 0.2) * (200 / 640)]} />
      <meshStandardMaterial map={tex} roughness={0.7} emissive={glow ? "#FED300" : "#000000"} emissiveIntensity={glow ? 0.25 : 0} />
    </mesh>
  );
}

function Rig() {
  const { camera, size } = useThree();
  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    cam.fov = 42;
    const half = Math.tan(THREE.MathUtils.degToRad(21));
    const fitW = (BOARD.w / 2 + 0.4) / (half * aspect);
    const fitH = (BOARD.h / 2 + 1.2) / half;
    const dist = Math.max(fitW, fitH);
    cam.position.set(0, BOARD.y - 0.3, dist);
    cam.lookAt(0, BOARD.y - 0.6, 0);
    cam.updateProjectionMatrix();
  });
  return null;
}

export function Wall({
  cards,
  placed,
  selected,
  strongest,
  lite,
  onPlace,
  onSelect,
}: {
  cards: string[];
  placed: Record<string, ProblemId | null | undefined>;
  selected: string | null;
  strongest: ProblemId | null;
  lite: boolean;
  onPlace: (id: string, p: ProblemId | null) => void;
  onSelect: (id: string | null) => void;
}) {
  const [, force] = useState(0);
  // home positions: column stacks, or a tray row along the bottom
  const homes = useMemo(() => {
    const out: Record<string, THREE.Vector3> = {};
    const tray = cards.filter((id) => !placed[id]);
    tray.forEach((id, i) => {
      const n = tray.length;
      const spacing = Math.min(CARD.w + 0.15, (BOARD.w - CARD.w) / Math.max(1, n - 1));
      out[id] = new THREE.Vector3((i - (n - 1) / 2) * spacing, TRAY_Y, 0.12 + i * 0.01);
    });
    COLUMNS.forEach((p, ci) => {
      const ids = cards.filter((id) => placed[id] === p);
      ids.forEach((id, k) => {
        out[id] = new THREE.Vector3(colX(ci), BOARD.y + BOARD.h / 2 - 1.85 - k * 0.98, 0.12 + k * 0.02);
      });
    });
    return out;
  }, [cards, placed]);

  const drop = (id: string, col: number | null) => {
    onPlace(id, col === null ? null : COLUMNS[col]);
    onSelect(null);
    force((n) => n + 1);
  };
  const tapHeader = (i: number) => {
    if (selected) drop(selected, i);
  };

  return (
    <>
      <color attach="background" args={["#2F1C1A"]} />
      <hemisphereLight args={["#FFF4E6", "#3A2A20", 1.1]} />
      <directionalLight position={[3, 8, 10]} intensity={1.6} castShadow={!lite} />
      <pointLight position={[0, BOARD.y + 3, 3]} intensity={6} distance={14} color="#FFD08A" />
      <Rig />
      {/* studio wall + corkboard */}
      <mesh position={[0, 4, -0.3]}>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial color="#4A3230" roughness={0.95} />
      </mesh>
      <RoundedBox args={[BOARD.w + 0.4, BOARD.h + 0.4, 0.12]} radius={0.05} position={[0, BOARD.y, -0.08]}>
        <meshStandardMaterial color="#6B4126" roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, BOARD.y, 0]} onClick={() => onSelect(null)}>
        <planeGeometry args={[BOARD.w, BOARD.h]} />
        <meshStandardMaterial color="#C79A6B" roughness={1} />
      </mesh>
      {/* column guides */}
      {[1, 2, 3].map((i) => (
        <mesh key={i} position={[colX(i) - COL_W / 2, BOARD.y + 0.7, 0.01]}>
          <planeGeometry args={[0.03, BOARD.h - 1.6]} />
          <meshBasicMaterial color="#8D6E50" />
        </mesh>
      ))}
      {/* tray strip */}
      <mesh position={[0, TRAY_Y, 0.005]}>
        <planeGeometry args={[BOARD.w, 2.0]} />
        <meshStandardMaterial color="#B98A5E" roughness={1} />
      </mesh>
      {COLUMNS.map((p, i) => (
        <Header key={p} p={p} i={i} glow={strongest === p} onTap={tapHeader} />
      ))}
      {/* strings between related cards (same group) */}
      {COLUMNS.map((p) => {
        const ids = cards.filter((id) => placed[id] === p);
        if (ids.length < 2) return null;
        const pts = ids.map((id) => {
          const h = homes[id];
          return [h.x, h.y + CARD.h / 2 - 0.08, 0.3] as [number, number, number];
        });
        return <Line key={p} points={pts} color="#D32F2F" lineWidth={2.5} />;
      })}
      {cards.map((id) => {
        const p = placed[id];
        const c = CONSUMERS.find((x) => x.id === id)!;
        return <Card key={id} id={id} home={homes[id]} state={!p ? "tray" : p === c.problem ? "right" : "wrong"} selected={selected === id} onDrop={drop} onTap={(x) => onSelect(selected === x ? null : x)} />;
      })}
    </>
  );
}
