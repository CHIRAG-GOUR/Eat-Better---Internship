"use client";
/* eslint-disable react-hooks/immutability -- three.js objects are animated inside useFrame by design */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Scooter } from "@/components/world2/StreetLife";
import type { HumanLook } from "@/components/world2/Human";
import { Hoverable } from "@/components/world/hover";
import { canvasTexture, drawText, groundHeight, mat, rng, signTex, star } from "./kit";
import { Instanced, useTex, Near, Walker, Worker, type Inst } from "./parts";

/**
 * The town of customers (z -88 … -150): hillside homes (families, left), a quick-commerce dark store,
 * a college + co-working block (students, young professionals), a festive market (gift buyers), an
 * office tower (corporate buyers) and a phone-shaped billboard of customer reviews (abstract stars).
 */

function Sign({ tex, w, h, position, rotation = 0, glow = 0.15 }: { tex: THREE.Texture; w: number; h: number; position: [number, number, number]; rotation?: number; glow?: number }) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={0.6} emissiveMap={tex} emissive="#FFFFFF" emissiveIntensity={glow} />
    </mesh>
  );
}

/* ── hillside homes ───────────────────────────────────────────── */

const WALLS = ["#F2C14E", "#E8A87C", "#9DC3C2", "#F4E1C1", "#E98A7B", "#C9D7A4", "#B9C7E4", "#F6BD60", "#E4C59E", "#D9A5B8"];

type House = { x: number; z: number; w: number; d: number; floors: number; base: number; foot: number; color: string };

function useHouses(compact: boolean) {
  return useMemo(() => {
    const r = rng(612);
    const list: House[] = [];
    const cols = [-21, -28.5, -36, -43];
    const rows = [-92, -99.5, -107, -114.5, -122, -129.5];
    for (const x0 of cols)
      for (const z0 of rows) {
        if (x0 > -24 && z0 < -118) continue; // market behind
        if (r() < (compact ? 0.45 : 0.15)) continue;
        const x = x0 + (r() - 0.5) * 1.6;
        const z = z0 + (r() - 0.5) * 1.6;
        const w = 4.8 + r() * 1.6;
        const d = 4.6 + r() * 1.4;
        const hs = [groundHeight(x - d / 2, z - w / 2), groundHeight(x + d / 2, z - w / 2), groundHeight(x - d / 2, z + w / 2), groundHeight(x + d / 2, z + w / 2)];
        list.push({ x, z, w, d, floors: r() > 0.45 ? 2 : 1, base: Math.max(...hs) + 0.25, foot: Math.min(...hs) - 0.4, color: WALLS[Math.floor(r() * WALLS.length)] });
      }
    return list;
  }, [compact]);
}

