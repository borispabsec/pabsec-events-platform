"use client";

import Link from "next/link";

interface HeroCardProps {
  textColorMode: string;
  daysRemaining: number;
  locale: string;
  eventSlug: string;
  imageUrl?: string;
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
  daysRemaining,
  locale,
  eventSlug,
  imageUrl,
  labels,
}: HeroCardProps) {
  const [datePart, locationPart] = labels.eventDateLocation.split(" · ");

  return (
    {/*
      Outer: establishes the stacking context and the hero height.
      All children (photo, gradient, content) use absolute inset-0 so they
      all fill exactly the same rectangle — no h-full / min-height ambiguity.
    */}
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(520px, 70vh, 720px)" }}
    >
      {/* Photo — fills the container edge-to-edge */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl || "/images/Stariy_Tbilisi.jpg"}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient — vivid photo at top, text-readable dark at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(7,15,26,0.05) 0%, rgba(7,15,26,0.15) 30%, rgba(7,15,26,0.55) 75%, rgba(7,15,26,0.90) 100%)",
        }}
      />

      {/*
        Content overlay — also absolute inset-0 so it covers the exact same
        area as the photo. flex + justify-between keeps gateway label at the
        top and title/badges at the bottom.
        Inner containers are max-w-[1400px] centered so text never stretches
        beyond 1400 px on ultrawide monitors while the photo stays 100 % wide.
      */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between py-10">

        {/* Top: gateway label */}
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
          <span
            className="inline-block text-[10px] font-semibold uppercase"
            style={{
              letterSpacing: "2.5px",
              color: "#C9A84C",
              background: "rgba(7,15,26,0.55)",
              borderRadius: 4,
              padding: "4px 12px",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(201,168,76,0.25)",
            }}
          >
            {labels.gatewayLabel}
          </span>
        </div>

        {/* Bottom: title + date/location + badges */}
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="max-w-3xl">
            <h1
              className="font-playfair font-bold text-white leading-tight mb-4"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontVariant: "none",
                fontVariantNumeric: "normal",
                verticalAlign: "baseline",
              }}
            >
              {labels.eventTitle}
            </h1>

            {/* Date + Location row */}
            <div className="flex flex-wrap items-center gap-5 mb-7">
              {datePart && (
                <span className="flex items-center gap-2 text-[15px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "rgba(201,168,76,0.7)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {datePart.trim()}
                </span>
              )}
              {locationPart && (
                <span className="flex items-center gap-2 text-[15px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "rgba(201,168,76,0.7)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                  {locationPart.trim()}
                </span>
              )}
              {!datePart && !locationPart && (
                <span className="text-[15px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                  {labels.eventDateLocation}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  border: "1px solid rgba(201,168,76,0.55)",
                  color: "#C9A84C",
                  background: "rgba(201,168,76,0.08)",
                }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: "#C9A84C" }} />
                {labels.registrationOpen}
              </div>

              {daysRemaining > 0 && (
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
                  style={{
                    background: "rgba(7,15,26,0.65)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "rgba(255,255,255,0.55)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {labels.daysRemaining.replace("{days}", String(daysRemaining))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
