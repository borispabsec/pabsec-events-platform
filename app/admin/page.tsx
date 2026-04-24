import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Image from "next/image";
import { sendRegistrationApproved, sendRegistrationRejected } from "@/lib/email";
import { findMemberPhoto } from "@/lib/services/pabsec-data";

async function updateHeroTextColor(formData: FormData) {
  "use server";
  const eventId = formData.get("eventId") as string;
  const heroTextColor = formData.get("heroTextColor") as string;
  if (!eventId || !["auto", "white", "dark"].includes(heroTextColor)) return;
  await db.event.update({ where: { id: eventId }, data: { heroTextColor } });
  redirect("/admin");
}

async function addEventDocument(formData: FormData) {
  "use server";
  const eventId  = formData.get("eventId")  as string;
  const locale   = formData.get("locale")   as string;
  const category = formData.get("category") as string;
  const title    = formData.get("title")    as string;
  const fileUrl  = formData.get("fileUrl")  as string;
  if (!eventId || !locale || !category || !title || !fileUrl) return;
  if (!["en", "ru", "tr"].includes(locale)) return;
  await db.eventDocument.create({
    data: { eventId, locale: locale as "en" | "ru" | "tr", category, title, fileUrl },
  });
  redirect("/admin");
}

async function deleteEventDocument(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await db.eventDocument.delete({ where: { id } });
  redirect("/admin");
}

async function approveUser(formData: FormData) {
  "use server";
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
  redirect("/admin?" + new URLSearchParams({ key: process.env.ADMIN_KEY ?? "changeme" }).toString());
}

async function rejectUser(formData: FormData) {
  "use server";
  const id = formData.get("userId") as string;
  const reason = (formData.get("reason") as string) || undefined;
  const notes = (formData.get("notes") as string) || null;
  if (!id) return;
  const user = await db.authUser.findUnique({ where: { id } });
  if (!user) return;
  await db.authUser.update({ where: { id }, data: { status: "REJECTED", adminNotes: notes } });
  sendRegistrationRejected({ to: user.email, firstName: user.firstName, lastName: user.lastName, reason }).catch(console.error);
  redirect("/admin?" + new URLSearchParams({ key: process.env.ADMIN_KEY ?? "changeme" }).toString());
}

const DOCUMENT_CATEGORIES = [
  { id: "programme",  label: "Programme" },
  { id: "hotel",      label: "Hotel Information" },
  { id: "practical",  label: "Practical Info" },
  { id: "official",   label: "Official Documents" },
] as const;

