import type { Metadata } from "next";
import Link from "next/link";
import { PAST_ASSEMBLIES } from "@/lib/data/archive";

export const metadata: Metadata = {
  title: "Archive – PABSEC Events Platform",
  description: "Archive of past PABSEC General Assemblies, committee meetings and official sessions.",
};

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="font-sans bg-white min-h-screen">

      {/* Page header */}
      <div
        className="border-b border-gray-100 py-16 px-6"
        style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Link
              href={`/${locale}`}
              className="text-[11px] font-semibold uppercase tracking-[0.08em] hover:text-navy transition-colors flex items-center gap-1.5"
              style={{ color: "rgba(11,30,61,0.40)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">
              Past Sessions
            </span>
          </div>
          <h1 className="text-navy text-4xl font-bold mb-4 tracking-tight">Archive</h1>
          <p className="text-gray-500 text-base max-w-lg leading-relaxed">
            Official records of past PABSEC General Assemblies. Resolutions, programmes and minutes
            are available on the official PABSEC website.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Assembly grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {PAST_ASSEMBLIES.map((assembly) => (
            <div
              key={assembly.session}
              className="rounded-2xl p-7 border border-gray-100 bg-white hover:border-gold/20 hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              {/* Session badge + status */}
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

              {/* Title and location */}
              <h3 className="text-navy font-bold text-base mb-1">{assembly.title}</h3>
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

              {/* View Documents link */}
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

        {/* Footer note */}
        <div
          className="p-8 rounded-2xl text-center"
          style={{ background: "rgba(11,30,61,0.02)", border: "1px solid rgba(11,30,61,0.07)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(11,30,61,0.05)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"
              style={{ color: "#0B1E3D" }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h3 className="text-navy font-bold text-base mb-2">Full Document Archive</h3>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto mb-4">
            The complete archive of resolutions, programmes and session minutes is available on the
            official PABSEC website.
          </p>
          <a
            href="https://pabsec.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-gold"
            style={{ color: "#1A5FA8" }}
          >
            Visit pabsec.org
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
