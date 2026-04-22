"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { locales, localeNames } from "@/lib/i18n/config";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Home",         path: "" },
  { label: "Events",       path: "/events" },
  { label: "Registration", path: "/events#registration" },
  { label: "Archive",      path: "/archive" },
  { label: "About",        path: "/about" },
  { label: "Contact",      path: "/contact" },
];

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: string) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || "/");
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Wordmark logo */}
        <Link href={`/${locale}`} className="flex-shrink-0 group">
          <div className="leading-none select-none transition-transform duration-200 group-hover:-translate-y-[1px]">
            <div
              className="font-playfair font-bold text-[1.55rem] leading-none tracking-wide text-[#1a3a6b] transition-all duration-200 [text-shadow:0_1px_4px_rgba(26,58,107,0.18)] group-hover:text-[#1e4a8a] group-hover:[text-shadow:0_2px_12px_rgba(26,58,107,0.32)]"
            >
              PABSEC
            </div>
            <div
              className="text-[7px] leading-none mt-[4px] font-semibold uppercase tracking-[0.12em] transition-opacity duration-200 group-hover:opacity-70"
              style={{ color: "rgba(26,58,107,0.42)", fontVariantCaps: "small-caps" }}
            >
              Parliamentary Assembly of the Black Sea Economic Cooperation
            </div>
          </div>
        </Link>

        {/* Navigation links — desktop */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_LINKS.map(({ label, path }) => {
            const href = `/${locale}${path}`;
            const basePath = path.split("#")[0];
            const isActive =
              basePath === ""
                ? pathname === `/${locale}`
                : pathname.startsWith(`/${locale}${basePath}`);

            return (
              <Link
                key={label}
                href={href}
                className={`relative text-[11px] font-semibold uppercase tracking-[0.08em] px-3 py-2.5 rounded-md transition-colors duration-150 ${
                  isActive
                    ? "text-navy"
                    : "text-navy/42 hover:text-navy hover:bg-gray-50"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gold" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Language switcher */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              aria-label={localeNames[l]}
              className={`text-[11px] font-bold uppercase px-2.5 py-1.5 border-r border-gray-200 last:border-r-0 transition-all duration-150 ${
                l === locale
                  ? "bg-navy text-white"
                  : "text-navy/45 hover:text-navy hover:bg-gray-50"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
