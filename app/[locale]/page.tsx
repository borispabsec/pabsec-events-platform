import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PABSEC Events Platform – Official Digital Gateway",
  description:
    "Official registration and information platform for PABSEC assemblies and committee meetings of the Black Sea Economic Cooperation.",
};

// ── Countdown (server-side) ────────────────────────────────────────────────
function getDaysRemaining(): number {
  const target = new Date("2026-05-19T00:00:00.000Z");
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

// ── Data ──────────────────────────────────────────────────────────────────
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
    description: "Secure online accreditation for parliamentarians, officials and accredited press.",
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

const MEMBER_STATES = [
  "Albania", "Armenia", "Azerbaijan", "Bulgaria",
  "Georgia", "Greece", "Moldova", "North Macedonia",
  "Romania", "Russia", "Serbia", "Türkiye", "Ukraine",
];

const HERO_STATS = [
  { value: "13",   label: "Member States" },
  { value: "1993", label: "Established" },
  { value: "67th", label: "Assembly" },
];

const EVENT_DETAILS = [
  {
    label: "Date",
    value: "May 19–21, 2026",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: "Location",
    value: "Tbilisi, Georgia",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
      </svg>
    ),
  },
  {
    label: "Format",
    value: "In-Person",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const daysRemaining = getDaysRemaining();

  return (
    <div className="font-sans">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden min-h-[92vh] flex items-center"
        style={{ background: "linear-gradient(150deg, #070F20 0%, #0B1E3D 60%, #0d2346 100%)" }}
      >
        {/* Decorative radial glows */}
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(26,95,168,0.12) 0%, transparent 65%)" }}
        />
        <div
          className="absolute bottom-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)" }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr,1fr] gap-16 items-center">

            {/* ── Left: Text ── */}
            <div className="animate-fade-in-up">

              {/* Small uppercase label → "Official Digital Gateway for" */}
              <p
                className="text-[11px] tracking-[0.42em] uppercase font-semibold mb-4"
                style={{ color: "rgba(201,168,76,0.72)" }}
              >
                Official Digital Gateway for
              </p>

              {/* Main heading */}
              <h1
                className="text-white font-bold leading-[1.08] tracking-tight mb-6"
                style={{ fontSize: "clamp(2.2rem, 4.8vw, 4rem)" }}
              >
                PABSEC{" "}
                <em className="not-italic" style={{ color: "#C9A84C" }}>Events</em>
              </h1>

              <p className="text-lg leading-relaxed mb-10 max-w-[480px]"
                style={{ color: "rgba(255,255,255,0.50)" }}>
                The secure registration and information platform for parliamentary
                assemblies, committee meetings.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-14">
                <Link
                  href={`/${locale}/events`}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-navy transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110"
                  style={{ background: "#C9A84C" }}
                >
                  Register for the Assembly
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href="#resources"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.14)" }}
                >
                  Explore Resources
                </a>
              </div>

              {/* Trust stats */}
              <div
                className="flex items-center gap-8 pt-8"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                {HERO_STATS.map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-8">
                    {i > 0 && (
                      <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.10)" }} />
                    )}
                    <div>
                      <div className="text-white font-bold text-2xl leading-none">{stat.value}</div>
                      <div className="text-[10px] uppercase tracking-widest mt-1"
                        style={{ color: "rgba(255,255,255,0.30)" }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Event card ── */}
            <div className="animate-fade-in-right animation-delay-200">
              <div className="rounded-2xl overflow-hidden bg-white shadow-2xl">

                {/* Cover photo — Tbilisi */}
                <div className="h-56 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Tbilisi_city_view.jpg/1280px-Tbilisi_city_view.jpg"
                    alt="Tbilisi, Georgia"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient overlay for text legibility */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(7,15,32,0.78) 100%)" }}
                  />

                  {/* Text overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <div
                      className="text-sm font-bold uppercase tracking-[0.32em] mb-2"
                      style={{ color: "#C9A84C" }}
                    >
                      67th General Assembly
                    </div>
                    <div className="text-white font-bold text-xl leading-tight mb-1">
                      Tbilisi, Georgia
                    </div>
                    <div className="text-sm" style={{ color: "rgba(255,255,255,0.60)" }}>
                      May 19–21, 2026
                    </div>
                  </div>

                  {/* Registration status badge */}
                  <div
                    className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-sm"
                    style={{
                      background: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(74,222,128,0.25)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[11px] font-medium tracking-wide text-green-300">
                      Registration Open
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6">
                  <h3 className="text-navy font-bold text-[15px] leading-snug mb-5">
                    67th Ordinary Session of the PABSEC General Assembly
                  </h3>

                  <div className="space-y-3.5 mb-5">
                    {EVENT_DETAILS.map(({ label, value, icon }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(11,30,61,0.04)",
                            border: "1px solid rgba(11,30,61,0.06)",
                            color: "rgba(11,30,61,0.38)",
                          }}
                        >
                          {icon}
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider leading-none mb-0.5"
                            style={{ color: "#9CA3AF" }}>
                            {label}
                          </div>
                          <div className="text-navy text-sm font-semibold">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Countdown */}
                  {daysRemaining > 0 && (
                    <div
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl mb-5"
                      style={{
                        background: "rgba(201,168,76,0.08)",
                        border: "1px solid rgba(201,168,76,0.18)",
                      }}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        style={{ color: "#C9A84C" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold" style={{ color: "#a88630" }}>
                        {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
                      </span>
                    </div>
                  )}

                  <Link
                    href={`/${locale}/events`}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110"
                    style={{ background: "#1A5FA8" }}
                  >
                    Register Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── RESOURCE CARDS ────────────────────────────────────────────────── */}
      <section id="resources" className="py-20 border-b border-gray-100" style={{ background: "#F8F9FA" }}>
        <div className="max-w-7xl mx-auto px-6">

          {/* Section header */}
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] tracking-[0.38em] uppercase font-semibold text-gold">
                67th General Assembly Resources
              </span>
              <div className="h-px w-8 bg-gold" />
            </div>
            <h2 className="text-navy text-3xl font-bold mb-3">Everything Delegates Need</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
              Essential information and services for parliamentarians and officials.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RESOURCE_CARDS.map((card) => (
              <a
                key={card.id}
                href={card.href.startsWith("/") ? `/${locale}${card.href}` : card.href}
                className="group bg-white rounded-2xl p-7 flex flex-col gap-5 border border-gray-100 hover:border-gold/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                {/* Gold top accent on hover */}
                <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-gold transition-all duration-500 rounded-t-2xl" />

                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{ background: "rgba(11,30,61,0.05)", color: "#0B1E3D" }}
                >
                  <div className="group-hover:hidden">{card.icon}</div>
                  <div className="hidden group-hover:block" style={{ color: "#C9A84C" }}>{card.icon}</div>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="font-bold text-navy text-[15px] mb-2">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.description}</p>
                </div>

                {/* CTA */}
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

      {/* ── ABOUT PABSEC ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Text */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-gold" />
                <span className="text-gold text-[10px] tracking-[0.38em] uppercase font-semibold">About</span>
              </div>
              <h2 className="text-navy text-3xl font-bold leading-tight mb-6">
                Parliamentary Assembly of the<br />Black Sea Economic Cooperation
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4 text-[15px]">
                PABSEC is the parliamentary dimension of the Organisation of the Black Sea Economic
                Cooperation (BSEC). Established in 1993, it brings together parliamentarians from
                all thirteen BSEC member states to foster regional cooperation and democratic governance.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8 text-[15px]">
                The General Assembly — the supreme body of PABSEC — convenes twice per year to
                adopt resolutions, elect Bureau members and shape the parliamentary agenda for the
                Black Sea region.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {["Founded 1993", "13 Member States", "Biannual Sessions", "Istanbul Secretariat"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full border"
                    style={{ color: "#0B1E3D", borderColor: "rgba(11,30,61,0.14)", background: "rgba(11,30,61,0.04)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Member states */}
            <div
              className="rounded-2xl p-8"
              style={{ background: "rgba(248,249,250,0.7)", border: "1px solid rgba(11,30,61,0.07)" }}
            >
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-6" style={{ color: "#9CA3AF" }}>
                Member States
              </h3>
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-6">
                {MEMBER_STATES.map((state) => (
                  <div key={state} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#1A5FA8" }} />
                    {state}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "#0B1E3D" }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: "rgba(201,168,76,0.38)" }} />
            <span className="text-[10px] tracking-[0.42em] uppercase font-semibold"
              style={{ color: "rgba(201,168,76,0.55)" }}>
              Next Assembly
            </span>
            <div className="h-px w-8" style={{ background: "rgba(201,168,76,0.38)" }} />
          </div>
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
            67th General Assembly · Tbilisi, Georgia
          </h2>
          <p className="text-sm mb-10" style={{ color: "#7db3e0" }}>May 19–21, 2026</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/events`}
              className="inline-flex items-center gap-2.5 text-sm font-semibold px-7 py-3.5 rounded-xl text-navy transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110"
              style={{ background: "#C9A84C" }}
            >
              Register for the Assembly
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="https://www.pabsec.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-7 py-3.5 rounded-xl transition-all duration-200 hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.14)" }}
            >
              Visit pabsec.org
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
