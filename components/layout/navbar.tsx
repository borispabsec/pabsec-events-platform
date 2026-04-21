"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { locales, localeNames } from "@/lib/i18n/config";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: string) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || "/");
  }

  const navLinks = [
    { label: "Programme",      href: `/${locale}/events#programme` },
    { label: "Documents",      href: `/${locale}/events#documents`  },
    { label: "Register",       href: `/${locale}/events`            },
    { label: "Practical Info", href: `/${locale}/events#practical`  },
  ];

  return (
    <header style={{ background: "#0B1E3D" }} className="shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        {/* Logo / wordmark */}
        <Link href={`/${locale}`} className="flex items-center gap-3 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.pabsec.org/frontend/img/logo@2x_en.gif"
            alt="PABSEC"
            className="h-8 w-auto object-contain"
          />
          <span className="hidden sm:block text-white font-semibold text-sm leading-tight">
            PABSEC<br />
            <span className="text-blue-300 font-normal text-xs">Events Platform</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-blue-200/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium px-3 py-2 rounded-md"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Locale switcher */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              aria-label={localeNames[l]}
              className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                l === locale
                  ? "text-white"
                  : "text-blue-300/60 hover:text-blue-200"
              }`}
              style={l === locale ? { background: "#1A5FA8" } : undefined}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
