import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

async function updateEventStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("eventId") as string;
  const status = formData.get("status") as string;
  const validStatuses = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"];
  if (!id || !validStatuses.includes(status)) return;
  await db.event.update({ where: { id }, data: { status: status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED" } });
  redirect("/admin/events");
}

async function updateHeroTextColor(formData: FormData) {
  "use server";
  await requireAdmin();
  const eventId = formData.get("eventId") as string;
  const heroTextColor = formData.get("heroTextColor") as string;
  if (!eventId || !["auto", "white", "dark"].includes(heroTextColor)) return;
  await db.event.update({ where: { id: eventId }, data: { heroTextColor } });
  redirect("/admin/events");
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED:  "bg-green-50 text-green-700",
  DRAFT:      "bg-gray-100 text-gray-500",
  CANCELLED:  "bg-red-50 text-red-600",
  COMPLETED:  "bg-blue-50 text-blue-600",
};

export default async function EventsPage() {
  await requireAdmin();

  const events = await db.event.findMany({
    orderBy: { startDate: "desc" },
    include: {
      translations: { where: { locale: "en" } },
      _count: { select: { registrations: true, documents: true } },
    },
  });

  const colorOptions = [
    { value: "auto",  label: "Auto (Canvas)" },
    { value: "white", label: "White text" },
    { value: "dark",  label: "Dark text" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Management</span>
        </div>
        <h1 className="text-navy text-2xl font-bold">Events</h1>
        <p className="text-gray-400 text-sm mt-1">Manage event status and hero image settings.</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No events found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const title = event.translations[0]?.title ?? event.slug;
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="px-6 py-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status] ?? ""}`}>
                        {event.status}
                      </span>
                    </div>
                    <h3 className="text-navy font-bold text-sm">{title}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {event.location} · {event.startDate.toLocaleDateString("en-GB")}–{event.endDate.toLocaleDateString("en-GB")}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>{event._count.registrations} registrations</span>
                      <span>{event._count.documents} documents</span>
                    </div>
                  </div>

                  {/* Status change */}
                  <form action={updateEventStatus} className="flex items-center gap-2 flex-shrink-0">
                    <input type="hidden" name="eventId" value={event.id} />
                    <select
                      name="status"
                      defaultValue={event.status}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition"
                    >
                      Save
                    </button>
                  </form>
                </div>

                {/* Hero color */}
                <div className="px-6 pb-5 border-t border-gray-50 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Hero Text Colour</p>
                  <form action={updateHeroTextColor} className="flex items-center gap-3 flex-wrap">
                    <input type="hidden" name="eventId" value={event.id} />
                    <div className="flex gap-2">
                      {colorOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer text-xs font-medium transition ${
                            event.heroTextColor === opt.value
                              ? "border-gold bg-gold/5 text-navy"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="heroTextColor"
                            value={opt.value}
                            defaultChecked={event.heroTextColor === opt.value}
                            className="sr-only"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl border border-navy/20 text-navy text-xs font-semibold hover:bg-navy/5 transition"
                    >
                      Apply
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
