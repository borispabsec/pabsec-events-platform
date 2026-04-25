"use client";

interface Props {
  fileUrl: string;
  label: string;
}

export function DocViewButton({ fileUrl, label }: Props) {
  function handleView() {
    const ext = fileUrl.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "pdf") {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } else {
      // DOC, DOCX, PPT, PPTX, XLS, XLSX — use Google Docs viewer
      const absoluteUrl = fileUrl.startsWith("http")
        ? fileUrl
        : `${window.location.origin}${fileUrl}`;
      window.open(
        `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=false`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleView}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
      style={{ background: "#C9A96E" }}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {label}
    </button>
  );
}
