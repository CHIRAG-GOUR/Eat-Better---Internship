"use client";
/* eslint-disable react-hooks/immutability --
   three.js textures/materials, the WebGL canvas and camera-controls are imperative
   objects owned by this module; mutating them (needsUpdate, cursor, enabled) is the
   intended R3F pattern and does not affect React state. */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import type { CameraControls } from "@react-three/drei";
import { PACK_DIMS, rectToUV, uvToFront, type AtlasLayout } from "../art/atlas";
import { elementBox } from "../art/drawArtwork";
import { mixHex } from "../art/color";
import type { Artwork } from "../useArtwork";
import type { FinishId, PackDesign } from "../types";
import { useStudio } from "../store";
import { makeGusset, makePillowPanel, planeWithUV, remapUV } from "./geometry";

/* ── texture from the artwork canvas ──────────────────────────── */

function useAtlasTexture(art: Artwork) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const w = art.atlas?.width;
  const h = art.atlas?.height;
  const tex = useMemo(() => {
    if (!art.canvas || !w || !h) return null;
    const t = new THREE.CanvasTexture(art.canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return t;
  }, [art.canvas, w, h, gl]);
  useEffect(() => () => tex?.dispose(), [tex]);
  useEffect(() => {
    if (!tex) return;
    tex.needsUpdate = true;
    invalidate();
  }, [tex, art.version, invalidate]);
  return tex;
}

/* ── materials by finish ──────────────────────────────────────── */

function filmMaterial(finish: FinishId, map: THREE.Texture | null, rigid = false) {
  const m = new THREE.MeshPhysicalMaterial({ map, side: THREE.FrontSide });
  if (finish === "gloss") {
    m.roughness = rigid ? 0.42 : 0.36;
    m.clearcoat = rigid ? 0.55 : 1;
    m.clearcoatRoughness = 0.12;
  } else if (finish === "matte") {
    m.roughness = 0.82;
    m.clearcoat = 0;
    m.sheen = 0.25;
    m.sheenRoughness = 0.8;
  } else {
    m.roughness = 0.96;
    m.clearcoat = 0;
  }
  return m;
}

function useFilmMaterial(finish: FinishId, map: THREE.Texture | null, rigid = false) {
  const mat = useMemo(() => filmMaterial(finish, map, rigid), [finish, map, rigid]);
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

/* ── drag-to-place on the 3D surface ──────────────────────────── */

type DragHandlers = {
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
};

function useSurfaceDrag(design: PackDesign, atlas: AtlasLayout | null, enabled: boolean): DragHandlers | undefined {
  const controls = useThree((s) => s.controls) as CameraControls | null;
  const gl = useThree((s) => s.gl);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const designRef = useRef(design);
  useEffect(() => {
    designRef.current = design;
  }, [design]);

  return useMemo(() => {
    if (!enabled || !atlas) return undefined;
    const hitElement = (x: number, y: number) => {
      const f = atlas.front;
      const px = f.x + x * f.w;
      const py = f.y + y * f.h;
      const els = designRef.current.elements;
      for (let i = els.length - 1; i >= 0; i--) {
        const b = elementBox(els[i], f);
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return els[i];
      }
      return null;
    };
    return {
      onPointerDown: (e) => {
        if (!e.uv) return;
        const hit = uvToFront(e.uv.x, e.uv.y, atlas);
        if (!hit) return;
        const el = hitElement(hit.x, hit.y);
        if (!el) return;
        e.stopPropagation();
        useStudio.getState().select(el.id);
        drag.current = { id: el.id, dx: hit.x - el.x, dy: hit.y - el.y };
        if (controls) controls.enabled = false;
        (e.target as unknown as Element).setPointerCapture?.(e.pointerId);
        gl.domElement.style.cursor = "grabbing";
      },
      onPointerMove: (e) => {
        const d = drag.current;
        if (!d || !e.uv) return;
        const hit = uvToFront(e.uv.x, e.uv.y, atlas);
        if (!hit) return;
        e.stopPropagation();
        const x = Math.min(1.05, Math.max(-0.05, hit.x - d.dx));
        const y = Math.min(1.05, Math.max(-0.05, hit.y - d.dy));
        useStudio.getState().patchElement(d.id, { x, y }, true);
      },
      onPointerUp: (e) => {
        if (!drag.current) return;
        drag.current = null;
        useStudio.getState().commit();
        if (controls) controls.enabled = true;
        (e.target as unknown as Element).releasePointerCapture?.(e.pointerId);
        gl.domElement.style.cursor = "";
      },
      onPointerOver: () => {
        gl.domElement.style.cursor = "grab";
      },
      onPointerOut: () => {
        if (!drag.current) gl.domElement.style.cursor = "";
      },
    };
  }, [enabled, atlas, controls, gl]);
}

/* ── entrance animation shared by all packs ───────────────────── */

function useEntrance(group: React.RefObject<THREE.Group | null>) {
  const invalidate = useThree((s) => s.invalidate);
  const t = useRef(0);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g || t.current >= 1) return;
    t.current = Math.min(1, t.current + dt * 1.6);
    const k = 1 - Math.pow(1 - t.current, 3);
    const overshoot = Math.sin(k * Math.PI) * 0.035;
    g.position.y = (1 - k) * 0.5;
    g.scale.setScalar(0.9 + 0.1 * k + overshoot);
    g.rotation.y = (1 - k) * -0.5;
    invalidate();
  });
}

