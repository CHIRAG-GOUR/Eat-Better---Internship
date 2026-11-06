"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { create } from "zustand";

/**
 * Chapter 3.2 activities registry. The page's Activities section renders every entry of ACTS_32 in order and
 * the wrap-up lists them. Add each activity as { id, label, Comp } where Comp is loaded with next/dynamic (ssr:false).
 * (Stub created by the lead so the page compiles; the activities agent fills ACTS_32.)
 */
export type Act32 = { id: string; label: string; Comp: ComponentType<{ onDone: (summary: string) => void }> };

const Loading = () => <div className="h-[520px] animate-pulse rounded-[24px] bg-[#F6E3CF]" />;
const DependencyMap = dynamic(() => import("./DependencyMap"), { ssr: false, loading: Loading });
const SupplierDesk = dynamic(() => import("./SupplierDesk"), { ssr: false, loading: Loading });
const TrustTrace = dynamic(() => import("./TrustTrace"), { ssr: false, loading: Loading });

export const ACTS_32: Act32[] = [
  { id: "map", label: "Dependency Map", Comp: DependencyMap },
  { id: "supplier", label: "Supplier Failure Desk", Comp: SupplierDesk },
  { id: "trust", label: "Trust Trace", Comp: TrustTrace },
];

export const useWork32 = create<{ work: Record<string, string>; save: (k: string, v: string) => void }>((set) => ({
  work: {},
  save: (k, v) => set((s) => ({ work: { ...s.work, [k]: v } })),
}));
