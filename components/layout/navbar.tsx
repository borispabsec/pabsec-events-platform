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

  const LangSwitcher = ({ compact }: { compact?: boolean }) => (
    <div className="flex items-center">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span className={compact ? "mx-1 text-[9px]" : "mx-2 text-[10px]"} style={{ color: "rgba(255,255,255,0.18)" }}>
              |
            </span>
          )}
          <button
            onClick={() => switchLocale(l)}
            className="font-bold uppercase tracking-widest transition-colors duration-150 hover:text-white"
            style={{
              fontSize: compact ? 10 : 11,
              color: l === locale ? GOLD : "rgba(255,255,255,0.42)",
            }}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );

  return (
    <>
      <header
        className="sticky top-0 z-50"
        style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}
      >
        <nav className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex-shrink-0 select-none min-w-0">
            <div className="font-playfair font-bold text-[1.4rem] sm:text-[1.55rem] leading-none" style={{ color: GOLD }}>
              {tFooter("abbr")}
            </div>
            {/* Subtitle — visible on all sizes */}
            <div
              className="text-[7px] lg:text-[7px] leading-tight mt-[4px] font-medium uppercase tracking-[0.10em]"
              style={{
                color: "rgba(255,255,255,1.0)",
                fontWeight: 500,
                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                maxWidth: "14rem",
              }}
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

          {/* Desktop right: auth + language */}
          <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
            <AuthButton />
            <LangSwitcher />
          </div>

          {/* Mobile right: lang + auth + hamburger */}
          <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
            <LangSwitcher compact />
            <AuthButton />
            <button
              className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] flex-shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-5 h-[1.5px] rounded-full" style={{ background: "rgba(255,255,255,0.7)" }} />
              <span className="block w-5 h-[1.5px] rounded-full" style={{ background: "rgba(255,255,255,0.7)" }} />
              <span className="block w-5 h-[1.5px] rounded-full" style={{ background: "rgba(255,255,255,0.7)" }} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile full-screen overlay — nav links only */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden flex flex-col" style={{ background: BG }}>
          {/* Overlay header */}
          <div
            className="flex items-center justify-between px-5 h-16 flex-shrink-0"
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <span className="font-playfair font-bold text-[1.4rem]" style={{ color: GOLD }}>
              {tFooter("abbr")}
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255,255,255,0.65)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-6 pt-4">
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
        </div>
      )}
    </>
  );
}