function Homes({ compact }: { compact: boolean }) {
  const houses = useHouses(compact);
  const front = useTex(() =>
    canvasTexture(256, 128, (g) => {
      g.clearRect(0, 0, 256, 128);
      // door
      g.fillStyle = "#6B3F26";
      g.fillRect(104, 34, 48, 94);
      g.fillStyle = "#4E2C1A";
      g.fillRect(126, 34, 4, 94);
      // windows with grills + sunshades
      for (const x of [22, 178]) {
        g.fillStyle = "#3D4B5C";
        g.fillRect(x, 40, 56, 50);
        g.strokeStyle = "#F4EFE6";
        g.lineWidth = 4;
        g.strokeRect(x, 40, 56, 50);
        g.beginPath();
        g.moveTo(x + 28, 40);
        g.lineTo(x + 28, 90);
        g.stroke();
        g.fillStyle = "rgba(60,40,30,0.55)";
        g.fillRect(x - 6, 30, 68, 8);
      }
    }),
  );
  const upper = useTex(() =>
    canvasTexture(256, 128, (g) => {
      g.clearRect(0, 0, 256, 128);
      for (const x of [34, 150]) {
        g.fillStyle = "#3D4B5C";
        g.fillRect(x, 36, 72, 56);
        g.strokeStyle = "#F4EFE6";
        g.lineWidth = 4;
        g.strokeRect(x, 36, 72, 56);
        g.beginPath();
        g.moveTo(x + 36, 36);
        g.lineTo(x + 36, 92);
        g.stroke();
        g.fillStyle = "rgba(60,40,30,0.55)";
        g.fillRect(x - 6, 26, 84, 8);
      }
    }),
  );
  const frontMat = useMemo(() => new THREE.MeshStandardMaterial({ map: front, transparent: true, alphaTest: 0.5, roughness: 0.8 }), [front]);
  const upperMat = useMemo(() => new THREE.MeshStandardMaterial({ map: upper, transparent: true, alphaTest: 0.5, roughness: 0.8 }), [upper]);
  const geos = useMemo(() => ({ box: new THREE.BoxGeometry(1, 1, 1), plane: new THREE.PlaneGeometry(1, 1), tank: new THREE.CylinderGeometry(0.5, 0.5, 1, 14) }), []);
  useEffect(
    () => () => {
      frontMat.dispose();
      upperMat.dispose();
      Object.values(geos).forEach((g) => g.dispose());
    },
    [frontMat, upperMat, geos],
  );
  const sets = useMemo(() => {
    const bodies: Inst[] = [];
    const plinths: Inst[] = [];
    const roofs: Inst[] = [];
    const tanks: Inst[] = [];
    const fronts: Inst[] = [];
    const uppers: Inst[] = [];
    const balconies: Inst[] = [];
    for (const h of houses) {
      const H = h.floors * 3;
      bodies.push({ p: [h.x, h.base + H / 2, h.z], s: [h.d, H, h.w], c: h.color });
      plinths.push({ p: [h.x, (h.base + h.foot) / 2, h.z], s: [h.d + 0.3, h.base - h.foot, h.w + 0.3] });
      roofs.push({ p: [h.x, h.base + H + 0.2, h.z], s: [h.d + 0.25, 0.4, h.w + 0.25] });
      tanks.push({ p: [h.x - h.d * 0.25, h.base + H + 0.9, h.z + h.w * 0.25], s: [1.2, 1.1, 1.2] });
      fronts.push({ p: [h.x + h.d / 2 + 0.02, h.base + 1.3, h.z], r: [0, Math.PI / 2, 0], s: [h.w * 0.92, 2.6, 1] });
      if (h.floors > 1) {
        uppers.push({ p: [h.x + h.d / 2 + 0.02, h.base + 4.4, h.z], r: [0, Math.PI / 2, 0], s: [h.w * 0.92, 2.6, 1] });
        balconies.push({ p: [h.x + h.d / 2 + 0.45, h.base + 3.05, h.z], s: [0.9, 0.14, h.w * 0.7] });
        balconies.push({ p: [h.x + h.d / 2 + 0.86, h.base + 3.45, h.z], s: [0.06, 0.8, h.w * 0.7] });
      }
    }
    return { bodies, plinths, roofs, tanks, fronts, uppers, balconies };
  }, [houses]);
  return (
    <Hoverable label="Homes on the hill: health-conscious families (Customer Segment)">
      <group>
        <Instanced geometry={geos.box} material={mat("#FFFFFF", 0.9)} items={sets.bodies} castShadow={!compact} receiveShadow />
        <Instanced geometry={geos.box} material={mat("#A8957A", 0.95)} items={sets.plinths} receiveShadow />
        <Instanced geometry={geos.box} material={mat("#EDE7DC", 0.85)} items={sets.roofs} castShadow={!compact} />
        <Instanced geometry={geos.tank} material={mat("#2B2B2B", 0.6)} items={sets.tanks} castShadow={!compact} />
        <Instanced geometry={geos.plane} material={frontMat} items={sets.fronts} />
        <Instanced geometry={geos.plane} material={upperMat} items={sets.uppers} />
        <Instanced geometry={geos.box} material={mat("#EDE7DC", 0.85)} items={sets.balconies} />
      </group>
    </Hoverable>
  );
}

/* ── dark store ───────────────────────────────────────────────── */