/* ── formats ──────────────────────────────────────────────────── */

type PackProps = {
  design: PackDesign;
  art: Artwork;
  interactive?: boolean;
  lidOpen?: boolean;
};

function FlexiblePack({ design, art, interactive }: PackProps) {
  const kind = design.format === "sachet" ? "sachet" : "pouch";
  const dims = kind === "sachet" ? PACK_DIMS.sachet : PACK_DIMS.pouch;
  const tex = useAtlasTexture(art);
  const mat = useFilmMaterial(design.finish, tex);
  const atlas = art.atlas;
  const opts = useMemo(() => ({ w: dims.w, h: dims.h, depth: dims.depth, kind } as const), [dims, kind]);

  const geo = useMemo(() => {
    if (!atlas || atlas.width === undefined) return null;
    const front = makePillowPanel(opts, rectToUV(atlas.front, atlas));
    const back = makePillowPanel(opts, rectToUV(atlas.back, atlas));
    back.rotateY(Math.PI);
    const gusset = kind === "pouch" ? makeGusset(opts) : null;
    return { front, back, gusset };
  }, [atlas, opts, kind]);
  useEffect(() => () => {
    geo?.front.dispose();
    geo?.back.dispose();
    geo?.gusset?.dispose();
  }, [geo]);

  const gussetMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: mixHex(design.colors.band, "#000000", 0.15), roughness: 0.6 }),
    [design.colors.band],
  );
  useEffect(() => () => gussetMat.dispose(), [gussetMat]);
  const handlers = useSurfaceDrag(design, atlas, !!interactive);

  if (!geo) return null;
  return (
    <group position={[0, dims.h / 2, 0]}>
      <mesh geometry={geo.front} material={mat} castShadow receiveShadow {...handlers} />
      <mesh geometry={geo.back} material={mat} castShadow receiveShadow />
      {geo.gusset && <mesh geometry={geo.gusset} material={gussetMat} />}
    </group>
  );
}

const FLAVOUR_TONES = ["#D39F5B", "#EED8C3", "#F3D59C", "#E8742A", "#F0A33A", "#E9DCC8"];

