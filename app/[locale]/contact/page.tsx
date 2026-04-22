import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact – PABSEC Events Platform",
  description: "Contact the PABSEC Events Platform support team.",
};

const CONTACTS = [
  {
    label: "General Support",
    email: "support@pabsecevents.org",
    description: "Registration assistance, platform issues and general enquiries.",
  },
  {
    label: "Administration",
    email: "admin@pabsecevents.org",
    description: "Accreditation matters, delegation coordination and official correspondence.",
  },
  {
    label: "Legal",
    email: "legal@pabsecevents.org",
    description: "Intellectual property, terms of use and legal matters.",
  },
];

export default async function ContactPage({
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
              Get in Touch
            </span>
          </div>
          <h1 className="text-navy text-4xl font-bold mb-4 tracking-tight">Contact</h1>
          <p className="text-gray-500 text-base max-w-lg leading-relaxed">
            For assistance with registration, accreditation or platform enquiries,
            please contact the appropriate team below.
          </p>
        </div>
      </div>

      {/* Contact cards */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-5">
          {CONTACTS.map((contact) => (
            <div
              key={contact.email}
              className="rounded-2xl p-7 border border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center gap-5"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
              <div className="flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-1.5">
                  {contact.label}
                </div>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-navy font-bold text-base hover:text-gold transition-colors"
                >
                  {contact.email}
                </a>
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{contact.description}</p>
              </div>
              <a
                href={`mailto:${contact.email}`}
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110"
                style={{ background: "#1A5FA8" }}
              >
                Email
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        <div
          className="mt-12 p-8 rounded-2xl"
          style={{ background: "rgba(11,30,61,0.03)", border: "1px solid rgba(11,30,61,0.07)" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(11,30,61,0.06)" }}
            >
              <svg className="w-4 h-4 text-navy/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <div className="text-navy font-semibold text-sm mb-1">PABSEC International Secretariat</div>
              <div className="text-gray-500 text-sm leading-relaxed">
                Istanbul, Republic of Türkiye<br />
                For official PABSEC matters, please also visit{" "}
                <a
                  href="https://www.pabsec.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pabsec hover:text-gold transition-colors"
                >
                  www.pabsec.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
