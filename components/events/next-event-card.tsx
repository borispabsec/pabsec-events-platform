"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface NextEventCardProps {
  imageUrl?: string | null;
  title: string;
  location: string;
  period: string;
  locale: string;
  slug: string;
  labels: {
    saveTheDate: string;
    registrationNotOpen: string;
  };
}

export function NextEventCard({
  imageUrl,
  title,
  location,
  period,
  locale,
  slug,
  labels,
}: NextEventCardProps) {
  // Start assuming dark (navy fallback or typical dark photo)
  const [imageDark, setImageDark] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imageUrl) { setImageDark(true); return; }

    const img = imgRef.current;
    if (!img) return;

    const detect = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth  || img.width  || 800;
        const h = img.naturalHeight || img.height || 300;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        // Sample the bottom half where text sits
        const data = ctx.getImageData(0, Math.floor(h * 0.4), w, Math.floor(h * 0.6)).data;
        let total = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        setImageDark(total / pixels < 128);
      } catch { /* canvas blocked — keep default */ }
    };

    if (img.complete && img.naturalWidth > 0) detect();
    else img.addEventListener("load", detect, { once: true });
  }, [imageUrl]);

  const isDark = !imageUrl || imageDark;

  const titleClass   = isDark ? "text-white" : "text-[#0B1E3D]";
  const mutedColor   = isDark ? "rgba(255,255,255,0.60)" : "rgba(11,30,61,0.65)";
  const badgeStyle: React.CSSProperties = isDark
    ? { background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.30)" }
    : { background: "rgba(201,168,76,0.20)", color: "#9a7828", border: "1px solid rgba(201,168,76,0.45)" };
  const buttonStyle: React.CSSProperties = isDark
    ? { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.38)", border: "1px solid rgba(255,255,255,0.12)" }
    : { background: "rgba(11,30,61,0.07)",   color: "rgba(11,30,61,0.45)",    border: "1px solid rgba(11,30,61,0.15)"   };

  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[140px]">
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt=""
            aria-hidden="true"
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle bottom gradient for text readability only */}
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? "linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 62%)"
                : "linear-gradient(to top, rgba(248,249,250,0.80) 0%, transparent 62%)",
            }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #132848 100%)" }}
          />
          <div
            className="absolute top-[-40px] right-[-40px] w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.08), transparent 70%)" }}
          />
        </>
      )}

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-8 py-8 md:px-12">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <span
              className="text-[9px] tracking-[0.32em] uppercase font-semibold px-3 py-1.5 rounded-full"
              style={badgeStyle}
            >
              {labels.saveTheDate}
            </span>
          </div>
          <h3 className={`font-bold text-xl mb-1 ${titleClass}`}>{title}</h3>
          <p className="text-sm" style={{ color: mutedColor }}>
            {location} · {period}
          </p>
        </div>
        <Link
          href={`/${locale}/events/${slug}`}
          className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
          style={buttonStyle}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {labels.registrationNotOpen}
        </Link>
      </div>
    </div>
  );
}