function DarkStore({ compact, reduced }: { compact: boolean; reduced: boolean }) {
  const sign = useTex(() => signTex("QUICK DELIVERY HUB", "#5B2A86", "#FFFFFF", 1536, 200));
  const shutter = useTex(() => {
    const t = canvasTexture(64, 64, (g) => {
      g.fillStyle = "#B4BBC0";
      g.fillRect(0, 0, 64, 64);
      for (let y = 0; y < 64; y += 8) {
        g.fillStyle = "#949CA2";
        g.fillRect(0, y, 64, 2);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 5);
    return t;
  });
  const spin = useRef(0);
  return (
    <group>
      <Hoverable label="Dark store for quick-commerce apps: orders packed and sent out in minutes (Channel)">
        <group>
          <mesh position={[11.6, 2.3, -93.5]} material={mat("#ECE6F2", 0.85)} castShadow receiveShadow>
            <boxGeometry args={[8, 4.6, 9]} />
          </mesh>
          <mesh position={[11.6, 4.75, -93.5]} material={mat("#5B2A86", 0.7)}>
            <boxGeometry args={[8.2, 0.3, 9.2]} />
          </mesh>
          {[-91.2, -95.8].map((z) => (
            <mesh key={z} position={[7.58, 1.6, z]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[3.4, 3.0]} />
              <meshStandardMaterial map={shutter} roughness={0.5} metalness={0.4} />
            </mesh>
          ))}
          <Sign tex={sign} w={7.4} h={0.96} position={[7.57, 3.7, -93.5]} rotation={-Math.PI / 2} glow={0.25} />
        </group>
      </Hoverable>
      <Near at={[6, -94]} r={58}>
        {[-90.6, -93.4].slice(0, compact ? 1 : 2).map((z, i) => (
          <group key={z} position={[5.4, 0.04, z]} rotation={[0, -Math.PI / 2 + (i ? 0.15 : -0.1), 0]}>
            <Scooter spin={spin} body={i ? "#5B2A86" : "#2E7D6B"} box={i ? "#FED300" : "#5B2A86"} rider={{ skin: i ? "#A86F45" : "#C68B59", hair: "#140C08", hairStyle: "short", outfit: "tshirt", top: "#5B2A86", bottom: "#2B2B2B", facial: i ? "beard" : "stubble", helmet: i ? "#1E1E1E" : "#F4F1EC" }} />
          </group>
        ))}
        {!compact && <Worker look={{ skin: "#8D5A3B", hair: "#1A110C", hairStyle: "side", outfit: "tshirt", top: "#5B2A86", bottom: "#2B2B2B", facial: "stubble", bag: { kind: "backpack", color: "#5B2A86" } }} at={[6.3, -97.3]} face={-2.2} reduced={reduced} />}
      </Near>
    </group>
  );
}

/* ── college + co-working ─────────────────────────────────────── */

function ribbonWindows(cols: number, rows: number, glass: string, wall: string, w = 512, h = 512) {
  return canvasTexture(w, h, (g) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    const cw = w / cols;
    const rh = h / rows;
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        g.fillStyle = glass;
        g.fillRect(i * cw + cw * 0.08, j * rh + rh * 0.22, cw * 0.84, rh * 0.56);
        g.fillStyle = "rgba(255,255,255,0.18)";
        g.fillRect(i * cw + cw * 0.08, j * rh + rh * 0.22, cw * 0.84, rh * 0.08);
      }
  });
}

