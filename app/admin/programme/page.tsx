import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

async function updateAgenda(formData: FormData) {
  "use server";
  await requireAdmin();
  const eventId = formData.get("eventId") as string;
  const locale  = formData.get("locale")  as string;
  const agenda  = formData.get("agenda")  as string;
  if (!eventId || !["en", "ru", "tr"].includes(locale)) return;
  await db.eventTranslation.updateMany({
    where: { eventId, locale: locale as "en" | "ru" | "tr" },
    data: { agenda: agenda || null },
  });
  redirect("/admin/programme");
}

async function addProgrammeDoc(formData: FormData) {
  "use server";
  await requireAdmin();
  const eventId = formData.get("eventId") as string;
  const locale  = formData.get("locale")  as string;
  const title   = formData.get("title")   as string;
  const fileUrl = formData.get("fileUrl") as string;
  if (!eventId || !locale || !title || !fileUrl) return;
  if (!["en", "ru", "tr"].includes(locale)) return;
  await db.eventDocument.create({
    data: { eventId, locale: locale as "en" | "ru" | "tr", category: "programme", title, fileUrl },
  });
  redirect("/admin/programme");
}

async function deleteProgrammeDoc(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return;
  await db.eventDocument.delete({ where: { id } });
  redirect("/admin/programme");
}

const LOCALES = ["en", "ru", "tr"] as const;

export default async function ProgrammePage() {
  await requireAdmin();

  const events = await db.event.findMany({
    orderBy: { startDate: "desc" },
    include: {
      translations: true,
      documents: {
        where: { category: "programme" },
        orderBy: [{ locale: "asc" }, { sortOrder: "asc" }],
      },
    },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Management</span>
        </div>
        <h1 className="text-navy text-2xl font-bold">Programme</h1>
        <p className="text-gray-400 text-sm mt-1">Edit event agendas and upload programme documents.</p>
      </div>

      <div className="space-y-6">
        {events.map((event) => {
          const enTitle = event.translations.find((t) => t.locale === "en")?.title ?? event.slug;
          return (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-navy font-bold text-sm">{enTitle}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{event.location} · {event.startDate.toLocaleDateString("en-GB")}</p>
              </div>

              <div className="divide-y divide-gray-50">
                {LOCALES.map((loc) => {
                  const translation = event.translations.find((t) => t.locale === loc);
                  const docs = event.documents.filter((d) => d.locale === loc);
                  return (
                    <div key={loc} className="px-6 py-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-3">{loc.toUpperCase()}</p>

                      {/* Agenda text */}
                      <form action={updateAgenda} className="mb-4">
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="locale" value={loc} />
                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                          Agenda Text
                        </label>
                        <textarea
                          name="agenda"
                          rows={4}
                          defaultValue={translation?.agenda ?? ""}
                          placeholder="Paste agenda text here…"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold resize-y font-mono"
                        />
                        <button
                          type="submit"
                          className="mt-2 px-3 py-1.5 rounded-xl border border-navy/20 text-navy text-xs font-semibold hover:bg-navy/5 transition"
                        >
                          Save Agenda
                        </button>
                      </form>

                      {/* Programme documents */}
                      {docs.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {docs.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-100 bg-gray-50">
                              <span className="flex-1 text-xs text-navy font-medium truncate">{doc.title}</span>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-500 hover:text-gold transition"
                              >
                                View
                              </a>
                              <form action={deleteProgrammeDoc}>
                                <input type="hidden" name="id" value={doc.id} />
                                <button type="submit" className="text-[10px] font-semibold text-red-400 hover:text-red-600 transition">
                                  Delete
                                </button>
                              </form>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add programme doc */}
                      <form action={addProgrammeDoc} className="flex gap-2">
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="locale" value={loc} />
                        <input
                          type="text"
                          name="title"
                          required
                          placeholder="Document title"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold placeholder:text-gray-300"
                        />
                        <input
                          type="url"
                          name="fileUrl"
                          required
                          placeholder="https://…"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold placeholder:text-gray-300"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition flex-shrink-0"
                        >
                          Add PDF
                        </button>
                      </form>
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
