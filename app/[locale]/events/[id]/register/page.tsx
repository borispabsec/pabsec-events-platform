import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { EventRegistrationForm } from "@/components/events/event-registration-form";

const BETA_TESTERS = ["pabsec", "kolisboris", "Gleb"];

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
        {!session ? (
          <div className="rounded-2xl p-10 text-center border border-gray-100" style={{ background: "rgba(11,30,61,0.02)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(11,30,61,0.06)" }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "#0B1E3D" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-navy font-bold text-lg mb-2">Login Required</h3>
            <p className="text-gray-500 text-sm mb-6">You must be logged in to access the registration form.</p>
            <Link
              href={`/${locale}/login?from=/${locale}/events/${event.slug}/register`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-navy/90 transition"
            >
              Log in
            </Link>
          </div>
        ) : !BETA_TESTERS.some((u) => u.toLowerCase() === session.username.toLowerCase()) ? (
          <div className="rounded-2xl p-10 text-center border border-gray-100" style={{ background: "rgba(11,30,61,0.02)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(11,30,61,0.06)" }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" style={{ color: "#0B1E3D" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-navy font-bold text-lg mb-2">Registration Opening Soon</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
              Registration for this event will open soon.
              <br />
              You will be notified when registration becomes available.
            </p>
          </div>
        ) : isClosed ? (
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
