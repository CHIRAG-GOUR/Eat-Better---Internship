"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * The dining hall around the long kitchen table: tiled floor, table legs, chairs on both
 * sides, Jaipur-style arched walls, hanging brass lanterns and an Eat Better signboard that
 * hangs in the haze ahead of the camera. Everything repeated is instanced (a handful of draw calls).
 *
 * Table top is at y = 0, half-width TABLE_HALF; floor at FLOOR_Y.
 */
export const TABLE_HALF = 6;
const FLOOR_Y = -2.4;
const Z_FROM = 8;
const Z_TO = -68;

function useInstances(count: number, place: (o: THREE.Object3D, i: number) => void) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      o.position.set(0, 0, 0);
      o.rotation.set(0, 0, 0);
      o.scale.set(1, 1, 1);
      place(o, i);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [count, place]);
  return ref;
}

/* ── textures ─────────────────────────────────────────────────── */

function makeTileTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#EFD9C2";
  g.fillRect(0, 0, 256, 256);
  // terracotta lattice tile, Jaipur-inspired
  g.fillStyle = "#D99A6C";
  for (const [x, y] of [
    [0, 0],
    [128, 128],
  ]) {
    g.beginPath();
    g.moveTo(x + 64, y + 10);
    g.lineTo(x + 118, y + 64);
    g.lineTo(x + 64, y + 118);
    g.lineTo(x + 10, y + 64);
    g.closePath();
    g.fill();
  }
  g.fillStyle = "#C8963E";
  for (const [x, y] of [
    [64, 64],
    [192, 192],
    [192, 64],
    [64, 192],
  ]) {
    g.beginPath();
    g.arc(x, y, 7, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = "rgba(90,50,25,0.25)";
  g.lineWidth = 2;
  g.strokeRect(1, 1, 254, 254);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(12, 40);
  t.anisotropy = 8;
  return t;
}

/** Signboard texture: official logo on a cream board (drawn from the SVG at high resolution). */
function useSignTexture() {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const c = document.createElement("canvas");
      c.width = 1600;
      c.height = 820;
      const g = c.getContext("2d")!;
      g.fillStyle = "#FFF5EE";
      g.fillRect(0, 0, c.width, c.height);
      g.strokeStyle = "#FF5C00";
      g.lineWidth = 18;
      g.strokeRect(40, 40, c.width - 80, c.height - 80);
      const w = 1080;
      const h = w * (40 / 83);
      g.drawImage(img, (c.width - w) / 2, 120, w, h);
      g.fillStyle = "#4A3230";
      g.font = "600 64px Fredoka, sans-serif";
      g.textAlign = "center";
      g.fillText("THE JOY OF SNACKING, MADE BETTER", c.width / 2, 120 + h + 110);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
    };
    img.src = "/brand/eat-better-logo.svg";
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

/* ── geometry ─────────────────────────────────────────────────── */

function makeChairGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const add = (g: THREE.BufferGeometry, x: number, y: number, z: number) => {
    g.translate(x, y, z);
    parts.push(g);
  };
  // chair faces +x (towards the table); backrest on -x
  for (const [x, z] of [
    [-0.4, -0.4],
    [0.4, -0.4],
    [-0.4, 0.4],
    [0.4, 0.4],
  ]) {
    add(new THREE.BoxGeometry(0.09, 1.15, 0.09), x, FLOOR_Y + 0.575, z);
  }
  add(new THREE.BoxGeometry(0.96, 0.08, 0.96), 0, FLOOR_Y + 1.18, 0);
  add(new THREE.BoxGeometry(0.09, 1.35, 0.09), -0.42, FLOOR_Y + 1.85, -0.4);
  add(new THREE.BoxGeometry(0.09, 1.35, 0.09), -0.42, FLOOR_Y + 1.85, 0.4);
  add(new THREE.BoxGeometry(0.08, 0.16, 0.9), -0.42, FLOOR_Y + 2.45, 0);
  add(new THREE.BoxGeometry(0.06, 0.1, 0.9), -0.42, FLOOR_Y + 1.95, 0);
  return mergeGeometries(parts)!;
}

function makeArchGeometry(w = 3, h = 5.2) {
  const s = new THREE.Shape();
  const r = w / 2;
  s.moveTo(-r, 0);
  s.lineTo(-r, h - r);
  s.absarc(0, h - r, r, Math.PI, 0, true);
  s.lineTo(r, 0);
  s.closePath();
  return new THREE.ShapeGeometry(s, 20);
}

