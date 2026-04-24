import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

async function addDocument(formData: FormData) {
  "use server";
  await requireAdmin();
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
  redirect("/admin/documents");
}

async function deleteDocument(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  await db.eventDocument.delete({ where: { id } });
  redirect("/admin/documents");
}

const CATEGORIES = [
  { id: "programme",  label: "Programme" },
  { id: "hotel",      label: "Hotel Information" },
  { id: "practical",  label: "Practical Info" },
  { id: "official",   label: "Official Documents" },
];

const LOCALES = ["en", "ru", "tr"] as const;

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  await requireAdmin();
  const { event: filterEventId } = await searchParams;

  const events = await db.event.findMany({
    orderBy: { startDate: "desc" },
    include: {
      translations: { where: { locale: "en" } },
      documents: {
        orderBy: [{ locale: "asc" }, { category: "asc" }, { sortOrder: "asc" }],
      },
    },
  });

  const filteredEvents = filterEventId
    ? events.filter((e) => e.id === filterEventId)
    : events;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Management</span>
        </div>
        <h1 className="text-navy text-2xl font-bold">Documents</h1>
        <p className="text-gray-400 text-sm mt-1">Add and manage event documents per locale.</p>
      </div>

      {/* Event filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <a
          href="/admin/documents"
          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            !filterEventId ? "bg-navy text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-navy/30 hover:text-navy"
          }`}
        >
          All Events
        </a>
        {events.map((e) => (
          <a
            key={e.id}
            href={`/admin/documents?event=${e.id}`}
            className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterEventId === e.id ? "bg-navy text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-navy/30 hover:text-navy"
            }`}
          >
            {e.translations[0]?.title ?? e.slug}
          </a>
        ))}
      </div>

      <div className="space-y-6">
        {filteredEvents.map((event) => {
          const title = event.translations[0]?.title ?? event.slug;
          return (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-navy font-bold text-sm">{title}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{event.location} · {event.startDate.toLocaleDateString("en-GB")}</p>
              </div>

              {/* Existing documents */}
              <div className="px-6 py-4">
                {LOCALES.map((loc) => {
                  const docs = event.documents.filter((d) => d.locale === loc);
                  if (docs.length === 0) return null;
                  return (
                    <div key={loc} className="mb-4 last:mb-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-navy/40 mb-2">{loc.toUpperCase()}</p>
                      <div className="space-y-2">
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50"
                          >
                            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-navy/6 text-navy/60">
                              {doc.category}
                            </span>
                            <span className="flex-1 text-xs text-navy font-medium truncate">{doc.title}</span>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-500 hover:text-gold transition truncate max-w-[180px]"
                            >
                              {doc.fileUrl.replace(/^https?:\/\//, "")}
                            </a>
                            <form action={deleteDocument}>
                              <input type="hidden" name="id" value={doc.id} />
                              <button type="submit" className="text-[10px] font-semibold text-red-400 hover:text-red-600 transition flex-shrink-0">
                                Delete
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {event.documents.length === 0 && (
                  <p className="text-gray-400 text-xs py-2">No documents yet.</p>
                )}
              </div>

              {/* Add document form */}
              <div className="px-6 pb-6 border-t border-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-4 mb-3">Add Document</p>
                <form action={addDocument} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <input type="hidden" name="eventId" value={event.id} />
                  <select
                    name="locale"
                    required
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
                  >
                    <option value="en">EN – English</option>
                    <option value="ru">RU – Русский</option>
                    <option value="tr">TR – Türkçe</option>
                  </select>
                  <select
                    name="category"
                    required
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Document title"
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold placeholder:text-gray-300"
                  />
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="fileUrl"
                      required
                      placeholder="https://…"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold placeholder:text-gray-300"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition flex-shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
