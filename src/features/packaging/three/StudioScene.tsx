"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr, CameraControls, ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { getProduct } from "@/lib/brand";
import { useStudio, type CameraView } from "../store";
import type { Artwork } from "../useArtwork";
import { useArtwork } from "../useArtwork";
import { PACK_DIMS } from "../art/atlas";
import type { PackDesign } from "../types";
import { PackModel } from "./PackModel";
import { StudioSet } from "./StudioSet";

/* capture hook used by "Export concept card" (no preserveDrawingBuffer needed) */
export const captureRef: { current: null | (() => string) } = { current: null };

function CaptureRegistrar() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    captureRef.current = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    };
    return () => {
      captureRef.current = null;
    };
  }, [gl, scene, camera]);
  return null;
}

function packHeight(d: PackDesign) {
  switch (d.format) {
    case "pouch":
      return PACK_DIMS.pouch.h;
    case "sachet":
      return PACK_DIMS.sachet.h;
    case "carton":
      return PACK_DIMS.carton.h;
    case "tin":
      return PACK_DIMS.tin.h;
  }
}

const VIEWS: Record<CameraView, { pos: [number, number, number]; dist: number }> = {
  hero: { pos: [0.5, 0.26, 1], dist: 5.4 },
  front: { pos: [0, 0.05, 1], dist: 4.6 },
  back: { pos: [0, 0.05, -1], dist: 4.6 },
  side: { pos: [1, 0.12, 0.12], dist: 4.6 },
  shelf: { pos: [0.1, 0.07, 1], dist: 11 },
};

function CameraRig({ design, comparing }: { design: PackDesign; comparing: boolean }) {
  const ref = useRef<CameraControls>(null);
  const view = useStudio((s) => s.view);
  const nonce = useStudio((s) => s.viewNonce);
  const size = useThree((s) => s.size);
  const h = packHeight(design);
  const lidOpen = useStudio((s) => s.lidOpen);
  const isLid = design.format === "carton" && lidOpen;
  // on wide viewports the brief card sits on the left, so frame the pack right of centre
  const wide = size.width >= 640;
  const portrait = size.height > size.width;

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const v = VIEWS[view];
    const ty = h * 0.5;
    const dir = new THREE.Vector3(...v.pos).normalize();
    const dist = v.dist * (0.55 + 0.45 * (h / 1.4)) * (comparing ? 1.35 : 1) * (portrait ? 1.25 : 1);
    const eye = dir.multiplyScalar(dist).add(new THREE.Vector3(0, ty, 0));
    void c.setLookAt(eye.x, eye.y + (isLid ? 1.1 : 0), eye.z, 0, ty, 0, true);
    void c.setFocalOffset(wide && view !== "shelf" ? -dist * (comparing ? 0.13 : 0.085) : 0, 0, 0, true);
  }, [view, nonce, h, comparing, isLid, wide, portrait]);

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={2}
      maxDistance={13}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI / 2 - 0.02}
      smoothTime={0.45}
      draggingSmoothTime={0.12}
      dollySpeed={0.6}
    />
  );
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#fff1e2", "#4a2a1c", 0.55]} />
      <directionalLight
        position={[-3.2, 5.2, 4.2]}
        intensity={2.4}
        color="#fff0dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-2}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
      />
      <spotLight position={[3.5, 3.2, -3]} angle={0.6} penumbra={1} intensity={28} color="#ffcf9e" distance={12} decay={2} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#2a1a14"]} />
        <Lightformer form="rect" intensity={3} color="#fff4e6" position={[-3, 2.5, 3]} scale={[3.5, 3, 1]} target={[0, 0.7, 0]} />
        <Lightformer form="rect" intensity={1.4} color="#ffe2c4" position={[3.5, 1.2, 2]} scale={[1.2, 4, 1]} target={[0, 0.7, 0]} />
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 5, 0]} scale={[5, 5, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="ring" intensity={1.2} color="#ffb98a" position={[2, 2, -4]} scale={2} target={[0, 0.7, 0]} />
      </Environment>
    </>
  );
}

function ComparePack({ design }: { design: PackDesign }) {
  const art = useArtwork(design);
  return <PackModel design={design} art={art} position={[1.05, 0, 0]} />;
}

export function StudioScene({ art, design }: { art: Artwork; design: PackDesign }) {
  const lidOpen = useStudio((s) => s.lidOpen);
  const compareId = useStudio((s) => s.compareId);
  const snapshots = useStudio((s) => s.snapshots);
  const compare = snapshots.find((s) => s.id === compareId)?.design ?? null;
  const [dprMax, setDprMax] = useState(1.75);
  const line = getProduct(design.productId).line;
  const comparing = !!compare;

  return (
    <Canvas
      shadows="percentage"
      frameloop="demand"
      dpr={[1, dprMax]}
      camera={{ position: [2, 1.6, 4], fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-label="3D view of your pack"
    >
      <PerformanceMonitor onDecline={() => setDprMax(1.1)} onIncline={() => setDprMax(1.75)} />
      <AdaptiveDpr pixelated={false} />
      <CaptureRegistrar />
      <Lights />
      <Suspense fallback={null}>
        <StudioSet line={line} />
        <group position={[comparing ? -1.05 : 0, 0, 0]}>
          <PackModel key={`${design.format}-${design.productId}`} design={design} art={art} interactive lidOpen={lidOpen} />
        </group>
        {compare && <ComparePack key={compareId} design={compare} />}
        <ContactShadows position={[0, 0.002, 0]} opacity={0.55} scale={6} blur={2.6} far={1.8} resolution={512} color="#2a120a" />
      </Suspense>
      <CameraRig design={design} comparing={comparing} />
    </Canvas>
  );
}
