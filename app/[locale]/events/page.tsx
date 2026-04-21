import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { EventCard } from "@/components/events/event-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return { title: `${t("title")} – PABSEC` };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });

  let events: Awaited<ReturnType<typeof db.event.findMany>> = [];
  try {
    events = await db.event.findMany({
      where: { status: "PUBLISHED" },
      include: {
        translations: { where: { locale: locale as "en" | "ru" | "tr" } },
      },
      orderBy: { startDate: "desc" },
    });
  } catch {
    // DB not yet available — show empty state
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
      <p className="text-gray-500 mb-10">{t("subtitle")}</p>

      {events.length === 0 ? (
        <p className="text-gray-500">{t("no_events")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