const LOCALES = ["en", "ru", "tr"] as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const adminKey = process.env.ADMIN_KEY ?? "changeme";
  if (key !== adminKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center shadow-sm">
          <h1 className="text-navy font-bold text-xl mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm">Append <code>?key=YOUR_ADMIN_KEY</code> to the URL.</p>
        </div>
      </div>
    );
  }

  const [events, pendingUsers, allUsers] = await Promise.all([
    db.event.findMany({
      orderBy: { startDate: "desc" },
      include: {
        translations: { where: { locale: "en" } },
        documents: { orderBy: [{ locale: "asc" }, { category: "asc" }, { sortOrder: "asc" }] },
      },
    }),
    db.authUser.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" } }),
    db.authUser.findMany({ where: { status: { not: "PENDING" } }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  const colorOptions = [
    { value: "auto",  label: "Auto-detect (Canvas)", desc: "Samples the bottom of the photo to decide" },
    { value: "white", label: "Always White text",    desc: "Force white — use on dark photos" },
    { value: "dark",  label: "Always Dark text",     desc: "Force navy — use on light photos" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Admin</span>
        </div>
        <h1 className="text-navy text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-gray-500 text-sm mb-10">Registration requests, event settings, and document management.</p>

        {/* ── Registration Requests ──────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-navy font-bold text-lg">Registration Requests</h2>
            {pendingUsers.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold text-white text-[10px] font-bold">
                {pendingUsers.length}
              </span>
            )}
          </div>

          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">No pending registration requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((u) => (
                <div key={u.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="px-6 py-5 flex items-start gap-5">
                    {u.uploadedPhotoUrl ? (
                      <Image
                        src={u.uploadedPhotoUrl}
                        alt={`${u.firstName} ${u.lastName}`}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                        unoptimized
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-navy/8 flex items-center justify-center flex-shrink-0 border border-gray-100 text-navy font-bold text-lg">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-navy font-bold text-base">{u.firstName} {u.lastName}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">PENDING</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-0.5 text-sm text-gray-500">
                        <span><strong className="text-gray-700">Email:</strong> {u.email}</span>
                        <span><strong className="text-gray-700">Country:</strong> {u.country}</span>
                        <span><strong className="text-gray-700">Role:</strong> {u.role}</span>
                      </div>
                      <a
                        href={`https://www.pabsec.org/search?q=${encodeURIComponent(u.firstName + " " + u.lastName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-blue-500 hover:text-gold transition"
                      >
                        Verify on pabsec.org
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="px-6 pb-5 flex flex-wrap gap-3">
                    <form action={approveUser} className="flex items-end gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin Notes</label>
                        <input type="text" name="notes" placeholder="Optional notes…" className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold w-48" />
                      </div>
                      <button type="submit" className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">
                        Approve
                      </button>
                    </form>

                    <form action={rejectUser} className="flex items-end gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Rejection Reason</label>
                        <input type="text" name="reason" placeholder="Reason for rejection…" className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gold w-48" />
                      </div>
                      <button type="submit" className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent approved/rejected */}
          {allUsers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Recent Decisions</h3>
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                {allUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-navy font-semibold text-sm">{u.firstName} {u.lastName}</span>
                      <span className="text-gray-400 text-xs ml-2">{u.country} · {u.role}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      u.status === "APPROVED"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}>
                      {u.status}
                    </span>
                    {u.adminNotes && (
                      <span className="text-gray-400 text-xs italic truncate max-w-[160px]">{u.adminNotes}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Event Settings ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-navy font-bold text-lg">Event Settings</h2>
        </div>

        <div className="space-y-8">
          {events.map((event) => {
            const title = event.translations[0]?.title ?? event.slug;
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                {/* Event header */}
                <div className="px-7 pt-7 pb-5 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        background: event.status === "PUBLISHED" ? "rgba(34,197,94,0.10)" : "rgba(11,30,61,0.06)",
                        color: event.status === "PUBLISHED" ? "#15803d" : "#0B1E3D",
                      }}
                    >
                      {event.status}
                    </span>
                  </div>
                  <h2 className="text-navy font-bold text-base mb-1">{title}</h2>
                  <p className="text-gray-400 text-xs">
                    {event.location} · {event.startDate.toLocaleDateString("en-GB")}
                  </p>
                </div>

                {/* Hero text color */}
                <div className="px-7 py-6 border-b border-gray-100">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                    Hero Text Colour
                  </p>
                  <form action={updateHeroTextColor} className="space-y-3">
                    <input type="hidden" name="eventId" value={event.id} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {colorOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex flex-col gap-1 p-4 rounded-xl border cursor-pointer transition-all ${
                            event.heroTextColor === opt.value
                              ? "border-gold bg-gold/5"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="heroTextColor"
                            value={opt.value}
                            defaultChecked={event.heroTextColor === opt.value}
                            className="sr-only"
                          />
                          <span className="font-semibold text-navy text-sm">{opt.label}</span>
                          <span className="text-gray-400 text-[11px] leading-snug">{opt.desc}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                      style={{ background: "#1A5FA8" }}
                    >
                      Save Colour
                    </button>
                  </form>
                </div>

                {/* Document management */}
                <div className="px-7 py-6">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                    Documents
                  </p>

                  {/* Existing documents grouped by locale + category */}
                  {LOCALES.map((loc) => {
                    const localeDocs = event.documents.filter((d) => d.locale === loc);
                    if (localeDocs.length === 0) return null;
                    return (
                      <div key={loc} className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-2">
                          {loc.toUpperCase()}
                        </p>
                        <div className="space-y-2">
                          {localeDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50"
                            >
                              <div className="flex-1 min-w-0">
                                <span
                                  className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded mr-2"
                                  style={{ background: "rgba(11,30,61,0.06)", color: "#0B1E3D" }}
                                >
                                  {doc.category}
                                </span>
                                <span className="text-sm text-navy font-medium">{doc.title}</span>
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-[11px] text-blue-500 hover:text-gold truncate"
                                >
                                  {doc.fileUrl}
                                </a>
                              </div>
                              <form action={deleteEventDocument}>
                                <input type="hidden" name="id" value={doc.id} />
                                <button
                                  type="submit"
                                  className="text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                                >
                                  Delete
                                </button>
                              </form>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add new document form */}
                  <div
                    className="mt-4 p-5 rounded-xl"
                    style={{ background: "rgba(11,30,61,0.02)", border: "1px solid rgba(11,30,61,0.07)" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                      Add Document
                    </p>
                    <form action={addEventDocument} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="hidden" name="eventId" value={event.id} />

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                          Language
                        </label>
                        <select
                          name="locale"
                          required
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold"
                        >
                          <option value="en">EN – English</option>
                          <option value="ru">RU – Русский</option>
                          <option value="tr">TR – Türkçe</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                          Category
                        </label>
                        <select
                          name="category"
                          required
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold"
                        >
                          {DOCUMENT_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          required
                          placeholder="e.g. Provisional Agenda"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold placeholder:text-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                          File URL
                        </label>
                        <input
                          type="url"
                          name="fileUrl"
                          required
                          placeholder="https://pabsec.org/…"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold placeholder:text-gray-300"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                          style={{ background: "#1A5FA8" }}
                        >
                          Add Document
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-gray-300 text-xs text-center mt-10">
          PABSEC Events Platform · Admin · <code>?key=</code> protected
        </p>
      </div>
    </div>
  );
}