function College() {
  const facade = useTex(() => ribbonWindows(6, 3, "#3E5468", "#E9DCC6"));
  const sign = useTex(() => signTex("CITY COLLEGE  ·  CO-WORKING", "#1E5AA8", "#FFFFFF", 1536, 180));
  return (
    <Hoverable label="College and co-working block: students and young professionals (Customer Segment)">
      <group>
        <mesh position={[19, 5.25, -112]} castShadow receiveShadow>
          <boxGeometry args={[14, 10.5, 18]} />
          <meshStandardMaterial color="#E9DCC6" roughness={0.85} />
        </mesh>
        <mesh position={[11.98, 5.0, -112]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[17, 9.6]} />
          <meshStandardMaterial map={facade} roughness={0.6} />
        </mesh>
        <mesh position={[19, 10.7, -112]} material={mat("#B5654A", 0.85)}>
          <boxGeometry args={[14.3, 0.4, 18.3]} />
        </mesh>
        {/* entrance portico */}
        <mesh position={[10.6, 3.4, -112]} material={mat("#F4EFE6", 0.8)} castShadow>
          <boxGeometry args={[2.8, 0.3, 6]} />
        </mesh>
        {[-2.6, 2.6].map((dz) => (
          <mesh key={dz} position={[9.5, 1.7, -112 + dz]} material={mat("#F4EFE6", 0.8)} castShadow>
            <cylinderGeometry args={[0.18, 0.2, 3.4, 12]} />
          </mesh>
        ))}
        <Sign tex={sign} w={9} h={1.05} position={[11.94, 9.9, -112]} rotation={-Math.PI / 2} />
        {/* forecourt */}
        <mesh position={[9.6, 0.05, -112]} material={mat("#D8CDBA", 0.9)} receiveShadow>
          <boxGeometry args={[4.8, 0.1, 20]} />
        </mesh>
      </group>
    </Hoverable>
  );
}

/* ── office tower ─────────────────────────────────────────────── */

