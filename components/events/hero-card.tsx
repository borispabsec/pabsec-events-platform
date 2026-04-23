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

function sampleBrightness(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): number {
  const data = ctx.getImageData(x, y, w, h).data;
  let total = 0;
  const pixels = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return total / pixels; // 0–255
}

export function HeroCard({
  textColorMode,
  daysRemaining,
  locale,
  eventSlug,
  labels,
}: HeroCardProps) {
  // true = dark photo → use light/tinted badge style
  // false = light photo → use solid colored badge style
  const [imageDark, setImageDark] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (textColorMode === "white") { setImageDark(true);  return; }
    if (textColorMode === "dark")  { setImageDark(false); return; }

    const img = imgRef.current;
    if (!img) return;

    const detect = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth  || img.width;
        const h = img.naturalHeight || img.height;
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);

        // Sample two regions and average them:
        // 1. Badge area: top-right 30% × top 50%
        const badgeX = Math.floor(w * 0.65);
        const badgeW = w - badgeX;
        const badgeH = Math.floor(h * 0.50);
        const b1 = sampleBrightness(ctx, badgeX, 0, badgeW, badgeH);

        // 2. Title area: bottom 40%
        const titleY = Math.floor(h * 0.60);
        const titleH = h - titleY;
        const b2 = sampleBrightness(ctx, 0, titleY, w, titleH);

        const avg = (b1 + b2) / 2;
        setImageDark(avg < 128);
      } catch {
        // canvas blocked — keep default
      }
    };

    if (img.complete && img.naturalWidth > 0) detect();
    else img.addEventListener("load", detect, { once: true });
  }, [textColorMode]);

  // ── Text colours for title / date / label ─────────────────────────────────
  const textClass  = imageDark ? "text-white"     : "text-[#0B1E3D]";
  const textMuted  = imageDark ? "rgba(255,255,255,0.88)" : "rgba(11,30,61,0.82)";
  const labelMuted = imageDark ? "rgba(255,255,255,0.45)" : "rgba(11,30,61,0.50)";

  const overlay = imageDark
    ? "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(5,12,28,0.65) 50%, rgba(5,12,28,0.93) 100%)"
    : "linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(248,249,250,0.30) 50%, rgba(248,249,250,0.82) 100%)";

  // ── Badge styles ───────────────────────────────────────────────────────────
  // Dark photo → semi-transparent coloured tint, blur(8px)
  // Light photo → solid saturated colour, blur(4px)
  const blur   = imageDark ? "blur(8px)" : "blur(4px)";
  const badgeBase: React.CSSProperties = {
    minWidth: "195px",
    padding: "10px 18px",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.3s ease",
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    textAlign: "center",
  };

  const greenStyle: React.CSSProperties = imageDark
    ? { ...badgeBase, background: "rgba(34,197,94,0.20)",  border: "1px solid rgba(34,197,94,0.60)",  color: "#fff" }
    : { ...badgeBase, background: "rgba(21,128,61,0.85)",  border: "1px solid #15803d",               color: "#fff" };

  const redStyle: React.CSSProperties = imageDark
    ? { ...badgeBase, background: "rgba(220,38,38,0.20)",  border: "1px solid rgba(220,38,38,0.60)",  color: "#fff" }
    : { ...badgeBase, background: "rgba(185,28,28,0.85)",  border: "1px solid #b91c1c",               color: "#fff" };

  const blueStyle: React.CSSProperties = imageDark
    ? { ...badgeBase, background: "rgba(59,130,246,0.20)", border: "1px solid rgba(59,130,246,0.60)", color: "#fff" }
    : { ...badgeBase, background: "rgba(29,78,216,0.85)",  border: "1px solid #1d4ed8",               color: "#fff" };

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
          <p
            className="text-[11px] font-light tracking-[0.24em] uppercase"
            style={{ color: labelMuted }}
          >
            {labels.gatewayLabel}
          </p>
        </div>

        {/* Right-side badges — adapt to photo brightness */}
        <div className="absolute top-12 right-5 flex flex-col gap-3">

          {/* Registration Open */}
          <div style={greenStyle}>
            <span
              className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
              style={{ background: "#22c55e" }}
            />
            <span>{labels.registrationOpen}</span>
          </div>

          {/* Days remaining */}
          {daysRemaining > 0 && (
            <div style={redStyle}>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#dc2626" }}
              />
              <span>{labels.daysRemaining.replace("{days}", String(daysRemaining))}</span>
            </div>
          )}

          {/* Register Now */}
          <Link
            href={`/${locale}/events/${eventSlug}?tab=register`}
            style={blueStyle}
            className="hover:opacity-85 transition-opacity"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "#3b82f6" }}
            />
            <span>{labels.registerNow} →</span>
          </Link>
        </div>

        {/* Bottom: event title + date/location */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-9">
          <h1
            className={`font-bold leading-tight mb-3 ${textClass}`}
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
          >
            {labels.eventTitle}
          </h1>
          <p
            className="font-semibold"
            style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: textMuted }}
          >
            {labels.eventDateLocation}
          </p>
        </div>
      </div>
    </div>
  );
}
