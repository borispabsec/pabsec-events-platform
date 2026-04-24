import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateRange } from "@/lib/utils";
import { RegistrationForm } from "@/components/events/registration-form";
import { getSession } from "@/lib/auth/session";
import { AuthGateClient } from "@/components/auth/auth-gate-client";

async function getEvent(id: string, locale: string) {
  try {
    return db.event.findFirst({
      where: { OR: [{ id }, { slug: id }], status: "PUBLISHED" },
      include: {
        translations: { where: { locale: locale as "en" | "ru" | "tr" } },
        documents: {
          where: { locale: locale as "en" | "ru" | "tr" },
          orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
        },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const event = await getEvent(id, locale);
  if (!event) return { title: "Event not found – PABSEC" };
  const translation = event.translations[0];
  return { title: `${translation?.title ?? event.slug} – PABSEC` };
}

const TABS = [
  { id: "programme", labelKey: "tab_programme" },
  { id: "documents", labelKey: "tab_documents" },
  { id: "info",      labelKey: "tab_info" },
  { id: "register",  labelKey: "tab_register" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale, id } = await params;
  const { tab: rawTab } = await searchParams;

  const validTab = TABS.some((t) => t.id === rawTab);
  const activeTab: TabId = validTab ? (rawTab as TabId) : "programme";

  const [event, tEvents, tUi, tPage, session] = await Promise.all([
    getEvent(id, locale),
    getTranslations({ locale, namespace: "events" }),
    getTranslations({ locale, namespace: "ui" }),
    getTranslations({ locale, namespace: "event_page" }),
    getSession(),
  ]);
  const isAuthenticated = session?.status === "APPROVED";

  if (!event) notFound();

  const translation = event.translations[0];
  const isUpcoming = event.endDate > new Date();
  const basePath = `/${locale}/events/${event.slug}`;
  const title = translation?.title ?? event.slug;

  const displayLocation = translation?.location ?? event.location;

  const practicalCards = [
    {
      key: "venue",
      title: tPage("venue_title"),
      body: tPage("venue_body").replace("{title}", title).replace("{location}", displayLocation),
      iconPath: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z",
    },
    {
      key: "visa",
      title: tPage("visa_title"),
      body: tPage("visa_body"),
      iconPath: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
    },
    {
      key: "accommodation",
      title: tPage("accommodation_title"),
      body: tPage("accommodation_body"),
      iconPath: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
    },
    {
      key: "contact_sec",
      title: tPage("contact_sec_title"),
      body: tPage("contact_sec_body"),
      iconPath: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
    },
  ];

  return (
    <div className="font-sans bg-white min-h-screen">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div
        className="border-b border-gray-100 py-14 px-6"
        style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Link
              href={`/${locale}/events`}
              className="text-[11px] font-semibold uppercase tracking-[0.08em] hover:text-navy transition-colors flex items-center gap-1.5"
              style={{ color: "rgba(11,30,61,0.40)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {tEvents("title")}
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={
                isUpcoming
                  ? { background: "rgba(34,197,94,0.10)", color: "#15803d" }
                  : { background: "rgba(11,30,61,0.06)", color: "#0B1E3D" }
              }
            >
              {isUpcoming ? tPage("upcoming_label") : tPage("past_label")}
            </span>
          </div>

          <h1 className="text-navy text-3xl font-bold mb-4 tracking-tight">{title}</h1>

          <div className="flex flex-wrap gap-5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "#9CA3AF" }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {formatDateRange(event.startDate, event.endDate, locale)}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "#9CA3AF" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
              </svg>
              {displayLocation}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tab navigation ──────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`${basePath}?tab=${tab.id}`}
                  className={`relative flex-shrink-0 text-[12px] font-semibold uppercase tracking-[0.08em] px-5 py-4 transition-colors duration-150 ${
                    isActive ? "text-navy" : "text-navy/40 hover:text-navy hover:bg-gray-50"
                  }`}
                >
                  {tPage(tab.labelKey)}
                  {isActive && (
                    <span className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full bg-gold" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* PROGRAMME */}
        {activeTab === "programme" && (() => {
          const programmeDocs = (event.documents ?? []).filter((d) => d.category === "programme");
          return (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">
                {tPage("tab_programme")}
              </span>
            </div>
            <h2 className="text-navy font-bold text-xl mb-8">
              {tPage("programme_for")} {title}
            </h2>

            {programmeDocs.length > 0 ? (
              <div className="space-y-2 mb-10">
                {programmeDocs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-gray-100 bg-white hover:border-gold/20 hover:-translate-y-0.5 transition-all duration-200 group"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(11,30,61,0.05)" }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "#0B1E3D" }}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <span className="text-navy font-medium text-sm truncate">{doc.title}</span>
                    </div>
                    <span
                      className="flex-shrink-0 inline-flex items-center gap-1.5 text-[12px] font-semibold group-hover:text-gold transition-colors"
                      style={{ color: "#1A5FA8" }}
                    >
                      {tPage("doc_download")}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </span>
                  </a>
                ))}
              </div>
            ) : translation?.agenda ? (
              <div className="rounded-2xl p-8 border border-gray-100 mb-10" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {translation.agenda}
                </pre>
              </div>
            ) : (
              <div className="rounded-2xl p-10 text-center border border-gray-100 mb-10" style={{ background: "rgba(11,30,61,0.02)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(11,30,61,0.05)" }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "#0B1E3D" }}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">{tPage("programme_coming_soon")}</p>
              </div>
            )}

            {translation?.description && (
              <div>
                <h2 className="text-navy font-bold text-lg mb-4">{tPage("about_assembly")}</h2>
                <p className="text-gray-700 leading-relaxed">{translation.description}</p>
              </div>
            )}
          </div>
          );
        })()}

        {/* DOCUMENTS */}
        {activeTab === "documents" && !isAuthenticated && <AuthGate locale={locale} />}
        {activeTab === "documents" && isAuthenticated && (() => {
          const DOC_CATEGORIES = [
            { id: "programme", label: tPage("doc_cat_programme") },
            { id: "hotel",     label: tPage("doc_cat_hotel") },
            { id: "practical", label: tPage("doc_cat_practical") },
            { id: "official",  label: tPage("doc_cat_official") },
          ];
          const docs = event.documents ?? [];
          const hasDocs = docs.length > 0;
          return (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">
                {tPage("tab_documents")}
              </span>
            </div>

            {hasDocs ? (
              <div className="space-y-8">
                {DOC_CATEGORIES.map((cat) => {
                  const catDocs = docs.filter((d) => d.category === cat.id);
                  if (catDocs.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-3">
                        {cat.label}
                      </h3>
                      <div className="space-y-2">
                        {catDocs.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-gray-100 bg-white hover:border-gold/20 hover:-translate-y-0.5 transition-all duration-200 group"
                            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(11,30,61,0.05)" }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "#0B1E3D" }}>
                                  <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                              </div>
                              <span className="text-navy font-medium text-sm truncate">{doc.title}</span>
                            </div>
                            <span
                              className="flex-shrink-0 inline-flex items-center gap-1.5 text-[12px] font-semibold group-hover:text-gold transition-colors"
                              style={{ color: "#1A5FA8" }}
                            >
                              {tPage("doc_download")}
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl p-10 text-center border border-gray-100" style={{ background: "rgba(11,30,61,0.02)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(11,30,61,0.05)" }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "#0B1E3D" }}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-navy font-bold text-base mb-2">{tPage("documents_title")}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto mb-2">{tPage("doc_no_docs")}</p>
                <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">{tPage("documents_desc")}</p>
                <a href="https://www.pabsec.org/page-detail/pabsec-general-assemblies/8" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 text-sm font-semibold transition-colors hover:text-gold" style={{ color: "#1A5FA8" }}>
                  {tUi("view_on_pabsec")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            )}
          </div>
          );
        })()}

        {/* PRACTICAL INFORMATION */}
        {activeTab === "info" && !isAuthenticated && <AuthGate locale={locale} />}
        {activeTab === "info" && isAuthenticated && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">
                {tPage("tab_info")}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {practicalCards.map((card) => (
                <div key={card.key} className="rounded-2xl p-7 border border-gray-100 bg-white" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(11,30,61,0.05)" }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "#0B1E3D" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.iconPath} />
                    </svg>
                  </div>
                  <h3 className="text-navy font-bold text-sm mb-2">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-xs mt-8 text-center">{tPage("practical_note")}</p>
          </div>
        )}

        {/* REGISTRATION */}
        {activeTab === "register" && !isAuthenticated && <AuthGate locale={locale} />}
        {activeTab === "register" && isAuthenticated && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">
                {tPage("tab_register")}
              </span>
            </div>
            {isUpcoming ? (
              <div className="max-w-2xl">
                <h2 className="text-navy font-bold text-xl mb-2">{tPage("register_title")}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">{tPage("register_desc")}</p>
                <RegistrationForm eventId={event.id} locale={locale} />
              </div>
            ) : (
              <div className="rounded-2xl p-10 text-center border border-gray-100" style={{ background: "rgba(11,30,61,0.02)" }}>
                <h3 className="text-navy font-bold text-base mb-2">{tPage("reg_closed_title")}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">{tPage("reg_closed_desc")}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

async function AuthGate({ locale }: { locale: string }) {
  const tAuth = await getTranslations({ locale, namespace: "auth" });
  return (
    <div className="rounded-2xl p-12 text-center border border-gray-100" style={{ background: "rgba(11,30,61,0.02)" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(11,30,61,0.06)" }}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "#0B1E3D" }}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <h3 className="text-navy font-bold text-base mb-2">{tAuth("delegates_only")}</h3>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto mb-6">
        {tAuth("delegates_only_desc")}
      </p>
      <AuthGateClient />
    </div>
  );
}
