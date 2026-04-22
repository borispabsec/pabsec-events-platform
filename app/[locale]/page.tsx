import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PAST_ASSEMBLIES } from "@/lib/data/archive";

export const metadata: Metadata = {
  title: "PABSEC Events Platform – Official Digital Gateway",
  description:
    "Official registration and information platform for PABSEC General Assemblies, Committee Meetings, and official events of the Black Sea Economic Cooperation.",
};

function getDaysRemaining(): number {
  const target = new Date("2026-06-30T00:00:00.000Z");
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

const RESOURCE_CARDS = [
  {
    id: "programme",
    title: "Programme",
    description: "Full agenda of plenary sessions, committee meetings and side events for delegates.",
    cta: "View Programme",
    href: "#programme",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    id: "documents",
    title: "Documents",
    description: "Resolutions, reports, draft texts and official background papers for delegates.",
    cta: "Browse Documents",
    href: "#documents",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: "practical",
    title: "Practical Information",
    description: "Venue details, visa guidance, accommodation options and transport information.",
    cta: "Learn More",
    href: "#practical",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
      </svg>
    ),
  },
  {
    id: "registration",
    title: "Registration",
    description: "Secure online accreditation for parliamentarians and officials.",
    cta: "Register Now",
    href: "/events",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

const COMMITTEE_MEETINGS = [
  {
    id: "econ",
    session: "67th Meeting",
    committee: "Committee on Economic and Development Policy",
    period: "September / October 2026",
    location: "Sofia, Bulgaria",
  },
  {
    id: "legal",
    session: "68th Meeting",
    committee: "Committee on Legal Affairs and International Cooperation",
    period: "September / October 2026",
    location: "TBA",
  },
  {
    id: "social",
    session: "67th Meeting",
    committee: "Committee on Social and Humanitarian Policy",
    period: "September / October 2026",
    location: "Yerevan, Armenia",
  },
];


export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const daysRemaining = getDaysRemaining();

  // 68th GA data from DB — editable via admin panel
  let ga68 = { location: "Athens, Hellenic Republic", period: "November 2026" };
  try {
    const event = await db.event.findUnique({
      where: { slug: "pabsec-68th-general-assembly" },
      select: { location: true, startDate: true },
    });
    if (event) {
      ga68 = {
        location: event.location,
        period: event.startDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      };
    }
  } catch {
    // DB unavailable — hardcoded fallback already set above
  }

  return (
    <div className="font-sans">

      {/* ── 1. EVENT CARD (67th GA) ───────────────────────────────────────── */}
      <section className="bg-white pt-8 pb-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl">

            {/* Photo — full-width, tall */}
            <div className="relative h-[500px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Tbilisi_Photo.png"
                alt="Tbilisi, Georgia"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(5,12,28,0.72) 55%, rgba(5,12,28,0.96) 100%)",
                }}
              />

              {/* Very top centre: platform label */}
              <div className="absolute top-5 left-0 right-0 flex justify-center pointer-events-none">
                <p
                  className="text-[11px] font-light tracking-[0.24em] uppercase"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Official Digital Gateway for PABSEC Events
                </p>
              </div>

              {/* Right-side stacked badges — all same width */}
              <div className="absolute top-12 right-5 flex flex-col gap-2" style={{ width: "178px" }}>
                {/* Registration Open — green */}
                <div
                  className="flex items-center justify-center gap-1.5 w-full rounded-full px-3 py-1.5 backdrop-blur-sm"
                  style={{
                    background: "rgba(34,197,94,0.15)",
                    border: "1px solid rgba(74,222,128,0.30)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                  <span className="text-[11px] font-medium tracking-wide text-green-300">
                    Registration Open
                  </span>
                </div>

                {/* Days remaining — crimson */}
                {daysRemaining > 0 && (
                  <div
                    className="flex items-center justify-center gap-1.5 w-full rounded-full px-3 py-1.5 backdrop-blur-sm"
                    style={{
                      background: "rgba(139,0,0,0.22)",
                      border: "1px solid rgba(220,38,38,0.35)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#f87171" }} />
                    <span className="text-[11px] font-medium tracking-wide" style={{ color: "#fca5a5" }}>
                      {daysRemaining} days remaining
                    </span>
                  </div>
                )}

                {/* Register Now — blue */}
                <Link
                  href={`/${locale}/events`}
                  className="flex items-center justify-center gap-1.5 w-full rounded-full px-3 py-1.5 backdrop-blur-sm transition-opacity hover:opacity-85"
                  style={{
                    background: "rgba(26,95,168,0.40)",
                    border: "1px solid rgba(96,165,250,0.35)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-[11px] font-medium tracking-wide text-blue-200">
                    Register Now →
                  </span>
                </Link>
              </div>

              {/* Bottom: title + date/location */}
              <div className="absolute bottom-0 left-0 right-0 px-8 pb-9">
                <h1
                  className="text-white font-bold leading-tight mb-3"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                >
                  67th PABSEC General Assembly
                </h1>
                <p
                  className="font-semibold"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.88)" }}
                >
                  30 June – 1 July 2026 · Tbilisi, Georgia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. RESOURCE CARDS ─────────────────────────────────────────────── */}
      <section id="resources" className="pt-6 pb-12 border-b border-gray-100" style={{ background: "#F8F9FA" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RESOURCE_CARDS.map((card) => (
              <a
                key={card.id}
                href={card.href.startsWith("/") ? `/${locale}${card.href}` : card.href}
                className="group bg-white rounded-2xl p-7 flex flex-col gap-5 border border-gray-100 hover:border-gold/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-gold transition-all duration-500 rounded-t-2xl" />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{ background: "rgba(11,30,61,0.05)", color: "#0B1E3D" }}
                >
                  <div className="group-hover:hidden">{card.icon}</div>
                  <div className="hidden group-hover:block" style={{ color: "#C9A84C" }}>{card.icon}</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-navy text-[15px] mb-2">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.description}</p>
                </div>
                <div
                  className="flex items-center gap-1.5 text-sm font-semibold group-hover:gap-3 transition-all duration-200"
                  style={{ color: "#C9A84C" }}
                >
                  {card.cta}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. UPCOMING EVENTS ────────────────────────────────────────────── */}
      <section className="py-10 border-b border-blue-100" style={{ background: "#EBF4FF" }}>
        <div className="max-w-7xl mx-auto px-6">

          {/* Section label */}
          <div className="flex items-center gap-3 mb-7">
            <div className="h-px w-8" style={{ background: "#1A5FA8" }} />
            <span
              className="text-sm tracking-[0.22em] uppercase font-bold"
              style={{ color: "#1A5FA8" }}
            >
              Upcoming Events
            </span>
          </div>

          {/* Autumn Committee Meetings */}
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
            style={{ color: "rgba(11,30,61,0.38)" }}
          >
            Autumn 2026 — Committee Meetings
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {COMMITTEE_MEETINGS.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl p-5 border border-blue-100"
                style={{ boxShadow: "0 1px 4px rgba(26,95,168,0.06)" }}
              >
                <div className="mb-3">
                  <span
                    className="text-[9px] tracking-[0.22em] uppercase font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(201,168,76,0.12)",
                      color: "#a88630",
                      border: "1px solid rgba(201,168,76,0.28)",
                    }}
                  >
                    Save the Date
                  </span>
                </div>
                <p
                  className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "rgba(11,30,61,0.35)" }}
                >
                  {m.session}
                </p>
                <h4 className="text-navy font-bold text-[13px] leading-snug mb-4">{m.committee}</h4>
                <div className="space-y-1.5">
                  <p className="text-[12px] text-gray-500 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {m.period}
                  </p>
                  <p className="text-[12px] text-gray-500 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                    </svg>
                    {m.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 68th General Assembly — data from DB */}
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
            style={{ color: "rgba(11,30,61,0.38)" }}
          >
            68th Session of the General Assembly
          </p>
          <div
            className="relative rounded-2xl px-8 py-8 md:px-12 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #132848 100%)" }}
          >
            <div
              className="absolute top-[-40px] right-[-40px] w-64 h-64 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(201,168,76,0.08), transparent 70%)" }}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span
                    className="text-[9px] tracking-[0.32em] uppercase font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(201,168,76,0.15)",
                      color: "#C9A84C",
                      border: "1px solid rgba(201,168,76,0.25)",
                    }}
                  >
                    Upcoming · Save the Date
                  </span>
                </div>
                <h3 className="text-white font-bold text-xl mb-1">68th General Assembly</h3>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {ga68.location} · {ga68.period}
                </p>
              </div>
              <div
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium cursor-default"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.32)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Registration Not Yet Open
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. ARCHIVE PREVIEW ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-gold" />
                <span className="text-gold text-[10px] tracking-[0.38em] uppercase font-semibold">Archive</span>
              </div>
              <h2 className="text-navy text-3xl font-bold">Past Assemblies</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-sm leading-relaxed">
                Official records of previous PABSEC sessions, resolutions and documents.
              </p>
            </div>
            <Link
              href={`/${locale}/archive`}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-gold"
              style={{ color: "#C9A84C" }}
            >
              View Full Archive
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAST_ASSEMBLIES.slice(0, 3).map((assembly) => (
              <div
                key={assembly.session}
                className="group bg-white rounded-2xl p-7 border border-gray-100 hover:border-gold/20 hover:-translate-y-0.5 transition-all duration-200"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(11,30,61,0.06)", color: "#0B1E3D" }}
                  >
                    {assembly.session}
                  </span>
                  <span
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(34,197,94,0.08)", color: "#15803d" }}
                  >
                    Completed
                  </span>
                </div>
                <h3 className="text-navy font-bold text-[15px] mb-1">{assembly.title}</h3>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}
                    viewBox="0 0 24 24" style={{ color: "#9CA3AF" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">{assembly.location}</p>
                </div>
                <div className="flex items-center gap-1.5 mb-5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}
                    viewBox="0 0 24 24" style={{ color: "#9CA3AF" }}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <p className="text-gray-400 text-xs">{assembly.date}</p>
                </div>
                <a
                  href="https://www.pabsec.org/page-detail/pabsec-general-assemblies/8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors hover:text-gold"
                  style={{ color: "#1A5FA8" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  View Documents →
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href={`/${locale}/archive`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "#C9A84C" }}
            >
              View Full Archive
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
