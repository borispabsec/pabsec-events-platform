"use client";

import { useState, useCallback } from "react";

const COUNTRIES = [
  "Albania", "Armenia", "Azerbaijan", "Bulgaria", "Georgia",
  "Greece", "Moldova", "North Macedonia", "Romania", "Russia",
  "Serbia", "Türkiye", "Ukraine", "International Secretariat",
] as const;

const TITLES = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "H.E.", "Hon."] as const;

const PARTICIPANT_ROLES = [
  "Member of Parliament (MP)",
  "Head of National Delegation",
  "Secretary of National Delegation",
  "Observer",
  "Guest / Invited Expert",
  "PABSEC Secretariat Staff",
  "Security / Protocol",
  "Accompanying Person",
] as const;

const DIETARY_OPTIONS = [
  { value: "none", label: "No restrictions" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "other", label: "Other (specify below)" },
] as const;

const ROOM_TYPES = [
  { value: "single", label: "Single Room" },
  { value: "double", label: "Double Room" },
  { value: "suite", label: "Suite" },
] as const;

const STEP_LABELS = [
  "Personal",
  "Participation",
  "Travel",
  "Accommodation",
  "Additional",
  "Review",
];

interface Prefill {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  role: string;
}

interface Props {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  locale: string;
  prefill: Prefill | null;
  requirePassport: boolean;
  requirePhoto: boolean;
  sessionRole: string | null;
}

interface GroupPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  position: string;
  participantRole: string;
  isHeadOfDelegation: boolean;
}