function Carton({ design, art, interactive, lidOpen }: PackProps) {
  const { w, h, d } = PACK_DIMS.carton;
  const tex = useAtlasTexture(art);
  const mat = useFilmMaterial(design.finish, tex, true);
  const atlas = art.atlas;
  const invalidate = useThree((s) => s.invalidate);
  const lid = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    if (!atlas?.left) return null;
    const uv = (r: NonNullable<AtlasLayout["left"]>) => rectToUV(r, atlas);
    return {
      front: planeWithUV(w, h, uv(atlas.front)),
      back: planeWithUV(w, h, uv(atlas.back)),
      left: planeWithUV(d, h, uv(atlas.left!)),
      right: planeWithUV(d, h, uv(atlas.right!)),
      bottom: planeWithUV(w, d, uv(atlas.bottom!)),
      top: planeWithUV(w, d, uv(atlas.top!)),
    };
  }, [atlas, w, h, d]);
  useEffect(
    () => () => {
      if (geo) Object.values(geo).forEach((g) => g.dispose());
    },
    [geo],
  );

  const liner = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#F3E4D2", roughness: 0.9, side: THREE.BackSide }),
    [],
  );
  const linerTop = useMemo(() => new THREE.MeshStandardMaterial({ color: "#EAD6C0", roughness: 0.9 }), []);
  const packMats = useMemo(
    () => FLAVOUR_TONES.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.05 })),
    [],
  );
  useEffect(
    () => () => {
      liner.dispose();
      linerTop.dispose();
      packMats.forEach((m) => m.dispose());
    },
    [liner, linerTop, packMats],
  );
  const miniPack = useMemo(() => {
    const o = { w: 0.3, h: 1.12, depth: 0.05, kind: "sachet" as const, segX: 16, segY: 24 };
    const uv = { u0: 0, u1: 1, v0: 0, v1: 1 };
    const f = makePillowPanel(o, uv);
    const b = makePillowPanel(o, uv);
    b.rotateY(Math.PI);
    return { f, b };
  }, []);
  useEffect(() => () => {
    miniPack.f.dispose();
    miniPack.b.dispose();
  }, [miniPack]);

  useFrame((_, dt) => {
    const g = lid.current;
    if (!g) return;
    const target = lidOpen ? -1.95 : 0;
    const next = THREE.MathUtils.damp(g.rotation.x, target, 5, dt);
    if (Math.abs(next - target) > 0.0005) {
      g.rotation.x = next;
      invalidate();
    } else g.rotation.x = target;
  });

  const handlers = useSurfaceDrag(design, atlas, !!interactive);
  if (!geo) return null;

  return (
    <group position={[0, h / 2, 0]}>
      <mesh geometry={geo.front} material={mat} position={[0, 0, d / 2]} castShadow receiveShadow {...handlers} />
      <mesh geometry={geo.back} material={mat} position={[0, 0, -d / 2]} rotation={[0, Math.PI, 0]} castShadow />
      <mesh geometry={geo.right} material={mat} position={[w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow />
      <mesh geometry={geo.left} material={mat} position={[-w / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow />
      <mesh geometry={geo.bottom} material={mat} position={[0, -h / 2, 0]} rotation={[Math.PI / 2, 0, 0]} />
      {/* inner liner */}
      <mesh material={liner}>
        <boxGeometry args={[w - 0.012, h - 0.012, d - 0.012]} />
      </mesh>
      {/* six flavour packs standing inside (simplified, unbranded) */}
      {FLAVOUR_TONES.map((_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <group key={i} position={[(col - 1) * 0.32, -h / 2 + 0.56 + 0.01, (row - 0.5) * 0.17]} rotation={[0, 0, (col - 1) * 0.03]}>
            <mesh geometry={miniPack.f} material={packMats[i]} />
            <mesh geometry={miniPack.b} material={packMats[i]} />
          </group>
        );
      })}
      {/* hinged lid */}
      <group ref={lid} position={[0, h / 2, -d / 2]}>
        <mesh geometry={geo.top} material={mat} position={[0, 0.002, d / 2]} rotation={[-Math.PI / 2, 0, 0]} castShadow />
        <mesh material={linerTop} position={[0, -0.001, d / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
        </mesh>
      </group>
    </group>
  );
}

function Tin({ design, art, interactive }: PackProps) {
  const { r, h } = PACK_DIMS.tin;
  const tex = useAtlasTexture(art);
  const atlas = art.atlas;
  const lidH = 0.13;

  const geo = useMemo(() => {
    if (!atlas?.band || !atlas.lid) return null;
    const body = new THREE.CylinderGeometry(r, r, h - lidH * 0.6, 128, 1, true, Math.PI, Math.PI * 2);
    // body only shows the lower part of the band under the lid skirt: remap v to the visible part
    remapUV(body, rectToUV(atlas.band, atlas));
    const top = new THREE.CircleGeometry(r * 1.018, 96);
    remapUV(top, rectToUV(atlas.lid, atlas));
    return { body, top };
  }, [atlas, r, h]);
  useEffect(() => () => {
    geo?.body.dispose();
    geo?.top.dispose();
  }, [geo]);

  const printed = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ map: tex, metalness: 0.35, roughness: design.finish === "matte" ? 0.6 : 0.3, clearcoat: design.finish === "gloss" ? 0.8 : 0.1, clearcoatRoughness: 0.15 });
    return m;
  }, [tex, design.finish]);
  const metal = useMemo(
    () => new THREE.MeshStandardMaterial({ color: mixHex(design.colors.band, "#C8963E", 0.35), metalness: 0.85, roughness: 0.28 }),
    [design.colors.band],
  );
  const rim = useMemo(() => new THREE.MeshStandardMaterial({ color: "#C8963E", metalness: 1, roughness: 0.22 }), []);
  useEffect(() => () => {
    printed.dispose();
    metal.dispose();
    rim.dispose();
  }, [printed, metal, rim]);

  const handlers = useSurfaceDrag(design, atlas, !!interactive);
  if (!geo) return null;
  const bodyH = h - lidH * 0.6;
  return (
    <group>
      <mesh geometry={geo.body} material={printed} position={[0, bodyH / 2, 0]} castShadow receiveShadow {...handlers} />
      <mesh material={rim} position={[0, 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.014, 12, 96]} />
      </mesh>
      {/* lid */}
      <group position={[0, h - lidH / 2, 0]}>
        <mesh material={metal} castShadow>
          <cylinderGeometry args={[r * 1.018, r * 1.018, lidH, 96, 1, true]} />
        </mesh>
        <mesh geometry={geo.top} material={printed} position={[0, lidH / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        <mesh material={rim} position={[0, lidH / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * 1.018, 0.016, 12, 96]} />
        </mesh>
        <mesh material={rim} position={[0, -lidH / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * 1.018, 0.01, 10, 96]} />
        </mesh>
      </group>
    </group>
  );
}

export function PackModel(props: PackProps & { position?: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  useEntrance(group);
  const { design } = props;
  return (
    <group position={props.position}>
      <group ref={group}>
        {design.format === "carton" ? (
          <Carton {...props} />
        ) : design.format === "tin" ? (
          <Tin {...props} />
        ) : (
          <FlexiblePack {...props} />
        )}
      </group>
    </group>
  );
}
