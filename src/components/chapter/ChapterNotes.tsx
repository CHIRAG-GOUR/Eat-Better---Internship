"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ClipboardCopy,
  Download,
  FileText,
  Trash2,
  X,
} from "lucide-react";

interface ChapterNotesProps {
  chapterNumber: string;
  chapterTitle: string | [string, string];
}

export function ChapterNotes({ chapterNumber, chapterTitle }: ChapterNotesProps) {
  const displayTitle = Array.isArray(chapterTitle) ? chapterTitle.join(" ") : chapterTitle;
  const storageKey = `eat-better-notes-${chapterNumber}`;
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [lastDownloadedText, setLastDownloadedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore saved draft on mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        const downloadedFlag = localStorage.getItem(`${storageKey}-downloaded`);
        if (saved) {
          setNotes(saved);
        }
        if (downloadedFlag && downloadedFlag === saved) {
          setLastDownloadedText(downloadedFlag);
        }
      } catch {
        // localStorage disabled/restricted
      } finally {
        setHydrated(true);
      }
    });
  }, [storageKey]);

  // Persist to local storage draft
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, notes);
    } catch {
      // ignore
    }
  }, [notes, hydrated, storageKey]);

  // Determine if notes are unsaved/undownloaded
  const isDirty = notes.trim().length > 0 && notes !== lastDownloadedText;

  // Window unload guard (browser reload / closing tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have notes that haven't been downloaded yet! Download them before leaving to avoid losing your work.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // In-app navigation guard (clicking links inside the page)
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (!isDirty) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      const url = new URL(target.href, window.location.href);

      // Ignore in-page hash links (e.g. #glance, #d2c)
      if (url.origin === window.location.origin && url.pathname === window.location.pathname) {
        return;
      }

      // External or different page route
      e.preventDefault();
      e.stopPropagation();
      setPendingNavUrl(target.href);
      setShowExitConfirm(true);
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => document.removeEventListener("click", handleLinkClick, { capture: true });
  }, [isDirty]);

  // Browser back/forward navigation guard (client-side routing)
  useEffect(() => {
    if (!isDirty) return;

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowExitConfirm(true);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  // Word count & character count
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = notes.length;

  // Download notes file
  const handleDownload = useCallback(() => {
    const dateStr = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const fileContent = `================================================================
EAT BETTER CO × SKILLIZEE — INTERNSHIP NOTEBOOK
Chapter ${chapterNumber}: ${displayTitle}
Saved: ${dateStr}
================================================================

${notes.trim() || "(No notes entered)"}

----------------------------------------------------------------
Word count: ${wordCount} | Characters: ${charCount}
Generated from Eat Better Co Internship Portal
================================================================
`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const cleanChapter = chapterNumber.replace(/[^0-9.]/g, "");
    link.href = url;
    link.download = `EatBetter_Chapter_${cleanChapter}_Notes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setLastDownloadedText(notes);
    try {
      localStorage.setItem(`${storageKey}-downloaded`, notes);
    } catch {
      // ignore
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  }, [chapterNumber, displayTitle, notes, wordCount, charCount, storageKey]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access error
    }
  };

  // Insert helper template snippet
  const insertSnippet = (snippet: string) => {
    setNotes((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // Exit dialog handlers
  const handleConfirmLeaveWithoutSaving = () => {
    setShowExitConfirm(false);
    if (pendingNavUrl) {
      window.location.href = pendingNavUrl;
    }
  };

  const handleDownloadAndLeave = () => {
    handleDownload();
    setShowExitConfirm(false);
    if (pendingNavUrl) {
      setTimeout(() => {
        window.location.href = pendingNavUrl;
      }, 350);
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setPendingNavUrl(null);
    setIsOpen(true);
  };

  return (
    <>
      {/* ── Top-Left Floating Button ────────────────────────────── */}
      <div
        className="fixed z-50 flex items-center gap-2"
        style={{
          top: "max(16px, env(safe-area-inset-top))",
          left: "max(16px, env(safe-area-inset-left))",
        }}
      >
        <motion.button
          onClick={() => setIsOpen((prev) => !prev)}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
          aria-label={isOpen ? "Close notes panel" : "Open chapter notes"}
          aria-expanded={isOpen}
          title="Take Chapter Notes"
          className={`group relative grid size-12 place-items-center rounded-full border border-cocoa transition-[box-shadow,background-color,color] ${
            isOpen
              ? "bg-cocoa text-cream shadow-[3px_3px_0_0_#ff5c00]"
              : isDirty
              ? "bg-cream text-cocoa shadow-[2px_2px_0_0_#2f1c1a] hover:bg-orange hover:text-white hover:shadow-[3px_3px_0_0_#2f1c1a]"
              : "bg-cream text-cocoa shadow-[2px_2px_0_0_#2f1c1a] hover:bg-orange hover:text-white hover:shadow-[3px_3px_0_0_#2f1c1a]"
          }`}
        >
          <BookOpen className="size-5 shrink-0 transition-transform group-hover:scale-110" />
          <span className="sr-only">Notes</span>

          {/* Badge: Shows count or unsaved indicator */}
          {wordCount > 0 && (
            <span
              className={`absolute -bottom-1.5 -right-2 flex items-center gap-0.5 rounded-full border border-white px-1.5 py-px text-[0.68rem] font-bold leading-tight ${
                isOpen
                  ? "bg-orange text-white"
                  : isDirty
                  ? "bg-orange text-white"
                  : "bg-success text-white"
              }`}
            >
              {isDirty ? (
                <span>{wordCount}w</span>
              ) : (
                <>
                  <Check className="size-3 stroke-[3]" />
                  <span>{wordCount}w</span>
                </>
              )}
            </span>
          )}

          {/* Ping indicator if there are unsaved notes */}
          {isDirty && !isOpen && (
            <span className="absolute -right-1 -top-1 flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange opacity-75" />
              <span className="relative inline-flex size-3 rounded-full border-2 border-white bg-orange" />
            </span>
          )}
        </motion.button>
      </div>

      {/* ── Slide-Over Notes Drawer ─────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-cocoa/40 backdrop-blur-xs transition-opacity"
              aria-hidden
            />

            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: "-100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0.5 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="relative z-10 flex h-full w-full max-w-lg flex-col border-r border-cocoa/20 bg-cream shadow-[12px_0_40px_rgba(47,28,26,0.3)]"
              aria-label="Chapter notes drawer"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-cocoa/15 bg-peach/70 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-orange text-white shadow-[2px_2px_0_0_#2f1c1a]">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[1.15rem] font-semibold text-cocoa">
                        Chapter Notes
                      </span>
                      <span className="rounded-md border border-cocoa/20 bg-white px-2 py-0.5 font-display text-[0.8rem] font-semibold text-orange">
                        {chapterNumber}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-[0.85rem] text-cocoa-2">
                      {displayTitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="grid size-9 place-items-center rounded-lg border border-cocoa/20 bg-white text-cocoa transition-colors hover:bg-peach hover:text-orange"
                  aria-label="Close notes"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between border-b border-cocoa/10 bg-white/70 px-5 py-2.5 text-[0.85rem]">
                <div className="flex items-center gap-2">
                  {isDirty ? (
                    <span className="inline-flex items-center gap-1.5 font-bold text-orange">
                      <span className="size-2 rounded-full bg-orange animate-pulse" />
                      Unsaved changes — download before leaving
                    </span>
                  ) : notes.trim().length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 font-bold text-success">
                      <Check className="size-3.5 stroke-[3]" />
                      Latest notes downloaded
                    </span>
                  ) : (
                    <span className="text-cocoa-2">Ready for your notes</span>
                  )}
                </div>

                <span className="font-semibold text-cocoa-2">
                  {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} chars
                </span>
              </div>

              {/* Quick Snippet Chips */}
              <div className="flex flex-wrap items-center gap-2 border-b border-cocoa/10 bg-peach/30 px-5 py-2.5">
                <span className="text-[0.8rem] font-extrabold uppercase tracking-[0.1em] text-cocoa-2">
                  Insert:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `[${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}] `
                    )
                  }
                  className="rounded-full border border-cocoa/20 bg-white px-2.5 py-1 text-[0.8rem] font-bold text-cocoa hover:border-cocoa hover:bg-peach"
                >
                  + Time
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("📌 Key Takeaway:\n- ")}
                  className="rounded-full border border-cocoa/20 bg-white px-2.5 py-1 text-[0.8rem] font-bold text-cocoa hover:border-cocoa hover:bg-peach"
                >
                  + Key Takeaway
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("❓ Question for Mentor:\n- ")}
                  className="rounded-full border border-cocoa/20 bg-white px-2.5 py-1 text-[0.8rem] font-bold text-cocoa hover:border-cocoa hover:bg-peach"
                >
                  + Mentor Question
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("💡 Idea for Project:\n- ")}
                  className="rounded-full border border-cocoa/20 bg-white px-2.5 py-1 text-[0.8rem] font-bold text-cocoa hover:border-cocoa hover:bg-peach"
                >
                  + Project Idea
                </button>
              </div>

              {/* Text Area */}
              <div className="flex-1 p-5">
                <textarea
                  ref={textareaRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Write your takeaways, insights, or thoughts on Chapter ${chapterNumber} here...\n\nYour notes are auto-saved in this browser, and you can download them as a file anytime using the button below.`}
                  className="h-full w-full resize-none rounded-2xl border border-cocoa/20 bg-white p-4 font-sans text-[1.05rem] leading-relaxed text-cocoa shadow-inner outline-none transition-colors focus:border-orange focus:ring-2 focus:ring-orange/20"
                />
              </div>

              {/* Download Feedback Alert */}
              <AnimatePresence>
                {downloadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mx-5 mb-2 flex items-center gap-2 rounded-xl bg-success/15 px-4 py-2.5 text-[0.92rem] font-bold text-success"
                  >
                    <Check className="size-4 stroke-[3]" />
                    <span>Notes downloaded! File saved to your computer.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer Controls */}
              <div className="border-t border-cocoa/15 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!notes.trim()}
                      onClick={handleCopy}
                      className="eb-btn eb-btn-secondary !py-2 !px-3.5 !text-[0.88rem] !normal-case"
                      title="Copy notes to clipboard"
                    >
                      {copied ? <Check className="size-4 text-success" /> : <ClipboardCopy className="size-4" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>

                    {notes.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Clear all notes in this chapter? This cannot be undone.")) {
                            setNotes("");
                            setLastDownloadedText(null);
                          }
                        }}
                        className="flex size-9 items-center justify-center rounded-lg border border-cocoa/20 text-cocoa-2 transition-colors hover:border-error hover:bg-error/10 hover:text-error"
                        title="Clear notes"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!notes.trim()}
                    onClick={handleDownload}
                    className="eb-btn eb-btn-primary !py-2 !px-4 !text-[0.92rem] !normal-case"
                  >
                    <Download className="size-4" />
                    <span>Download Notes (.txt)</span>
                  </button>
                </div>

                <p className="mt-3 text-center text-[0.8rem] text-cocoa-2/80">
                  ⚠️ Download your notes before leaving the page to ensure they are saved.
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Page Exit Confirmation Modal ───────────────────────── */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-cocoa/60 backdrop-blur-sm"
              onClick={() => setShowExitConfirm(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 25 }}
              className="relative z-10 w-full max-w-lg rounded-[28px] border-2 border-cocoa bg-cream p-6 shadow-[8px_8px_0_0_#2f1c1a] sm:p-8"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby="confirm-desc"
            >
              <div className="flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-cocoa bg-orange text-white shadow-[2px_2px_0_0_#2f1c1a]">
                  <AlertTriangle className="size-7" />
                </div>
                <div>
                  <h3
                    id="confirm-title"
                    className="font-display text-[1.45rem] font-semibold text-cocoa"
                  >
                    Hold on! You have unsaved notes
                  </h3>
                  <p
                    id="confirm-desc"
                    className="mt-2 text-[1.05rem] leading-relaxed text-cocoa-2"
                  >
                    Your notes for <strong>Chapter {chapterNumber}</strong> have not been downloaded. If you change pages, your notes will not be saved to your files.
                  </p>
                </div>
              </div>

              {/* Note preview box */}
              <div className="mt-4 rounded-xl border border-cocoa/15 bg-white p-3 text-[0.95rem] text-cocoa max-h-28 overflow-y-auto font-mono whitespace-pre-wrap">
                {notes.slice(0, 240)}
                {notes.length > 240 ? "..." : ""}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelExit}
                  className="eb-btn eb-btn-secondary !py-2.5 !text-[0.95rem] !normal-case"
                >
                  Stay &amp; Keep Editing
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAndLeave}
                  className="eb-btn eb-btn-primary !py-2.5 !text-[0.95rem] !normal-case"
                >
                  <Download className="size-4" />
                  Download &amp; Continue
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLeaveWithoutSaving}
                  className="text-center text-[0.88rem] font-bold text-error hover:underline sm:self-center sm:px-2"
                >
                  Leave without saving
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
