import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PABSEC Events Platform – 67th General Assembly",
  description:
    "Official events platform of the Parliamentary Assembly of the Black Sea Economic Cooperation. 67th General Assembly, Tbilisi, Georgia, May 19–21 2026.",
};

const NAV_LINKS = [
  { label: "Programme",       href: "#programme"  },
  { label: "Documents",       href: "#documents"  },
  { label: "Register",        href: "#register"   },
  { label: "Practical Info",  href: "#practical"  },
];

const QUICK_LINKS = [
  {
    id: "programme",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    title: "Programme",
    description: "Full agenda of plenary sessions, committee meetings and side events.",
    cta: "View Programme",
  },
  {
    id: "documents",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: "Documents",
    description: "Resolutions, reports, draft texts and background papers for delegates.",
    cta: "Browse Documents",
  },
  {
    id: "register",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    title: "Register",
    description: "Online accreditation for parliamentarians, officials and accredited press.",
    cta: "Register Now",
  },
  {
    id: "practical",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
    title: "Practical Info",
    description: "Venue details, visa guidance, accommodation and transport in Tbilisi.",
    cta: "Learn More",
  },
];

const MEMBER_STATES = [
  "Albania", "Armenia", "Azerbaijan", "Bulgaria", "Georgia",
  "Greece", "Moldova", "Romania", "Russia", "Serbia", "Turkey", "Ukraine",
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="font-sans">
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden min-h-[92vh] flex flex-col"
        style={{ background: "linear-gradient(150deg, #070F20 0%, #0B1E3D 55%, #0f2a50 100%)" }}
      >
        {/* Decorative grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #1A5FA8 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }} />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
          {/* Logo */}
          <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-8 py-5 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.pabsec.org/frontend/img/logo@2x_en.gif"
              alt="PABSEC Logo"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Assembly label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold text-xs font-semibold uppercase tracking-[0.25em]">
              67th General Assembly
            </span>
            <div className="h-px w-12 bg-gold" />
          </div>

          {/* Title */}
          <h1 className="text-white font-bold leading-tight mb-4 max-w-3xl"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            PABSEC Events Platform
          </h1>
          <p className="text-blue-200/80 text-lg max-w-xl mb-10">
            Parliamentary Assembly of the Black Sea Economic Cooperation
          </p>

          {/* Event card */}
          <div className="w-full max-w-lg mb-10 rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)" }}>
            <div className="border-b border-white/10 px-6 py-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-300 text-xs font-medium uppercase tracking-wider">
                Registration Open
              </span>
            </div>
            <div className="px-6 py-6 grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Date</p>
                <p className="text-white font-semibold text-sm">May 19–21, 2026</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Location</p>
                <p className="text-white font-semibold text-sm">Tbilisi, Georgia</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Assembly</p>
                <p className="text-white font-semibold text-sm">67th Ordinary Session</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Format</p>
                <p className="text-white font-semibold text-sm">In-Person</p>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <Link
                href={`/${locale}/events`}
                className="flex-1 text-center text-sm font-semibold py-2.5 px-4 rounded-lg transition-all text-white bg-[#1A5FA8] hover:bg-[#154d8a]"
              >
                Register Now
              </Link>
              <Link
                href="#programme"
                className="flex-1 text-center text-sm font-semibold py-2.5 px-4 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all"
              >
                View Programme
              </Link>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="flex flex-col items-center gap-2 text-white/30">
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ───────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#0B1E3D" }}>
              Assembly Resources
            </h2>
            <p className="text-gray-500 text-sm">Everything delegates need for the 67th General Assembly</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_LINKS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{ background: "#1A5FA8" }}
                >
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
                <span className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                  style={{ color: "#1A5FA8" }}>
                  {item.cta}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                {/* Hover accent bar */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full rounded-b-2xl transition-all duration-300"
                  style={{ background: "#1A5FA8" }} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT PABSEC ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ background: "#C9A84C" }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#C9A84C" }}>
                About
              </span>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-5" style={{ color: "#0B1E3D" }}>
              Parliamentary Assembly of the Black Sea Economic Cooperation
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              PABSEC is the parliamentary dimension of the Organisation of the Black Sea Economic
              Cooperation (BSEC). Established in 1993, it brings together parliamentarians from
              all twelve BSEC member states to foster regional cooperation and democratic governance.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              The General Assembly — the highest decision-making body of PABSEC — meets twice a
              year to adopt resolutions, elect Bureau members and shape the parliamentary agenda
              for the Black Sea region.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Founded 1993", "12 Member States", "Biannual Sessions", "Istanbul Secretariat"].map((tag) => (
                <span key={tag}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border"
                  style={{ color: "#0B1E3D", borderColor: "#0B1E3D22", background: "#0B1E3D08" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Member states */}
          <div className="rounded-2xl border border-gray-200 p-8 bg-gray-50">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-5">
              Member States
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              {MEMBER_STATES.map((state) => (
                <div key={state} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#1A5FA8" }} />
                  {state}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COUNTDOWN BANNER ──────────────────────────────────────────── */}
      <section className="py-12 px-4" style={{ background: "#0B1E3D" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Next Assembly</p>
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">
            67th General Assembly · Tbilisi, Georgia
          </h2>
          <p className="text-blue-300 text-sm mb-8">May 19–21, 2026</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/events`}
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-lg text-white transition-all"
              style={{ background: "#1A5FA8" }}
            >
              Register for the Assembly
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="https://www.pabsec.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              pabsec.org
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
