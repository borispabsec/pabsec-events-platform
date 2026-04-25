"use client";

import { useState, useRef } from "react";

const CATEGORIES = [
  { id: "programme",         label: "Programme" },
  { id: "practical",         label: "Practical Info" },
  { id: "bureau",            label: "Bureau Documents" },
  { id: "standing_committee", label: "Standing Committee Documents" },
  { id: "general_assembly",  label: "General Assembly Documents" },
];

interface Props {
  eventId: string;
  addDocumentAction: (formData: FormData) => Promise<void>;
}

export function AddDocumentForm({ eventId, addDocumentAction }: Props) {
  const [mode, setMode] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    if (mode === "file") {
      if (!selectedFile) {
        setUploadError("Please select a file.");
        return;
      }
      setUploading(true);
      try {
        // Step 1: upload file
        const uploadFd = new FormData();
        uploadFd.append("file", selectedFile);
        const res = await fetch("/api/admin/upload-document", {
          method: "POST",
          body: uploadFd,
        });
        const data = await res.json();
        if (!res.ok) {
          setUploadError(data.error ?? "Upload failed");
          return;
        }
        // Step 2: set the URL and submit to server action
        fd.set("fileUrl", data.url);
        // Use title from file name if not already set
        const titleInput = form.querySelector<HTMLInputElement>('input[name="title"]');
        if (titleInput && !titleInput.value.trim()) {
          fd.set("title", selectedFile.name.replace(/\.[^.]+$/, "").replace(/_/g, " "));
        }
      } catch {
        setUploadError("Upload failed. Please try again.");
        return;
      } finally {
        setUploading(false);
      }
    }

    // Submit to server action via form data
    await addDocumentAction(fd);
    // Reset form on success
    setSelectedFile(null);
    setMode("file");
    if (fileRef.current) fileRef.current.value = "";
    formRef.current?.reset();
  }

  return (
    <div className="mt-4 p-5 rounded-xl" style={{ background: "rgba(11,30,61,0.02)", border: "1px solid rgba(11,30,61,0.07)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Add Document</p>
        {/* Toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-3 py-1.5 transition ${mode === "file" ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-3 py-1.5 transition ${mode === "url" ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Enter URL
          </button>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="eventId" value={eventId} />

        <div className="grid grid-cols-2 gap-3">
          <select
            name="locale"
            required
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
          >
            <option value="en">EN – English</option>
            <option value="ru">RU – Русский</option>
            <option value="tr">TR – Türkçe</option>
          </select>
          <select
            name="category"
            required
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          name="title"
          required={mode === "url"}
          placeholder="Document title"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold placeholder:text-gray-300"
        />

        {mode === "file" ? (
          <div>
            {/* File picker area */}
            <div
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition ${
                selectedFile
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 hover:border-navy/30 hover:bg-gray-50"
              }`}
              onClick={() => fileRef.current?.click()}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedFile ? "bg-green-100" : "bg-navy/5"}`}>
                <svg className={`w-4 h-4 ${selectedFile ? "text-green-600" : "text-navy/40"}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  {selectedFile ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  )}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {selectedFile ? (
                  <>
                    <p className="text-xs font-semibold text-green-700 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-green-600">{formatSize(selectedFile.size)}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-navy">Click to browse files</p>
                    <p className="text-[10px] text-gray-400">PDF, DOC, DOCX, PPT, PPTX · Max 100 MB</p>
                  </>
                )}
              </div>
              {selectedFile && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setSelectedFile(f);
              }}
            />
          </div>
        ) : (
          <input
            type="url"
            name="fileUrl"
            required
            placeholder="https://pabsec.org/documents/…"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold placeholder:text-gray-300"
          />
        )}

        {uploadError && (
          <p className="text-red-500 text-xs rounded-lg bg-red-50 px-3 py-2">{uploadError}</p>
        )}

        <button
          type="submit"
          disabled={uploading || (mode === "file" && !selectedFile)}
          className="w-full py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading…" : "Add Document"}
        </button>
      </form>
    </div>
  );
}
