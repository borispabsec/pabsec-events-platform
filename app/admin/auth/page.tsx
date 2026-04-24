import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sendPasswordReset } from "@/lib/email";
import { generateToken } from "@/lib/auth/password";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

async function unlockAccount(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("userId") as string;
  if (!id) return;
  await db.authUser.update({
    where: { id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  redirect("/admin/auth");
}

async function sendPasswordResetEmail(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("userId") as string;
  if (!id) return;
  const user = await db.authUser.findUnique({ where: { id } });
  if (!user) return;
  const token = generateToken();
  await db.authUser.update({
    where: { id },
    data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) },
  });
  await sendPasswordReset({ to: user.email, firstName: user.firstName, token });
  redirect("/admin/auth");
}

export default async function AuthManagementPage() {
  await requireAdmin();

  const users = await db.authUser.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      status: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      resetToken: true,
      resetTokenExpiry: true,
      createdAt: true,
    },
  });

  const lockedUsers = users.filter((u) => u.lockedUntil && u.lockedUntil > new Date());

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Security</span>
        </div>
        <h1 className="text-navy text-2xl font-bold">Auth Management</h1>
        <p className="text-gray-400 text-sm mt-1">Manage account locks, password resets, and login attempts.</p>
      </div>

      {/* Locked accounts alert */}
      {lockedUsers.length > 0 && (
        <div className="mb-6 p-5 rounded-2xl border border-red-100 bg-red-50 flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <p className="flex-1 text-red-700 font-semibold text-sm">
            {lockedUsers.length} account{lockedUsers.length > 1 ? "s are" : " is"} currently locked due to failed login attempts.
          </p>
        </div>
      )}

      {/* All users table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-navy font-bold text-sm">All Users — Security Overview</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {users.map((u) => {
            const isLocked = u.lockedUntil && u.lockedUntil > new Date();
            const minutesLeft = isLocked
              ? Math.ceil((u.lockedUntil!.getTime() - Date.now()) / 60000)
              : 0;
            const hasPendingReset = u.resetToken && u.resetTokenExpiry && u.resetTokenExpiry > new Date();
            return (
              <div key={u.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-semibold text-xs">{u.firstName} {u.lastName}</p>
                  <p className="text-gray-400 text-[10px] truncate">@{u.username} · {u.email}</p>
                  <div className="flex gap-2 mt-1">
                    {isLocked && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                        LOCKED {minutesLeft}m left
                      </span>
                    )}
                    {hasPendingReset && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        RESET PENDING
                      </span>
                    )}
                    {u.failedLoginAttempts > 0 && !isLocked && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                        {u.failedLoginAttempts} FAILED ATTEMPTS
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isLocked && (
                    <form action={unlockAccount}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button type="submit" className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-[10px] font-semibold hover:bg-red-600 transition">
                        Unlock
                      </button>
                    </form>
                  )}
                  <form action={sendPasswordResetEmail}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button type="submit" className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 text-[10px] font-semibold hover:border-navy/30 hover:text-navy transition">
                      Send Reset
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="px-6 py-8 text-gray-400 text-sm text-center">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
