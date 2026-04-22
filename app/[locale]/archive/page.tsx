import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Archive – PABSEC Events Platform",
  description: "Archive of past PABSEC General Assemblies and events.",
};

const PAST_ASSEMBLIES = [
  { session: "66th", title: "66th General Assembly", location: "Baku, Azerbaijan", date: "November 2025" },
  { session: "65th", title: "65th General Assembly", location: "Sofia, Bulgaria", date: "June 2025" },
  { session: "64th", title: "64th General Assembly", location: "Athens, Greece", date: "November 2024" },
  { session: "63rd", title: "63rd General Assembly", location: "Chisinau, Moldova", date: "June 2024" },
];

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
              className="text-[11px] font-semibold uppercase tracking-[0.08em] text-navy/40 hover:text-navy transition-colors flex items-center gap-1.5"
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
            Records of past PABSEC General Assemblies, committee meetings and official sessions.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PAST_ASSEMBLIES.map((assembly) => (
            <div
              key={assembly.session}
              className="rounded-2xl p-7 border border-gray-100 bg-white"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(11,30,61,0.06)", color: "#0B1E3D" }}
                >
                  {assembly.session}
                </span>
              </div>
              <h3 className="text-navy font-bold text-base mb-1">{assembly.title}</h3>
              <p className="text-gray-500 text-sm mb-1">{assembly.location}</p>
              <p className="text-gray-400 text-[12px]">{assembly.date}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-12 p-8 rounded-2xl text-center"
          style={{ background: "rgba(11,30,61,0.03)", border: "1px solid rgba(11,30,61,0.07)" }}
        >
          <p className="text-gray-500 text-sm leading-relaxed">
            Full archive of documents, resolutions and minutes is available upon request.
            Contact{" "}
            <a href="mailto:support@pabsecevents.org" className="text-pabsec hover:text-gold transition-colors">
              support@pabsecevents.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