const defaultForm = (prefill: Prefill | null) => ({
  // Step 1
  firstName: prefill?.firstName ?? "",
  lastName: prefill?.lastName ?? "",
  title: "",
  position: "",
  institution: "",
  country: prefill?.country ?? "",
  email: prefill?.email ?? "",
  phone: "",
  passportNationality: "",
  // Step 2
  participantRole: "",
  isHeadOfDelegation: false,
  participationDateFrom: "",
  participationDateTo: "",
  committeeMeetings: [] as string[],
  // Step 3 - Arrival
  arrivalDate: "",
  arrivalAirport: "",
  arrivalFlight: "",
  arrivalRoute: "",
  arrivalTime: "",
  needsTransfer: false,
  viaIstanbul: false,
  istanbulVipLounge: false,
  // Step 3 - Departure
  departureDate: "",
  departureAirport: "",
  departureFlight: "",
  departureRoute: "",
  departureTime: "",
  // Step 4
  needsHotel: false,
  hotelCheckIn: "",
  hotelCheckOut: "",
  roomType: "single",
  sharingRoom: false,
  hotelName: "",
  // Step 5
  dietaryRestrictions: "none",
  accessibilityNeeds: "",
  securityNote: "",
  specialRequests: "",
});

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition bg-white";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1";
const sectionClass = "bg-white rounded-2xl border border-gray-100 p-6 space-y-4";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
        checked
          ? "bg-navy text-white border-navy"
          : "bg-white text-gray-500 border-gray-200 hover:border-navy/30"
      }`}
    >
      <span
        className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${checked ? "bg-gold" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string | boolean | null }) {
  if (value === undefined || value === null || value === "" || value === false) return null;
  return (
    <div className="flex gap-3 py-1.5 border-b border-gray-50">
      <span className="text-xs text-gray-400 w-40 flex-shrink-0">{label}</span>
      <span className="text-xs text-navy font-medium">{value === true ? "Yes" : String(value)}</span>
    </div>
  );
}

export function EventRegistrationForm({
  eventId,
  eventTitle,
  eventSlug,
  locale,
  prefill,
  requirePassport,
  requirePhoto,
  sessionRole,
}: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm(prefill));
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  // Group registration mode
  const isSecretary =
    sessionRole === "Secretary of National Delegation" ||
    sessionRole === "Member of International Secretariat";
  const [groupMode, setGroupMode] = useState(false);
  const [groupPersons, setGroupPersons] = useState<GroupPerson[]>([]);

  const set = useCallback((key: string, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const showIstanbul =
    form.arrivalRoute.toLowerCase().includes("istanbul") ||
    form.arrivalRoute.toUpperCase().includes("IST");

  // ── Group helpers ────────────────────────────────────────────────────────────
  function addGroupPerson() {
    setGroupPersons((p) => [
      ...p,
      {
        id: Math.random().toString(36).slice(2),
        firstName: "",
        lastName: "",
        email: "",
        title: "",
        position: "",
        participantRole: "Member of Parliament (MP)",
        isHeadOfDelegation: false,
      },
    ]);
  }

  function updateGroupPerson(id: string, key: keyof GroupPerson, value: unknown) {
    setGroupPersons((ps) => ps.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  }

  function removeGroupPerson(id: string) {
    setGroupPersons((ps) => ps.filter((p) => p.id !== id));
  }

  // ── Navigation ───────────────────────────────────────────────────────────────
  function next() {
    setStep((s) => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const persons = groupMode && groupPersons.length > 0 ? groupPersons : null;
      const delegationGroupId = persons ? `dg-${Date.now()}` : undefined;

      const toSubmit = persons
        ? persons.map((p) => ({ ...form, ...p, delegationGroupId }))
        : [{ ...form }];

      let lastRef = "";
      for (const person of toSubmit) {
        const fd = new FormData();
        Object.entries(person).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            fd.append(k, v.join(","));
          } else {
            fd.append(k, String(v ?? ""));
          }
        });
        fd.append("eventId", eventId);
        if (passportFile) fd.append("passport", passportFile);
        if (photoFile) fd.append("photo", photoFile);

        const res = await fetch("/api/event-registrations", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Registration failed");
        lastRef = data.referenceNumber;
      }
      setReferenceNumber(lastRef);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────────
  if (referenceNumber) {
    return (
      <div className="rounded-2xl border border-gray-100 p-12 text-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex items-center gap-2 justify-center mb-3">
          <div className="h-px w-6 bg-gold" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Registration Submitted</span>
          <div className="h-px w-6 bg-gold" />
        </div>
        <h2 className="text-navy text-2xl font-bold mb-3">Thank You!</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-6">
          Your registration for <strong>{eventTitle}</strong> has been received and is pending review.
          A confirmation has been sent to <strong>{form.email}</strong>.
        </p>
        <div className="inline-block bg-navy/5 rounded-xl px-6 py-4 mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Reference Number</p>
          <p className="text-2xl font-bold text-navy tracking-widest">{referenceNumber}</p>
        </div>
        <div>
          <a
            href={`/${locale}/events/${eventSlug}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition"
          >
            Back to Event
          </a>
        </div>
      </div>
    );
  }

  // ── Step progress ────────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    done
                      ? "bg-gold text-white"
                      : active
                      ? "bg-navy text-white ring-4 ring-navy/20"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : n}
                </div>
                <span className={`text-[10px] font-semibold hidden sm:block ${active ? "text-navy" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 ${done ? "bg-gold" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Nav buttons ──────────────────────────────────────────────────────────────
  const NavButtons = ({ onNext, nextLabel = "Next Step →" }: { onNext?: () => void; nextLabel?: string }) => (
    <div className="flex items-center justify-between pt-4">
      {step > 1 ? (
        <button
          type="button"
          onClick={back}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
        >
          ← Back
        </button>
      ) : <div />}
      {step < 6 && (
        <button
          type="button"
          onClick={onNext ?? next}
          className="px-6 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition"
        >
          {nextLabel}
        </button>
      )}
      {step === 6 && (
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="px-8 py-2.5 rounded-xl bg-gold text-white text-sm font-bold hover:bg-gold/90 transition disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Registration"}
        </button>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 1 — Personal Information
  // ════════════════════════════════════════════════════════════════════════════
  const Step1 = () => (
    <div className="space-y-5">
      <div className={sectionClass}>
        <h3 className="text-navy font-bold text-sm mb-2">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
            <input type="text" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputClass} placeholder="English only" />
          </div>
          <div>
            <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
            <input type="text" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputClass} placeholder="English only" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title / Salutation</label>
            <select value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass}>
              <option value="">Select…</option>
              {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Passport Nationality</label>
            <input type="text" value={form.passportNationality} onChange={(e) => set("passportNationality", e.target.value)} className={inputClass} placeholder="e.g. Georgian" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Position / Title in Parliament</label>
          <input type="text" value={form.position} onChange={(e) => set("position", e.target.value)} className={inputClass} placeholder="e.g. Member of Parliament, Chairman of Committee…" />
        </div>
        <div>
          <label className={labelClass}>Institution / Parliament Name</label>
          <input type="text" value={form.institution} onChange={(e) => set("institution", e.target.value)} className={inputClass} placeholder="e.g. Parliament of Georgia" />
        </div>
        <p className="text-[11px] text-gray-400">Names must be in English (Latin script).</p>
      </div>

      <div className={sectionClass}>
        <h3 className="text-navy font-bold text-sm mb-2">Contact Details</h3>
        <div>
          <label className={labelClass}>Country <span className="text-red-500">*</span></label>
          <select required value={form.country} onChange={(e) => set("country", e.target.value)} className={inputClass}>
            <option value="">Select country…</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email <span className="text-red-500">*</span></label>
            <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mobile Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} placeholder="+995 XXX XXX XXX" />
          </div>
        </div>
      </div>

      <NavButtons
        onNext={() => {
          if (!form.firstName || !form.lastName || !form.email || !form.country) {
            setError("Please fill in all required fields.");
            return;
          }
          setError("");
          next();
        }}
      />
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 2 — Participation
  // ════════════════════════════════════════════════════════════════════════════
  const Step2 = () => (
    <div className="space-y-5">
      <div className={sectionClass}>
        <h3 className="text-navy font-bold text-sm mb-2">Participation Details</h3>

        {isSecretary && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gold/5 border border-gold/20 mb-2">
            <Toggle
              checked={groupMode}
              onChange={setGroupMode}
              label="Register delegation group"
            />
            <p className="text-xs text-gray-500">Register multiple delegates with shared travel info</p>
          </div>
        )}

        <div>
          <label className={labelClass}>Participant Role <span className="text-red-500">*</span></label>
          <select required value={form.participantRole} onChange={(e) => set("participantRole", e.target.value)} className={inputClass}>
            <option value="">Select role…</option>
            {PARTICIPANT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Head of Delegation?</label>
          <div className="flex gap-3 mt-1">
            <Toggle
              checked={form.isHeadOfDelegation}
              onChange={(v) => set("isHeadOfDelegation", v)}
              label={form.isHeadOfDelegation ? "Yes" : "No"}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Participation From</label>
            <input type="date" value={form.participationDateFrom} onChange={(e) => set("participationDateFrom", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Participation To</label>
            <input type="date" value={form.participationDateTo} onChange={(e) => set("participationDateTo", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Committee Meetings Attending</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
            {["Economic Committee", "Legal & Political Committee", "Social & Cultural Committee"].map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-gray-200 hover:border-navy/30 transition text-xs">
                <input
                  type="checkbox"
                  checked={form.committeeMeetings.includes(c)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...form.committeeMeetings, c]
                      : form.committeeMeetings.filter((m) => m !== c);
                    set("committeeMeetings", updated);
                  }}
                  className="accent-gold"
                />
                <span className="text-navy">{c}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Group person list */}
      {groupMode && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-navy font-bold text-sm">Delegation Members</h3>
            <button
              type="button"
              onClick={addGroupPerson}
              className="px-3 py-1.5 rounded-xl bg-navy/10 text-navy text-xs font-semibold hover:bg-navy/20 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Person
            </button>
          </div>
          {groupPersons.length === 0 && (
            <p className="text-gray-400 text-xs">No delegates added yet. Click "Add Person" to begin.</p>
          )}
          {groupPersons.map((p, idx) => (
            <div key={p.id} className="border border-gray-100 rounded-xl p-4 space-y-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy">Person {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeGroupPerson(p.id)}
                  className="text-red-400 hover:text-red-600 text-xs font-semibold transition"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={p.firstName}
                  onChange={(e) => updateGroupPerson(p.id, "firstName", e.target.value)}
                  placeholder="First Name"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={p.lastName}
                  onChange={(e) => updateGroupPerson(p.id, "lastName", e.target.value)}
                  placeholder="Last Name"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  value={p.email}
                  onChange={(e) => updateGroupPerson(p.id, "email", e.target.value)}
                  placeholder="Email"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={p.position}
                  onChange={(e) => updateGroupPerson(p.id, "position", e.target.value)}
                  placeholder="Position"
                  className={inputClass}
                />
              </div>
              <select
                value={p.participantRole}
                onChange={(e) => updateGroupPerson(p.id, "participantRole", e.target.value)}
                className={inputClass}
              >
                {PARTICIPANT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      <NavButtons
        onNext={() => {
          if (!form.participantRole) {
            setError("Please select a participant role.");
            return;
          }
          setError("");
          next();
        }}
      />
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 3 — Travel
  // ════════════════════════════════════════════════════════════════════════════
  const Step3 = () => (
    <div className="space-y-5">
      <div className={sectionClass}>
        <h3 className="text-navy font-bold text-sm mb-1">Arrival</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Arrival Date</label>
            <input type="date" value={form.arrivalDate} onChange={(e) => set("arrivalDate", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Arrival Time</label>
            <input type="time" value={form.arrivalTime} onChange={(e) => set("arrivalTime", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Arrival Airport</label>
            <input type="text" value={form.arrivalAirport} onChange={(e) => set("arrivalAirport", e.target.value)} className={inputClass} placeholder="e.g. TBS, GYD, IST…" />
          </div>
          <div>
            <label className={labelClass}>Flight Number</label>
            <input type="text" value={form.arrivalFlight} onChange={(e) => set("arrivalFlight", e.target.value)} className={inputClass} placeholder="e.g. TK 392" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Full Route</label>
          <input
            type="text"
            value={form.arrivalRoute}
            onChange={(e) => set("arrivalRoute", e.target.value)}
            className={inputClass}
            placeholder="e.g. Kyiv – Istanbul – Tbilisi"
          />
          <p className="text-[11px] text-gray-400 mt-1">Enter the full itinerary including connections.</p>
        </div>

        {/* Istanbul smart logic */}
        {showIstanbul && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-3">
            <p className="text-xs font-semibold text-blue-800">Istanbul connection detected</p>
            <Toggle
              checked={form.viaIstanbul}
              onChange={(v) => set("viaIstanbul", v)}
              label="Travelling via Istanbul Airport?"
            />
            {form.viaIstanbul && (
              <Toggle
                checked={form.istanbulVipLounge}
                onChange={(v) => set("istanbulVipLounge", v)}
                label="Need VIP Lounge support at Istanbul Airport?"
              />
            )}
          </div>
        )}

        <div>
          <label className={labelClass}>Airport Transfer Needed?</label>
          <div className="mt-1">
            <Toggle
              checked={form.needsTransfer}
              onChange={(v) => set("needsTransfer", v)}
              label={form.needsTransfer ? "Yes — arrange transfer" : "No transfer needed"}
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-navy font-bold text-sm mb-1">Departure</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Departure Date</label>
            <input type="date" value={form.departureDate} onChange={(e) => set("departureDate", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Departure Time</label>
            <input type="time" value={form.departureTime} onChange={(e) => set("departureTime", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Departure Airport</label>
            <input type="text" value={form.departureAirport} onChange={(e) => set("departureAirport", e.target.value)} className={inputClass} placeholder="e.g. TBS" />
          </div>
          <div>
            <label className={labelClass}>Return Flight Number</label>
            <input type="text" value={form.departureFlight} onChange={(e) => set("departureFlight", e.target.value)} className={inputClass} placeholder="e.g. TK 393" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Full Return Route</label>
          <input type="text" value={form.departureRoute} onChange={(e) => set("departureRoute", e.target.value)} className={inputClass} placeholder="e.g. Tbilisi – Istanbul – Kyiv" />
        </div>
      </div>
      <NavButtons />
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 4 — Accommodation
  // ════════════════════════════════════════════════════════════════════════════
  const Step4 = () => (
    <div className="space-y-5">
      <div className={sectionClass}>
        <h3 className="text-navy font-bold text-sm mb-2">Hotel & Accommodation</h3>
        <div>
          <label className={labelClass}>Hotel Required?</label>
          <div className="mt-1">
            <Toggle
              checked={form.needsHotel}
              onChange={(v) => set("needsHotel", v)}
              label={form.needsHotel ? "Yes — please arrange hotel" : "No hotel needed"}
            />
          </div>
        </div>

        {form.needsHotel && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Check-in Date</label>
                <input type="date" value={form.hotelCheckIn} onChange={(e) => set("hotelCheckIn", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Check-out Date</label>
                <input type="date" value={form.hotelCheckOut} onChange={(e) => set("hotelCheckOut", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Room Type</label>
              <div className="flex gap-3 mt-1">
                {ROOM_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("roomType", value)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition ${
                      form.roomType === value
                        ? "bg-navy text-white border-navy"
                        : "bg-white text-gray-500 border-gray-200 hover:border-navy/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Sharing Room with Colleague?</label>
              <div className="mt-1 space-y-2">
                <Toggle
                  checked={form.sharingRoom}
                  onChange={(v) => set("sharingRoom", v)}
                  label={form.sharingRoom ? "Yes — sharing room" : "No — single occupancy"}
                />
                {form.sharingRoom && (
                  <input
                    type="text"
                    value={form.hotelName}
                    onChange={(e) => set("hotelName", e.target.value)}
                    className={inputClass}
                    placeholder="Colleague's full name"
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <NavButtons />
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 5 — Additional Information
  // ════════════════════════════════════════════════════════════════════════════
  const Step5 = () => (
    <div className="space-y-5">
      <div className={sectionClass}>
        <h3 className="text-navy font-bold text-sm mb-2">Dietary & Accessibility</h3>
        <div>
          <label className={labelClass}>Dietary Restrictions</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            {DIETARY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => set("dietaryRestrictions", value)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-left ${
                  form.dietaryRestrictions === value
                    ? "bg-navy text-white border-navy"
                    : "bg-white text-gray-500 border-gray-200 hover:border-navy/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Accessibility Needs</label>
          <textarea
            value={form.accessibilityNeeds}
            onChange={(e) => set("accessibilityNeeds", e.target.value)}
            className={inputClass}
            rows={2}
            placeholder="Wheelchair access, mobility assistance, hearing loop, etc."
          />
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-navy font-bold text-sm mb-2">Protocol & Security</h3>
        <div>
          <label className={labelClass}>Security Note</label>
          <textarea
            value={form.securityNote}
            onChange={(e) => set("securityNote", e.target.value)}
            className={inputClass}
            rows={2}
            placeholder="Security escort, VIP protocol, official status…"
          />
        </div>
        <div>
          <label className={labelClass}>Special Requests</label>
          <textarea
            value={form.specialRequests}
            onChange={(e) => set("specialRequests", e.target.value)}
            className={inputClass}
            rows={2}
            placeholder="Any other requests or notes for the Secretariat…"
          />
        </div>
      </div>

      {(requirePassport || requirePhoto) && (
        <div className={sectionClass}>
          <h3 className="text-navy font-bold text-sm mb-2">Document Uploads</h3>
          {requirePassport && (
            <div>
              <label className={labelClass}>
                Passport Copy <span className="text-red-500">*</span>
                <span className="ml-1 font-normal text-gray-400 normal-case">PDF, JPG, PNG · Max 10 MB</span>
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setPassportFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy/5 file:text-navy hover:file:bg-navy/10 transition"
              />
            </div>
          )}
          {requirePhoto && (
            <div>
              <label className={labelClass}>
                Photo <span className="text-red-500">*</span>
                <span className="ml-1 font-normal text-gray-400 normal-case">JPG, PNG, WebP · Max 5 MB</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy/5 file:text-navy hover:file:bg-navy/10 transition"
              />
            </div>
          )}
        </div>
      )}
      <NavButtons />
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 6 — Review & Submit
  // ════════════════════════════════════════════════════════════════════════════
  const Step6 = () => {
    const Section = ({ title, stepNum, children }: { title: string; stepNum: number; children: React.ReactNode }) => (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
          <span className="text-xs font-bold text-navy uppercase tracking-wider">{title}</span>
          <button
            type="button"
            onClick={() => { setStep(stepNum); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="text-[11px] font-semibold text-gold hover:text-gold/80 transition"
          >
            Edit →
          </button>
        </div>
        <div className="px-5 py-3">{children}</div>
      </div>
    );

    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gold/5 border border-gold/20 px-5 py-3">
          <p className="text-xs font-semibold text-navy">Please review your registration details before submitting.</p>
        </div>

        <Section title="Personal Information" stepNum={1}>
          <SummaryRow label="Name" value={`${form.title ? form.title + " " : ""}${form.firstName} ${form.lastName}`} />
          <SummaryRow label="Country" value={form.country} />
          <SummaryRow label="Email" value={form.email} />
          <SummaryRow label="Phone" value={form.phone} />
          <SummaryRow label="Position" value={form.position} />
          <SummaryRow label="Institution" value={form.institution} />
          <SummaryRow label="Passport Nationality" value={form.passportNationality} />
        </Section>

        <Section title="Participation" stepNum={2}>
          <SummaryRow label="Role" value={form.participantRole} />
          <SummaryRow label="Head of Delegation" value={form.isHeadOfDelegation} />
          <SummaryRow label="Dates" value={form.participationDateFrom && form.participationDateTo ? `${form.participationDateFrom} → ${form.participationDateTo}` : form.participationDateFrom || form.participationDateTo} />
          <SummaryRow label="Committees" value={form.committeeMeetings.join(", ")} />
          {groupMode && groupPersons.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Group ({groupPersons.length} persons):</p>
              {groupPersons.map((p, i) => (
                <p key={p.id} className="text-xs text-navy">{i + 1}. {p.firstName} {p.lastName} — {p.participantRole}</p>
              ))}
            </div>
          )}
        </Section>

        <Section title="Travel" stepNum={3}>
          {form.arrivalDate && <SummaryRow label="Arrival" value={`${form.arrivalDate} ${form.arrivalTime}`} />}
          <SummaryRow label="From" value={form.arrivalRoute} />
          <SummaryRow label="Arr. Airport" value={form.arrivalAirport} />
          <SummaryRow label="Arr. Flight" value={form.arrivalFlight} />
          <SummaryRow label="Transfer" value={form.needsTransfer} />
          <SummaryRow label="Via Istanbul" value={form.viaIstanbul} />
          {form.viaIstanbul && <SummaryRow label="IST VIP Lounge" value={form.istanbulVipLounge} />}
          {form.departureDate && <SummaryRow label="Departure" value={`${form.departureDate} ${form.departureTime}`} />}
          <SummaryRow label="Return Route" value={form.departureRoute} />
          <SummaryRow label="Dep. Flight" value={form.departureFlight} />
        </Section>

        <Section title="Accommodation" stepNum={4}>
          <SummaryRow label="Hotel Needed" value={form.needsHotel} />
          {form.needsHotel && (
            <>
              <SummaryRow label="Check-in" value={form.hotelCheckIn} />
              <SummaryRow label="Check-out" value={form.hotelCheckOut} />
              <SummaryRow label="Room Type" value={form.roomType} />
              <SummaryRow label="Sharing" value={form.sharingRoom ? (form.hotelName ? `Yes — with ${form.hotelName}` : "Yes") : false} />
            </>
          )}
        </Section>

        <Section title="Additional" stepNum={5}>
          <SummaryRow label="Dietary" value={form.dietaryRestrictions !== "none" ? form.dietaryRestrictions : null} />
          <SummaryRow label="Accessibility" value={form.accessibilityNeeds} />
          <SummaryRow label="Security Note" value={form.securityNote} />
          <SummaryRow label="Special Requests" value={form.specialRequests} />
          {requirePassport && <SummaryRow label="Passport" value={passportFile ? passportFile.name : "Not uploaded"} />}
          {requirePhoto && <SummaryRow label="Photo" value={photoFile ? photoFile.name : "Not uploaded"} />}
        </Section>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <NavButtons />
      </div>
    );
  };

  return (
    <div>
      <StepIndicator />
      {error && step < 6 && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
      {step === 5 && <Step5 />}
      {step === 6 && <Step6 />}
    </div>
  );
}
