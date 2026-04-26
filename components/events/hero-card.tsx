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
    <div className="relative overflow-hidden" style={{ minHeight: "clamp(520px, 70vh, 720px)" }}>
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl || "/images/Stariy_Tbilisi.jpg"}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Cinematic dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(7,15,26,0.25) 0%, rgba(7,15,26,0.62) 55%, rgba(7,15,26,0.96) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between px-6 md:px-14 lg:px-20 py-10" style={{ minHeight: "clamp(520px, 70vh, 720px)" }}>

        {/* Top row: gateway label */}
        <div>
          <p
            className="text-[11px] font-semibold uppercase"
            style={{ color: "#C9A84C", letterSpacing: "3px" }}
          >
            {labels.gatewayLabel}
          </p>
        </div>

        {/* Bottom content: title + meta + badges */}
        <div className="max-w-3xl">
          <h1
            className="font-playfair font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
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
            {/* Registration Open */}
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

            {/* Days remaining */}
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

            {/* Register CTA */}
            <Link
              href={`/${locale}/events/${eventSlug}?tab=register`}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90"
              style={{ background: "#C9A84C", color: "#070F1A" }}
            >
              {labels.registerNow}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
