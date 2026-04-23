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

        {/* Right-side stacked badges — always readable on any photo */}
        <div className="absolute top-12 right-5 flex flex-col gap-2.5">
          {/* Registration Open */}
          <div
            className="flex items-center justify-center gap-2 text-center"
            style={{
              minWidth: "200px",
              padding: "10px 20px",
              borderRadius: "25px",
              background: "rgba(0,0,0,0.70)",
              border: "1px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: "#22c55e" }} />
            <span className="text-[12px] font-semibold text-white tracking-wide">
              {labels.registrationOpen}
            </span>
          </div>

          {/* Days remaining */}
          {daysRemaining > 0 && (
            <div
              className="flex items-center justify-center gap-2 text-center"
              style={{
                minWidth: "200px",
                padding: "10px 20px",
                borderRadius: "25px",
                background: "rgba(0,0,0,0.70)",
                border: "1px solid rgba(255,255,255,0.4)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#dc2626" }} />
              <span className="text-[12px] font-semibold text-white tracking-wide">
                {labels.daysRemaining.replace("{days}", String(daysRemaining))}
              </span>
            </div>
          )}

          {/* Register Now */}
          <Link
            href={`/${locale}/events/${eventSlug}?tab=register`}
            className="flex items-center justify-center gap-2 text-center transition-opacity hover:opacity-80"
            style={{
              minWidth: "200px",
              padding: "10px 20px",
              borderRadius: "25px",
              background: "rgba(0,0,0,0.70)",
              border: "1px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#3b82f6" }} />
            <span className="text-[12px] font-semibold text-white tracking-wide">
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
