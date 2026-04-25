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
  imageUrl: string | null;
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
  { value: "committee_economic", label: "Committee on Economic and Development Policy" },
  { value: "committee_legal",    label: "Committee on Legal Affairs and International Cooperation" },
  { value: "committee_social",   label: "Committee on Social and Humanitarian Policy" },
];

const STATUSES = [
  { value: "SAVE_THE_DATE", label: "Save the Date" },
  { value: "CONFIRMED",     label: "Confirmed / Upcoming" },
  { value: "COMPLETED",     label: "Completed" },
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
  const [locationTba, setLocationTba] = useState(!event || event?.location === "TBA");
  const [activeTab, setActiveTab] = useState<"en" | "ru" | "tr">("en");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageUrl, setImageUrl] = useState(event?.imageUrl ?? "");
  const [imagePreview, setImagePreview] = useState(event?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const imageRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error ?? "Upload failed"); return; }
      setImageUrl(data.url);
      setImagePreview(data.url);
    } catch {
      setUploadError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    const fd = new FormData(e.currentTarget);
    fd.set("dateFlexible", dateFlexible ? "on" : "");
    fd.set("imageUrl", imageUrl);
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

      {/* Committee & session */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
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
          <span className="text-xs font-semibold text-navy">Flexible date (month range, exact dates TBD)</span>
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
            <p className="text-[10px] text-gray-400 mt-1">Shown to users. Add approximate dates below for ordering.</p>
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

      {/* Hero Image */}
      <div>
        <p className="text-xs font-semibold text-navy mb-2">Hero Image (optional)</p>
        {imagePreview && (
          <div className="relative rounded-xl overflow-hidden mb-2" style={{ height: 120 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { setImageUrl(""); setImagePreview(""); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-navy/30 hover:bg-gray-50 transition"
          onClick={() => imageRef.current?.click()}
        >
          <div className="w-7 h-7 rounded-lg bg-navy/5 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-navy/40" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-navy">{uploading ? "Uploading…" : "Upload image"}</p>
        </div>
        <input
          ref={imageRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
        />
        {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
      </div>

      {/* Titles per locale */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Committee Name / Titles</p>
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
          disabled={submitting || uploading}
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
