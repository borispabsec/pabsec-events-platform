import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sendRegistrationApproved, sendRegistrationRejected, sendRegistrationReceived } from "@/lib/email";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

async function resendApprovalEmail(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("userId") as string;
  if (!id) return;
  const user = await db.authUser.findUnique({ where: { id } });
  if (!user) return;
  if (user.status === "APPROVED") {
    await sendRegistrationApproved({ to: user.email, firstName: user.firstName, lastName: user.lastName });
  } else if (user.status === "REJECTED") {
    await sendRegistrationRejected({ to: user.email, firstName: user.firstName, lastName: user.lastName });
  } else {
    await sendRegistrationReceived({ to: user.email, firstName: user.firstName, lastName: user.lastName });
  }
  redirect("/admin/notifications");
}

export default async function NotificationsPage() {
  await requireAdmin();

  const users = await db.authUser.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const pending   = users.filter((u) => u.status === "PENDING");
  const approved  = users.filter((u) => u.status === "APPROVED");
  const rejected  = users.filter((u) => u.status === "REJECTED");

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Communications</span>
        </div>
        <h1 className="text-navy text-2xl font-bold">Notifications</h1>
        <p className="text-gray-400 text-sm mt-1">Resend email notifications to users.</p>
      </div>

      {/* Pending section */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-navy font-bold text-sm mb-3 flex items-center gap-2">
            Pending Review
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
              {pending.length}
            </span>
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {pending.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-semibold text-xs">{u.firstName} {u.lastName}</p>
                  <p className="text-gray-400 text-[10px] truncate">{u.email}</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex-shrink-0">
                  PENDING
                </span>
                <form action={resendApprovalEmail}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button type="submit" className="text-[10px] font-semibold text-blue-500 hover:text-gold transition flex-shrink-0">
                    Resend Confirmation
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved section */}
      <div className="mb-8">
        <h2 className="text-navy font-bold text-sm mb-3">Approved Users ({approved.length})</h2>
        {approved.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {approved.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-semibold text-xs">{u.firstName} {u.lastName}</p>
                  <p className="text-gray-400 text-[10px] truncate">{u.email} · {u.country}</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-50 text-green-700 flex-shrink-0">
                  APPROVED
                </span>
                <form action={resendApprovalEmail}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button type="submit" className="text-[10px] font-semibold text-blue-500 hover:text-gold transition flex-shrink-0">
                    Resend Approval Email
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-gray-400 text-sm">No approved users yet.</p>
          </div>
        )}
      </div>

      {/* Rejected section */}
      {rejected.length > 0 && (
        <div>
          <h2 className="text-navy font-bold text-sm mb-3">Rejected ({rejected.length})</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {rejected.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-semibold text-xs">{u.firstName} {u.lastName}</p>
                  <p className="text-gray-400 text-[10px] truncate">{u.email}</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex-shrink-0">
                  REJECTED
                </span>
                <form action={resendApprovalEmail}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button type="submit" className="text-[10px] font-semibold text-blue-500 hover:text-gold transition flex-shrink-0">
                    Resend Rejection Email
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 p-5 rounded-2xl border border-gray-100 bg-gray-50">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email Provider</p>
        <p className="text-sm text-gray-600">
          Emails are sent via <strong>Resend</strong> from <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">noreply@pabsecevents.org</code>.
          Admin notifications go to <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">
            {process.env.ADMIN_EMAIL ?? "borispabsec@gmail.com"}
          </code>.
        </p>
      </div>
    </div>
  );
}
