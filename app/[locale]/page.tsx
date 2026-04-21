import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "home" });
  return { title: `PABSEC – ${t("hero_title")}` };
}

async function getUpcomingEvents(locale: string) {
  return db.event.findMany({
    where: { status: "PUBLISHED", endDate: { gte: new Date() } },
    include: { translations: { where: { locale: locale as "en" | "ru" | "tr" } } },
    orderBy: { startDate: "asc" },
    take: 3,
  });
}

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const events = await getUpcomingEvents(params.locale);

  return (
    <div>
      <HeroSection />
      <UpcomingEventsSection events={events} locale={params.locale} />
    </div>
  );
}

function HeroSection() {
  const t = useTranslations("home");
  return (
    <section className="bg-brand-800 text-white py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-brand-300 text-sm font-semibold uppercase tracking-widest mb-4">
          PABSEC
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-6">
          {t("hero_title")}
        </h1>
        <p className="text-brand-200 text-lg max-w-2xl mx-auto">
          {t("hero_subtitle")}
        </p>
      </div>
    </section>
  );
}

function UpcomingEventsSection({
  events,
  locale,
}: {
  events: Awaited<ReturnType<typeof getUpcomingEvents>>;
  locale: string;
}) {
  const t = useTranslations("home");
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{t("upcoming_events")}</h2>
        <Button asChild variant="outline">
          <Link href={`/${locale}/events`}>{t("view_all_events")}</Link>
        </Button>
      </div>
      {events.length === 0 ? (
        <p className="text-gray-500">No upcoming events.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
