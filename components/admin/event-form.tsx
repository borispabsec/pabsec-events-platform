"use client";

import { useState, useRef } from "react";

interface EventData {
  id: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  location: string;
  status: string;
  heroTextColor: string;
  imageUrl: string | null;
  dateFlexible: boolean;
  dateFlexibleText: string | null;
  translations: Array<{
    locale: string;
    title: string;
    description: string;
    location: string | null;
  }>;
}

interface Props {
  mode: "create" | "edit";
  event?: EventData;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" },
];

const HERO_COLOR_OPTIONS = [
  { value: "auto", label: "Auto (Canvas)" },
  { value: "white", label: "White text" },
  { value: "dark", label: "Dark text" },
];

const LOCALES = [
  { key: "en", label: "EN – English" },
  { key: "ru", label: "RU – Русский" },
  { key: "tr", label: "TR – Türkçe" },
] as const;

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function EventForm({ mode, event, createAction, updateAction }: Props) {
  const isEdit = mode === "edit";

  const getTranslation = (locale: string) =>
    event?.translations.find((t) => t.locale === locale);

  const [imageUrl, setImageUrl] = useState(event?.imageUrl ?? "");
  const [imagePreview, setImagePreview] = useState(event?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [activeTab, setActiveTab] = useState<"en" | "ru" | "tr">("en");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [dateFlexible, setDateFlexible] = useState(event?.dateFlexible ?? false);
  const [locationTba, setLocationTba] = useState(event?.location === "TBA");
  const [requirePassport, setRequirePassport] = useState((event as EventData & { requirePassport?: boolean })?.requirePassport ?? false);
  const [requirePhoto, setRequirePhoto] = useState((event as EventData & { requirePhoto?: boolean })?.requirePhoto ?? false);
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
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }
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
    fd.set("imageUrl", imageUrl);
    fd.set("dateFlexible", dateFlexible ? "on" : "");
    fd.set("requirePassport", requirePassport ? "on" : "");
    fd.set("requirePhoto", requirePhoto ? "on" : "");
    if (locationTba) fd.set("location", "TBA");
    try {
      if (isEdit) {
        await updateAction(fd);
      } else {
        await createAction(fd);
      }
    } catch (err: unknown) {
      // Re-throw Next.js redirect errors so the router can handle navigation
      const digest = (err as Record<string, unknown>)?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw err;
      setSubmitError(
        "Save failed — hard-refresh this page (Ctrl+F5 or Cmd+Shift+R) and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {isEdit && <input type="hidden" name="eventId" value={event!.id} />}

      {/* Assembly & Dates */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Event Details</p>
        <div className="grid grid-cols-2 gap-4">
          {!isEdit && (
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-navy mb-1.5">Assembly Number</label>
              <input
                type="number"
                name="assemblyNumber"
                required={!isEdit}
                placeholder="e.g. 67"
                min="1"
                max="999"
                defaultValue={isEdit ? event!.slug.replace(/\D/g, "") : ""}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold"
              />
              <p className="text-[10px] text-gray-400 mt-1">Slug will be generated as <code>ga[number]</code></p>
            </div>
          )}
          {isEdit && (
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-navy mb-1.5">Slug</label>
              <input
                type="text"
                value={event!.slug}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 bg-gray-50"
              />
            </div>
          )}
          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                name="dateFlexible"
                checked={dateFlexible}
                onChange={(e) => setDateFlexible(e.target.checked)}
                className="w-4 h-4 accent-gold"
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
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold"
                />
                <p className="text-[10px] text-gray-400 mt-1">Shown to users. Set approximate dates below for sorting.</p>
              </div>
            )}
            <div className={`grid grid-cols-2 gap-3${dateFlexible ? " opacity-60" : ""}`}>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  {dateFlexible ? "Approx. Start (ordering)" : "Start Date"}
                </label>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={event ? toDateInputValue(new Date(event.startDate)) : ""}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  {dateFlexible ? "Approx. End (ordering)" : "End Date"}
                </label>
                <input
                  type="date"
                  name="endDate"
                  defaultValue={event ? toDateInputValue(new Date(event.endDate)) : ""}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-navy mb-1.5">Status</label>
            <select
              name="status"
              defaultValue={event?.status ?? "DRAFT"}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-navy mb-1.5">Hero Text Colour</label>
            <select
              name="heroTextColor"
              defaultValue={event?.heroTextColor ?? "auto"}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold"
            >
              {HERO_COLOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Location</p>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-navy">Base Location (City, Country)</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={locationTba}
                  onChange={(e) => setLocationTba(e.target.checked)}
                  className="w-3.5 h-3.5 accent-gold"
                />
                <span className="text-[10px] font-semibold text-gray-400">TBA (venue not yet determined)</span>
              </label>
            </div>
            {locationTba ? (
              <div className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 bg-gray-50 select-none">
                TBA
              </div>
            ) : (
              <input
                type="text"
                name="location"
                required
                defaultValue={event?.location === "TBA" ? "" : (event?.location ?? "")}
                placeholder="e.g. Tbilisi, Georgia"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold"
              />
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LOCALES.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-navy mb-1.5">{label}</label>
                <input
                  type="text"
                  name={`location_${key}`}
                  defaultValue={getTranslation(key)?.location ?? ""}
                  placeholder="Localised city/country"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold placeholder:text-gray-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Hero Image</p>
        <div className="space-y-3">
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden" style={{ height: 160 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Hero preview" className="w-full h-full object-cover" />
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-navy/30 hover:bg-gray-50 transition"
            onClick={() => imageRef.current?.click()}
          >
            <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-navy/40" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-navy">{uploading ? "Uploading…" : "Upload hero image"}</p>
              <p className="text-[10px] text-gray-400">JPG, PNG, WebP · Max 20 MB</p>
            </div>
          </div>
          <input
            ref={imageRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.avif"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImageUpload(f);
            }}
          />
          <div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
              placeholder="or paste image URL (e.g. /images/Stariy_Tbilisi.jpg)"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-navy focus:outline-none focus:border-gold placeholder:text-gray-300"
            />
          </div>
          {uploadError && (
            <p className="text-red-500 text-xs rounded-lg bg-red-50 px-3 py-2">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Translations */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Translations</p>

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4 w-fit">
          {LOCALES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-xs font-semibold transition ${
                activeTab === key ? "bg-navy text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {LOCALES.map(({ key }) => (
          <div key={key} className={activeTab === key ? "space-y-3" : "hidden"}>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">Title</label>
              <input
                type="text"
                name={`title_${key}`}
                required={activeTab === key}
                defaultValue={getTranslation(key)?.title ?? ""}
                placeholder={`Event title in ${key.toUpperCase()}`}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">Description</label>
              <textarea
                name={`description_${key}`}
                rows={4}
                defaultValue={getTranslation(key)?.description ?? ""}
                placeholder={`Event description in ${key.toUpperCase()}`}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold placeholder:text-gray-300 resize-y"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Registration Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Registration Settings</p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1.5">Registration Deadline</label>
            <input
              type="datetime-local"
              name="registrationDeadline"
              defaultValue={(event as EventData & { registrationDeadline?: Date })?.registrationDeadline
                ? new Date((event as EventData & { registrationDeadline?: Date }).registrationDeadline!).toISOString().slice(0, 16)
                : ""}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy focus:outline-none focus:border-gold max-w-xs"
            />
            <p className="text-[10px] text-gray-400 mt-1">Leave empty to allow registration indefinitely.</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="requirePassport"
                checked={requirePassport}
                onChange={(e) => setRequirePassport(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-xs font-semibold text-navy">Require passport upload</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="requirePhoto"
                checked={requirePhoto}
                onChange={(e) => setRequirePhoto(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-xs font-semibold text-navy">Require photo upload</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="space-y-3">
        {submitError && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
            {submitError}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-6 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Event"}
          </button>
          <a
            href="/admin/events"
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
          >
            Cancel
          </a>
        </div>
      </div>
    </form>
  );
}
