import { redirect } from "next/navigation";
import { db } from "@/lib/db";

async function updateHeroTextColor(formData: FormData) {
  "use server";
  const eventId = formData.get("eventId") as string;
  const heroTextColor = formData.get("heroTextColor") as string;
  if (!eventId || !["auto", "white", "dark"].includes(heroTextColor)) return;
  await db.event.update({ where: { id: eventId }, data: { heroTextColor } });
  redirect("/admin");
}

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

  const events = await db.event.findMany({
    orderBy: { startDate: "desc" },
    include: { translations: { where: { locale: "en" } } },
  });

  const colorOptions = [
    { value: "auto",  label: "Auto-detect (Canvas)", desc: "Samples the bottom of the photo to decide" },
    { value: "white", label: "Always White text",    desc: "Force white — use on dark photos" },
    { value: "dark",  label: "Always Dark text",     desc: "Force navy — use on light photos" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Admin</span>
        </div>
        <h1 className="text-navy text-3xl font-bold mb-2">Event Settings</h1>
        <p className="text-gray-500 text-sm mb-10">Hero text colour override per event. Changes take effect immediately.</p>

        <div className="space-y-5">
          {events.map((event) => {
            const title = event.translations[0]?.title ?? event.slug;
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl p-7 border border-gray-100"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
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
                <p className="text-gray-400 text-xs mb-5">
                  {event.location} · {event.startDate.toLocaleDateString("en-GB")}
                </p>

                <form action={updateHeroTextColor} className="space-y-3">
                  <input type="hidden" name="eventId" value={event.id} />
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                    Hero Text Colour
                  </p>
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
                    Save
                  </button>
                </form>
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
