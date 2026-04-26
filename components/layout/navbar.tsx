"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { locales } from "@/lib/i18n/config";
import { usePathname, useRouter } from "next/navigation";
import { AuthButton } from "@/components/auth/auth-modals";

const NAV_LINKS = [
  { key: "home",         path: "" },
  { key: "events",       path: "/events" },
  { key: "registration", path: "/events#registration" },
  { key: "archive",      path: "/archive" },
  { key: "about",        path: "/about" },
  { key: "contact",      path: "/contact" },
] as const;

const BG = "#070F1A";
const BORDER = "rgba(201,168,76,0.14)";
const GOLD = "#C9A84C";

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const [mobileOpen, setMobileOpen] = useState(false);

  function switchLocale(next: string) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || "/");
    setMobileOpen(false);
  }

  function isActive(path: string) {
    const base = path.split("#")[0];
    return base === ""
      ? pathname === `/${locale}`
      : pathname.startsWith(`/${locale}${base}`);
  }

  return (
    <>
      <header
        className="sticky top-0 z-50"
        style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex-shrink-0 select-none">
            <div className="font-playfair font-bold text-[1.55rem] leading-none" style={{ color: GOLD }}>
              {tFooter("abbr")}
            </div>
            <div
              className="text-[7px] leading-none mt-[4px] font-medium uppercase tracking-[0.14em] hidden sm:block"
              style={{ color: "rgba(200,210,220,0.85)" }}
            >
              {tFooter("org_name")}
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0 flex-1 justify-center">
            {NAV_LINKS.map(({ key, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={key}
                  href={`/${locale}${path}`}
                  className="relative text-[11px] font-semibold uppercase tracking-[0.14em] px-3.5 py-2.5 transition-colors duration-150 hover:text-white"
                  style={{ color: active ? GOLD : "rgba(255,255,255,0.48)" }}
                >
                  {tNav(key)}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full"
                      style={{ background: GOLD }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: auth + language */}
          <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
            <AuthButton />
            <div className="flex items-center">
              {locales.map((l, i) => (
                <span key={l} className="flex items-center">
                  {i > 0 && (
                    <span className="mx-2 text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>
                      |
                    </span>
                  )}
                  <button
                    onClick={() => switchLocale(l)}
                    className="text-[11px] font-bold uppercase tracking-widest transition-colors duration-150 hover:text-white"
                    style={{ color: l === locale ? GOLD : "rgba(255,255,255,0.36)" }}
                  >
                    {l.toUpperCase()}
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex-shrink-0 w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-5 h-[1.5px] rounded-full" style={{ background: "rgba(255,255,255,0.7)" }} />
            <span className="block w-5 h-[1.5px] rounded-full" style={{ background: "rgba(255,255,255,0.7)" }} />
            <span className="block w-5 h-[1.5px] rounded-full" style={{ background: "rgba(255,255,255,0.7)" }} />
          </button>
        </nav>
      </header>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden flex flex-col" style={{ background: BG }}>
          {/* Mobile header */}
          <div
            className="flex items-center justify-between px-6 h-16 flex-shrink-0"
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <span className="font-playfair font-bold text-[1.55rem]" style={{ color: GOLD }}>
              {tFooter("abbr")}
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-10 h-10 flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255,255,255,0.65)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-6 pt-6">
            {NAV_LINKS.map(({ key, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={key}
                  href={`/${locale}${path}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-4 text-base font-semibold uppercase tracking-[0.12em] border-b transition-colors"
                  style={{
                    color: active ? GOLD : "rgba(255,255,255,0.65)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  {tNav(key)}
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom: language + auth */}
          <div className="px-6 pb-8 pt-6 flex-shrink-0" style={{ borderTop: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-6 mb-6">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className="text-sm font-bold uppercase tracking-widest transition-colors"
                  style={{ color: l === locale ? GOLD : "rgba(255,255,255,0.35)" }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <AuthButton />
          </div>
        </div>
      )}
    </>
  );
}
