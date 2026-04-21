"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { locales, localeNames } from "@/lib/i18n/config";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: string) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"));
  }

  return (
    <header className="bg-brand-900 text-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="font-bold text-lg tracking-tight whitespace-nowrap">
          PABSEC
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
          <Link href={`/${locale}/events`} className="hover:text-brand-200 transition-colors">
            {t("events")}
          </Link>
          <Link href={`/${locale}/documents`} className="hover:text-brand-200 transition-colors">
            {t("documents")}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                l === locale
                  ? "bg-brand-600 text-white"
                  : "text-brand-300 hover:text-white hover:bg-brand-700"
              }`}
              aria-label={localeNames[l]}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
