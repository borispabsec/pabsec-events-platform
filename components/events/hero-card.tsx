"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface HeroCardProps {
  textColorMode: string; // "auto" | "white" | "dark"
  daysRemaining: number;
  locale: string;
  eventSlug: string;
  labels: {
    gatewayLabel: string;
    registrationOpen: string;
    daysRemaining: string;
    registerNow: string;
    eventTitle: string;
    eventDateLocation: string;
  };
}

export function HeroCard({
  textColorMode,
  daysRemaining,
  locale,
  eventSlug,
  labels,
}: HeroCardProps) {
  // false = light image → dark text; true = dark image → white text
  const [imageDark, setImageDark] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (textColorMode === "white") { setImageDark(true); return; }
    if (textColorMode === "dark")  { setImageDark(false); return; }

    // AUTO: sample the bottom 45% of the image with Canvas API
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
        // CORS or canvas error — keep default (dark text)
      }
    };

    if (img.complete && img.naturalWidth > 0) detect();
    else img.addEventListener("load", detect, { once: true });
  }, [textColorMode]);

  const textClass    = imageDark ? "text-white" : "text-[#0B1E3D]";
  const textMuted    = imageDark ? "rgba(255,255,255,0.88)" : "rgba(11,30,61,0.82)";
  const labelMuted   = imageDark ? "rgba(255,255,255,0.45)" : "rgba(11,30,61,0.50)";

  // Gradient overlay adapts so text stays readable on both dark and light photos
  const overlay = imageDark
    ? "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(5,12,28,0.65) 50%, rgba(5,12,28,0.93) 100%)"
    : "linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(248,249,250,0.30) 50%, rgba(248,249,250,0.82) 100%)";

  // Badge styles
  const greenBg     = imageDark ? "rgba(34,197,94,0.15)"  : "rgba(34,197,94,0.18)";
  const greenBorder = imageDark ? "rgba(74,222,128,0.30)" : "rgba(21,128,61,0.40)";
  const greenText   = imageDark ? "#86efac"  : "#15803d";
  const greenDot    = imageDark ? "#4ade80"  : "#16a34a";

  const redBg       = imageDark ? "rgba(139,0,0,0.22)"    : "rgba(220,38,38,0.10)";
  const redBorder   = imageDark ? "rgba(220,38,38,0.35)"  : "rgba(220,38,38,0.35)";
  const redText     = imageDark ? "#fca5a5"  : "#b91c1c";
  const redDot      = imageDark ? "#f87171"  : "#dc2626";

  const blueBg      = imageDark ? "rgba(26,95,168,0.40)"  : "rgba(26,95,168,0.12)";
  const blueBorder  = imageDark ? "rgba(96,165,250,0.35)" : "rgba(26,95,168,0.40)";
  const blueText    = imageDark ? "#93c5fd"  : "#1a5fa8";
  const blueDot     = imageDark ? "#60a5fa"  : "#1a5fa8";

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
        {/* Adaptive gradient overlay */}
        <div className="absolute inset-0" style={{ background: overlay }} />

        {/* Top centre: platform label */}
        <div className="absolute top-5 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-[11px] font-light tracking-[0.24em] uppercase" style={{ color: labelMuted }}>
            {labels.gatewayLabel}
          </p>
        </div>

        {/* Right-side stacked badges */}
        <div className="absolute top-12 right-5 flex flex-col gap-2" style={{ width: "178px" }}>
          <div
            className="flex items-center justify-center gap-1.5 w-full rounded-full px-3 py-1.5 backdrop-blur-sm"
            style={{ background: greenBg, border: `1px solid ${greenBorder}` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
              style={{ background: greenDot }}
            />
            <span className="text-[11px] font-medium tracking-wide" style={{ color: greenText }}>
              {labels.registrationOpen}
            </span>
          </div>

          {daysRemaining > 0 && (
            <div
              className="flex items-center justify-center gap-1.5 w-full rounded-full px-3 py-1.5 backdrop-blur-sm"
              style={{ background: redBg, border: `1px solid ${redBorder}` }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: redDot }} />
              <span className="text-[11px] font-medium tracking-wide" style={{ color: redText }}>
                {labels.daysRemaining.replace("{days}", String(daysRemaining))}
              </span>
            </div>
          )}

          <Link
            href={`/${locale}/events/${eventSlug}?tab=register`}
            className="flex items-center justify-center gap-1.5 w-full rounded-full px-3 py-1.5 backdrop-blur-sm transition-opacity hover:opacity-85"
            style={{ background: blueBg, border: `1px solid ${blueBorder}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: blueDot }} />
            <span className="text-[11px] font-medium tracking-wide" style={{ color: blueText }}>
              {labels.registerNow} →
            </span>
          </Link>
        </div>

        {/* Bottom: event title + date/location — color adapts to image */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-9">
          <h1
            className={`font-bold leading-tight mb-3 ${textClass}`}
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
          >
            {labels.eventTitle}
          </h1>
          <p className="font-semibold" style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: textMuted }}>
            {labels.eventDateLocation}
          </p>
        </div>
      </div>
    </div>
  );
}
