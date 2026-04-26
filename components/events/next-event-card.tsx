"use client";

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
  return (
    <div
      className="group relative rounded-2xl overflow-hidden"
      style={{ minHeight: 200 }}
    >
      {/* Background */}
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(7,15,26,0.40)" }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #0B1F3A 0%, #0F2848 60%, #132E52 100%)" }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-full opacity-30"
            style={{ background: "radial-gradient(ellipse at right center, rgba(201,168,76,0.18), transparent 70%)" }}
          />
        </div>
      )}

      {/* Gold top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(to right, #C9A84C, rgba(201,168,76,0.2))" }}
      />

      <div
        className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-8 py-8 md:px-12"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
      >
        <div>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[9px] tracking-[0.28em] uppercase font-bold px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(201,168,76,0.15)",
                color: "#C9A84C",
                border: "1px solid rgba(201,168,76,0.50)",
              }}
            >
              {labels.saveTheDate}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-playfair font-bold text-white leading-tight mb-3"
            style={{ fontSize: "clamp(1.2rem, 3vw, 1.6rem)", fontVariant: "none", fontVariantNumeric: "normal" }}
          >
            {title}
          </h3>

          {/* Location + dates */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#E8C97A" }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "#E8C97A" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
              </svg>
              {location}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#E8C97A" }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "#E8C97A" }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {period}
            </span>
          </div>
        </div>

        {/* CTA button */}
        <Link
          href={`/${locale}/events/${slug}`}
          className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
          style={{
            background: "rgba(201,168,76,0.12)",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(201,168,76,0.40)",
          }}
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
