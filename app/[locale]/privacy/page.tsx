import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – PABSEC Events Platform",
  description: "Privacy Policy governing the collection and processing of personal data on the PABSEC Events Platform.",
};

const SECTIONS = [
  {
    id: "overview",
    title: "1. Overview",
    content: `This Privacy Policy describes how the PABSEC Events Platform ("Platform") collects, processes, stores and protects personal data submitted by users in connection with PABSEC events. The Platform is operated by an independent developer/operator.

By registering for or otherwise using the Platform, you consent to the collection and processing of your personal data as described in this Policy. If you do not consent, please refrain from submitting personal data through the Platform.`,
  },
  {
    id: "data-collected",
    title: "2. Personal Data Collected",
    content: `The Platform collects the following categories of personal data through registration and related forms:

— Identity data: first name, last name, title or honorific;
— Contact data: email address, telephone number (where provided);
— Professional data: country of affiliation, parliamentary chamber or institution, position or title, delegation role;
— Accreditation data: category of participation (parliamentarian, official, observer, press);
— Dietary and accessibility requirements (where voluntarily provided);
— Correspondence and communications submitted through the Platform.

The Platform does not collect sensitive personal data (such as biometric data, health records or financial information) beyond dietary and accessibility requirements voluntarily provided for logistical purposes.`,
  },
  {
    id: "purposes",
    title: "3. Purposes of Processing",
    content: `Personal data collected through the Platform is processed exclusively for the following purposes:

— Event registration and accreditation: verifying eligibility and issuing confirmation of participation;
— Event administration: coordinating logistics, including accommodation, seating, access and security;
— Communications: sending official notifications, programme updates and event-related correspondence;
— Security and access control: verifying the identity of registered participants at event venues;
— Compliance: fulfilling obligations under applicable law, including reporting to host country authorities where required.

Personal data is not processed for marketing, commercial, or any other purpose not directly related to PABSEC event administration.`,
  },
  {
    id: "third-parties",
    title: "4. Disclosure to Third Parties",
    content: `Personal data is not sold, rented or otherwise transferred to third parties for commercial purposes. Data may be shared in the following limited circumstances:

— With event venue management and security personnel for the purpose of access control;
— With host country authorities where required by applicable law or government regulation;
— With technical service providers supporting the operation of the Platform, subject to appropriate data processing agreements;
— Where required by court order, legal process or regulatory authority.

All third parties with whom data is shared are required to process it solely for the stated purpose and in compliance with applicable data protection requirements.`,
  },
  {
    id: "retention",
    title: "5. Data Retention",
    content: `Personal data is retained for the period necessary to fulfil the purposes described in this Policy, and in any event no longer than:

— Registration and accreditation data: retained for a period of three (3) years following the relevant event, for the purpose of maintaining official records and resolving any disputes arising from participation;
— Communications: retained for two (2) years from the date of the communication;
— Data required by law: retained for the period prescribed by applicable law.

Following the applicable retention period, personal data is securely deleted or anonymised.`,
  },
  {
    id: "cookies",
    title: "6. Cookies and Technical Data",
    content: `The Platform uses strictly necessary session cookies to maintain authentication state during your session. These cookies are temporary and are deleted upon closing your browser.

The Platform may collect technical data including IP address, browser type and version, operating system, referring URL and pages accessed. This data is collected for security monitoring and to ensure the stability and integrity of the Platform. It is not used to build user profiles or for targeted advertising.

No third-party advertising or tracking cookies are deployed on this Platform.`,
  },
  {
    id: "security",
    title: "7. Security Measures",
    content: `The Platform implements industry-standard technical and organisational measures to protect personal data against unauthorised access, disclosure, alteration or destruction. These measures include:

— Encrypted data transmission (TLS/HTTPS) for all Platform communications;
— Access controls limiting data access to authorised personnel only;
— Secure server infrastructure with regular security monitoring;
— Regular review of security practices and procedures.

While the operator takes all reasonable steps to protect your data, no electronic transmission or storage system is completely secure. The operator cannot guarantee absolute security.`,
  },
  {
    id: "rights",
    title: "8. Your Rights",
    content: `Subject to applicable law, you may have the following rights in respect of your personal data:

— Right of access: to request a copy of the personal data held about you;
— Right of rectification: to request correction of inaccurate or incomplete data;
— Right of erasure: to request deletion of your data, subject to legal retention requirements;
— Right to object: to object to processing in certain circumstances;
— Right to restriction: to request that processing of your data be restricted in certain circumstances.

Requests regarding your rights should be submitted to support@pabsecevents.org. The operator will respond within a reasonable period in accordance with applicable law.`,
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: `The operator may update this Privacy Policy from time to time to reflect changes in the Platform, applicable law or data processing practices. Updated versions will be published on this page with a revised effective date. Continued use of the Platform following publication of changes constitutes acceptance of the updated Policy.`,
  },
  {
    id: "contact",
    title: "10. Contact",
    content: `For enquiries or requests relating to this Privacy Policy or the processing of your personal data, please contact:`,
    contact: true,
  },
];

export default async function PrivacyPage({
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
          <h1 className="text-navy text-4xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
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
                    href="mailto:support@pabsecevents.org"
                    className="block text-[15px] font-medium transition-colors hover:text-gold"
                    style={{ color: "#1A5FA8" }}
                  >
                    support@pabsecevents.org
                  </a>
                  <a
                    href="mailto:legal@pabsecevents.org"
                    className="block text-[15px] font-medium transition-colors hover:text-gold"
                    style={{ color: "#1A5FA8" }}
                  >
                    legal@pabsecevents.org
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
          <Link href={`/${locale}/legal`} className="hover:text-navy transition-colors">Legal Notice</Link>
          <span>·</span>
          <Link href={`/${locale}`} className="hover:text-navy transition-colors">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}
