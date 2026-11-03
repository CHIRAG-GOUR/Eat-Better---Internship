"use client";

import { useSyncExternalStore } from "react";

/**
 * Lightweight rendering mode shared by the chapter simulations (1.4–1.6).
 * Auto-on for phones, low-core/low-memory devices and reduced-motion users; the student can override it
 * (stored per device). Use `liteCanvasProps(lite)` on <Canvas> and skip decorative props when `lite`.
 */

const KEY = "ebc-sim-lite";
const listeners = new Set<() => void>();

function autoLite() {
  const small = window.matchMedia("(max-width: 767px)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return small || weak || reduce;
}

function read() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {
    /* storage blocked */
  }
  return autoLite();
}

/** Force lite on/off, or `null` to go back to automatic. */
export function setLiteMode(v: boolean | null) {
  try {
    if (v === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* storage blocked */
  }
  listeners.forEach((l) => l());
}

export function useLiteMode(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", cb);
      return () => {
        listeners.delete(cb);
        mq.removeEventListener("change", cb);
      };
    },
    read,
    () => false,
  );
}

/** Spread onto <Canvas {...liteCanvasProps(lite)}>. */
export function liteCanvasProps(lite: boolean) {
  return {
    dpr: (lite ? [1, 1.25] : [1, 1.75]) as [number, number],
    shadows: lite ? false : ("percentage" as const),
    gl: { antialias: !lite, powerPreference: (lite ? "low-power" : "high-performance") as WebGLPowerPreference },
  };
}