function OfficeTower() {
  const glass = useTex(() => {
    const t = canvasTexture(256, 512, (g) => {
      const grd = g.createLinearGradient(0, 0, 256, 512);
      grd.addColorStop(0, "#9CC3DD");
      grd.addColorStop(1, "#4D7491");
      g.fillStyle = grd;
      g.fillRect(0, 0, 256, 512);
      g.fillStyle = "#2D3E4C";
      for (let x = 0; x <= 256; x += 32) g.fillRect(x, 0, 3, 512);
      for (let y = 0; y <= 512; y += 40) g.fillRect(0, y, 256, 5);
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
  const sign = useTex(() => signTex("BUSINESS PARK", "#2F1C1A", "#FFFFFF", 1024, 200));
  const glassMat = useMemo(() => new THREE.MeshStandardMaterial({ map: glass, roughness: 0.15, metalness: 0.55 }), [glass]);
  useEffect(() => () => glassMat.dispose(), [glassMat]);
  return (
    <Hoverable label="Office tower: corporate buyers order gift hampers and bulk boxes (Customer Segment)">
      <group>
        <mesh position={[18, 13.5, -135]} material={glassMat} castShadow receiveShadow>
          <boxGeometry args={[10, 26, 10]} />
        </mesh>
        <mesh position={[18, 26.7, -135]} material={mat("#3B4650", 0.5, 0.4)}>
          <boxGeometry args={[10.4, 0.6, 10.4]} />
        </mesh>
        <mesh position={[18, 1.6, -135]} material={mat("#2E3A44", 0.3, 0.3)}>
          <boxGeometry args={[10.3, 3.2, 10.3]} />
        </mesh>
        <mesh position={[12.4, 3.4, -135]} material={mat("#E9E6E0", 0.7)} castShadow>
          <boxGeometry args={[1.6, 0.25, 5]} />
        </mesh>
        <Sign tex={sign} w={7.6} h={1.5} position={[12.88, 24.5, -135]} rotation={-Math.PI / 2} glow={0.2} />
        <mesh position={[10.4, 0.05, -135]} material={mat("#D8D3CA", 0.9)} receiveShadow>
          <boxGeometry args={[4.6, 0.1, 14]} />
        </mesh>
        {/* gift hampers stacked for a corporate order */}
        {[0, 1, 2, 3, 4].map((k) => (
          <RoundedBox key={k} args={[0.7, 0.45, 0.55]} radius={0.04} position={[11.2 + (k % 3) * 0.75 - (k > 2 ? -0.35 : 0), 0.33 + (k > 2 ? 0.46 : 0), -130.6]} material={mat(k % 2 ? "#550D10" : "#FF5C00", 0.55)} castShadow />
        ))}
      </group>
    </Hoverable>
  );
}

/* ── festive market ───────────────────────────────────────────── */

const STALLS = [
  { z: -125.2, canopy: "#FF5C00", goods: "#C2185B" },
  { z: -129.0, canopy: "#550D10", goods: "#F2B33A" },
  { z: -132.8, canopy: "#2E7D6B", goods: "#FF5C00" },
  { z: -136.6, canopy: "#C9A400", goods: "#7B2D8E" },
];

function Market({ compact, reduced }: { compact: boolean; reduced: boolean }) {
  const canopyMats = useMemo(
    () =>
      STALLS.map(
        (s) =>
          new THREE.MeshStandardMaterial({
            map: canvasTexture(256, 32, (g) => {
              for (let i = 0; i < 8; i++) {
                g.fillStyle = i % 2 ? "#FFF5EE" : s.canopy;
                g.fillRect(i * 32, 0, 32, 32);
              }
            }),
            roughness: 0.8,
          }),
      ),
    [],
  );
  useEffect(
    () => () =>
      canopyMats.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      }),
    [canopyMats],
  );
  const arch = useTex(() => signTex("FESTIVE MARKET", "#550D10", "#FED300", 1536, 220));
  const bulbMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#FFE6B0", emissive: new THREE.Color("#FFB84D"), emissiveIntensity: 1.6, toneMapped: false }), []);
  useEffect(() => () => bulbMat.dispose(), [bulbMat]);
  useFrame(({ clock }) => {
    if (!reduced) bulbMat.emissiveIntensity = 1.4 + Math.sin(clock.elapsedTime * 3) * 0.4;
  });
  const geos = useMemo(() => ({ bulb: new THREE.SphereGeometry(0.06, 8, 6), box: new THREE.BoxGeometry(1, 1, 1), lantern: new THREE.OctahedronGeometry(0.3, 0), flower: new THREE.SphereGeometry(0.07, 6, 5) }), []);
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);
  const sets = useMemo(() => {
    const r = rng(19);
    const bulbs: Inst[] = [];
    const gifts: Inst[] = [];
    const lanterns: Inst[] = [];
    const flowers: Inst[] = [];
    // light strings along the stall fronts and across the lane
    for (let k = 0; k < 4; k++) {
      const z0 = -123.5 - k * 4;
      for (let i = 0; i <= 18; i++) {
        const t = i / 18;
        bulbs.push({ p: [-7.6, 3.4 - Math.sin(t * Math.PI) * 0.5, z0 - t * 4] });
      }
    }
    for (let k = 0; k < 3; k++) {
      const z = -127 - k * 4;
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        bulbs.push({ p: [-7.6 + t * 4.4, 4.0 - Math.sin(t * Math.PI) * 0.6, z] });
      }
    }
    STALLS.forEach((s, si) => {
      for (let i = 0; i < 7; i++) {
        const h = 0.18 + r() * 0.14;
        gifts.push({ p: [-8.9 + (r() - 0.5) * 0.4, 1.0 + h / 2, s.z - 1.2 + i * 0.4], s: [0.32, h, 0.3], r: [0, r(), 0], c: [s.goods, "#FF5C00", "#550D10", "#FED300"][i % 4] });
      }
      lanterns.push({ p: [-7.9, 2.75, s.z], s: [1, 1.3, 1], c: si % 2 ? "#FF7A1A" : "#FFC107" });
      // marigold garland along the canopy edge
      for (let i = 0; i < 16; i++) {
        const t = i / 15;
        flowers.push({ p: [-7.95, 3.0 - Math.sin(t * Math.PI) * 0.22, s.z - 1.6 + t * 3.2], c: i % 3 ? "#F59E0B" : "#EA580C" });
      }
    });
    return { bulbs: compact ? bulbs.filter((_, i) => i % 2 === 0) : bulbs, gifts, lanterns, flowers };
  }, [compact]);
  const wood = mat("#7A5233", 0.85);
  return (
    <Hoverable label="Festive market: gift buyers shopping for festivals and personal gifting (Customer Segment)">
      <group>
        {STALLS.map((s, i) => (
          <group key={s.z}>
            {/* counter + back + posts + canopy */}
            <mesh material={wood} position={[-9.1, 0.5, s.z]} castShadow>
              <boxGeometry args={[1.1, 1.0, 3.4]} />
            </mesh>
            <mesh material={mat("#E9DFC9", 0.85)} position={[-11.2, 1.5, s.z]}>
              <boxGeometry args={[0.15, 3.0, 3.6]} />
            </mesh>
            {[-1.7, 1.7].map((dz) => (
              <mesh key={dz} material={wood} position={[-8.05, 1.5, s.z + dz]}>
                <cylinderGeometry args={[0.05, 0.05, 3.0, 8]} />
              </mesh>
            ))}
            <mesh position={[-9.5, 3.15, s.z]} rotation={[0, Math.PI / 2, 0.28]} material={canopyMats[i]} castShadow>
              <boxGeometry args={[3.8, 0.05, 3.5]} />
            </mesh>
          </group>
        ))}
        <Instanced geometry={geos.box} material={mat("#FFFFFF", 0.5)} items={sets.gifts} castShadow={!compact} />
        <Instanced geometry={geos.bulb} material={bulbMat} items={sets.bulbs} />
        <Instanced geometry={geos.lantern} material={mat("#FFFFFF", 0.6, 0, { emissive: "#FF8A00", ei: 0.6 })} items={sets.lanterns} />
        <Instanced geometry={geos.flower} material={mat("#FFFFFF", 0.8)} items={sets.flowers} />
        {/* entrance arch */}
        {[-4.4, -12.6].map((x) => (
          <mesh key={x} material={mat("#550D10", 0.6)} position={[x, 2.4, -122.4]} castShadow>
            <boxGeometry args={[0.35, 4.8, 0.35]} />
          </mesh>
        ))}
        <Sign tex={arch} w={8.6} h={1.15} position={[-8.5, 4.55, -122.25]} glow={0.3} />
        <mesh material={mat("#550D10", 0.6)} position={[-8.5, 4.55, -122.42]}>
          <boxGeometry args={[8.9, 1.35, 0.25]} />
        </mesh>
        {/* pavement */}
        <mesh position={[-8, 0.04, -130.5]} material={mat("#CDBFA6", 0.9)} receiveShadow>
          <boxGeometry args={[9, 0.08, 17]} />
        </mesh>
      </group>
    </Hoverable>
  );
}

