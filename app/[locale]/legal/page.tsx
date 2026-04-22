import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use – PABSEC Events Platform",
  description: "Terms of Use for the PABSEC Events Platform.",
};

const SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: `This platform is operated by the developer/operator of the PABSEC Events Platform
      on behalf of the Parliamentary Assembly of the Black Sea Economic Cooperation (PABSEC).
      These Terms of Use govern your access to and use of the platform, including all content,
      features and functionality made available through it.`,
  },
  {
    id: "acceptance",
    title: "2. Acceptance of Terms",
    content: `By accessing or using this platform, you agree to be bound by these Terms of Use.
      If you do not agree to all of the terms, you must not access or use the platform.
      Continued use of the platform following any updates to these Terms constitutes acceptance
      of the revised Terms.`,
  },
  {
    id: "intellectual-property",
    title: "3. Intellectual Property Rights",
    content: `All intellectual property rights in the platform, including software, design,
      workflows, databases and related digital assets, remain reserved by the developer/operator.
      No part of the platform — including its interface, architecture, data structures, source code,
      visual design, or operational workflows — may be reproduced, distributed, modified,
      reverse-engineered, or used to create derivative works without the prior written
      authorisation of the developer/operator.

      Event-related content submitted by participants (such as registration data and correspondence)
      remains the property of the respective submitting parties, subject to the licence granted
      herein for operational purposes.

      The name "PABSEC" and associated marks belong to the Parliamentary Assembly of the Black Sea
      Economic Cooperation and are used with permission. No licence to such marks is granted to users.`,
  },
  {
    id: "permitted-use",
    title: "4. Permitted Use",
    content: `This platform is intended exclusively for official use by delegates, parliamentarians,
      officials, accredited observers and press representatives in connection with PABSEC events.
      Users may access the platform to register for events, retrieve official documents and
      obtain practical information related to PABSEC assemblies.

      Any commercial use, data scraping, automated access or use for any purpose other than
      the intended institutional purpose is strictly prohibited.`,
  },
  {
    id: "registration-data",
    title: "5. Registration Data",
    content: `Information submitted during the registration process is used exclusively for
      the administration of PABSEC events. Personal data is processed in accordance with
      applicable data protection requirements. Data is not shared with third parties
      except as required for event logistics or by applicable law.

      By submitting registration data, you confirm that the information provided is accurate
      and that you are authorised to attend the relevant event.`,
  },
  {
    id: "disclaimer",
    title: "6. Disclaimer of Warranties",
    content: `The platform is provided on an "as is" and "as available" basis without any
      warranty of any kind, express or implied. The developer/operator does not warrant
      that the platform will be error-free, uninterrupted, or free of harmful components.
      Event information is subject to change without prior notice.`,
  },
  {
    id: "liability",
    title: "7. Limitation of Liability",
    content: `To the fullest extent permitted by applicable law, the developer/operator shall
      not be liable for any indirect, incidental, special, consequential or punitive damages
      arising from your use of, or inability to use, the platform. The total aggregate liability
      of the developer/operator for any claim arising out of or relating to these Terms shall
      not exceed the amount paid by you, if any, for access to the platform.`,
  },
  {
    id: "governing-law",
    title: "8. Governing Law and Jurisdiction",
    content: `These Terms of Use are governed by and construed in accordance with the laws
      applicable to the operator's jurisdiction of registration. Any disputes arising out of
      or in connection with these Terms shall be subject to the exclusive jurisdiction of
      the competent courts of that jurisdiction.`,
  },
  {
    id: "amendments",
    title: "9. Amendments",
    content: `The developer/operator reserves the right to amend these Terms of Use at any time.
      Changes will be effective upon publication on this page. Users are responsible for
      reviewing these Terms periodically. Material changes will be communicated through the platform.`,
  },
  {
    id: "contact",
    title: "10. Contact",
    content: `For enquiries regarding these Terms of Use or intellectual property matters,
      please contact:`,
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
            <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Legal</span>
          </div>
          <h1 className="text-navy text-4xl font-bold mb-4 tracking-tight">Terms of Use</h1>
          <p className="text-gray-500 text-sm">
            Last updated: January 2026 &nbsp;·&nbsp; PABSEC Events Platform
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <div key={section.id} id={section.id}>
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

        {/* Divider */}
        <div className="h-px bg-gray-100 my-16" />

        {/* Footer note */}
        <p className="text-gray-400 text-xs leading-relaxed">
          © 2026 Proprietary conference management software. All rights reserved.
          All intellectual property rights in the platform, including software, design, workflows,
          databases and related digital assets, remain reserved by the developer/operator.
        </p>
      </div>
    </div>
  );
}
