"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: "programme",          label: "Programme" },
  { id: "practical",          label: "Practical Info" },
  { id: "bureau",             label: "Bureau Documents" },
  { id: "standing_committee", label: "Standing Committee Documents" },
  { id: "general_assembly",   label: "General Assembly Documents" },
];

const ALLOWED_EXTS = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];

interface EventOption {
  id: string;
  title: string;
}

interface Props {
  defaultEventId: string;
  events: EventOption[];
  defaultCategory?: string;
}

export function AddDocumentForm({ defaultEventId, events, defaultCategory }: Props) {
  const router = useRouter();
  const [mode, setMode]                     = useState<"file" | "url">("file");
  const [selectedEventId, setSelectedEventId] = useState(defaultEventId);
  const [selectedFiles, setSelectedFiles]   = useState<File[]>([]);
  const [uploading, setUploading]           = useState(false);
  const [uploadError, setUploadError]       = useState("");
  const fileRef   = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const formRef   = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (folderRef.current) {
      folderRef.current.setAttribute("webkitdirectory", "true");
      folderRef.current.setAttribute("directory", "true");
    }
  }, []);

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function totalSize(files: File[]) {
    return files.reduce((sum, f) => sum + f.size, 0);
  }

  function pickFiles(raw: FileList | null) {
    const files = Array.from(raw ?? []).filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      return ALLOWED_EXTS.includes(ext);
    });
    if (files.length) setSelectedFiles(files);
  }

  function clearFiles() {
    setSelectedFiles([]);
    if (fileRef.current)   fileRef.current.value   = "";
    if (folderRef.current) folderRef.current.value = "";
  }

  async function saveDocument(params: {
    eventId: string; locale: string; category: string; title: string; fileUrl: string;
  }) {
    const res = await fetch("/api/admin/create-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, visibility: "public" }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error ?? "Save failed");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError("");

    const fd       = new FormData(e.currentTarget);
    const locale   = fd.get("locale") as string;
    const category = fd.get("category") as string;
    const baseTitle = (fd.get("title") as string)?.trim();

    if (mode === "file") {
      if (selectedFiles.length === 0) { setUploadError("Please select a file."); return; }

      setUploading(true);
      try {
        for (const file of selectedFiles) {
          const uploadFd = new FormData();
          uploadFd.append("file", file);
          const res  = await fetch("/api/admin/upload-document", { method: "POST", body: uploadFd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Upload failed");

          const title = selectedFiles.length > 1
            ? file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim()
            : (baseTitle || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim());

          await saveDocument({ eventId: selectedEventId, locale, category, title, fileUrl: data.url });
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
        return;
      } finally {
        setUploading(false);
      }

      clearFiles();
      formRef.current?.reset();
      router.refresh();
      return;
    }

    // URL mode — save directly without file upload
    const fileUrl = fd.get("fileUrl") as string;
    setUploading(true);
    try {
      await saveDocument({ eventId: selectedEventId, locale, category, title: baseTitle, fileUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Save failed.");
      return;
    } finally {
      setUploading(false);
    }
    formRef.current?.reset();
    router.refresh();
  }

  const hasFiles = selectedFiles.length > 0;

  return (
    <div className="mt-4 p-5 rounded-xl" style={{ background: "rgba(11,30,61,0.02)", border: "1px solid rgba(11,30,61,0.07)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Add Document</p>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[10px] font-semibold">
          <button type="button" onClick={() => setMode("file")} className={`px-3 py-1.5 transition ${mode === "file" ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}>Upload File</button>
          <button type="button" onClick={() => setMode("url")}  className={`px-3 py-1.5 transition ${mode === "url"  ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}>Enter URL</button>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">

        {/* Event selector */}
        {events.length > 1 && (
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        )}

        <div className={`grid gap-3 ${defaultCategory ? "grid-cols-1" : "grid-cols-2"}`}>
          <select name="locale" required className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold">
            <option value="en">EN – English</option>
            <option value="ru">RU – Русский</option>
            <option value="tr">TR – Türkçe</option>
          </select>
          {defaultCategory ? (
            <input type="hidden" name="category" value={defaultCategory} />
          ) : (
            <select name="category" required className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold">
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          )}
        </div>

        <input
          type="text"
          name="title"
          required={mode === "url"}
          placeholder={hasFiles && selectedFiles.length > 1 ? "Title prefix (optional — auto from filename)" : "Document title"}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold placeholder:text-gray-300"
        />

        {mode === "file" ? (
          <div>
            {/* Browse area */}
            <div
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition ${
                hasFiles ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-navy/30 hover:bg-gray-50"
              }`}
              onClick={() => fileRef.current?.click()}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${hasFiles ? "bg-green-100" : "bg-navy/5"}`}>
                <svg className={`w-4 h-4 ${hasFiles ? "text-green-600" : "text-navy/40"}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  {hasFiles ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  )}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {hasFiles ? (
                  <>
                    {selectedFiles.length === 1 ? (
                      <p className="text-xs font-semibold text-green-700 truncate">{selectedFiles[0].name}</p>
                    ) : (
                      <p className="text-xs font-semibold text-green-700">{selectedFiles.length} files selected</p>
                    )}
                    <p className="text-[10px] text-green-600">{formatSize(totalSize(selectedFiles))}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-navy">Click to browse files</p>
                    <p className="text-[10px] text-gray-400">PDF, DOC, DOCX, PPT, PPTX · Max 100 MB · Ctrl+A to select all</p>
                  </>
                )}
              </div>
              {hasFiles && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFiles(); }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {!hasFiles && (
              <button type="button" onClick={() => folderRef.current?.click()} className="mt-1.5 text-[10px] font-medium text-navy/50 hover:text-navy transition">
                Or browse a folder →
              </button>
            )}

            {selectedFiles.length > 1 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedFiles.slice(0, 6).map((f, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium truncate max-w-[180px]">{f.name}</span>
                ))}
                {selectedFiles.length > 6 && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">+{selectedFiles.length - 6} more</span>
                )}
              </div>
            )}

            <input ref={fileRef}   type="file" multiple={true} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" className="sr-only" onChange={(e) => { pickFiles(e.target.files); e.target.value = ""; }} />
            <input ref={folderRef} type="file" multiple={true} className="sr-only" onChange={(e) => { pickFiles(e.target.files); e.target.value = ""; }} />
          </div>
        ) : (
          <input type="url" name="fileUrl" required placeholder="https://pabsec.org/documents/…" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold placeholder:text-gray-300" />
        )}

        {uploadError && (
          <p className="text-red-500 text-xs rounded-lg bg-red-50 px-3 py-2">{uploadError}</p>
        )}

        <button
          type="submit"
          disabled={uploading || (mode === "file" && selectedFiles.length === 0)}
          className="w-full py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? "Uploading…"
            : selectedFiles.length > 1
            ? `Upload ${selectedFiles.length} files`
            : "Add Document"}
        </button>
      </form>
    </div>
  );
}
