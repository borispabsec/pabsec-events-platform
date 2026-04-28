import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { RegistrationRowActions } from "@/components/admin/registration-row-actions";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

function fmt(d?: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_COLORS: Record<string, string> = {
  pending:           "bg-amber-50 text-amber-700",
  approved:          "bg-green-50 text-green-700",
  rejected:          "bg-red-50 text-red-600",
  changes_requested: "bg-blue-50 text-blue-700",
};

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string; status?: string; country?: string; search?: string; role?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const { eventId, status = "all", country = "all", search, role = "all" } = params;

  const events = await db.event.findMany({
    select: { id: true, slug: true, translations: { where: { locale: "en" }, select: { title: true } } },
    orderBy: { startDate: "desc" },
  });

  const where: Record<string, unknown> = {};
  if (eventId) where.eventId = eventId;
  if (status !== "all") where.status = status;
  if (country !== "all") where.country = country;
  if (role !== "all") where.participantRole = role;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const registrations = await db.eventRegistration.findMany({
    where,
    orderBy: [{ country: "asc" }, { lastName: "asc" }],
    include: {
      event: { select: { slug: true, translations: { where: { locale: "en" }, select: { title: true } } } },
    },
  });

  const allCountries = await db.eventRegistration.findMany({
    select: { country: true },
    distinct: ["country"],
    orderBy: { country: "asc" },
  });

  const counts = {
    all: await db.eventRegistration.count(eventId ? { where: { eventId } } : undefined),
    pending: await db.eventRegistration.count({ where: { ...(eventId ? { eventId } : {}), status: "pending" } }),
    approved: await db.eventRegistration.count({ where: { ...(eventId ? { eventId } : {}), status: "approved" } }),
    rejected: await db.eventRegistration.count({ where: { ...(eventId ? { eventId } : {}), status: "rejected" } }),
  };

  function filterHref(overrides: Record<string, string>) {
    const p = new URLSearchParams({ ...params, ...overrides });
    return `/admin/registrations?${p}`;
  }

  const exportUrl = `/api/admin/event-registrations/export${eventId ? `?eventId=${eventId}` : ""}`;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Management</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-navy text-2xl font-bold">Registrations</h1>
            <p className="text-gray-400 text-sm mt-1">Manage participant registrations for all events.</p>
          </div>
          <a
            href={exportUrl}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </a>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Event selector */}
        <form method="get" action="/admin/registrations">
          <select
            name="eventId"
            defaultValue={eventId ?? ""}
            onChange={(e) => (e.currentTarget.form as HTMLFormElement).submit()}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold bg-white"
          >
            <option value="">All Events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.translations[0]?.title ?? e.slug}</option>
            ))}
          </select>
          {country !== "all" && <input type="hidden" name="country" value={country} />}
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {role !== "all" && <input type="hidden" name="role" value={role} />}
          {search && <input type="hidden" name="search" value={search} />}
        </form>

        {/* Country selector */}
        <form method="get" action="/admin/registrations">
          {eventId && <input type="hidden" name="eventId" value={eventId} />}
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {role !== "all" && <input type="hidden" name="role" value={role} />}
          {search && <input type="hidden" name="search" value={search} />}
          <select
            name="country"
            defaultValue={country}
            onChange={(e) => (e.currentTarget.form as HTMLFormElement).submit()}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold bg-white"
          >
            <option value="all">All Countries</option>
            {allCountries.map((c) => (
              <option key={c.country} value={c.country}>{c.country}</option>
            ))}
          </select>
        </form>

        {/* Search */}
        <form method="get" action="/admin/registrations" className="flex gap-2">
          {eventId && <input type="hidden" name="eventId" value={eventId} />}
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {country !== "all" && <input type="hidden" name="country" value={country} />}
          <input
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search name or email…"
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold w-48"
          />
          <button type="submit" className="px-3 py-1.5 rounded-xl bg-navy/10 text-navy text-xs font-semibold hover:bg-navy/20 transition">
            Search
          </button>
          {search && (
            <Link href={filterHref({ search: "" })} className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-400 hover:text-navy transition">
              ✕ Clear
            </Link>
          )}
        </form>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => {
          const cnt = counts[s] ?? 0;
          const active = status === s;
          return (
            <Link
              key={s}
              href={filterHref({ status: s })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                active
                  ? "bg-navy text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-navy/30 hover:text-navy"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {cnt > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[16px] h-4 rounded-full text-[9px] font-bold px-1 ${
                  active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {cnt}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {registrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No registrations found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-3 py-3 text-left font-semibold tracking-wide w-8">№</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Country</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Name</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Position / Role</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Arrival</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Arr. Airport</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Route</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Flight</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Time</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Hotel</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Departure</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Dep. Flight</th>
                  <th className="px-3 py-3 text-center font-semibold tracking-wide w-8">IST</th>
                  <th className="px-3 py-3 text-center font-semibold tracking-wide w-8">VIP</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide">Status</th>
                  <th className="px-3 py-3 text-left font-semibold tracking-wide min-w-[200px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${
                      r.isVip ? "bg-amber-50/40" : r.status === "pending" ? "bg-yellow-50/20" : ""
                    }`}
                  >
                    <td className="px-3 py-3 text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-3 py-3 font-semibold text-navy whitespace-nowrap">{r.country}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-semibold text-navy">{r.lastName}, {r.firstName}</div>
                      <div className="text-gray-400">{r.email}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-600 max-w-[160px]">
                      <div className="truncate">{r.position || r.participantRole}</div>
                      {r.isHeadOfDelegation && (
                        <span className="text-[9px] font-bold text-gold uppercase tracking-wide">Head of Del.</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{fmt(r.arrivalDate)}</td>
                    <td className="px-3 py-3 text-gray-600">{r.arrivalAirport ?? "—"}</td>
                    <td className="px-3 py-3 text-gray-600 max-w-[140px]">
                      <span className="truncate block">{r.arrivalRoute ?? "—"}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{r.arrivalFlight ?? "—"}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{r.arrivalTime ?? "—"}</td>
                    <td className="px-3 py-3 text-gray-600 max-w-[120px]">
                      <span className="truncate block">{r.hotelAssigned ?? r.hotelName ?? (r.needsHotel ? "Requested" : "—")}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{fmt(r.departureDate)}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{r.departureFlight ?? "—"}</td>
                    <td className="px-3 py-3 text-center">
                      {r.viaIstanbul ? (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {r.istanbulVipLounge ? "VIP" : "Yes"}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {r.isVip && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">VIP</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? "bg-gray-50 text-gray-500"}`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <RegistrationRowActions
                        id={r.id}
                        status={r.status}
                        adminNotes={r.adminNotes}
                        hotelAssigned={r.hotelAssigned}
                        isVip={r.isVip}
                        onUpdated={() => {}}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">{registrations.length} registration{registrations.length !== 1 ? "s" : ""} shown</p>
            <a href={exportUrl} className="text-xs font-semibold text-navy hover:text-gold transition">
              Download Excel →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
