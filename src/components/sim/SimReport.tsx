"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCopy, Download, FileText, Printer } from "lucide-react";

/**
 * Shared deliverable report for the chapter simulations (Consumer Insight Report, Product Concept
 * Portfolio, Quality Assurance Report). Built from real activity state; saved on this device; copy,
 * download (.md) or print / save as PDF. It is a student deliverable, not LMS completion.
 */

export type ReportSection = { heading: string; body?: string; items?: string[]; status?: "pass" | "fail" | "info" };

export type ReportData = {
  title: string;
  chapter: string; // e.g. "Chapter 1.4 · The Consumer Insight Expedition"
  role: string; // e.g. "Junior Consumer Researcher"
  sections: ReportSection[];
  image?: { src: string; alt: string }; // e.g. a toDataURL() snapshot of the 3D pack
  footnote?: string; // e.g. "Fictional consumers · practice exercise"
};

export function reportToMarkdown(r: ReportData, date = new Date()) {
  const lines = [`# ${r.title}`, ``, `${r.chapter} · Eat Better Co × SkilliZee`, `Role: ${r.role}`, `Date: ${date.toLocaleDateString("en-IN")}`, ``];
  for (const s of r.sections) {
    lines.push(`## ${s.heading}`);
    if (s.body) lines.push(s.body);
    if (s.items) for (const it of s.items) lines.push(`- ${it}`);
    lines.push("");
  }
  if (r.footnote) lines.push(`_${r.footnote}_`);
  return lines.join("\n");
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function reportToHtml(r: ReportData) {
  const secs = r.sections
    .map(
      (s) =>
        `<section><h2>${esc(s.heading)}</h2>${s.body ? `<p>${esc(s.body)}</p>` : ""}${s.items ? `<ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}</section>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.title)}</title><style>
body{font-family:system-ui,sans-serif;color:#2f1c1a;max-width:760px;margin:32px auto;padding:0 20px;line-height:1.5}
header{border-bottom:4px solid #ff5c00;padding-bottom:12px;margin-bottom:16px}h1{margin:0;font-size:28px}
.meta{color:#4a3230;font-size:14px}h2{font-size:18px;color:#ff5c00;margin:20px 0 6px;text-transform:uppercase;letter-spacing:.06em}
img{max-width:100%;border:1px solid #2f1c1a;border-radius:12px}footer{margin-top:24px;font-size:12px;color:#4a3230}
</style></head><body><header><h1>${esc(r.title)}</h1><div class="meta">${esc(r.chapter)} · Eat Better Co × SkilliZee<br>Role: ${esc(r.role)} · ${new Date().toLocaleDateString("en-IN")}</div></header>
${r.image ? `<img src="${r.image.src}" alt="${esc(r.image.alt)}">` : ""}${secs}${r.footnote ? `<footer>${esc(r.footnote)}</footer>` : ""}
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;
}

export function SimReport({ data, storageKey, ready = true }: { data: ReportData; storageKey: string; ready?: boolean }) {
  const md = useMemo(() => reportToMarkdown(data), [data]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ md, savedAt: Date.now() }));
    } catch {
      /* storage blocked */
    }
  }, [md, ready, storageKey]);

  const download = () => {
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(reportToHtml(data));
    w.document.close();
  };

  return (
    <article className="overflow-hidden rounded-[22px] border border-cocoa bg-white shadow-[3px_3px_0_0_#2f1c1a]">
      <header className="border-b-4 border-orange bg-cream px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-orange">
              <FileText className="size-4" /> {data.chapter}
            </div>
            <h3 className="mt-1 font-display text-[1.6rem] font-semibold leading-tight text-cocoa">{data.title}</h3>
            <div className="text-[0.92rem] text-cocoa-2">Role: {data.role}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={!ready}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(md);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* clipboard blocked */
                }
              }}
              className="eb-btn eb-btn-secondary !py-1.5 !text-[0.85rem] !normal-case"
            >
              {copied ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />} {copied ? "Copied" : "Copy"}
            </button>
            <button disabled={!ready} onClick={download} className="eb-btn eb-btn-secondary !py-1.5 !text-[0.85rem] !normal-case">
              <Download className="size-4" /> Download
            </button>
            <button disabled={!ready} onClick={print} className="eb-btn eb-btn-primary !py-1.5 !text-[0.85rem] !normal-case">
              <Printer className="size-4" /> Print / PDF
            </button>
          </div>
        </div>
      </header>
      <div className="grid gap-4 p-5 sm:p-6">
        {data.image && (
          // eslint-disable-next-line @next/next/no-img-element -- data-URL snapshot of the student's 3D design
          <img src={data.image.src} alt={data.image.alt} className="mx-auto w-full max-w-sm rounded-2xl border border-cocoa/20" />
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {data.sections.map((s) => {
            const chips = !!s.items && s.items.every((it) => it.length <= 48);
            const wide = !chips && ((s.items?.length ?? 0) > 3 || (s.body?.length ?? 0) > 160);
            return (
              <section key={s.heading} className={`rounded-2xl p-4 ${s.status === "fail" ? "bg-error/10" : s.status === "pass" ? "bg-success/10" : "bg-cream"} ${wide ? "sm:col-span-2" : ""}`}>
                <h4 className={`text-[0.8rem] font-extrabold uppercase tracking-[0.1em] ${s.status === "fail" ? "text-error" : s.status === "pass" ? "text-success" : "text-orange"}`}>{s.heading}</h4>
                {s.body && <p className="mt-1.5 text-[1rem] font-semibold leading-snug text-cocoa">{s.body}</p>}
                {s.items &&
                  (chips ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.items.map((it) => (
                        <span key={it} className="rounded-full border border-cocoa/15 bg-white px-3 py-1 text-[0.92rem] font-semibold text-cocoa">
                          {it}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {s.items.map((it) => (
                        <li key={it} className="flex gap-2 text-[0.95rem] leading-snug text-cocoa">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" /> {it}
                        </li>
                      ))}
                    </ul>
                  ))}
              </section>
            );
          })}
        </div>
        <p className="text-[0.82rem] text-cocoa-2/80">
          {data.footnote ? `${data.footnote} · ` : ""}Saved on this device only. This report is your deliverable; it does not record progress in the LMS.
        </p>
      </div>
    </article>
  );
}
