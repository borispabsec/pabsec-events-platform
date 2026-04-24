import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

async function loginAction(formData: FormData) {
  "use server";
  const key = formData.get("key") as string;
  const adminKey = process.env.ADMIN_KEY ?? "changeme";
  if (key === adminKey) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/admin");
  } else {
    redirect("/admin?error=1");
  }
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; key?: string }>;
}) {
  const cookieStore = await cookies();
  const authenticated = cookieStore.get("admin_session")?.value === "1";

  // Legacy ?key= URL support
  const { error, key } = await searchParams;
  if (!authenticated && key) {
    const adminKey = process.env.ADMIN_KEY ?? "changeme";
    if (key === adminKey) {
      cookieStore.set("admin_session", "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/admin",
        maxAge: 60 * 60 * 24 * 7,
      });
      redirect("/admin");
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div
          className="bg-white rounded-2xl p-10 w-full max-w-sm border border-gray-100"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px w-6 bg-gold" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">Admin</span>
          </div>
          <h1 className="text-navy font-bold text-xl mb-1">PABSEC Events</h1>
          <p className="text-gray-400 text-sm mb-6">Enter your admin key to continue.</p>

          {error && (
            <p className="text-red-500 text-xs rounded-lg bg-red-50 px-3 py-2 mb-4">
              Invalid key. Please try again.
            </p>
          )}

          <form action={loginAction} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                Admin Key
              </label>
              <input
                type="password"
                name="key"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard stats
  const [totalUsers, pendingUsers, approvedUsers, totalEvents, publishedEvents, totalRegistrations, totalDocs] =
    await Promise.all([
      db.authUser.count(),
      db.authUser.count({ where: { status: "PENDING" } }),
      db.authUser.count({ where: { status: "APPROVED" } }),
      db.event.count(),
      db.event.count({ where: { status: "PUBLISHED" } }),
      db.registration.count(),
      db.eventDocument.count(),
    ]);

  const recentUsers = await db.authUser.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentRegistrations = await db.registration.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { event: { include: { translations: { where: { locale: "en" } } } } },
  });

  const stats = [
    { label: "Total Users", value: totalUsers, sub: `${pendingUsers} pending`, href: "/admin/users", color: "bg-blue-50 text-blue-600" },
    { label: "Approved Users", value: approvedUsers, sub: "active delegates", href: "/admin/users", color: "bg-green-50 text-green-600" },
    { label: "Events", value: totalEvents, sub: `${publishedEvents} published`, href: "/admin/events", color: "bg-purple-50 text-purple-600" },
    { label: "Registrations", value: totalRegistrations, sub: "all time", href: "/admin/analytics", color: "bg-amber-50 text-amber-600" },
    { label: "Documents", value: totalDocs, sub: "uploaded", href: "/admin/documents", color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Dashboard</span>
        </div>
        <h1 className="text-navy text-2xl font-bold">Overview</h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-navy/20 transition-all hover:-translate-y-0.5 group"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-3 text-sm font-bold ${s.color}`}>
              {s.value}
            </div>
            <p className="text-navy font-bold text-sm">{s.label}</p>
            <p className="text-gray-400 text-[11px] mt-0.5">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending users */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-navy font-bold text-sm">Recent Users</h2>
            <Link href="/admin/users" className="text-[11px] font-semibold text-blue-500 hover:text-gold transition">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map((u) => (
              <div key={u.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-navy/8 flex items-center justify-center text-[9px] font-bold text-navy flex-shrink-0">
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-semibold text-xs truncate">{u.firstName} {u.lastName}</p>
                  <p className="text-gray-400 text-[10px] truncate">{u.country}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 ${
                  u.status === "APPROVED" ? "bg-green-50 text-green-700"
                  : u.status === "REJECTED" ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-700"
                }`}>
                  {u.status}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="px-6 py-6 text-gray-400 text-sm text-center">No users yet.</p>
            )}
          </div>
        </div>

        {/* Recent registrations */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-navy font-bold text-sm">Recent Registrations</h2>
            <Link href="/admin/analytics" className="text-[11px] font-semibold text-blue-500 hover:text-gold transition">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentRegistrations.map((r) => (
              <div key={r.id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-navy/8 flex items-center justify-center text-[9px] font-bold text-navy flex-shrink-0">
                  {r.firstName[0]}{r.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-semibold text-xs truncate">{r.firstName} {r.lastName}</p>
                  <p className="text-gray-400 text-[10px] truncate">{r.event.translations[0]?.title ?? r.event.slug}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 ${
                  r.status === "CONFIRMED" ? "bg-green-50 text-green-700"
                  : r.status === "REJECTED" ? "bg-red-50 text-red-600"
                  : r.status === "WAITLISTED" ? "bg-purple-50 text-purple-700"
                  : "bg-amber-50 text-amber-700"
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
            {recentRegistrations.length === 0 && (
              <p className="px-6 py-6 text-gray-400 text-sm text-center">No registrations yet.</p>
            )}
          </div>
        </div>
      </div>

      {pendingUsers > 0 && (
        <div className="mt-6 p-5 rounded-2xl border border-amber-100 bg-amber-50 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-amber-800 font-semibold text-sm">{pendingUsers} pending registration request{pendingUsers > 1 ? "s" : ""}</p>
            <p className="text-amber-700 text-xs mt-0.5">Review and approve or reject new delegate registrations.</p>
          </div>
          <Link
            href="/admin/users?filter=pending"
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition"
          >
            Review Now
          </Link>
        </div>
      )}
    </div>
  );
}
