"use client";
/* eslint-disable react-hooks/immutability -- material glow is animated inside useFrame by design */

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Hoverable } from "@/components/world/hover";
import { canvasTexture, drawText, mat, TERRACE } from "./kit";
import { Instanced, type Inst } from "./parts";

/**
 * A giant Business Model Canvas laid on the left hillside like a terrace map: nine plots separated by
 * low hedges. The chapter's blocks are lit (3.1: Customer Segments, Value Propositions, Channels,
 * Customer Relationships; 3.2: Key Partners, Key Activities, Key Resources).
 */

type Block = { id: string; lines: string[]; x: number; y: number; w: number; h: number };
const CW = 1536;
const CH = 1024;
const UP = 0.72; // upper section share of the canvas height
const col = CW / 5;
const BLOCKS: Block[] = [
  { id: "KP", lines: ["KEY", "PARTNERS"], x: 0, y: 0, w: col, h: UP },
  { id: "KA", lines: ["KEY", "ACTIVITIES"], x: col, y: 0, w: col, h: UP / 2 },
  { id: "KR", lines: ["KEY", "RESOURCES"], x: col, y: UP / 2, w: col, h: UP / 2 },
  { id: "VP", lines: ["VALUE", "PROPOSITIONS"], x: col * 2, y: 0, w: col, h: UP },
  { id: "CR", lines: ["CUSTOMER", "RELATIONSHIPS"], x: col * 3, y: 0, w: col, h: UP / 2 },
  { id: "CH", lines: ["CHANNELS"], x: col * 3, y: UP / 2, w: col, h: UP / 2 },
  { id: "CS", lines: ["CUSTOMER", "SEGMENTS"], x: col * 4, y: 0, w: col, h: UP },
  { id: "CO", lines: ["COST STRUCTURE"], x: 0, y: UP, w: CW / 2, h: 1 - UP },
  { id: "RS", lines: ["REVENUE STREAMS"], x: CW / 2, y: UP, w: CW / 2, h: 1 - UP },
];
export const LIT: Record<"3.1" | "3.2", string[]> = { "3.1": ["CS", "VP", "CH", "CR"], "3.2": ["KP", "KA", "KR"] };

function draw(lit: string[], emissive: boolean) {
  return canvasTexture(
    CW,
    CH,
    (g) => {
      g.fillStyle = emissive ? "#000000" : "#4F6E33";
      g.fillRect(0, 0, CW, CH);
      for (const b of BLOCKS) {
        const on = lit.includes(b.id);
        const x = b.x + 14;
        const y = b.y * CH + 14;
        const w = b.w - 28;
        const h = b.h * CH - 28;
        if (emissive) {
          g.fillStyle = on ? "#FFFFFF" : "#000000";
          g.fillRect(x, y, w, h);
          continue;
        }
        g.fillStyle = on ? "#FFF3E2" : "#B9C98F";
        g.beginPath();
        g.roundRect(x, y, w, h, 18);
        g.fill();
        if (on) {
          g.strokeStyle = "#FF5C00";
          g.lineWidth = 14;
          g.stroke();
        } else {
          // crop-row texture on the unlit plots
          g.strokeStyle = "rgba(80,100,50,0.25)";
          g.lineWidth = 4;
          for (let ry = y + 20; ry < y + h - 10; ry += 22) {
            g.beginPath();
            g.moveTo(x + 14, ry);
            g.lineTo(x + w - 14, ry);
            g.stroke();
          }
        }
        drawText(g, b.lines, x + w / 2, y + h / 2, w * 0.86, Math.min(h * 0.5, b.lines.length * 64), on ? "#2F1C1A" : "#6F8150");
      }
    },
    !emissive,
  );
}

export function BmcTerrace({ chapter }: { chapter: "3.1" | "3.2" }) {
  const { map, glow } = useMemo(() => ({ map: draw(LIT[chapter], false), glow: draw(LIT[chapter], true) }), [chapter]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ map, emissiveMap: glow, emissive: new THREE.Color("#FFB070"), emissiveIntensity: 0.35, roughness: 0.9 }), [map, glow]);
  useEffect(
    () => () => {
      map.dispose();
      glow.dispose();
      material.dispose();
    },
    [map, glow, material],
  );
  useFrame(({ clock }) => {
    material.emissiveIntensity = 0.32 + Math.sin(clock.elapsedTime * 1.6) * 0.08;
  });
  // hedges along block borders, in the tilted terrace frame (local -x = up the slope, local -z = canvas right)
  const hedges = useMemo<Inst[]>(() => {
    const L = TERRACE.length;
    const Wd = TERRACE.width;
    const toX = (v: number) => -(1 - v) * L; // v = canvas y (0 top … 1 bottom)
    const toZ = (u: number) => (0.5 - u / CW) * Wd;
    const out: Inst[] = [];
    const along = (u: number, v0: number, v1: number) => out.push({ p: [(toX(v0) + toX(v1)) / 2, 0.15, toZ(u)], s: [Math.abs(toX(v1) - toX(v0)), 0.3, 0.32] });
    const across = (v: number, u0: number, u1: number) => out.push({ p: [toX(v), 0.15, (toZ(u0) + toZ(u1)) / 2], s: [0.32, 0.3, Math.abs(toZ(u1) - toZ(u0))] });
    for (const u of [0, col, col * 2, col * 3, col * 4, CW]) along(u, 0, UP);
    for (const u of [0, CW / 2, CW]) along(u, UP, 1);
    across(0, 0, CW);
    across(UP, 0, CW);
    across(1, 0, CW);
    across(UP / 2, col, col * 2);
    across(UP / 2, col * 3, col * 4);
    return out;
  }, []);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useEffect(() => () => box.dispose(), [box]);
  const names = chapter === "3.1" ? "Customer Segments, Value Propositions, Channels, Customer Relationships" : "Key Partners, Key Activities, Key Resources";
  return (
    <Hoverable label={`Business Model Canvas on the hill: this chapter lights ${names}`}>
      <group position={[TERRACE.footX, 0, TERRACE.zc]} rotation={[0, 0, -TERRACE.theta]}>
        <group position={[-TERRACE.length / 2, 0.12, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} material={material} receiveShadow>
              <planeGeometry args={[TERRACE.width, TERRACE.length]} />
            </mesh>
          </group>
        </group>
        <Instanced geometry={box} material={mat("#3F6A2C", 0.9)} items={hedges} castShadow />
      </group>
    </Hoverable>
  );
}
