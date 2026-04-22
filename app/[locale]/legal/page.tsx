import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Notice – PABSEC Events Platform",
  description: "Legal Notice and intellectual property statement for the PABSEC Events Platform.",
};

const SECTIONS = [
  {
    id: "platform-operator",
    title: "1. Platform Operator",
    content: `The PABSEC Events Platform is independently developed and operated by a private developer/operator ("Operator") providing professional digital services for the administration of events of the Parliamentary Assembly of the Black Sea Economic Cooperation (PABSEC).

The Platform is not an official publication of PABSEC, nor is it operated by any government authority, member state parliament or intergovernmental organisation. The Operator provides this Platform as a service for event management purposes pursuant to arrangement with PABSEC event administrators.

For enquiries regarding the Platform or its operation, contact: support@pabsecevents.org`,
  },
  {
    id: "ip-ownership",
    title: "2. Intellectual Property Ownership",
    content: `All intellectual property rights in the Platform — including but not limited to:

— Software architecture, source code and compiled applications;
— Visual design, user interface and user experience elements;
— Data models, database schemas and workflows;
— Operational processes and administrative systems;
— Documentation and technical specifications;
— Any derivative works or improvements thereof —

are and remain the exclusive property of the Operator. These rights are protected by copyright, trade secret and other applicable intellectual property laws.

No intellectual property rights in the Platform are transferred to PABSEC, its member states, event participants or any other person by virtue of use of the Platform or by any arrangement relating to event administration.`,
  },
  {
    id: "no-transfer",
    title: "3. No Transfer of Rights",
    content: `Access to or use of this Platform does not grant any licence, right or interest in the intellectual property of the Platform. In particular:

— No licence is granted to copy, reproduce, modify, distribute, create derivative works from or exploit the Platform or any component thereof;
— No right is granted to use the Platform's design, architecture or source code for any other purpose;
— No implied licence arises from the provision of services through the Platform;
— Any written agreement purporting to transfer intellectual property rights in the Platform must be executed by the Operator and shall be binding only to the extent expressly stated therein.

Enquiries regarding licensing of the Platform or any of its components should be directed to legal@pabsecevents.org.`,
  },
  {
    id: "pabsec-marks",
    title: "4. PABSEC Name and Marks",
    content: `The name "PABSEC", the name "Parliamentary Assembly of the Black Sea Economic Cooperation", and any associated emblems, seals or symbols are the property of the Parliamentary Assembly of the Black Sea Economic Cooperation. These marks are used on this Platform pursuant to arrangement and do not constitute a transfer of rights in such marks to the Operator or to any user.

The Operator makes no claim of ownership to the PABSEC name or any official marks of PABSEC or its member state parliaments.`,
  },
  {
    id: "content-disclaimer",
    title: "5. Content and Information Disclaimer",
    content: `Event information, programme details, documents and other content published on this Platform is provided for information purposes only. While the Operator endeavours to ensure the accuracy of information published, event details — including dates, venues, agenda and speakers — are subject to change without prior notice and the Operator accepts no liability for inaccuracies or omissions.

Official documents and resolutions of PABSEC are the property of PABSEC and are published on this Platform for the convenience of delegates and participants. The authoritative versions of such documents are those maintained by the PABSEC International Secretariat.`,
  },
  {
    id: "enforcement",
    title: "6. Enforcement",
    content: `The Operator reserves all rights to enforce its intellectual property rights to the fullest extent permitted by applicable law. Unauthorised copying, reproduction, distribution, modification, scraping or exploitation of the Platform or any part thereof may result in civil and/or criminal proceedings.

Reports of intellectual property infringement or misuse of the Platform may be submitted to legal@pabsecevents.org.`,
  },
  {
    id: "contact",
    title: "7. Contact",
    content: `Legal and intellectual property enquiries:`,
    contact: true,
  },
];

export default async function LegalPage({
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
        <div className="max-w-3xl mx-auto">
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
            <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Legal</span>
          </div>
          <h1 className="text-navy text-4xl font-bold mb-4 tracking-tight">Legal Notice</h1>
          <p className="text-gray-500 text-sm">
            Last updated: April 2026 &nbsp;·&nbsp; PABSEC Events Platform
          </p>
        </div>
      </div>

      {/* Table of contents */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-4">
        <div
          className="rounded-xl p-6"
          style={{ background: "rgba(11,30,61,0.02)", border: "1px solid rgba(11,30,61,0.07)" }}
        >
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: "#9CA3AF" }}>
            Contents
          </h2>
          <ol className="space-y-1.5 list-none">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm hover:text-gold transition-colors"
                  style={{ color: "rgba(11,30,61,0.55)" }}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-navy text-xl font-bold mb-4">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-line">
                {section.content}
              </p>
              {section.contact && (
                <div
                  className="mt-4 p-5 rounded-xl space-y-2"
                  style={{ background: "rgba(11,30,61,0.03)", border: "1px solid rgba(11,30,61,0.07)" }}
                >
                  <a
                    href="mailto:legal@pabsecevents.org"
                    className="block text-[15px] font-medium transition-colors hover:text-gold"
                    style={{ color: "#1A5FA8" }}
                  >
                    legal@pabsecevents.org
                  </a>
                  <a
                    href="mailto:support@pabsecevents.org"
                    className="block text-[15px] font-medium transition-colors hover:text-gold"
                    style={{ color: "#1A5FA8" }}
                  >
                    support@pabsecevents.org
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="h-px bg-gray-100 my-14" />

        <div className="flex flex-wrap gap-4 text-xs" style={{ color: "rgba(11,30,61,0.35)" }}>
          <Link href={`/${locale}/terms`} className="hover:text-navy transition-colors">Terms of Use</Link>
          <span>·</span>
          <Link href={`/${locale}/privacy`} className="hover:text-navy transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href={`/${locale}`} className="hover:text-navy transition-colors">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}
