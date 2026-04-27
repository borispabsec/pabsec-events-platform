import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PAST_ASSEMBLIES } from "@/lib/data/archive";
import { HeroCard } from "@/components/events/hero-card";
import { NextEventCard } from "@/components/events/next-event-card";
import { formatDateRange } from "@/lib/utils";

export const metadata: Metadata = {
  title: "PABSEC Events Platform – Official Digital Gateway",
  description:
    "Official registration and information platform for PABSEC General Assemblies, Committee Meetings, and official events of the Black Sea Economic Cooperation.",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!["en", "ru", "tr"].includes(locale)) notFound();

  const [t, tUi, tHome, tCommittees] = await Promise.all([
    getTranslations({ locale, namespace: "events" }),
    getTranslations({ locale, namespace: "ui" }),
    getTranslations({ locale, namespace: "home_page" }),
    getTranslations({ locale, namespace: "committees" }),
  ]);

  const LOCATION_NAMES: Record<string, Record<string, string>> = {
    ru: {
      "Sofia, Bulgaria": "София, Болгария",
      "Yerevan, Armenia": "Ереван, Армения",
      "TBA": "Уточняется",
      "Athens, Hellenic Republic": "Афины, Греческая Республика",
    },
    tr: {
      "Sofia, Bulgaria": "Sofya, Bulgaristan",
      "Yerevan, Armenia": "Erivan, Ermenistan",
      "TBA": "Belirlenecek",
      "Athens, Hellenic Republic": "Atina, Yunan Cumhuriyeti",
    },
  };
  const FLEXIBLE_DATES: Record<string, Record<string, string>> = {
    ru: { "September / October 2026": "Сентябрь / Октябрь 2026" },
    tr: { "September / October 2026": "Eylül / Ekim 2026" },
  };
  const translateLoc = (loc: string): string => LOCATION_NAMES[locale]?.[loc] ?? loc;
  const translateFlexDate = (date: string): string => FLEXIBLE_DATES[locale]?.[date] ?? date;

  // ── Hero event ───────────────────────────────────────────────────────────
  const now = new Date();
  let heroEvent: {
    slug: string;
    heroTextColor: string;
    imageUrl: string | null;
    startDate: Date;
    endDate: Date;
    location: string;
    translations: { title: string; location: string | null }[];
  } | null = null;

  try {
    heroEvent = await db.event.findFirst({
      where: { status: "PUBLISHED", startDate: { gte: now } },
      orderBy: { startDate: "asc" },
      select: {
        slug: true, heroTextColor: true, imageUrl: true,
        startDate: true, endDate: true, location: true,
        translations: { where: { locale: locale as "en" | "ru" | "tr" }, select: { title: true, location: true } },
      },
    });
    if (!heroEvent) {
      heroEvent = await db.event.findFirst({
        where: { status: "PUBLISHED" },
        orderBy: { startDate: "desc" },
        select: {
          slug: true, heroTextColor: true, imageUrl: true,
          startDate: true, endDate: true, location: true,
          translations: { where: { locale: locale as "en" | "ru" | "tr" }, select: { title: true, location: true } },
        },
      });
    }
  } catch { /* use fallback */ }

  const eventSlug       = heroEvent?.slug ?? "ga67";
  const heroImageUrl    = heroEvent?.imageUrl ?? null;
  const heroTranslation = heroEvent?.translations[0];
  const heroTitle       = heroTranslation?.title ?? tHome("hero_event_title");
  const heroLocation    = heroTranslation?.location ?? heroEvent?.location ?? "";
  const heroDates       = heroEvent ? formatDateRange(heroEvent.startDate, heroEvent.endDate, locale) : "";
  const heroDateLocation = heroEvent
    ? `${heroDates} · ${heroLocation}`
    : tHome("hero_event_date_location");
  const daysRemaining = heroEvent
    ? Math.max(0, Math.ceil((heroEvent.startDate.getTime() - now.getTime()) / 86_400_000))
    : 0;

  // ── Next event ───────────────────────────────────────────────────────────
  let nextEvent: {
    slug: string;
    location: string;
    startDate: Date;
    endDate: Date;
    imageUrl: string | null;
    translations: { title: string; location: string | null }[];
  } | null = null;

  try {
    nextEvent = await db.event.findFirst({
      where: { status: "PUBLISHED", startDate: { gt: heroEvent?.startDate ?? now } },
      orderBy: { startDate: "asc" },
      select: {
        slug: true, location: true, startDate: true, endDate: true, imageUrl: true,
        translations: { where: { locale: locale as "en" | "ru" | "tr" }, select: { title: true, location: true } },
      },
    });
    if (!nextEvent) {
      nextEvent = await db.event.findFirst({
        where: { status: { not: "CANCELLED" }, startDate: { gt: now } },
        orderBy: { startDate: "asc" },
        select: {
          slug: true, location: true, startDate: true, endDate: true, imageUrl: true,
          translations: { where: { locale: locale as "en" | "ru" | "tr" }, select: { title: true, location: true } },
        },
      });
    }
  } catch { /* use fallback */ }

  const nextTitle    = nextEvent?.translations[0]?.title ?? tHome("ga68_title");
  const nextLocation = nextEvent?.translations[0]?.location
    ?? translateLoc(nextEvent?.location ?? "Athens, Hellenic Republic");
  const nextPeriod   = nextEvent ? formatDateRange(nextEvent.startDate, nextEvent.endDate, locale) : "November 2026";
  const nextImageUrl = nextEvent?.imageUrl ?? null;
  const nextSlug     = nextEvent?.slug ?? "ga68";

  // ── Committee meetings ───────────────────────────────────────────────────
  let dbMeetings: {
    id: string;
    category: string;
    session: string | null;
    dateFlexible: boolean;
    dateFlexibleText: string | null;
    startDate: Date | null;
    endDate: Date | null;
    location: string;
    imageUrl: string | null;
    translations: { title: string }[];
  }[] = [];
  try {
    dbMeetings = await db.upcomingEvent.findMany({
      where: { status: { not: "CANCELLED" } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true, category: true, session: true, dateFlexible: true, dateFlexibleText: true,
        startDate: true, endDate: true, location: true, imageUrl: true,
        translations: { where: { locale: locale as "en" | "ru" | "tr" }, select: { title: true } },
      },
    });
  } catch { /* keep empty */ }

  const COMMITTEE_CATEGORY_LABELS: Record<string, string> = {
    committee_economic: tCommittees("economic"),
    committee_legal:    tCommittees("legal"),
    committee_social:   tCommittees("social"),
  };

  const COMMITTEE_MEETINGS = dbMeetings.map((m) => ({
    id: m.id,
    session: m.session ?? "",
    committee: m.translations[0]?.title ?? COMMITTEE_CATEGORY_LABELS[m.category] ?? m.category,
    period: m.dateFlexible && m.dateFlexibleText
      ? translateFlexDate(m.dateFlexibleText)
      : m.startDate
        ? formatDateRange(m.startDate, m.endDate ?? m.startDate, locale)
        : "TBD",
    location: translateLoc(m.location),
    imageUrl: m.imageUrl,
  }));

  // ── Resource cards ───────────────────────────────────────────────────────
  const RESOURCE_CARDS = [
    {
      id: "programme",
      title: tHome("res_programme_title"),
      cta: tHome("res_programme_cta"),
      href: `/${locale}/events/${eventSlug}?tab=programme`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      id: "documents",
      title: tHome("res_documents_title"),
      cta: tHome("res_documents_cta"),
      href: `/${locale}/events/${eventSlug}?tab=documents`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      id: "practical",
      title: tHome("res_practical_title"),
      cta: tHome("res_practical_cta"),
      href: `/${locale}/events/${eventSlug}?tab=info`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
        </svg>
      ),
    },
    {
      id: "registration",
      title: tHome("res_register_title"),
      cta: tHome("res_register_cta"),
      href: `/${locale}/events/${eventSlug}?tab=register`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ background: "#070F1A" }}>

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section>
        <HeroCard
          textColorMode={heroEvent?.heroTextColor ?? "auto"}
          daysRemaining={daysRemaining}
          locale={locale}
          eventSlug={eventSlug}
          imageUrl={heroImageUrl ?? undefined}
          labels={{
            gatewayLabel: tHome("gateway_label"),
            registrationOpen: tUi("registration_open"),
            daysRemaining: tUi("days_remaining"),
            registerNow: tUi("register_now"),
            eventTitle: heroTitle,
            eventDateLocation: heroDateLocation,
          }}
        />
      </section>

      {/* ── 2. RESOURCE STRIP ───────────────────────────────────────────────── */}
      <section
        style={{
          background: "rgba(7,15,26,0.98)",
          borderTop: "1px solid rgba(201,168,76,0.28)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {RESOURCE_CARDS.map((card, i) => (
              <a
                key={card.id}
                href={card.href}
                className="group flex items-center gap-4 px-6 py-5 transition-all duration-200 hover:bg-white/[0.03]"
                style={{
                  borderRight: i < 3 ? "1px solid rgba(201,168,76,0.15)" : undefined,
                  borderBottom: i < 2 ? "1px solid rgba(201,168,76,0.15)" : undefined,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                  style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C" }}
                >
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{card.title}</p>
                  <p
                    className="text-xs font-medium mt-0.5 flex items-center gap-1 group-hover:gap-2 transition-all duration-200"
                    style={{ color: "#C9A84C" }}
                  >
                    {card.cta}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. UPCOMING EVENTS ──────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "#0B1729" }}>
        <div className="max-w-7xl mx-auto px-6">

          {/* Section label */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8" style={{ background: "#C9A84C" }} />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.32em]"
              style={{ color: "#C9A84C" }}
            >
              {tHome("upcoming_events")}
            </span>
          </div>

          {/* Committee meetings */}
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-6"
            style={{ color: "#8AA0B8" }}
          >
            {tHome("autumn_meetings")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {COMMITTEE_MEETINGS.map((m) => (
              <div
                key={m.id}
                className="group relative rounded-2xl overflow-hidden"
                style={{ minHeight: 220 }}
              >
                {/* Background */}
                {m.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "rgba(0,0,0,0.40)" }}
                    />
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(135deg, #0B1F3A 0%, #0F2848 100%)",
                    }}
                  >
                    <div
                      className="absolute top-0 right-0 w-40 h-40 opacity-20"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(201,168,76,0.4), transparent 70%)",
                      }}
                    />
                  </div>
                )}

                {/* Gold top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: "linear-gradient(to right, #C9A84C, rgba(201,168,76,0.15))" }}
                />

                <div className="relative z-10 flex flex-col justify-between h-full p-6" style={{ minHeight: 220 }}>
                  {/* Badge */}
                  <div>
                    <span
                      className="inline-block text-[9px] tracking-[0.22em] uppercase font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(201,168,76,0.12)",
                        color: "#C9A84C",
                        border: "1px solid rgba(201,168,76,0.30)",
                      }}
                    >
                      {tUi("save_the_date")}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                    {m.session && (
                      <p
                        className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                        style={{ color: "#FFFFFF" }}
                      >
                        {m.session}. {tCommittees("meeting")}
                      </p>
                    )}
                    <h4
                      className="font-bold leading-snug mb-4"
                      style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 700 }}
                    >
                      {m.committee}
                    </h4>
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-2 text-[12px] font-medium" style={{ color: "#E8C97A" }}>
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "#E8C97A" }}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {m.period}
                      </p>
                      <p className="flex items-center gap-2 text-[12px] font-medium" style={{ color: "#E8C97A" }}>
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "#E8C97A" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                        </svg>
                        {m.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 68th GA / next event */}
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-4"
            style={{ color: "rgba(184,200,216,0.40)" }}
          >
            {tHome("ga68_section")}
          </p>
          <NextEventCard
            imageUrl={nextImageUrl}
            title={nextTitle}
            location={nextLocation}
            period={nextPeriod}
            locale={locale}
            slug={nextSlug}
            labels={{
              saveTheDate: tUi("upcoming_save_date"),
              registrationNotOpen: tUi("registration_not_open"),
            }}
          />
        </div>
      </section>

      {/* ── 4. ARCHIVE PREVIEW ──────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#070F1A", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
        <div className="max-w-7xl mx-auto px-6">

          {/* Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8" style={{ background: "#C9A84C" }} />
                <span className="text-[10px] tracking-[0.38em] uppercase font-bold" style={{ color: "#C9A84C" }}>
                  {tHome("archive_eyebrow")}
                </span>
              </div>
              <h2 className="font-playfair font-bold text-white text-3xl mb-2">
                {tHome("archive_title")}
              </h2>
              <p className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(184,200,216,0.55)" }}>
                {tHome("archive_desc")}
              </p>
            </div>
            <Link
              href={`/${locale}/archive`}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: "#C9A84C" }}
            >
              {tUi("view_full_archive")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PAST_ASSEMBLIES.slice(0, 3).map((assembly) => {
              const loc = locale as "en" | "ru" | "tr";
              const docsHref = assembly.flipId
                ? `/api/pabsec-docs?assembly_id=${assembly.flipId}&lang=${locale}`
                : (assembly.legacyUrl ?? "https://www.pabsec.org");
              return (
                <div
                  key={assembly.session[loc]}
                  className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(145deg, #0F1F35 0%, #0B1729 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Gold accent top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(to right, #C9A84C, rgba(201,168,76,0.15))" }}
                  />

                  <div className="p-7">
                    {/* Session badge + status */}
                    <div className="flex items-center gap-2 mb-5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.20)" }}
                      >
                        {assembly.session[loc]}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.16)" }}
                      >
                        {tUi("completed")}
                      </span>
                    </div>

                    <h3 className="font-playfair font-bold text-white text-[15px] mb-3 leading-snug">
                      {assembly.title[loc]}
                    </h3>

                    <div className="space-y-1.5 mb-6">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "rgba(201,168,76,0.55)" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                        </svg>
                        <p className="text-sm" style={{ color: "rgba(184,200,216,0.65)" }}>{assembly.location[loc]}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "rgba(201,168,76,0.55)" }}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <p className="text-xs" style={{ color: "rgba(184,200,216,0.42)" }}>{assembly.date[loc]}</p>
                      </div>
                    </div>

                    <a
                      href={docsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors hover:opacity-80"
                      style={{ color: "#C9A84C" }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {tUi("view_documents")} →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile view all */}
          <div className="mt-8 text-center sm:hidden">
            <Link
              href={`/${locale}/archive`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "#C9A84C" }}
            >
              {tUi("view_full_archive")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
