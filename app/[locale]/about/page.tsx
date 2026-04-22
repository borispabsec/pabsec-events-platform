import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About PABSEC – Events Platform",
  description:
    "About the Parliamentary Assembly of the Black Sea Economic Cooperation (PABSEC).",
};

const MEMBER_STATES = [
  "Albania", "Armenia", "Azerbaijan", "Bulgaria",
  "Georgia", "Greece", "Moldova", "North Macedonia",
  "Romania", "Russia", "Serbia", "Türkiye", "Ukraine",
];

const FACTS = [
  { value: "1993", label: "Year Established" },
  { value: "13",   label: "Member States" },
  { value: "2×",   label: "Sessions per Year" },
  { value: "Istanbul", label: "Secretariat" },
];

export default async function AboutPage({
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
              Organisation
            </span>
          </div>
          <h1 className="text-navy text-4xl font-bold mb-4 tracking-tight">About PABSEC</h1>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
            The Parliamentary Assembly of the Black Sea Economic Cooperation brings together
            parliamentarians from twelve member states to advance regional cooperation.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Key facts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-16">
          {FACTS.map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl p-6 text-center border border-gray-100"
              style={{ background: "rgba(11,30,61,0.02)" }}
            >
              <div className="text-navy font-bold text-2xl mb-1">{fact.value}</div>
              <div className="text-gray-400 text-[11px] uppercase tracking-wider">{fact.label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-16">
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed text-[15px]">
              PABSEC is the parliamentary dimension of the Organisation of the Black Sea Economic
              Cooperation (BSEC). It provides an inter-parliamentary forum for the member states
              of BSEC to discuss matters of common concern and promote regional cooperation on
              political, economic, social and cultural issues.
            </p>
            <p className="text-gray-700 leading-relaxed text-[15px]">
              The General Assembly — the supreme body of PABSEC — convenes twice per year and
              is composed of parliamentarians delegated by the national parliaments of member states.
              It adopts resolutions, elects the Bureau, and approves the programme and budget.
            </p>
            <p className="text-gray-700 leading-relaxed text-[15px]">
              The PABSEC International Secretariat is headquartered in Istanbul, Republic of Türkiye,
              and coordinates the work of the Assembly between sessions.
            </p>
          </div>

          <div
            className="rounded-2xl p-8"
            style={{ background: "rgba(248,249,250,0.8)", border: "1px solid rgba(11,30,61,0.07)" }}
          >
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-6">
              Member States
            </h3>
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-6">
              {MEMBER_STATES.map((state) => (
                <div key={state} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-pabsec" />
                  {state}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-10" />

        <p className="text-gray-400 text-sm">
          For more information, visit{" "}
          <a
            href="https://www.pabsec.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pabsec hover:text-gold transition-colors"
          >
            www.pabsec.org
          </a>
        </p>
      </div>
    </div>
  );
}
