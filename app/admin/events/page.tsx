import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { EventForm } from "@/components/admin/event-form";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { createEvent, updateEvent } from "@/lib/admin/event-actions";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-green-50 text-green-700",
  DRAFT:     "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-50 text-red-600",
  COMPLETED: "bg-blue-50 text-blue-600",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const action = params.action;
  const editId = params.id;

  // ── Create form ─────────────────────────────────────────────────────────────
  if (action === "create") {
    return (
      <div className="p-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/admin/events" className="text-xs text-gray-400 hover:text-navy flex items-center gap-1 mb-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">New Event</span>
          </div>
          <h1 className="text-navy text-2xl font-bold">Create Event</h1>
        </div>
        <EventForm mode="create" createAction={createEvent} updateAction={updateEvent} />
      </div>
    );
  }

  // ── Edit form ────────────────────────────────────────────────────────────────
  if (action === "edit" && editId) {
    const event = await db.event.findUnique({
      where: { id: editId },
      include: { translations: true },
    });
    if (!event) redirect("/admin/events");

    return (
      <div className="p-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/admin/events" className="text-xs text-gray-400 hover:text-navy flex items-center gap-1 mb-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Edit Event</span>
          </div>
          <h1 className="text-navy text-2xl font-bold">
            {event.translations.find((t) => t.locale === "en")?.title ?? event.slug}
          </h1>
        </div>
        <EventForm
          mode="edit"
          event={{
            id: event.id,
            slug: event.slug,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            status: event.status,
            heroTextColor: event.heroTextColor,
            imageUrl: event.imageUrl,
            translations: event.translations.map((t) => ({
              locale: t.locale,
              title: t.title,
              description: t.description,
              location: t.location ?? null,
            })),
          }}
          createAction={createEvent}
          updateAction={updateEvent}
        />
      </div>
    );
  }

  // ── Event list ───────────────────────────────────────────────────────────────
  const events = await db.event.findMany({
    orderBy: { startDate: "asc" },
    include: {
      translations: { where: { locale: "en" } },
      _count: { select: { registrations: true, documents: true } },
    },
  });

  // Determine which event is currently shown on the homepage
  const now = new Date();
  const homepageEventId =
    events
      .filter((e) => e.status === "PUBLISHED" && e.startDate >= now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0]?.id ??
    events
      .filter((e) => e.status === "PUBLISHED")
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0]?.id;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Management</span>
          </div>
          <h1 className="text-navy text-2xl font-bold">Events</h1>
          <p className="text-gray-400 text-sm mt-1">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/events?action=create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm mb-3">No events found.</p>
          <Link
            href="/admin/events?action=create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const title = event.translations[0]?.title ?? event.slug;
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="px-6 py-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status] ?? ""}`}>
                        {event.status}
                      </span>
                      {event.id === homepageEventId && (
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          On Homepage
                        </span>
                      )}
                      <span className="text-[10px] text-gray-300 font-mono">{event.slug}</span>
                    </div>
                    <h3 className="text-navy font-bold text-sm truncate">{title}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {event.location} · {event.startDate.toLocaleDateString("en-GB")} – {event.endDate.toLocaleDateString("en-GB")}
                    </p>
                    <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
                      <span>{event._count.registrations} registrations</span>
                      <span>{event._count.documents} documents</span>
                      {event.imageUrl ? (
                        <span className="text-green-600">✓ hero image</span>
                      ) : (
                        <span className="text-red-400">✗ no hero image</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Edit button */}
                    <Link
                      href={`/admin/events?action=edit&id=${event.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-navy hover:bg-navy/5 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                      Edit
                    </Link>

                    {/* Delete button */}
                    <DeleteEventButton eventId={event.id} title={title} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