/* ── review billboard (phone shaped) ──────────────────────────── */

function reviewScreen() {
  return canvasTexture(512, 1024, (g) => {
    g.fillStyle = "#FFF9F3";
    g.fillRect(0, 0, 512, 1024);
    g.fillStyle = "#2F1C1A";
    g.fillRect(0, 0, 512, 120);
    drawText(g, ["REVIEWS"], 256, 64, 400, 70, "#FFF5EE");
    // overall rating stars
    for (let i = 0; i < 5; i++) {
      star(g, 96 + i * 80, 200, 34);
      g.fillStyle = i < 4 ? "#F5A623" : "#F7CF8A";
      g.fill();
    }
    // bars
    for (let i = 0; i < 5; i++) {
      g.fillStyle = "#EADFD3";
      g.fillRect(60, 262 + i * 26, 392, 12);
      g.fillStyle = "#FF5C00";
      g.fillRect(60, 262 + i * 26, 392 * [0.86, 0.62, 0.3, 0.14, 0.06][i], 12);
    }
    // review cards
    const avatars = ["#2E7D6B", "#C2185B", "#1E5AA8", "#C9A400"];
    for (let k = 0; k < 4; k++) {
      const y = 410 + k * 148;
      g.fillStyle = "#FFFFFF";
      g.strokeStyle = "#E7D9CB";
      g.lineWidth = 3;
      g.beginPath();
      g.roundRect(36, y, 440, 128, 18);
      g.fill();
      g.stroke();
      g.fillStyle = avatars[k];
      g.beginPath();
      g.arc(84, y + 46, 26, 0, Math.PI * 2);
      g.fill();
      for (let i = 0; i < 5; i++) {
        star(g, 140 + i * 34, y + 36, 14);
        g.fillStyle = i < (k === 2 ? 4 : 5) ? "#F5A623" : "#E2D6C8";
        g.fill();
      }
      g.fillStyle = "#D8CBBE";
      g.fillRect(124, y + 64, 300, 12);
      g.fillRect(124, y + 88, 220, 12);
    }
  });
}

