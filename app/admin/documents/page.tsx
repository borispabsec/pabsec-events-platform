import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { AddDocumentForm } from "@/components/admin/add-document-form";
import { BulkUploadPanel } from "@/components/admin/bulk-upload-panel";
import path from "path";
import fs from "fs/promises";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}


async function deleteDocument(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id") as string;
  const eventId = formData.get("eventId") as string;
  const fileUrl = formData.get("fileUrl") as string;
  if (!id) return;
  // Delete physical file if uploaded
  if (fileUrl?.startsWith("/uploads/documents/")) {
    try {
      const filename = path.basename(fileUrl);
      await fs.unlink(path.join(process.cwd(), "public", "uploads", "documents", filename));
    } catch { /* file missing — ignore */ }
  }
  await db.eventDocument.delete({ where: { id } });
  revalidatePath("/admin/documents");
  redirect("/admin/documents" + (eventId ? `?event=${eventId}` : ""));
}

const LOCALES = ["en", "ru", "tr"] as const;

const DOCUMENT_CATEGORIES = [
  { id: "programme",          label: "Programme",                    color: "bg-blue-50 text-blue-700" },
  { id: "practical",          label: "Practical Information",        color: "bg-teal-50 text-teal-700" },
  { id: "general_assembly",   label: "General Assembly Documents",   color: "bg-green-50 text-green-700" },
  { id: "bureau",             label: "Bureau Documents",             color: "bg-amber-50 text-amber-700" },
  { id: "standing_committee", label: "Standing Committee Documents", color: "bg-purple-50 text-purple-700" },
] as const;

const LOCALE_LABELS: Record<string, string> = { en: "English", ru: "Русский", tr: "Türkçe" };

function formatFileLabel(url: string) {
  if (url.startsWith("/uploads/")) return url.split("/").pop() ?? url;
  return url.replace(/^https?:\/\//, "").slice(0, 50);
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  await requireAdmin();
  const { event: filterEventId } = await searchParams;

  const events = await db.event.findMany({
    orderBy: { startDate: "asc" },
    include: {
      translations: { where: { locale: "en" } },
      documents: {
        orderBy: [{ category: "asc" }, { locale: "asc" }, { sortOrder: "asc" }],
      },
    },
  });

  const selectedEvent = filterEventId
    ? events.find((e) => e.id === filterEventId)
    : events[0];

  const displayEvents = filterEventId ? events.filter((e) => e.id === filterEventId) : events;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Management</span>
        </div>
        <h1 className="text-navy text-2xl font-bold">Documents</h1>
        <p className="text-gray-400 text-sm mt-1">Upload and manage documents per event, category and language.</p>
      </div>

      {/* Bulk upload panel */}
      <BulkUploadPanel
        events={events.map((e) => ({ id: e.id, title: e.translations[0]?.title ?? e.slug }))}
        defaultEventId={selectedEvent?.id}
      />

      {/* Event filter */}
      <div className="flex flex-wrap gap-2 mb-8">
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

      <div className="space-y-10">
        {displayEvents.map((event) => {
          const eventTitle = event.translations[0]?.title ?? event.slug;
          return (
            <div key={event.id}>
              {/* Event header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-gold" />
                <div>
                  <h2 className="text-navy font-bold text-base">{eventTitle}</h2>
                  <p className="text-gray-400 text-xs">{event.location} · {event.startDate.toLocaleDateString("en-GB")}</p>
                </div>
              </div>

              {/* Category sections */}
              <div className="space-y-6">
                {DOCUMENT_CATEGORIES.map((cat) => {
                  const catDocs = event.documents.filter((d) => d.category === cat.id);
                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                    >
                      {/* Category header */}
                      <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className="text-xs text-gray-400">{catDocs.length} document{catDocs.length !== 1 ? "s" : ""}</span>
                      </div>

                      {/* Documents grouped by locale */}
                      <div className="px-6 py-4 space-y-4">
                        {LOCALES.map((loc) => {
                          const localeDocs = catDocs.filter((d) => d.locale === loc);
                          return (
                            <div key={loc}>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-navy/40 mb-2">
                                {loc.toUpperCase()} — {LOCALE_LABELS[loc]}
                              </p>
                              {localeDocs.length > 0 ? (
                                <div className="space-y-1.5 mb-2">
                                  {localeDocs.map((doc) => (
                                    <div
                                      key={doc.id}
                                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/60"
                                    >
                                      <svg className="w-3.5 h-3.5 text-navy/30 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                      </svg>
                                      <span className="flex-1 text-xs text-navy font-medium truncate">{doc.title}</span>
                                      <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-blue-500 hover:text-gold transition truncate max-w-[180px] flex-shrink-0"
                                      >
                                        {formatFileLabel(doc.fileUrl)}
                                      </a>
                                      <form action={deleteDocument} className="flex-shrink-0">
                                        <input type="hidden" name="id" value={doc.id} />
                                        <input type="hidden" name="eventId" value={event.id} />
                                        <input type="hidden" name="fileUrl" value={doc.fileUrl} />
                                        <button
                                          type="submit"
                                          className="text-[10px] font-semibold text-red-400 hover:text-red-600 transition"
                                        >
                                          Delete
                                        </button>
                                      </form>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-gray-300 italic mb-2">No {loc.toUpperCase()} documents yet.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add document form pre-set to this category */}
                      <div className="px-6 pb-5">
                        <AddDocumentForm
                          defaultEventId={event.id}
                          events={events.map((e) => ({ id: e.id, title: e.translations[0]?.title ?? e.slug }))}
                          defaultCategory={cat.id}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
