import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { DelegationRegistrationForm } from "@/components/events/delegation-registration-form";

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
        imageUrl: true,
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

  const isSecretary   = session?.role === "Secretary of National Delegation";
  const isSecretariat = session?.role === "Member of International Secretariat";
  const hasAccess     = isSecretary || isSecretariat;

  let userDetails: { firstName: string; lastName: string; email: string; country: string } | null = null;
  if (session && hasAccess) {
    try {
      const u = await db.authUser.findUnique({
        where: { id: session.userId },
        select: { firstName: true, lastName: true, email: true, country: true },
      });
      if (u) userDetails = u;
    } catch {
      // db unavailable
    }
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!session) {
    return (
      <AccessBlock
        icon="lock"
        title="Login Required"
        body="You must be logged in to access the delegation registration form."
        action={
          <Link
            href={`/${locale}/login?from=/${locale}/events/${event.slug}/register`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
            style={{ background: "#0B1E3D" }}
          >
            Sign in to continue
          </Link>
        }
      />
    );
  }

  // ── Wrong role ─────────────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <AccessBlock
        icon="calendar"
        title="Registration Not Available"
        body="Delegation registration is available to Secretaries of National Delegations and Members of the International Secretariat. If you believe this is an error, please contact the PABSEC Secretariat."
        action={
          <Link
            href={`/${locale}/events/${event.slug}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-navy border border-[#DDE4ED] hover:bg-gray-50 transition"
          >
            ← Back to Event
          </Link>
        }
      />
    );
  }

  // ── Registration closed ────────────────────────────────────────────────────
  if (isClosed) {
    return (
      <AccessBlock
        icon="clock"
        title="Registration Closed"
        body={`The registration deadline for ${title} has passed. Please contact the PABSEC Secretariat for assistance.`}
        action={
          <Link
            href={`/${locale}/events/${event.slug}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-navy border border-[#DDE4ED] hover:bg-gray-50 transition"
          >
            ← Back to Event
          </Link>
        }
      />
    );
  }

  // ── Full delegation form ───────────────────────────────────────────────────
  return (
    <DelegationRegistrationForm
      eventId={event.id}
      eventSlug={event.slug}
      eventTitle={title}
      eventImageUrl={event.imageUrl ?? null}
      locale={locale}
      isSecretariat={isSecretariat}
      secretaryName={userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : (session.firstName + " " + session.lastName)}
      secretaryCountry={userDetails?.country ?? ""}
      secretaryEmail={userDetails?.email ?? ""}
    />
  );
}

// ── Access block component ─────────────────────────────────────────────────

function AccessBlock({
  icon,
  title,
  body,
  action,
}: {
  icon: "lock" | "calendar" | "clock";
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  const icons = {
    lock: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    ),
    calendar: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    ),
    clock: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-[#DDE4ED] p-12 max-w-lg w-full text-center"
        style={{ boxShadow: "0 2px 8px rgba(11,30,61,0.07)" }}>
        {/* Gold accent line */}
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="h-px w-8" style={{ background: "#C9A84C" }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: "#C9A84C" }}>PABSEC Events</span>
          <div className="h-px w-8" style={{ background: "#C9A84C" }} />
        </div>

        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(11,30,61,0.05)" }}>
          <svg className="w-7 h-7" fill="none" stroke="#0B1E3D" strokeWidth={1.6} viewBox="0 0 24 24">
            {icons[icon]}
          </svg>
        </div>

        <h2 className="font-playfair text-2xl font-bold text-navy mb-3">{title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-8">{body}</p>
        {action}
      </div>
    </div>
  );
}
