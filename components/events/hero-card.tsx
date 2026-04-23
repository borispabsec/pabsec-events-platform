"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface HeroCardProps {
  textColorMode: string; // "auto" | "white" | "dark"
  daysRemaining: number;
  locale: string;
  eventSlug: string;
  // i18n strings passed from server
  labels: {
    gatewayLabel: string;
    registrationOpen: string;
    daysRemaining: string;
    registerNow: string;
  };
}

export function HeroCard({
  textColorMode,
  daysRemaining,
  locale,
  eventSlug,
  labels,
}: HeroCardProps) {
  // true = image is dark → use white text; false = image is light → use dark text
  const [imageDark, setImageDark] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (textColorMode === "white") { setImageDark(true); return; }
    if (textColorMode === "dark")  { setImageDark(false); return; }

    // AUTO: sample the bottom-third of the image with Canvas API
    const img = imgRef.current;
    if (!img) return;

    const detect = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const startY = Math.floor(h * 0.55);
        const sampleH = Math.floor(h * 0.45);
        const data = ctx.getImageData(0, startY, w, sampleH).data;
        let total = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        setImageDark(total / pixels < 128);
      } catch {
        // CORS or canvas error — keep default (white text on dark image)
      }
    };

    if (img.complete && img.naturalWidth > 0) detect();
    else img.addEventListener("load", detect, { once: true });
  }, [textColorMode]);

  const textClass = imageDark ? "text-white" : "text-navy";
  const textMuted = imageDark ? "rgba(255,255,255,0.88)" : "rgba(11,30,61,0.80)";
  const labelMuted = imageDark ? "rgba(255,255,255,0.45)" : "rgba(11,30,61,0.38)";

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative h-[500px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src="/images/Stariy_Tbilisi.jpg"
          alt="Tbilisi, Georgia"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(5,12,28,0.68) 50%, rgba(5,12,28,0.95) 100%)",
          }}
        />

        {/* Top centre: platform label */}
        <div className="absolute top-5 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-[11px] font-light tracking-[0.24em] uppercase" style={{ color: labelMuted }}>
            {labels.gatewayLabel}
          </p>
        </div>

        {/* Right-side stacked badges — all same width */}
        <div className="absolute top-12 right-5 flex flex-col gap-2" style={{ width: "178px" }}>
          <div
            className="flex items-center justify-center gap-1.5 w-full rounded-full px-3 py-1.5 backdrop-blur-sm"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(74,222,128,0.30)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span className="text-[11px] font-medium tracking-wide text-green-300">
              {labels.registrationOpen}
            </span>
          </div>

          {daysRemaining > 0 && (
            <div
              className="flex items-center justify-center gap-1.5 w-full rounded-full px-3 py-1.5 backdrop-blur-sm"
              style={{ background: "rgba(139,0,0,0.22)", border: "1px solid rgba(220,38,38,0.35)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#f87171" }} />
              <span className="text-[11px] font-medium tracking-wide" style={{ color: "#fca5a5" }}>
                {labels.daysRemaining.replace("{days}", String(daysRemaining))}
              </span>
            </div>
          )}

          <Link
            href={`/${locale}/events/${eventSlug}?tab=register`}
            className="flex items-center justify-center gap-1.5 w-full rounded-full px-3 py-1.5 backdrop-blur-sm transition-opacity hover:opacity-85"
            style={{ background: "rgba(26,95,168,0.40)", border: "1px solid rgba(96,165,250,0.35)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            <span className="text-[11px] font-medium tracking-wide text-blue-200">
              {labels.registerNow} →
            </span>
          </Link>
        </div>

        {/* Bottom: title + date/location — color adapts to image */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-9">
          <h1
            className={`font-bold leading-tight mb-3 ${textClass}`}
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
          >
            67th PABSEC General Assembly
          </h1>
          <p className="font-semibold" style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: textMuted }}>
            29 June – 1 July 2026 · Tbilisi, Georgia
          </p>
        </div>
      </div>
    </div>
  );
}
