"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FileStatus = "pending" | "uploading" | "done" | "error";

interface FileEntry {
  key: string;
  file: File;
  relativePath: string;
  locale: string;
  category: string;
  title: string;
  status: FileStatus;
  progress: number;
  uploadedUrl?: string;
  errorMsg?: string;
}

interface EventOption {
  id: string;
  title: string;
}

interface Props {
  events: EventOption[];
  defaultEventId?: string;
}

// ─── Auto-detection helpers ───────────────────────────────────────────────────

function detectLocale(filename: string, relativePath: string): string {
  const text = relativePath + "/" + filename;
  if (/\bENG\b|\/ENG\/|[-_.](ENG|EN)[._\-/]|[-_.]EN$/i.test(text)) return "en";
  if (/\bRUS\b|\/RUS\/|[-_.](RUS|RU)[._\-/]|[-_.]RU$/i.test(text)) return "ru";
  if (/\bTUR\b|\/TUR\/|[-_.](TUR|TR)[._\-/]|[-_.]TR$/i.test(text)) return "tr";
  return "en";
}

const CATEGORY_RULES: [RegExp, string][] = [
  [/1[-_\s]*BUREAU|\/BUREAU\b|\bBUREAU\b/i,                   "bureau"],
  [/2[-_\s]*STANDING|STANDING[-_\s]*COMMITTEE/i,              "standing_committee"],
  [/3[-_\s]*GENERAL|GENERAL[-_\s]*ASSEMBLY/i,                 "general_assembly"],
  [/4[-_\s]*PROGRAMME|PROGRAMME|PROGRAM/i,                    "programme"],
];

function detectCategory(relativePath: string, filename: string): string {
  const text = relativePath || filename;
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(text)) return cat;
  }
  return "general_assembly";
}

function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// XHR upload so we get real progress events
function uploadFileXHR(file: File, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 90));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText).url); }
        catch { reject(new Error("Invalid server response")); }
      } else {
        try { reject(new Error(JSON.parse(xhr.responseText).error ?? "Upload failed")); }
        catch { reject(new Error(`Upload failed (${xhr.status})`)); }
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.open("POST", "/api/admin/upload-document");
    xhr.send(fd);
  });
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "bureau",             label: "Bureau Documents" },
  { id: "standing_committee", label: "Standing Committee" },
  { id: "general_assembly",   label: "General Assembly" },
  { id: "programme",          label: "Programme" },
  { id: "practical",          label: "Practical Info" },
];

const CAT_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
);

const ALLOWED_EXTS = new Set(["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"]);

// ─── Component ────────────────────────────────────────────────────────────────

