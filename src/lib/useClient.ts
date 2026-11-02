"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Read a browser-only value without a hydration mismatch (server renders `serverValue`). */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(noop, read, () => serverValue);
}

let webglCache: boolean | null = null;
export function detectWebGL() {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}
