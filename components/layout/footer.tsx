"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const NAV_LINKS = [
  { key: "home",         path: "" },
  { key: "events",       path: "/events" },
  { key: "registration", path: "/events" },
  { key: "archive",      path: "/archive" },
  { key: "about",        path: "/about" },
  { key: "contact",      path: "/contact" },
] as const;

export function Footer() {
  const locale = useLocale();
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer style={{ background: "#040D16", borderTop: "1px solid rgba(201,168,76,0.22)" }} className="mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">

          {/* Column 1: Identity */}
          <div>
            <div className="mb-5">
              <div className="font-playfair font-bold text-xl leading-none mb-2" style={{ color: "#C9A84C" }}>
                {t("abbr")}
              </div>
              <div
                className="text-[8px] uppercase tracking-[0.12em] font-medium leading-relaxed"
                style={{ color: "rgba(255,255,255,0.22)" }}
              >
                {t("org_name")}
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-gold/25 to-transparent mb-5" />
            <div className="space-y-0.5">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>{t("secretariat")}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>{t("location")}</p>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4
              className="text-[9px] uppercase tracking-[0.22em] font-semibold mb-5"
              style={{ color: "rgba(255,255,255,0.30)" }}
            >
              {t("nav_heading")}
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(({ key, path }) => (
                <li key={key}>
                  <Link
                    href={`/${locale}${path}`}
                    className="text-sm hover:text-gold transition-colors duration-150"
                    style={{ color: "rgba(255,255,255,0.32)" }}
                  >
                    {tNav(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4
              className="text-[9px] uppercase tracking-[0.22em] font-semibold mb-5"
              style={{ color: "rgba(255,255,255,0.30)" }}
            >
              {t("contact_heading")}
            </h4>
            <ul className="space-y-2.5 mb-6">
              <li>
                <a
                  href="mailto:support@pabsecevents.org"
                  className="text-sm hover:text-gold transition-colors duration-150 block"
                  style={{ color: "rgba(255,255,255,0.32)" }}
                >
                  support@pabsecevents.org
                </a>
              </li>
              <li>
                <a
                  href="mailto:admin@pabsecevents.org"
                  className="text-sm hover:text-gold transition-colors duration-150 block"
                  style={{ color: "rgba(255,255,255,0.32)" }}
                >
                  admin@pabsecevents.org
                </a>
              </li>
            </ul>
            <a
              href="https://www.pabsec.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs hover:text-white/45 transition-colors duration-150"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              www.pabsec.org
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* IP Disclaimer */}
        <div
          className="py-4 px-5 rounded-xl mb-8"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.22)" }}>
            {t("ip_disclaimer")}
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>
            {t("copyright")}
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href={`/${locale}/terms`}
              className="text-xs hover:text-white/42 transition-colors"
              style={{ color: "rgba(255,255,255,0.20)" }}
            >
              {t("terms")}
            </Link>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.10)" }}>·</span>
            <Link
              href={`/${locale}/privacy`}
              className="text-xs hover:text-white/42 transition-colors"
              style={{ color: "rgba(255,255,255,0.20)" }}
            >
              {t("privacy")}
            </Link>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.10)" }}>·</span>
            <Link
              href={`/${locale}/legal`}
              className="text-xs hover:text-white/42 transition-colors"
              style={{ color: "rgba(255,255,255,0.20)" }}
            >
              {t("legal_notice")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
