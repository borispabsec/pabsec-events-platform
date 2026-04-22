import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use – PABSEC Events Platform",
  description: "Terms of Use governing access to and use of the PABSEC Events Platform.",
};

const SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction and Scope",
    content: `These Terms of Use ("Terms") govern your access to and use of the PABSEC Events Platform ("Platform"), operated by an independent developer/operator on behalf of official PABSEC event administration. By accessing the Platform, you agree to be bound by these Terms in full. If you do not agree to these Terms, you must immediately cease use of the Platform.

These Terms apply to all users of the Platform, including delegates, parliamentarians, officials, accredited observers, members of the press and any other persons accessing the Platform in any capacity.`,
  },
  {
    id: "permitted-use",
    title: "2. Permitted Use",
    content: `The Platform is intended exclusively for official use in connection with events of the Parliamentary Assembly of the Black Sea Economic Cooperation (PABSEC). Permitted uses include:

— Registering for PABSEC events as an authorised delegate, official or accredited participant;
— Accessing official event documents, programmes and practical information;
— Submitting information required for accreditation and event participation;
— Communicating with Platform administrators for event-related purposes.

Any use of the Platform beyond the foregoing is strictly prohibited without the prior written authorisation of the operator.`,
  },
  {
    id: "prohibited-conduct",
    title: "3. Prohibited Conduct",
    content: `The following activities are strictly prohibited and may result in immediate suspension of access and legal action:

— Copying, reproducing, distributing or publicly displaying any part of the Platform, including its interface, design, content or source code;
— Scraping, crawling or using automated tools to extract data from the Platform;
— Cloning, replicating or creating derivative works based on the Platform or any of its components;
— Reverse-engineering, decompiling or disassembling any software component of the Platform;
— Using the Platform or any data obtained through it for commercial purposes;
— Impersonating any official, delegate or other authorised person;
— Submitting false, misleading or fraudulent registration information;
— Attempting to gain unauthorised access to any part of the Platform or its underlying systems;
— Interfering with the operation of the Platform or the experience of other users;
— Using the Platform in any manner that violates applicable law or regulation.`,
  },
  {
    id: "registration",
    title: "4. Registration and Account Responsibility",
    content: `Where the Platform requires registration, you are responsible for the accuracy of all information submitted. You confirm that you are authorised to attend the relevant event and that your credentials and institutional affiliation are genuine.

You must not share access credentials, registration confirmations or any security codes with unauthorised persons. The operator reserves the right to revoke access and cancel registrations at any time where there are reasonable grounds to believe that Terms have been violated.`,
  },
  {
    id: "intellectual-property",
    title: "5. Intellectual Property Rights",
    content: `All intellectual property rights in the Platform, including but not limited to software, source code, visual design, user interface, architecture, databases, workflows and related digital assets, are the exclusive property of the independent developer/operator. Nothing in these Terms or in your use of the Platform shall be construed as transferring or licensing any intellectual property rights to you.

Event-related content submitted by participants (including registration data, correspondence and supporting documentation) remains the property of the respective submitting parties, subject to a limited licence granted to the operator for the purpose of event administration.

The name "PABSEC", the name "Parliamentary Assembly of the Black Sea Economic Cooperation" and any associated marks, emblems or symbols belong to PABSEC and are used under arrangement. No licence to such marks is granted to users of this Platform.`,
  },
  {
    id: "data",
    title: "6. Data and Privacy",
    content: `Personal data submitted through the Platform is processed in accordance with the Platform's Privacy Policy, available at /privacy. By using the Platform, you acknowledge that your data may be processed for the purposes of event administration, accreditation, security and communications directly related to PABSEC events.

Personal data is not shared with third parties except where required for event logistics, venue management, or by applicable law.`,
  },
  {
    id: "disclaimer",
    title: "7. Disclaimer of Warranties",
    content: `The Platform is provided on an "as is" and "as available" basis. The operator makes no warranties, express or implied, regarding the availability, accuracy, completeness or fitness for purpose of the Platform or any information provided through it.

Event information, including dates, venues and programme details, is subject to change without prior notice. The operator shall not be liable for any inconvenience arising from such changes.`,
  },
  {
    id: "liability",
    title: "8. Limitation of Liability",
    content: `To the fullest extent permitted by applicable law, the operator shall not be liable for any direct, indirect, incidental, special, consequential, punitive or exemplary damages arising from or in connection with your use of, or inability to use, the Platform, even if the operator has been advised of the possibility of such damages.

The aggregate liability of the operator for any claim arising out of or relating to these Terms or the Platform shall not exceed the amount, if any, paid by you for access to the Platform.`,
  },
  {
    id: "modifications",
    title: "9. Modifications to Terms and Platform",
    content: `The operator reserves the right to modify these Terms at any time. Modified Terms will be effective upon publication on this page. Your continued use of the Platform following publication of modified Terms constitutes acceptance of those Terms.

The operator likewise reserves the right to modify, suspend or discontinue the Platform or any feature thereof at any time without prior notice.`,
  },
  {
    id: "governing-law",
    title: "10. Governing Law and Dispute Resolution",
    content: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the operator is registered. Any dispute arising out of or relating to these Terms or the Platform shall be submitted to the exclusive jurisdiction of the competent courts of that jurisdiction.

Nothing in these Terms shall be construed as creating an agency, partnership or joint venture relationship between the operator and PABSEC or any of its member states or national parliaments.`,
  },
  {
    id: "contact",
    title: "11. Contact",
    content: `Enquiries regarding these Terms of Use, intellectual property matters or platform licensing should be directed to:`,
    contact: true,
  },
];

export default async function TermsPage({
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
          <h1 className="text-navy text-4xl font-bold mb-4 tracking-tight">Terms of Use</h1>
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
          <Link href={`/${locale}/legal`} className="hover:text-navy transition-colors">Legal Notice</Link>
          <span>·</span>
          <Link href={`/${locale}/privacy`} className="hover:text-navy transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href={`/${locale}`} className="hover:text-navy transition-colors">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}
