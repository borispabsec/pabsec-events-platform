import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Image from "next/image";
import { sendRegistrationApproved, sendRegistrationRejected } from "@/lib/email";
import { findMemberPhoto } from "@/lib/services/pabsec-data";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

async function approveUser(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("userId") as string;
  const notes = (formData.get("notes") as string) || null;
  if (!id) return;
  const user = await db.authUser.findUnique({ where: { id } });
  if (!user) return;
  let photoUrl = user.photoUrl;
  if (!photoUrl) {
    try {
      const found = await findMemberPhoto(user.firstName, user.lastName);
      if (found) photoUrl = found;
    } catch { /* best-effort */ }
  }
  await db.authUser.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: "admin",
      photoUrl: photoUrl ?? user.uploadedPhotoUrl,
      adminNotes: notes,
    },
  });
  sendRegistrationApproved({ to: user.email, firstName: user.firstName, lastName: user.lastName }).catch(console.error);
  redirect("/admin/users");
}

async function rejectUser(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("userId") as string;
  const reason = (formData.get("reason") as string) || undefined;
  const notes = (formData.get("notes") as string) || null;
  if (!id) return;
  const user = await db.authUser.findUnique({ where: { id } });
  if (!user) return;
  await db.authUser.update({ where: { id }, data: { status: "REJECTED", adminNotes: notes } });
  sendRegistrationRejected({ to: user.email, firstName: user.firstName, lastName: user.lastName, reason }).catch(console.error);
  redirect("/admin/users");
}

async function unlockUser(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("userId") as string;
  if (!id) return;
  await db.authUser.update({
    where: { id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  redirect("/admin/users");
}

async function deleteUser(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("userId") as string;
  if (!id) return;
  await db.authUser.delete({ where: { id } });
  redirect("/admin/users");
}

const STATUS_FILTERS = [
  { value: "all",      label: "All" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdmin();
  const { filter = "all" } = await searchParams;

  const where =
    filter === "pending"  ? { status: "PENDING"  as const } :
    filter === "approved" ? { status: "APPROVED" as const } :
    filter === "rejected" ? { status: "REJECTED" as const } :
    {};

  const users = await db.authUser.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const counts = await db.authUser.groupBy({ by: ["status"], _count: true });
  const countMap: Record<string, number> = {};
  counts.forEach((c) => { countMap[c.status.toLowerCase()] = c._count; });
  countMap.all = users.length + (filter === "all" ? 0 : Object.values(countMap).reduce((a, b) => a + b, 0));

  const allCount = await db.authUser.count();

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Management</span>
        </div>
        <h1 className="text-navy text-2xl font-bold">Users</h1>
        <p className="text-gray-400 text-sm mt-1">Manage delegate registrations and approvals.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map((f) => {
          const cnt = f.value === "all" ? allCount : (countMap[f.value] ?? 0);
          return (
            <a
              key={f.value}
              href={`/admin/users${f.value === "all" ? "" : `?filter=${f.value}`}`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                (filter === f.value || (filter !== "pending" && filter !== "approved" && filter !== "rejected" && f.value === "all"))
                  ? "bg-navy text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-navy/30 hover:text-navy"
              }`}
            >
              {f.label}
              {cnt > 0 && (
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${
                  (filter === f.value || (filter !== "pending" && filter !== "approved" && filter !== "rejected" && f.value === "all"))
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {cnt}
                </span>
              )}
            </a>
          );
        })}
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <div className="px-6 py-5 flex items-start gap-5">
                {u.uploadedPhotoUrl || u.photoUrl ? (
                  <Image
                    src={(u.photoUrl || u.uploadedPhotoUrl)!}
                    alt={`${u.firstName} ${u.lastName}`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-navy/8 flex items-center justify-center flex-shrink-0 border border-gray-100 text-navy font-bold">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-navy font-bold text-sm">{u.firstName} {u.lastName}</h3>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      u.status === "APPROVED" ? "bg-green-50 text-green-700"
                      : u.status === "REJECTED" ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700"
                    }`}>
                      {u.status}
                    </span>
                    {u.lockedUntil && u.lockedUntil > new Date() && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        LOCKED
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-gray-500">
                    <span><strong className="text-gray-600">@</strong> {u.username}</span>
                    <span><strong className="text-gray-600">Email:</strong> {u.email}</span>
                    <span><strong className="text-gray-600">Country:</strong> {u.country}</span>
                    <span><strong className="text-gray-600">Role:</strong> {u.role}</span>
                  </div>
                  {u.adminNotes && (
                    <p className="text-gray-400 text-xs italic mt-1">Note: {u.adminNotes}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <a
                      href={`https://www.pabsec.org/search?q=${encodeURIComponent(u.firstName + " " + u.lastName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-500 hover:text-gold transition"
                    >
                      Verify on pabsec.org →
                    </a>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-5 flex flex-wrap gap-3 border-t border-gray-50 pt-4">
                {u.status === "PENDING" && (
                  <>
                    <form action={approveUser} className="flex items-end gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <input
                        type="text"
                        name="notes"
                        placeholder="Admin notes (optional)"
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold w-44"
                      />
                      <button type="submit" className="px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition">
                        Approve
                      </button>
                    </form>
                    <form action={rejectUser} className="flex items-end gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <input
                        type="text"
                        name="reason"
                        placeholder="Reason (optional)"
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold w-44"
                      />
                      <button type="submit" className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition">
                        Reject
                      </button>
                    </form>
                  </>
                )}
                {u.lockedUntil && u.lockedUntil > new Date() && (
                  <form action={unlockUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button type="submit" className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition">
                      Unlock Account
                    </button>
                  </form>
                )}
                <form action={deleteUser} onSubmit={(e) => { if (!confirm(`Delete ${u.firstName} ${u.lastName}?`)) e.preventDefault(); }}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button type="submit" className="px-3 py-1.5 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
