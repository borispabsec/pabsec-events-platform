"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

const NAV_LINKS = [
  { label: "Home",         path: "" },
  { label: "Events",       path: "/events" },
  { label: "Registration", path: "/events" },
  { label: "Archive",      path: "/archive" },
  { label: "About",        path: "/about" },
  { label: "Contact",      path: "/contact" },
];

export function Footer() {
  const locale = useLocale();

  return (
    <footer style={{ background: "#070F20" }} className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Column 1: Identity */}
          <div>
            <div className="mb-5">
              <div className="text-white font-bold text-xl tracking-[0.22em] uppercase leading-none mb-2">
                PABSEC
              </div>
              <div className="text-white/22 text-[8px] uppercase tracking-[0.12em] font-medium leading-relaxed">
                Parliamentary Assembly of the<br />Black Sea Economic Cooperation
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-gold/25 to-transparent mb-5" />
            <div className="text-white/28 text-xs leading-relaxed space-y-0.5">
              <p>PABSEC International Secretariat</p>
              <p>Istanbul, Republic of Türkiye</p>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-white/30 text-[9px] uppercase tracking-[0.22em] font-semibold mb-5">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(({ label, path }) => (
                <li key={label}>
                  <Link
                    href={`/${locale}${path}`}
                    className="text-white/32 text-sm hover:text-gold transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-white/30 text-[9px] uppercase tracking-[0.22em] font-semibold mb-5">
              Contact
            </h4>
            <ul className="space-y-2.5 mb-6">
              <li>
                <a
                  href="mailto:support@pabsecevents.org"
                  className="text-white/32 text-sm hover:text-gold transition-colors duration-150 block"
                >
                  support@pabsecevents.org
                </a>
              </li>
              <li>
                <a
                  href="mailto:admin@pabsecevents.org"
                  className="text-white/32 text-sm hover:text-gold transition-colors duration-150 block"
                >
                  admin@pabsecevents.org
                </a>
              </li>
            </ul>
            <a
              href="https://www.pabsec.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/22 text-xs hover:text-white/45 transition-colors duration-150"
            >
              www.pabsec.org
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/18 text-xs">
            © 2026 Proprietary conference management software. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/legal`}
              className="text-white/20 text-xs hover:text-white/42 transition-colors"
            >
              Terms of Use
            </Link>
            <span className="text-white/10 text-xs">·</span>
            <a
              href="mailto:legal@pabsecevents.org"
              className="text-white/20 text-xs hover:text-white/42 transition-colors"
            >
              legal@pabsecevents.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