function makeLanternGeometry() {
  const pts: [number, number][] = [
    [0, -0.42],
    [0.08, -0.4],
    [0.22, -0.28],
    [0.26, -0.05],
    [0.22, 0.15],
    [0.12, 0.26],
    [0.06, 0.36],
    [0, 0.4],
  ];
  return new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)),
    14,
  );
}

/* ── component ────────────────────────────────────────────────── */

export function Hall({ compact }: { compact: boolean }) {
  const { camera } = useThree();
  const tile = useMemo(() => makeTileTexture(), []);
  const chairGeo = useMemo(() => makeChairGeometry(), []);
  const cushionGeo = useMemo(() => new THREE.BoxGeometry(0.82, 0.08, 0.82).translate(0.02, FLOOR_Y + 1.26, 0), []);
  const archGeo = useMemo(() => makeArchGeometry(), []);
  const lanternGeo = useMemo(() => makeLanternGeometry(), []);
  const legGeo = useMemo(() => new THREE.BoxGeometry(0.4, -FLOOR_Y - 0.18, 0.4), []);
  const pillarGeo = useMemo(() => new THREE.BoxGeometry(0.5, 7.2, 0.5), []);
  const ropeGeo = useMemo(() => new THREE.CylinderGeometry(0.015, 0.015, 4.4, 5), []);
  const mats = useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({ map: tile, roughness: 0.55 }),
      wood: new THREE.MeshStandardMaterial({ color: "#6B4126", roughness: 0.6 }),
      cushion: new THREE.MeshStandardMaterial({ color: "#FF5C00", roughness: 0.85 }),
      tableEdge: new THREE.MeshStandardMaterial({ color: "#9C6A43", roughness: 0.6 }),
      wall: new THREE.MeshStandardMaterial({ color: "#F4D4B6", roughness: 0.95 }),
      arch: new THREE.MeshStandardMaterial({ color: "#E7B98F", roughness: 0.9 }),
      archInner: new THREE.MeshStandardMaterial({ color: "#FFE9D2", roughness: 1, emissive: "#FFD9A8", emissiveIntensity: 0.35 }),
      pillar: new THREE.MeshStandardMaterial({ color: "#EBC49E", roughness: 0.85 }),
      brass: new THREE.MeshStandardMaterial({ color: "#D9A84E", metalness: 0.6, roughness: 0.35, emissive: "#8A5414", emissiveIntensity: 0.35 }),
      glow: new THREE.MeshStandardMaterial({ color: "#FFC56B", emissive: "#FF9A2A", emissiveIntensity: 1.6, roughness: 0.4 }),
      rope: new THREE.MeshStandardMaterial({ color: "#4A3230", roughness: 1 }),
    }),
    [tile],
  );
  useEffect(
    () => () => {
      [tile, chairGeo, cushionGeo, archGeo, lanternGeo, legGeo, pillarGeo, ropeGeo].forEach((x) => x.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [tile, chairGeo, cushionGeo, archGeo, lanternGeo, legGeo, pillarGeo, ropeGeo, mats],
  );

  const span = Z_FROM - Z_TO;

  const chairStep = 2.6;
  const chairsPerSide = Math.floor(span / chairStep);
  const chairCount = chairsPerSide * 2;
  const placeChair = useMemo(
    () => (o: THREE.Object3D, i: number) => {
      const side = i < chairsPerSide ? -1 : 1;
      o.position.set(side * (TABLE_HALF + 0.75), 0, Z_FROM - 1 - (i % chairsPerSide) * chairStep);
      o.rotation.y = side < 0 ? 0 : Math.PI; // face the table
    },
    [chairsPerSide],
  );
  const chairs = useInstances(chairCount, placeChair);
  const cushions = useInstances(chairCount, placeChair);

  const legStep = 9;
  const legRows = Math.floor(span / legStep) + 1;
  const placeLeg = useMemo(
    () => (o: THREE.Object3D, i: number) => {
      o.position.set((i % 2 ? 1 : -1) * (TABLE_HALF - 0.5), (FLOOR_Y - 0.18) / 2, Z_FROM - 2 - Math.floor(i / 2) * legStep);
    },
    [],
  );
  const legs = useInstances(legRows * 2, placeLeg);

  const archStep = 6;
  const archCount = Math.floor(span / archStep) * 2;
  const placeArch = useMemo(
    () => (o: THREE.Object3D, i: number) => {
      const side = i % 2 ? 1 : -1;
      o.position.set(side * 10.95, FLOOR_Y, Z_FROM - 3 - Math.floor(i / 2) * archStep);
      o.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    },
    [],
  );
  const placeArchInner = useMemo(
    () => (o: THREE.Object3D, i: number) => {
      placeArch(o, i);
      o.scale.set(0.82, 0.9, 1);
      o.position.x += i % 2 ? -0.02 : 0.02;
    },
    [placeArch],
  );
  const placePillar = useMemo(
    () => (o: THREE.Object3D, i: number) => {
      o.position.set((i % 2 ? 1 : -1) * 10.8, FLOOR_Y + 3.6, Z_FROM - Math.floor(i / 2) * archStep);
    },
    [],
  );
  const arches = useInstances(archCount, placeArch);
  const archInner = useInstances(archCount, placeArchInner);
  const pillars = useInstances(archCount, placePillar);

  const lanternStep = 7;
  const lanternCount = Math.floor(span / lanternStep);
  const placeLantern = useMemo(
    () => (o: THREE.Object3D, i: number) => {
      o.position.set(i % 2 ? 2.4 : -2.4, 4.7, Z_FROM - 4 - i * lanternStep);
    },
    [],
  );
  const placeGlow = useMemo(
    () => (o: THREE.Object3D, i: number) => {
      placeLantern(o, i);
      o.scale.set(0.6, 0.55, 0.6);
    },
    [placeLantern],
  );
  const placeRope = useMemo(
    () => (o: THREE.Object3D, i: number) => {
      placeLantern(o, i);
      o.position.y = 4.7 + 2.2;
    },
    [placeLantern],
  );
  const lanterns = useInstances(lanternCount, placeLantern);
  const lanternGlow = useInstances(lanternCount, placeGlow);
  const ropes = useInstances(lanternCount, placeRope);

  /* signboard that hangs in the haze ahead of the camera */
  const sign = useRef<THREE.Group>(null);
  const signTex = useSignTexture();
  const signMat = useMemo(() => (signTex ? new THREE.MeshBasicMaterial({ map: signTex, fog: false, toneMapped: false }) : null), [signTex]);
  useEffect(() => () => signMat?.dispose(), [signMat]);
  useFrame(() => {
    sign.current?.position.set(compact ? 0 : 1.4, compact ? 3.1 : 2.85, camera.position.z - 19);
  });

  return (
    <group>
      <mesh material={mats.floor} position={[0, FLOOR_Y, (Z_FROM + Z_TO) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, span + 20]} />
      </mesh>
      <mesh material={mats.tableEdge} position={[0, -0.11, (Z_FROM + Z_TO) / 2]} castShadow receiveShadow>
        <boxGeometry args={[TABLE_HALF * 2, 0.2, span]} />
      </mesh>
      <instancedMesh ref={legs} args={[legGeo, mats.wood, legRows * 2]} castShadow />

      <instancedMesh ref={chairs} args={[chairGeo, mats.wood, chairCount]} castShadow receiveShadow />
      <instancedMesh ref={cushions} args={[cushionGeo, mats.cushion, chairCount]} castShadow />

      {[-1, 1].map((side) => (
        <mesh key={side} material={mats.wall} position={[side * 11, FLOOR_Y + 4, (Z_FROM + Z_TO) / 2]} rotation={[0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[span + 20, 12]} />
        </mesh>
      ))}
      <instancedMesh ref={arches} args={[archGeo, mats.arch, archCount]} />
      <instancedMesh ref={archInner} args={[archGeo, mats.archInner, archCount]} />
      <instancedMesh ref={pillars} args={[pillarGeo, mats.pillar, archCount]} />

      {!compact && (
        <>
          <instancedMesh ref={lanterns} args={[lanternGeo, mats.brass, lanternCount]} />
          <instancedMesh ref={lanternGlow} args={[lanternGeo, mats.glow, lanternCount]} />
          <instancedMesh ref={ropes} args={[ropeGeo, mats.rope, lanternCount]} />
        </>
      )}

      <group ref={sign} scale={0.85}>
        {signMat && (
          <>
            <mesh material={signMat}>
              <planeGeometry args={[4.6, 2.36]} />
            </mesh>
            <mesh position={[0, 0, -0.03]} material={mats.brass}>
              <boxGeometry args={[4.85, 2.6, 0.04]} />
            </mesh>
            {[-1.8, 1.8].map((x) => (
              <mesh key={x} position={[x, 2.6, -0.02]} material={mats.rope}>
                <cylinderGeometry args={[0.02, 0.02, 2.8, 5]} />
              </mesh>
            ))}
          </>
        )}
      </group>
    </group>
  );
}
