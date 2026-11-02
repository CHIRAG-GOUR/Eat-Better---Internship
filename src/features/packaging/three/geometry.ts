import * as THREE from "three";

type UVRect = { u0: number; u1: number; v0: number; v1: number };

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export type PillowOpts = {
  w: number;
  h: number;
  depth: number;
  kind: "pouch" | "sachet";
  segX?: number;
  segY?: number;
};

/** Puff (half-thickness) at normalised panel position u,v (v = 0 bottom). */
export function pillowPuff(u: number, v: number, o: PillowOpts) {
  const px = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * u - 1), 2.4)), 0.55);
  let py: number;
  if (o.kind === "pouch") {
    // flat crimped seal at the top, full and rounded towards the gusseted base
    const seal = 1 - smoothstep(0.83, 0.915, v);
    const belly = 1 + 0.35 * Math.pow(1 - v, 2);
    py = seal * belly;
  } else {
    const top = 1 - smoothstep(0.84, 0.92, v);
    const bottom = smoothstep(0.08, 0.16, v);
    py = top * bottom * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * v - 1), 6)), 0.4);
  }
  return o.depth * px * py;
}

/**
 * One face (front) of a flexible pack: a dense plane displaced into a pillow.
 * The back is the same geometry rotated 180° — texture still reads correctly.
 */
export function makePillowPanel(o: PillowOpts, uv: UVRect) {
  const segX = o.segX ?? 48;
  const segY = o.segY ?? 72;
  const g = new THREE.PlaneGeometry(o.w, o.h, segX, segY);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uvs = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const u = x / o.w + 0.5;
    const v = y / o.h + 0.5;
    const z = pillowPuff(u, v, o);
    // filled packs pull their side edges inwards slightly
    const pinch = 1 - 0.045 * (z / o.depth);
    pos.setXYZ(i, x * pinch, y, z);
    uvs.setXY(i, uv.u0 + u * (uv.u1 - uv.u0), uv.v0 + v * (uv.v1 - uv.v0));
  }
  g.computeVertexNormals();
  return g;
}

/** Oval gusset strip that closes the base of a stand-up pouch. */
export function makeGusset(o: PillowOpts, segX = 48) {
  const verts: number[] = [];
  const idx: number[] = [];
  const y = -o.h / 2;
  for (let i = 0; i <= segX; i++) {
    const u = i / segX;
    const x = (u - 0.5) * o.w;
    const z = pillowPuff(u, 0, o);
    const pinch = 1 - 0.045 * (z / o.depth);
    verts.push(x * pinch, y, z, x * pinch, y, -z);
  }
  for (let i = 0; i < segX; i++) {
    const a = i * 2;
    idx.push(a, a + 2, a + 1, a + 2, a + 3, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Plane whose UVs sample one rect of the atlas. */
export function planeWithUV(w: number, h: number, uv: UVRect, flipU = false) {
  const g = new THREE.PlaneGeometry(w, h, 1, 1);
  const a = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < a.count; i++) {
    let u = a.getX(i);
    const v = a.getY(i);
    if (flipU) u = 1 - u;
    a.setXY(i, uv.u0 + u * (uv.u1 - uv.u0), uv.v0 + v * (uv.v1 - uv.v0));
  }
  return g;
}

/** Remap any geometry's existing 0–1 UVs into an atlas rect. */
export function remapUV(g: THREE.BufferGeometry, uv: UVRect) {
  const a = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < a.count; i++) {
    a.setXY(i, uv.u0 + a.getX(i) * (uv.u1 - uv.u0), uv.v0 + a.getY(i) * (uv.v1 - uv.v0));
  }
  a.needsUpdate = true;
  return g;
}

/** Photographic infinity cove: floor that curves up into a back wall. */
export function makeCyclorama(width = 40, floorDepth = 9, radius = 3.2, wallHeight = 14, seg = 64) {
  const arc = (Math.PI / 2) * radius;
  const total = floorDepth + arc + wallHeight;
  const profile = (s: number): [number, number] => {
    // returns [y, z]; floor runs from z = +floorDepth/2 back towards the curve
    const zStart = 3;
    if (s <= floorDepth) return [0, zStart - s];
    if (s <= floorDepth + arc) {
      const a = (s - floorDepth) / radius;
      return [radius - Math.cos(a) * radius, zStart - floorDepth - Math.sin(a) * radius];
    }
    return [radius + (s - floorDepth - arc), zStart - floorDepth - radius];
  };
  const g = new THREE.PlaneGeometry(width, total, 1, seg);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const t = 1 - (pos.getY(i) / total + 0.5); // 0 at front edge
    const [y, z] = profile(t * total);
    pos.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  // PlaneGeometry faces +z; after bending, normals point the wrong way on the floor — flip winding
  const index = g.getIndex()!;
  const arr = index.array as Uint16Array | Uint32Array;
  for (let i = 0; i < arr.length; i += 3) {
    const t = arr[i];
    arr[i] = arr[i + 2];
    arr[i + 2] = t;
  }
  index.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

/** Lathe profile for a brass katori with a foot. */
export function makeKatori(radius = 0.42, height = 0.22) {
  const p: THREE.Vector2[] = [];
  const steps = 24;
  p.push(new THREE.Vector2(0, 0.0));
  p.push(new THREE.Vector2(radius * 0.42, 0.0));
  p.push(new THREE.Vector2(radius * 0.44, height * 0.08));
  p.push(new THREE.Vector2(radius * 0.38, height * 0.12));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * (Math.PI / 2);
    p.push(new THREE.Vector2(radius * (0.4 + 0.6 * Math.sin(a)), height * (0.12 + 0.88 * (1 - Math.cos(a)))));
  }
  p.push(new THREE.Vector2(radius * 1.02, height * 1.02));
  // inner wall
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const a = t * (Math.PI / 2);
    p.push(new THREE.Vector2(radius * (0.36 + 0.6 * Math.sin(a)), height * (0.18 + 0.82 * (1 - Math.cos(a)))));
  }
  p.push(new THREE.Vector2(0, height * 0.18));
  return new THREE.LatheGeometry(p, 72);
}

