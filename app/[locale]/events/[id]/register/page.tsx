import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { EventRegistrationForm } from "@/components/events/event-registration-form";

async function getEvent(id: string) {
  try {
    return db.event.findFirst({
      where: { OR: [{ id }, { slug: id }], status: "PUBLISHED" },
      select: {
        id: true,
        slug: true,
        startDate: true,
        endDate: true,
        location: true,
        registrationDeadline: true,
        requirePassport: true,
        requirePhoto: true,
        translations: { select: { locale: true, title: true } },
      },
    });
  } catch {
    return null;
  }
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [event, session] = await Promise.all([getEvent(id), getSession()]);

  if (!event) notFound();

  const title =
    event.translations.find((t) => t.locale === locale)?.title ??
    event.translations.find((t) => t.locale === "en")?.title ??
    event.slug;

  const deadline = event.registrationDeadline;
  const isClosed = deadline && deadline < new Date();

  let prefill: { firstName: string; lastName: string; email: string; country: string; role: string } | null = null;
  if (session) {
    const user = await db.authUser.findUnique({
      where: { id: session.userId },
      select: { firstName: true, lastName: true, email: true, country: true, role: true },
    });
    if (user) prefill = user;
  }

  return (
    <div className="font-sans bg-white min-h-screen">
      <div
        className="border-b border-gray-100 py-10 px-6"
        style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/${locale}/events/${event.slug}?tab=register`}
              className="text-[11px] font-semibold uppercase tracking-[0.08em] hover:text-navy transition-colors flex items-center gap-1.5"
              style={{ color: "rgba(11,30,61,0.40)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {title}
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Registration</span>
          </div>
          <h1 className="text-navy text-2xl font-bold">{title}</h1>
          {deadline && (
            <p className="text-sm text-gray-500 mt-2">
              Registration deadline:{" "}
              <span className={isClosed ? "text-red-600 font-semibold" : "text-navy font-semibold"}>
                {deadline.toLocaleDateString(locale === "ru" ? "ru-RU" : locale === "tr" ? "tr-TR" : "en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {isClosed ? (
          <div className="rounded-2xl p-10 text-center border border-gray-100" style={{ background: "rgba(11,30,61,0.02)" }}>
            <h3 className="text-navy font-bold text-lg mb-2">Registration Closed</h3>
            <p className="text-gray-500 text-sm">The registration deadline for this event has passed.</p>
          </div>
        ) : (
          <EventRegistrationForm
            eventId={event.id}
            eventTitle={title}
            eventSlug={event.slug}
            locale={locale}
            prefill={prefill}
            requirePassport={event.requirePassport}
            requirePhoto={event.requirePhoto}
            sessionRole={session?.role ?? null}
          />
        )}
      </div>
    </div>
  );
}