export function BulkUploadPanel({ events, defaultEventId }: Props) {
  const [isOpen, setIsOpen]         = useState(false);
  const [files, setFiles]           = useState<FileEntry[]>([]);
  const [bulkEventId, setBulkEventId]     = useState(defaultEventId ?? events[0]?.id ?? "");
  const [bulkLocale, setBulkLocale]       = useState("");
  const [bulkCategory, setBulkCategory]   = useState("");
  const [bulkVisibility, setBulkVisibility] = useState("public");
  const [uploading, setUploading]   = useState(false);
  const [summary, setSummary]       = useState<{ ok: number; fail: number; items: { title: string; url: string }[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // webkitdirectory must be set imperatively — not a standard React prop
  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "true");
      folderInputRef.current.setAttribute("directory", "true");
    }
  }, []);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const newEntries: FileEntry[] = arr
      .filter((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
        return ALLOWED_EXTS.has(ext);
      })
      .map((f) => {
        const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath ?? "";
        return {
          key: `${f.name}|${f.size}|${f.lastModified}|${Math.random()}`,
          file: f,
          relativePath: rel,
          locale: detectLocale(f.name, rel),
          category: detectCategory(rel, f.name),
          title: titleFromFilename(f.name),
          status: "pending" as FileStatus,
          progress: 0,
        };
      });
    setFiles((prev) => {
      const seen = new Set(prev.map((e) => `${e.file.name}|${e.file.size}`));
      const fresh = newEntries.filter((e) => !seen.has(`${e.file.name}|${e.file.size}`));
      return [...prev, ...fresh];
    });
    setSummary(null);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  function removeFile(key: string) {
    setFiles((prev) => prev.filter((f) => f.key !== key));
  }

  function updateFile(key: string, patch: Partial<FileEntry>) {
    setFiles((prev) => prev.map((f) => f.key === key ? { ...f, ...patch } : f));
  }

  async function startUpload() {
    if (!bulkEventId || files.length === 0) return;
    setUploading(true);
    setSummary(null);

    let ok = 0;
    let fail = 0;
    const items: { title: string; url: string }[] = [];

    for (const entry of files) {
      if (entry.status === "done") { ok++; items.push({ title: entry.title, url: entry.uploadedUrl! }); continue; }
      if (entry.status === "error") { /* allow retry by re-running */ }

      const locale     = bulkLocale    || entry.locale;
      const category   = bulkCategory  || entry.category;
      const visibility = bulkVisibility;
      const title      = entry.title;

      updateFile(entry.key, { status: "uploading", progress: 0, errorMsg: undefined });

      try {
        const url = await uploadFileXHR(entry.file, (p) => updateFile(entry.key, { progress: p }));

        updateFile(entry.key, { progress: 95 });

        const saveRes = await fetch("/api/admin/create-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: bulkEventId, locale, category, title, fileUrl: url, visibility }),
        });

        if (!saveRes.ok) {
          const err = await saveRes.json().catch(() => ({}));
          throw new Error((err as Record<string, string>).error ?? "Save failed");
        }

        updateFile(entry.key, { status: "done", progress: 100, uploadedUrl: url });
        items.push({ title, url });
        ok++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed";
        updateFile(entry.key, { status: "error", errorMsg: msg });
        fail++;
      }
    }

    setUploading(false);
    setSummary({ ok, fail, items });
  }

  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "error").length;
  const doneCount    = files.filter((f) => f.status === "done").length;

  return (
    <div className="mb-8">
      {/* Collapsed toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-dashed border-gold/40 bg-white hover:bg-amber-50/30 transition"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-navy">Bulk Upload</p>
            <p className="text-[10px] text-gray-400">Select multiple files or a folder — locale &amp; category auto-detected from path</p>
          </div>
          {files.length > 0 && (
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-navy/40 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="mt-3 bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}
        >
          <div className="p-6 space-y-5">

            {/* ── Drop zone ───────────────────────────────────────────────── */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-4 text-center transition ${
                isDragging
                  ? "border-gold bg-amber-50/50"
                  : "border-gray-200 hover:border-navy/20 hover:bg-gray-50/40"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center">
                <svg className="w-6 h-6 text-navy/35" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-navy mb-1">
                  {isDragging ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-xs text-gray-400">PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX · Max 100 MB each</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition"
                >
                  Browse Files
                </button>
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-navy text-xs font-semibold hover:bg-gray-50 transition"
                >
                  Browse Folder
                </button>
              </div>

              {/* Hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                className="sr-only"
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
              />
              <input
                ref={folderInputRef}
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
              />
            </div>

            {files.length > 0 && (
              <>
                {/* ── Bulk settings ───────────────────────────────────────── */}
                <div className="p-4 rounded-xl border border-navy/[0.08] bg-navy/[0.025] space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-navy/45">
                    Bulk Settings — applied to all files
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <label className="block text-[9px] font-semibold text-navy/55 mb-1">Event *</label>
                      <select
                        value={bulkEventId}
                        onChange={(e) => setBulkEventId(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[11px] text-navy focus:outline-none focus:border-gold"
                      >
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-navy/55 mb-1">Language override</label>
                      <select
                        value={bulkLocale}
                        onChange={(e) => setBulkLocale(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[11px] text-navy focus:outline-none focus:border-gold"
                      >
                        <option value="">Auto-detect</option>
                        <option value="en">EN – English</option>
                        <option value="ru">RU – Русский</option>
                        <option value="tr">TR – Türkçe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-navy/55 mb-1">Category override</label>
                      <select
                        value={bulkCategory}
                        onChange={(e) => setBulkCategory(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[11px] text-navy focus:outline-none focus:border-gold"
                      >
                        <option value="">Auto-detect</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-navy/55 mb-1">Visibility</label>
                      <select
                        value={bulkVisibility}
                        onChange={(e) => setBulkVisibility(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-[11px] text-navy focus:outline-none focus:border-gold"
                      >
                        <option value="public">Public</option>
                        <option value="registered">Registered only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── File list ───────────────────────────────────────────── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-navy/45">
                      Files ({files.length})
                    </p>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => { setFiles([]); setSummary(null); }}
                        className="text-[10px] font-semibold text-red-400 hover:text-red-600 transition"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {files.map((entry) => (
                      <div
                        key={entry.key}
                        className={`rounded-xl border px-4 py-3 transition ${
                          entry.status === "done"  ? "border-green-200 bg-green-50/50" :
                          entry.status === "error" ? "border-red-200 bg-red-50/50" :
                          entry.status === "uploading" ? "border-blue-200 bg-blue-50/30" :
                          "border-gray-100 bg-gray-50/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status icon */}
                          <div className="flex-shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center">
                            {entry.status === "done" ? (
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : entry.status === "error" ? (
                              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : entry.status === "uploading" ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                            )}
                          </div>

                          {/* File info + controls */}
                          <div className="flex-1 min-w-0">
                            {/* Top row: filename + size + folder */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5">
                              <span className="text-xs font-semibold text-navy truncate max-w-[240px]">
                                {entry.file.name}
                              </span>
                              <span className="text-[9px] text-gray-400">{formatSize(entry.file.size)}</span>
                              {entry.relativePath && (
                                <span className="text-[9px] text-gray-300 italic truncate max-w-[200px]">
                                  {entry.relativePath.split("/").slice(0, -1).join("/")}
                                </span>
                              )}
                            </div>

                            {/* Editable fields — shown only when pending and not uploading */}
                            {entry.status === "pending" && !uploading && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                <input
                                  type="text"
                                  value={entry.title}
                                  onChange={(e) => updateFile(entry.key, { title: e.target.value })}
                                  placeholder="Document title"
                                  className="sm:col-span-1 px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] text-navy focus:outline-none focus:border-gold"
                                />
                                <select
                                  value={bulkLocale || entry.locale}
                                  disabled={!!bulkLocale}
                                  onChange={(e) => updateFile(entry.key, { locale: e.target.value })}
                                  className="px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] text-navy focus:outline-none focus:border-gold disabled:opacity-40"
                                >
                                  <option value="en">EN – English</option>
                                  <option value="ru">RU – Русский</option>
                                  <option value="tr">TR – Türkçe</option>
                                </select>
                                <select
                                  value={bulkCategory || entry.category}
                                  disabled={!!bulkCategory}
                                  onChange={(e) => updateFile(entry.key, { category: e.target.value })}
                                  className="px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] text-navy focus:outline-none focus:border-gold disabled:opacity-40"
                                >
                                  {CATEGORIES.map((c) => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Upload progress bar */}
                            {entry.status === "uploading" && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] text-blue-500 font-semibold">Uploading…</span>
                                  <span className="text-[9px] text-blue-400">{entry.progress}%</span>
                                </div>
                                <div className="h-1 rounded-full bg-blue-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-blue-400 transition-all duration-150"
                                    style={{ width: `${entry.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Done metadata */}
                            {entry.status === "done" && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-green-600 font-semibold">Saved</span>
                                <span className="text-[9px] text-gray-300">·</span>
                                <span className="text-[9px] text-gray-400 uppercase">{bulkLocale || entry.locale}</span>
                                <span className="text-[9px] text-gray-300">·</span>
                                <span className="text-[9px] text-gray-400">{CAT_LABEL[bulkCategory || entry.category]}</span>
                                {entry.uploadedUrl && (
                                  <>
                                    <span className="text-[9px] text-gray-300">·</span>
                                    <a href={entry.uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-gold hover:underline">
                                      View file
                                    </a>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Error message */}
                            {entry.status === "error" && (
                              <p className="mt-1 text-[9px] text-red-500 font-medium">{entry.errorMsg}</p>
                            )}
                          </div>

                          {/* Remove button */}
                          {!uploading && entry.status !== "uploading" && (
                            <button
                              type="button"
                              onClick={() => removeFile(entry.key)}
                              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Overall progress ────────────────────────────────────── */}
                {uploading && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-navy">Overall progress</span>
                      <span className="text-xs text-gray-400">{doneCount} / {files.length} files</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold transition-all duration-300"
                        style={{ width: files.length > 0 ? `${(doneCount / files.length) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                )}

                {/* ── Upload button ────────────────────────────────────────── */}
                {!uploading && pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={startUpload}
                    disabled={!bulkEventId}
                    className="w-full py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload {pendingCount} file{pendingCount !== 1 ? "s" : ""}
                  </button>
                )}

                {/* ── Summary ──────────────────────────────────────────────── */}
                {summary && !uploading && (
                  <div
                    className={`p-4 rounded-xl border ${
                      summary.fail > 0
                        ? "border-amber-200 bg-amber-50/70"
                        : "border-green-200 bg-green-50/70"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {summary.fail === 0 ? (
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      <p className="text-sm font-bold text-navy">Upload complete</p>
                    </div>

                    <p className="text-xs text-gray-600 mb-3">
                      {summary.ok} file{summary.ok !== 1 ? "s" : ""} uploaded successfully
                      {summary.fail > 0 && `, ${summary.fail} failed — retry by clicking Upload again`}.
                    </p>

                    {summary.items.length > 0 && (
                      <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                        {summary.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px]">
                            <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-navy font-medium flex-1 truncate">{item.title}</span>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline flex-shrink-0">
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-xs font-semibold text-navy/55 hover:text-navy transition"
                    >
                      Refresh page to see documents in list ↻
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