/** Lathe profile for a speckled ceramic bowl. */
export function makeBowl(radius = 0.55, height = 0.3) {
  const p: THREE.Vector2[] = [];
  const steps = 22;
  p.push(new THREE.Vector2(0, 0));
  p.push(new THREE.Vector2(radius * 0.45, 0));
  p.push(new THREE.Vector2(radius * 0.47, height * 0.05));
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    p.push(new THREE.Vector2(radius * (0.45 + 0.55 * Math.sin(a)), height * (0.05 + 0.95 * (1 - Math.cos(a)))));
  }
  p.push(new THREE.Vector2(radius * 0.97, height));
  for (let i = steps; i >= 0; i--) {
    const a = (i / steps) * (Math.PI / 2);
    p.push(new THREE.Vector2(radius * (0.4 + 0.53 * Math.sin(a)), height * (0.12 + 0.86 * (1 - Math.cos(a)))));
  }
  p.push(new THREE.Vector2(0, height * 0.12));
  return new THREE.LatheGeometry(p, 72);
}

/** Lumpy, hand-rolled laddoo. */
export function makeLaddooGeometry(r = 0.12, detail = 3, seed = 1) {
  const g = new THREE.IcosahedronGeometry(r, detail);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      Math.sin(v.x * 61 + seed) * Math.cos(v.y * 53 + seed * 2) * 0.5 +
      Math.sin(v.z * 97 + v.x * 31 + seed) * 0.35 +
      Math.cos(v.y * 140 + v.z * 90) * 0.15;
    v.multiplyScalar(1 + n * 0.055);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Small speckle texture used as colour + bump for laddoos (generated, no download). */
export function makeSpeckleTexture(base = "#5a3322", seed = 7) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) {
    const k = rnd();
    g.fillStyle = k < 0.4 ? "rgba(214,170,120,0.8)" : k < 0.7 ? "rgba(240,215,180,0.7)" : "rgba(25,12,6,0.6)";
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, 0.6 + rnd() * 2.4, 0.5 + rnd() * 1.4, rnd() * 3, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
