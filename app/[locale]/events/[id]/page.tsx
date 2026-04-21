import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateRange } from "@/lib/utils";
import { RegistrationForm } from "@/components/events/registration-form";

async function getEvent(id: string, locale: string) {
  return db.event.findFirst({
    where: { OR: [{ id }, { slug: id }], status: "PUBLISHED" },
    include: {
      translations: { where: { locale: locale as "en" | "ru" | "tr" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const event = await getEvent(params.id, params.locale);
  if (!event) return { title: "Event not found – PABSEC" };
  const translation = event.translations[0];
  return { title: `${translation?.title ?? event.slug} – PABSEC` };
}

export default async function EventDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const [event, t] = await Promise.all([
    getEvent(params.id, params.locale),
    getTranslations({ locale: params.locale, namespace: "events" }),
  ]);

  if (!event) notFound();

  const translation = event.translations[0];
  const isUpcoming = event.endDate > new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href={`/${params.locale}/events`}
        className="text-brand-600 hover:underline text-sm mb-6 inline-block"
      >
        ← {t("title")}
      </Link>

      <div className="flex items-start gap-3 mb-4">
        <Badge variant={isUpcoming ? "default" : "secondary"}>
          {t(`status.${event.status}`)}
        </Badge>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {translation?.title ?? event.slug}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-sm text-gray-600">
        <div>
          <span className="font-semibold text-gray-900">{t("dates")}: </span>
          {formatDateRange(event.startDate, event.endDate, params.locale)}
        </div>
        <div>
          <span className="font-semibold text-gray-900">{t("location")}: </span>
          {event.location}
        </div>
      </div>

      {translation?.description && (
        <p className="text-gray-700 leading-relaxed mb-8">{translation.description}</p>
      )}

      {translation?.agenda && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">{t("agenda")}</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
            {translation.agenda}
          </pre>
        </div>
      )}

      {isUpcoming && (
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold mb-6">{t("register")}</h2>
          <RegistrationForm eventId={event.id} locale={params.locale} />
        </div>
      )}
    </div>
  );
}
