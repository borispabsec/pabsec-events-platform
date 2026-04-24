import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

export default async function AnalyticsPage() {
  await requireAdmin();

  const [
    totalUsers,
    pendingUsers,
    approvedUsers,
    rejectedUsers,
    totalEvents,
    totalRegistrations,
    confirmedRegistrations,
    totalDocs,
    usersByCountry,
    usersByRole,
    regsByEvent,
    regsByStatus,
    recentUsers,
  ] = await Promise.all([
    db.authUser.count(),
    db.authUser.count({ where: { status: "PENDING" } }),
    db.authUser.count({ where: { status: "APPROVED" } }),
    db.authUser.count({ where: { status: "REJECTED" } }),
    db.event.count(),
    db.registration.count(),
    db.registration.count({ where: { status: "CONFIRMED" } }),
    db.eventDocument.count(),
    db.authUser.groupBy({ by: ["country"], _count: true, orderBy: { _count: { country: "desc" } }, take: 10 }),
    db.authUser.groupBy({ by: ["role"], _count: true, orderBy: { _count: { role: "desc" } } }),
    db.registration.groupBy({
      by: ["eventId"],
      _count: true,
      orderBy: { _count: { eventId: "desc" } },
      take: 10,
    }),
    db.registration.groupBy({ by: ["status"], _count: true }),
    db.authUser.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  // Fetch event titles for registrations
  const eventIds = regsByEvent.map((r) => r.eventId);
  const eventsForRegs = await db.event.findMany({
    where: { id: { in: eventIds } },
    include: { translations: { where: { locale: "en" } } },
  });
  const eventTitleMap: Record<string, string> = {};
  eventsForRegs.forEach((e) => { eventTitleMap[e.id] = e.translations[0]?.title ?? e.slug; });

  const regStatusMap: Record<string, number> = {};
  regsByStatus.forEach((r) => { regStatusMap[r.status] = r._count; });

  // Group recentUsers by month
  const monthlySignups: Record<string, number> = {};
  recentUsers.forEach((u) => {
    const key = u.createdAt.toISOString().slice(0, 7);
    monthlySignups[key] = (monthlySignups[key] ?? 0) + 1;
  });
  const monthlyEntries = Object.entries(monthlySignups).sort().slice(-6);

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Insights</span>
        </div>
        <h1 className="text-navy text-2xl font-bold">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Platform usage overview.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users",    value: totalUsers,              color: "text-blue-600" },
          { label: "Approved",       value: approvedUsers,           color: "text-green-600" },
          { label: "Pending",        value: pendingUsers,            color: "text-amber-600" },
          { label: "Rejected",       value: rejectedUsers,           color: "text-red-500" },
          { label: "Events",         value: totalEvents,             color: "text-purple-600" },
          { label: "Registrations",  value: totalRegistrations,      color: "text-navy" },
          { label: "Confirmed Regs", value: confirmedRegistrations,  color: "text-green-600" },
          { label: "Documents",      value: totalDocs,               color: "text-gray-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 border border-gray-100"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by country */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-navy font-bold text-sm">Users by Country</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            {usersByCountry.map((c) => {
              const pct = totalUsers > 0 ? Math.round((c._count / totalUsers) * 100) : 0;
              return (
                <div key={c.country} className="flex items-center gap-3">
                  <p className="text-xs text-navy font-medium w-36 truncate">{c.country}</p>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 w-8 text-right">{c._count}</p>
                </div>
              );
            })}
            {usersByCountry.length === 0 && <p className="text-gray-400 text-sm">No data.</p>}
          </div>
        </div>

        {/* Users by role */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-navy font-bold text-sm">Users by Role</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            {usersByRole.map((r) => {
              const pct = totalUsers > 0 ? Math.round((r._count / totalUsers) * 100) : 0;
              return (
                <div key={r.role} className="flex items-center gap-3">
                  <p className="text-xs text-navy font-medium w-52 truncate">{r.role}</p>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 w-8 text-right">{r._count}</p>
                </div>
              );
            })}
            {usersByRole.length === 0 && <p className="text-gray-400 text-sm">No data.</p>}
          </div>
        </div>

        {/* Registrations by event */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-navy font-bold text-sm">Registrations by Event</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            {regsByEvent.map((r) => {
              const pct = totalRegistrations > 0 ? Math.round((r._count / totalRegistrations) * 100) : 0;
              return (
                <div key={r.eventId} className="flex items-center gap-3">
                  <p className="text-xs text-navy font-medium w-48 truncate">
                    {eventTitleMap[r.eventId] ?? r.eventId}
                  </p>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 w-8 text-right">{r._count}</p>
                </div>
              );
            })}
            {regsByEvent.length === 0 && <p className="text-gray-400 text-sm">No registrations yet.</p>}
          </div>
        </div>

        {/* Monthly signups */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-navy font-bold text-sm">User Signups (last 6 months)</h2>
          </div>
          <div className="px-6 py-4">
            {monthlyEntries.length > 0 ? (
              <div className="flex items-end gap-3 h-24">
                {monthlyEntries.map(([month, count]) => {
                  const maxVal = Math.max(...monthlyEntries.map(([, v]) => v));
                  const pct = maxVal > 0 ? (count / maxVal) * 100 : 0;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-[9px] font-bold text-navy">{count}</p>
                      <div className="w-full rounded-t-md bg-navy/10 relative" style={{ height: "60px" }}>
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-t-md bg-navy transition-all"
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-gray-400">{month.slice(5)}/{month.slice(2, 4)}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No signup data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
