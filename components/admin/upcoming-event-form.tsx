"use client";

import { useState, useRef } from "react";

interface UpcomingEventData {
  id: string;
  category: string;
  session: string | null;
  status: string;
  dateFlexible: boolean;
  dateFlexibleText: string | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  sortOrder: number;
  translations: Array<{ locale: string; title: string }>;
}

interface Props {
  mode: "create" | "edit";
  event?: UpcomingEventData;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
}

const CATEGORIES = [
  { value: "committee_economic", label: "Economic Committee" },
  { value: "committee_legal",    label: "Legal & Political Committee" },
  { value: "committee_social",   label: "Social & Cultural Committee" },
];

const STATUSES = [
  { value: "SAVE_THE_DATE", label: "Save the Date" },
  { value: "CONFIRMED",     label: "Confirmed" },
  { value: "CANCELLED",     label: "Cancelled" },
];

const LOCALES = [
  { key: "en", label: "EN – English" },
  { key: "ru", label: "RU – Русский" },
  { key: "tr", label: "TR – Türkçe" },
] as const;

function toDateInput(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export function UpcomingEventForm({ mode, event, createAction, updateAction }: Props) {
  const isEdit = mode === "edit";
  const getTranslation = (locale: string) => event?.translations.find((t) => t.locale === locale);

  const [dateFlexible, setDateFlexible] = useState(event?.dateFlexible ?? true);
  const [locationTba, setLocationTba] = useState(event?.location === "TBA" || !event);
  const [activeTab, setActiveTab] = useState<"en" | "ru" | "tr">("en");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    const fd = new FormData(e.currentTarget);
    fd.set("dateFlexible", dateFlexible ? "on" : "");
    if (locationTba) fd.set("location", "TBA");
    try {
      if (isEdit) {
        await updateAction(fd);
      } else {
        await createAction(fd);
      }
    } catch (err: unknown) {
      const digest = (err as Record<string, unknown>)?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw err;
      setSubmitError("Save failed — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 mt-5">
      {isEdit && <input type="hidden" name="upcomingEventId" value={event!.id} />}

      {/* Basic fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5">Committee</label>
          <select
            name="category"
            defaultValue={event?.category ?? "committee_economic"}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5">Session #</label>
          <input
            type="text"
            name="session"
            defaultValue={event?.session ?? ""}
            placeholder="e.g. 67"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5">Status</label>
          <select
            name="status"
            defaultValue={event?.status ?? "SAVE_THE_DATE"}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-1.5">Sort Order</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={event?.sortOrder ?? 0}
            min={0}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Dates */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={dateFlexible}
            onChange={(e) => setDateFlexible(e.target.checked)}
            className="w-3.5 h-3.5 accent-gold"
          />
          <span className="text-xs font-semibold text-navy">Flexible date</span>
        </label>
        {dateFlexible && (
          <div className="mb-3">
            <input
              type="text"
              name="dateFlexibleText"
              defaultValue={event?.dateFlexibleText ?? ""}
              placeholder="e.g. September / October 2026"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
            />
          </div>
        )}
        <div className={`grid grid-cols-2 gap-3${dateFlexible ? " opacity-60" : ""}`}>
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">{dateFlexible ? "Approx. Start" : "Start Date"}</label>
            <input type="date" name="startDate" defaultValue={toDateInput(event?.startDate ?? null)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">{dateFlexible ? "Approx. End" : "End Date"}</label>
            <input type="date" name="endDate" defaultValue={toDateInput(event?.endDate ?? null)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-navy">Location</label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={locationTba}
              onChange={(e) => setLocationTba(e.target.checked)}
              className="w-3.5 h-3.5 accent-gold"
            />
            <span className="text-[10px] font-semibold text-gray-400">TBA</span>
          </label>
        </div>
        {locationTba ? (
          <div className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-400 bg-gray-50">TBA</div>
        ) : (
          <input
            type="text"
            name="location"
            defaultValue={event?.location === "TBA" ? "" : (event?.location ?? "")}
            placeholder="e.g. Sofia, Bulgaria"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold"
          />
        )}
      </div>

      {/* Titles per locale */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Titles</p>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-3 w-fit">
          {LOCALES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === key ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {LOCALES.map(({ key }) => (
          <div key={key} className={activeTab === key ? "" : "hidden"}>
            <input
              type="text"
              name={`title_${key}`}
              required={key === "en"}
              defaultValue={getTranslation(key)?.title ?? ""}
              placeholder={`Committee name in ${key.toUpperCase()}`}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold placeholder:text-gray-300"
            />
          </div>
        ))}
      </div>

      {submitError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
          {submitError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Meeting"}
        </button>
        <a
          href="/admin/events?section=upcoming"
          className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