function ReviewPhone() {
  const screen = useTex(reviewScreen);
  return (
    <Hoverable label="Reviews and ratings: how customers build trust for the next buyer (Customer Relationships)">
      <group position={[6.5, 0, -150]} rotation={[0, -0.32, 0]}>
        {[-1.4, 1.4].map((x) => (
          <mesh key={x} position={[x, 1.2, -0.3]} material={mat("#3A3330", 0.5, 0.4)} castShadow>
            <cylinderGeometry args={[0.14, 0.16, 2.4, 10]} />
          </mesh>
        ))}
        <RoundedBox args={[4.8, 9.4, 0.4]} radius={0.5} smoothness={4} position={[0, 6.9, -0.3]} material={mat("#1E1B1A", 0.35, 0.3)} castShadow />
        <mesh position={[0, 6.9, -0.08]}>
          <planeGeometry args={[4.3, 8.6]} />
          <meshStandardMaterial map={screen} emissiveMap={screen} emissive="#FFFFFF" emissiveIntensity={0.35} roughness={0.35} />
        </mesh>
        <mesh position={[0, 11.05, -0.07]} material={mat("#111111", 0.4)}>
          <circleGeometry args={[0.12, 14]} />
        </mesh>
      </group>
    </Hoverable>
  );
}

/* ── town people ──────────────────────────────────────────────── */

const P: Record<string, HumanLook> = {
  mum: { skin: "#B5764A", hair: "#140C08", hairStyle: "long", outfit: "salwar", top: "#26A69A", bottom: "#F3E5D0", accent: "#FED300", bindi: true, slim: true, height: 0.94, bag: { kind: "shoulder", color: "#7A4B2A" } },
  dad: { skin: "#C68B59", hair: "#1E1410", hairStyle: "side", outfit: "shirt", top: "#E9EEF3", bottom: "#33475B", accent: "#FFFFFF", facial: "stubble" },
  kid: { skin: "#C68B59", hair: "#1E1410", hairStyle: "short", outfit: "tshirt", top: "#FED300", bottom: "#1E5AA8", height: 0.72, slim: true, shoe: "#EDEDED" },
  gran: { skin: "#A86B45", hair: "#CFC8C0", hairStyle: "bun", outfit: "saree", top: "#8E3B5A", bottom: "#8E3B5A", accent: "#F2D3A0", bindi: true, slim: true, height: 0.92, glasses: "#3A2A1E" },
  stuA: { skin: "#D1A276", hair: "#2A1A12", hairStyle: "curly", outfit: "tshirt", top: "#3E8E41", bottom: "#33475B", shoe: "#EDEDED", bag: { kind: "backpack", color: "#35401D" } },
  stuB: { skin: "#9C6644", hair: "#140C08", hairStyle: "braid", outfit: "salwar", top: "#F48FB1", bottom: "#ECE2D0", accent: "#FFFFFF", slim: true, height: 0.95, bag: { kind: "backpack", color: "#1565C0" } },
  stuC: { skin: "#8D5A3B", hair: "#1A110C", hairStyle: "short", outfit: "hoodie", top: "#4A4E69", bottom: "#2B2B2B", facial: "beard", shoe: "#F2F2F2", bag: { kind: "sling", color: "#222222" } },
  pro: { skin: "#D9A066", hair: "#3E2723", hairStyle: "bun", outfit: "shirt", top: "#E98A7B", bottom: "#2B3A55", accent: "#F7D2CB", slim: true, height: 0.95, glasses: "#1A1A1A", bag: { kind: "shoulder", color: "#2F2A28" } },
  vendor: { skin: "#8D5A3B", hair: "#1A110C", hairStyle: "short", outfit: "kurta", top: "#F2B33A", bottom: "#F4EFE6", facial: "moustache" },
  vendor2: { skin: "#A86B45", hair: "#140C08", hairStyle: "bun", outfit: "saree", top: "#2E7D6B", bottom: "#2E7D6B", accent: "#F2C14E", bindi: true, slim: true, height: 0.94 },
  shopA: { skin: "#B98157", hair: "#1E1410", hairStyle: "long", outfit: "saree", top: "#C2185B", bottom: "#C2185B", accent: "#F2A900", bindi: true, slim: true, height: 0.95, bag: { kind: "shoulder", color: "#7A4B2A" } },
  shopB: { skin: "#C68B59", hair: "#1E1410", hairStyle: "side", outfit: "kurta", top: "#7B2D26", bottom: "#E8DCC8", facial: "beard" },
  corpA: { skin: "#C68B59", hair: "#1E1410", hairStyle: "short", outfit: "shirt", top: "#4A5560", bottom: "#2F2A28", accent: "#DDE3E8", glasses: "#2F1C1A", bag: { kind: "shoulder", color: "#2F2A28" } },
  corpB: { skin: "#8D5A3B", hair: "#1A110C", hairStyle: "bun", outfit: "shirt", top: "#F4F1EC", bottom: "#35401D", accent: "#FFFFFF", slim: true, height: 0.95 },
};

function TownPeople({ compact, reduced }: { compact: boolean; reduced: boolean }) {
  return (
    <>
      <Near at={[-15, -105]} r={60}>
        <Walker look={P.dad} a={[-15.9, -92]} b={[-15.9, -118]} speed={0.95} reduced={reduced} />
        <Walker look={P.mum} a={[-15.1, -91]} b={[-15.1, -117]} speed={0.95} reduced={reduced} />
        {!compact && <Walker look={P.kid} a={[-14.4, -93.2]} b={[-14.4, -119.2]} speed={0.95} reduced={reduced} />}
        {!compact && <Worker look={P.gran} at={[-18.6, -101]} face={Math.PI / 2 - 0.3} reduced={reduced} />}
      </Near>
      <Near at={[9, -112]} r={58}>
        <Walker look={P.stuA} a={[8.2, -102]} b={[8.2, -122]} speed={1.25} reduced={reduced} />
        <Walker look={P.stuB} a={[7.4, -121]} b={[7.4, -103]} speed={1.05} phase={0.3} reduced={reduced} />
        {!compact && <Worker look={P.stuC} at={[10.1, -116.2]} face={-2.1} reduced={reduced} phase={1} />}
        {!compact && <Worker look={P.pro} at={[9.2, -117.1]} face={1.0} reduced={reduced} phase={2} />}
      </Near>
      <Near at={[-7, -131]} r={58}>
        <Worker look={P.vendor} at={[-10.3, -129]} face={Math.PI / 2} reduced={reduced} />
        {!compact && <Worker look={P.vendor2} at={[-10.3, -136.6]} face={Math.PI / 2 + 0.2} reduced={reduced} phase={1.4} />}
        <Walker look={P.shopA} a={[-5.3, -123.5]} b={[-5.3, -139]} speed={0.8} reduced={reduced} />
        {!compact && <Walker look={P.shopB} a={[-6.2, -138.5]} b={[-6.2, -124]} speed={0.9} phase={0.5} reduced={reduced} />}
        {!compact && <Worker look={P.dad} at={[-7.4, -132.8]} face={-Math.PI / 2} reduced={reduced} phase={0.6} />}
      </Near>
      <Near at={[10, -135]} r={58}>
        <Walker look={P.corpA} a={[9.3, -127]} b={[9.3, -142]} speed={1.15} reduced={reduced} />
        {!compact && <Walker look={P.corpB} a={[10.0, -141]} b={[10.0, -128]} speed={1.0} phase={0.4} reduced={reduced} />}
      </Near>
    </>
  );
}

export function Town({ compact, reduced }: { compact: boolean; reduced: boolean }) {
  return (
    <group>
      <Homes compact={compact} />
      <DarkStore compact={compact} reduced={reduced} />
      <College />
      <OfficeTower />
      <Market compact={compact} reduced={reduced} />
      <ReviewPhone />
      <TownPeople compact={compact} reduced={reduced} />
    </group>
  );
}
