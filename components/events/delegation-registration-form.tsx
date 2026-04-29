"use client";

import { useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type StepId = 1 | 2 | 3 | 4 | 5 | 6;
type MemberTab = "travel" | "accommodation" | "vip" | "notes";

interface DelegationMember {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  position: string;
  institution: string;
  email: string;
  phone: string;
  passportNationality: string;
  participantRole: string;
  isHeadOfDelegation: boolean;
  arrivalDate: string;
  arrivalAirport: string;
  arrivalFlight: string;
  arrivalRoute: string;
  arrivalTime: string;
  needsTransfer: boolean;
  viaIstanbul: boolean;
  istanbulVipLounge: boolean;
  departureDate: string;
  departureAirport: string;
  departureFlight: string;
  departureRoute: string;
  departureTime: string;
  needsHotel: boolean;
  roomType: string;
  hotelCheckIn: string;
  hotelCheckOut: string;
  sharingRoom: boolean;
  sharingWith: string;
  smokingPreference: string;
  specialProtocol: string;
  securityNote: string;
  dietaryRestrictions: string;
  dietaryOther: string;
  accessibilityNeeds: string;
  specialRequests: string;
  adminNotes: string;
  expanded: boolean;
  activeTab: MemberTab;
  selected: boolean;
}

interface DelegationInfo {
  delegationOfficialName: string;
  contactPhone: string;
  contactEmail: string;
  officialTitle: string;
}

interface SubmitResult {
  delegationRef: string;
  memberResults: { name: string; ref: string }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MEMBER_ROLES = [
  "Head of Delegation",
  "Delegate",
  "Support Staff",
  "Secretary",
  "Security",
  "Observer",
  "Guest",
] as const;

const TITLES = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "H.E.", "Hon."] as const;

const DIETARY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "other", label: "Other" },
] as const;

const ROOM_TYPES = ["Single", "Double", "Suite"] as const;

const PABSEC_COUNTRIES = [
  "Albania", "Armenia", "Azerbaijan", "Bulgaria", "Georgia",
  "Greece", "Moldova", "North Macedonia", "Romania", "Russia",
  "Serbia", "Türkiye", "Ukraine",
] as const;

const STEPS = [
  { id: 1 as StepId, label: "Delegation Information" },
  { id: 2 as StepId, label: "Delegation Members" },
  { id: 3 as StepId, label: "Travel Details" },
  { id: 4 as StepId, label: "Accommodation" },
  { id: 5 as StepId, label: "Protocol Requests" },
  { id: 6 as StepId, label: "Review & Submit" },
] as const;

const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  "Head of Delegation": { bg: "rgba(201,168,76,0.18)", color: "#7a5c00" },
  "Delegate":           { bg: "rgba(11,30,61,0.10)",  color: "#0B1E3D" },
  "Support Staff":      { bg: "#f3f4f6",               color: "#6b7280" },
  "Secretary":          { bg: "rgba(26,95,168,0.12)",  color: "#1A5FA8" },
  "Security":           { bg: "rgba(220,38,38,0.10)",  color: "#dc2626" },
  "Observer":           { bg: "rgba(13,148,136,0.12)", color: "#0d9488" },
  "Guest":              { bg: "rgba(14,165,233,0.12)", color: "#0ea5e9" },
};

function mkMember(): DelegationMember {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: "", firstName: "", lastName: "", position: "", institution: "",
    email: "", phone: "", passportNationality: "",
    participantRole: "Delegate", isHeadOfDelegation: false,
    arrivalDate: "", arrivalAirport: "", arrivalFlight: "", arrivalRoute: "", arrivalTime: "",
    needsTransfer: false, viaIstanbul: false, istanbulVipLounge: false,
    departureDate: "", departureAirport: "", departureFlight: "", departureRoute: "", departureTime: "",
    needsHotel: false, roomType: "Single", hotelCheckIn: "", hotelCheckOut: "",
    sharingRoom: false, sharingWith: "", smokingPreference: "non-smoking",
    specialProtocol: "", securityNote: "", dietaryRestrictions: "none",
    dietaryOther: "", accessibilityNeeds: "",
    specialRequests: "", adminNotes: "",
    expanded: false, activeTab: "travel", selected: false,
  };
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inp = "w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4ED] text-sm bg-white text-[#0B1E3D] focus:outline-none focus:ring-2 focus:ring-[#1A5FA8]/20 focus:border-[#1A5FA8] transition placeholder:text-gray-300";
const lbl = "block text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7A99] mb-1.5";
const cardCls = "bg-white rounded-2xl border border-[#DDE4ED]";
const cardShadow = { boxShadow: "0 2px 8px rgba(11,30,61,0.07)" };

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  eventImageUrl: string | null;
  locale: string;
  isSecretariat: boolean;
  secretaryName: string;
  secretaryCountry: string;
  secretaryEmail: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export function DelegationRegistrationForm({
  eventId, eventSlug, eventTitle, eventImageUrl,
  locale, isSecretariat, secretaryName, secretaryCountry, secretaryEmail,
}: Props) {

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<StepId>(1);
  const [country, setCountry] = useState(secretaryCountry);
  const [delegationInfo, setDelegationInfo] = useState<DelegationInfo>({
    delegationOfficialName: "",
    contactPhone: "",
    contactEmail: secretaryEmail,
    officialTitle: "",
  });
  const [members, setMembers] = useState<DelegationMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState("");

  // ── Member helpers ─────────────────────────────────────────────────────────
  const updateMember = useCallback((id: string, patch: Partial<DelegationMember>) => {
    setMembers(ms => ms.map(m => m.id === id ? { ...m, ...patch } : m));
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers(ms => ms.filter(m => m.id !== id));
  }, []);

  const addMember = useCallback((m: DelegationMember) => {
    setMembers(ms => [...ms, m]);
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goTo = (s: StepId) => {
    setError("");
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (members.length === 0) { setError("Please add at least one delegation member."); return; }
    setSubmitting(true);
    setError("");

    const delegationRef = `DEL-${Date.now().toString(36).toUpperCase().padStart(8, "0").slice(-8)}`;
    const memberResults: { name: string; ref: string }[] = [];

    try {
      for (const m of members) {
        const fd = new FormData();
        const fields: Record<string, string> = {
          eventId,
          firstName: m.firstName,
          lastName: m.lastName,
          title: m.title,
          position: m.position,
          institution: m.institution || `Parliament of ${country}`,
          country,
          email: m.email,
          phone: m.phone,
          passportNationality: m.passportNationality,
          participantRole: m.participantRole,
          isHeadOfDelegation: String(m.isHeadOfDelegation),
          arrivalDate: m.arrivalDate,
          arrivalAirport: m.arrivalAirport,
          arrivalFlight: m.arrivalFlight,
          arrivalRoute: m.arrivalRoute,
          arrivalTime: m.arrivalTime,
          needsTransfer: String(m.needsTransfer),
          viaIstanbul: String(m.viaIstanbul),
          istanbulVipLounge: String(m.istanbulVipLounge),
          departureDate: m.departureDate,
          departureAirport: m.departureAirport,
          departureFlight: m.departureFlight,
          departureRoute: m.departureRoute,
          departureTime: m.departureTime,
          needsHotel: String(m.needsHotel),
          hotelCheckIn: m.hotelCheckIn,
          hotelCheckOut: m.hotelCheckOut,
          roomType: m.roomType,
          sharingRoom: String(m.sharingRoom),
          hotelName: m.sharingWith,
          dietaryRestrictions: m.dietaryRestrictions === "other" ? m.dietaryOther : m.dietaryRestrictions,
          accessibilityNeeds: m.accessibilityNeeds,
          securityNote: m.securityNote,
          specialRequests: [m.specialProtocol && `Protocol: ${m.specialProtocol}`, m.specialRequests].filter(Boolean).join("\n"),
          delegationGroupId: delegationRef,
        };
        Object.entries(fields).forEach(([k, v]) => fd.append(k, v));

        const res = await fetch("/api/event-registrations", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `Failed for ${m.firstName} ${m.lastName}`);
        memberResults.push({ name: `${m.firstName} ${m.lastName}`, ref: data.referenceNumber });
      }
      setSubmitResult({ delegationRef, memberResults });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const travelDone = members.filter(m => m.arrivalDate && m.departureDate).length;
  const istanbulCount = members.filter(m => m.viaIstanbul).length;
  const transferCount = members.filter(m => m.needsTransfer).length;
  const hotelCount = members.filter(m => m.needsHotel).length;
  const headOfDel = members.find(m => m.isHeadOfDelegation);
  const byRole = (r: string) => members.filter(m => m.participantRole === r).length;

  const stepDone = [
    !!(delegationInfo.delegationOfficialName && delegationInfo.contactEmail),
    members.length > 0,
    travelDone === members.length && members.length > 0,
    true,
    true,
    false,
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // SUCCESS
  // ══════════════════════════════════════════════════════════════════════════
  if (submitResult) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-6">
        <div className={`${cardCls} p-12 max-w-2xl w-full text-center`} style={cardShadow}>
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(201,168,76,0.10)" }}>
            <svg className="w-10 h-10" fill="none" stroke="#C9A84C" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">Registration Submitted</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h2 className="font-playfair text-3xl font-bold text-navy mb-3">Delegation Registered</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Your delegation for <strong>{eventTitle}</strong> has been submitted.
            A confirmation has been sent to <strong>{delegationInfo.contactEmail}</strong>.
          </p>
          <div className="rounded-2xl px-6 py-5 mb-8" style={{ background: "rgba(11,30,61,0.04)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Delegation Reference</p>
            <p className="font-mono text-2xl font-bold text-navy tracking-widest">{submitResult.delegationRef}</p>
          </div>
          <div className="text-left space-y-0 mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Individual References</h3>
            {submitResult.memberResults.map(({ name, ref }) => (
              <div key={ref} className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-navy font-medium">{name}</span>
                <span className="font-mono text-sm font-bold text-gray-400">{ref}</span>
              </div>
            ))}
          </div>
          <a href={`/${locale}/events/${eventSlug}`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
            style={{ background: "#0B1E3D" }}>
            ← Back to Event
          </a>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INNER: SIDEBAR CONTENT
  // ══════════════════════════════════════════════════════════════════════════
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#C9A84C" }}>
            <span className="font-black text-sm text-navy">P</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm">PABSEC</div>
            <div className="text-[10px] font-medium tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.38)" }}>Events Platform</div>
          </div>
        </div>
      </div>

      {/* Event card */}
      <div className="mx-4 mt-5 rounded-xl p-4 border" style={{ borderColor: "rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.07)" }}>
        <div className="h-px w-7 mb-3" style={{ background: "#C9A84C" }} />
        <p className="text-white font-bold text-sm leading-snug mb-1">67th PABSEC General Assembly</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>30 June – 1 July 2026</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Tbilisi, Georgia</p>
      </div>

      {/* Steps nav */}
      <nav className="px-3 mt-5 flex-1 space-y-0.5">
        {STEPS.map((s) => {
          const active = step === s.id;
          const done = stepDone[s.id - 1] && step > s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(s.id)}
              className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium"
              style={{
                background: active ? "white" : "transparent",
                color: active ? "#0B1E3D" : done ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.45)",
              }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0 transition-colors"
                style={{ background: active ? "#C9A84C" : done ? "rgba(201,168,76,0.50)" : "rgba(255,255,255,0.18)" }} />
              <span className="flex-1 text-[13px]">{s.label}</span>
              {done && (
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="rgba(201,168,76,0.7)" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {active && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: "#C9A84C" }} />}
            </button>
          );
        })}
      </nav>

      {/* Support */}
      <div className="mx-4 mb-6 mt-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.06)" }}>
        <p className="text-xs font-bold mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>Need Help?</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>secretariat@pabsecevents.org</p>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // INNER: RIGHT PANEL
  // ══════════════════════════════════════════════════════════════════════════
  const RightPanel = () => (
    <div className="space-y-4">
      {eventImageUrl && (
        <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9", background: "#0B1E3D" }}>
          <img src={eventImageUrl} alt={eventTitle} className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`${cardCls} p-4`} style={cardShadow}>
        <p className="font-playfair font-bold text-navy text-base leading-snug mb-1">{eventTitle}</p>
        <p className="text-xs text-gray-400">30 June – 1 July 2026 · Tbilisi, Georgia</p>
      </div>

      {/* Progress */}
      <div className={`${cardCls} p-4`} style={cardShadow}>
        <h4 className={lbl}>Registration Progress</h4>
        <p className="text-2xl font-bold text-navy mb-1">{stepDone.filter(Boolean).length} <span className="text-base text-gray-300">of 6</span></p>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${(stepDone.filter(Boolean).length / 6) * 100}%`, background: "linear-gradient(90deg,#0B1E3D,#C9A84C)" }} />
        </div>
        <div className="space-y-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: stepDone[i] ? "#C9A84C" : "#e5e7eb" }} />
              <span className="text-xs" style={{ color: stepDone[i] ? "#0B1E3D" : "#9ca3af" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delegation Summary */}
      <div className={`${cardCls} p-4`} style={cardShadow}>
        <h4 className={lbl}>Delegation Summary</h4>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Total Members</span>
            <span className="text-xs font-bold text-navy">{members.length}</span>
          </div>
          {headOfDel && (
            <div className="flex justify-between gap-2">
              <span className="text-xs text-gray-400">Head of Delegation</span>
              <span className="text-xs font-bold text-navy truncate">{headOfDel.firstName} {headOfDel.lastName}</span>
            </div>
          )}
          {(["Delegate","Support Staff","Security","Observer","Guest"] as const).map(role => {
            const n = byRole(role);
            return n > 0 ? (
              <div key={role} className="flex justify-between">
                <span className="text-xs text-gray-400">{role}s</span>
                <span className="text-xs font-bold text-navy">{n}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Travel */}
      {members.length > 0 && (
        <div className={`${cardCls} p-4`} style={cardShadow}>
          <h4 className={lbl}>Travel Overview</h4>
          <div className="space-y-1.5">
            {[
              ["Travel complete", `${travelDone}/${members.length}`],
              ["Istanbul transit", String(istanbulCount)],
              ["Airport transfers", String(transferCount)],
              ["Hotel needed", String(hotelCount)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs font-bold text-navy">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security notice */}
      <div className={`${cardCls} p-4`} style={cardShadow}>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(11,30,61,0.05)" }}>
            <svg className="w-4 h-4" fill="none" stroke="rgba(11,30,61,0.45)" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-navy mb-0.5">All personal data is protected</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">Submitted data is accessible only to PABSEC Secretariat</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // INNER: ADD MEMBER MODAL
  // ══════════════════════════════════════════════════════════════════════════
  const AddMemberModal = () => {
    const [fm, setFm] = useState<DelegationMember>(mkMember);
    const [err, setErr] = useState("");

    const handleAdd = () => {
      if (!fm.firstName.trim() || !fm.lastName.trim()) {
        setErr("First and last name are required.");
        return;
      }
      addMember({ ...fm, id: `m-${Date.now()}-${Math.random().toString(36).slice(2)}` });
      setShowAddModal(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(11,30,61,0.55)", backdropFilter: "blur(2px)" }}>
        <div className={`${cardCls} w-full max-w-2xl max-h-[90vh] flex flex-col`} style={cardShadow}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE4ED]">
            <div>
              <h3 className="font-playfair text-lg font-bold text-navy">Add Member Manually</h3>
              <p className="text-xs text-gray-400 mt-0.5">Person not listed on pabsec.org</p>
            </div>
            <button type="button" onClick={() => setShowAddModal(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy hover:bg-gray-100 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Title</label>
                <select value={fm.title} onChange={e => setFm(f => ({ ...f, title: e.target.value }))} className={inp}>
                  <option value="">—</option>
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>First Name <span className="text-red-400">*</span></label>
                <input type="text" value={fm.firstName} onChange={e => setFm(f => ({ ...f, firstName: e.target.value }))} className={inp} placeholder="English only" />
              </div>
              <div>
                <label className={lbl}>Last Name <span className="text-red-400">*</span></label>
                <input type="text" value={fm.lastName} onChange={e => setFm(f => ({ ...f, lastName: e.target.value }))} className={inp} placeholder="English only" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Role in Delegation</label>
                <select value={fm.participantRole} onChange={e => setFm(f => ({ ...f, participantRole: e.target.value }))} className={inp}>
                  {MEMBER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Position / Title</label>
                <input type="text" value={fm.position} onChange={e => setFm(f => ({ ...f, position: e.target.value }))} className={inp} placeholder="Member of Parliament…" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Institution / Parliament</label>
                <input type="text" value={fm.institution} onChange={e => setFm(f => ({ ...f, institution: e.target.value }))} className={inp} placeholder={`Parliament of ${country}`} />
              </div>
              <div>
                <label className={lbl}>Passport Nationality</label>
                <input type="text" value={fm.passportNationality} onChange={e => setFm(f => ({ ...f, passportNationality: e.target.value }))} className={inp} placeholder="Georgian" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Email</label>
                <input type="email" value={fm.email} onChange={e => setFm(f => ({ ...f, email: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className={lbl}>Phone</label>
                <input type="tel" value={fm.phone} onChange={e => setFm(f => ({ ...f, phone: e.target.value }))} className={inp} placeholder="+995…" />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={fm.isHeadOfDelegation}
                onChange={e => setFm(f => ({ ...f, isHeadOfDelegation: e.target.checked, participantRole: e.target.checked ? "Head of Delegation" : f.participantRole }))}
                className="w-4 h-4 rounded accent-gold" />
              <span className="text-sm text-navy font-medium">Head of Delegation</span>
            </label>
            {err && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">{err}</p>}
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#DDE4ED]">
            <button type="button" onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl border border-[#DDE4ED] text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="button" onClick={handleAdd}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
              style={{ background: "#0B1E3D" }}>
              Add to Delegation
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // INNER: IMPORT MODAL
  // ══════════════════════════════════════════════════════════════════════════
  const ImportModal = () => {
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [list, setList] = useState<{ name: string; position: string; selected: boolean }[]>([]);

    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/delegation-import?country=${encodeURIComponent(country)}`);
        if (res.ok) {
          const data = await res.json();
          setList((data.members ?? []).map((m: { name: string; position: string }) => ({ ...m, selected: false })));
        }
      } catch {
        setList([]);
      } finally {
        setLoading(false);
        setFetched(true);
      }
    };

    const handleImport = () => {
      list.filter(m => m.selected).forEach(m => {
        const parts = m.name.trim().split(" ");
        const firstName = parts[0] ?? "";
        const lastName = parts.slice(1).join(" ");
        addMember({ ...mkMember(), firstName, lastName, position: m.position, id: `m-${Date.now()}-${Math.random().toString(36).slice(2)}` });
      });
      setShowImportModal(false);
    };

    const selCount = list.filter(m => m.selected).length;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(11,30,61,0.55)", backdropFilter: "blur(2px)" }}>
        <div className={`${cardCls} w-full max-w-lg max-h-[80vh] flex flex-col`} style={cardShadow}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE4ED]">
            <div>
              <h3 className="font-playfair text-lg font-bold text-navy">Import from pabsec.org</h3>
              <p className="text-xs text-gray-400 mt-0.5">{country} parliamentary delegation</p>
            </div>
            <button type="button" onClick={() => setShowImportModal(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy hover:bg-gray-100 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!fetched ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.10)" }}>
                  <svg className="w-7 h-7" fill="none" stroke="#C9A84C" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Fetch the current parliamentary delegation list for <strong>{country}</strong> from pabsec.org
                </p>
                <button type="button" onClick={fetchList} disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition"
                  style={{ background: "#C9A84C", color: "#0B1E3D" }}>
                  {loading ? "Fetching…" : "Fetch Delegation List"}
                </button>
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500 mb-2">No delegation data found for {country} on pabsec.org.</p>
                <p className="text-xs text-gray-400">Please add members manually using the &quot;Add manually&quot; button.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400">{selCount} of {list.length} selected</p>
                  <button type="button"
                    onClick={() => setList(ls => ls.map(m => ({ ...m, selected: !ls.every(x => x.selected) })))}
                    className="text-xs font-semibold text-navy hover:text-gold transition">
                    {list.every(m => m.selected) ? "Deselect all" : "Select all"}
                  </button>
                </div>
                <div className="space-y-2">
                  {list.map((m, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#DDE4ED] hover:border-navy/30 cursor-pointer transition">
                      <input type="checkbox" checked={m.selected}
                        onChange={e => setList(ls => ls.map((x, j) => j === i ? { ...x, selected: e.target.checked } : x))}
                        className="w-4 h-4 accent-gold flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-navy">{m.name}</p>
                        {m.position && <p className="text-xs text-gray-400">{m.position}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {fetched && list.length > 0 && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#DDE4ED]">
              <button type="button" onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl border border-[#DDE4ED] text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="button" onClick={handleImport} disabled={selCount === 0}
                className="px-6 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
                style={{ background: "#C9A84C", color: "#0B1E3D" }}>
                Import {selCount > 0 ? `(${selCount})` : ""}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // INNER: MEMBER ROW
  // ══════════════════════════════════════════════════════════════════════════
  const MemberRow = ({ m, idx }: { m: DelegationMember; idx: number }) => {
    const badge = ROLE_BADGE[m.participantRole] ?? { bg: "#f3f4f6", color: "#6b7280" };
    const travelOk = !!(m.arrivalDate && m.departureDate);
    const hotelOk = !m.needsHotel || !!(m.hotelCheckIn && m.hotelCheckOut);

    return (
      <div className="border border-[#DDE4ED] rounded-xl overflow-hidden mb-2 bg-white">
        {/* Row header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <input type="checkbox" checked={m.selected}
            onChange={e => updateMember(m.id, { selected: e.target.checked })}
            className="w-4 h-4 rounded accent-gold flex-shrink-0" />
          <span className="text-[11px] font-mono text-gray-300 w-5 flex-shrink-0">{idx + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-navy truncate">
              {m.title && <span className="text-gray-400">{m.title} </span>}
              {m.firstName || <span className="text-gray-300 italic">First name</span>}{" "}
              {m.lastName || <span className="text-gray-300 italic">Last name</span>}
            </p>
            {m.position && <p className="text-xs text-gray-400 truncate">{m.position}</p>}
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
            style={{ background: badge.bg, color: badge.color }}>
            {m.participantRole}
          </span>
          {/* Travel / hotel dots */}
          <div className="flex gap-1 flex-shrink-0" title="Travel / Hotel status">
            <div className="w-2 h-2 rounded-full" style={{ background: travelOk ? "#22c55e" : m.arrivalDate ? "#f97316" : "#e5e7eb" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: hotelOk ? "#22c55e" : m.needsHotel ? "#f97316" : "#e5e7eb" }} />
          </div>
          <button type="button" onClick={() => updateMember(m.id, { expanded: !m.expanded })}
            className="p-1.5 rounded-lg text-gray-300 hover:text-navy hover:bg-gray-100 transition flex-shrink-0">
            <svg className={`w-4 h-4 transition-transform ${m.expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button type="button" onClick={() => removeMember(m.id)}
            className="p-1.5 rounded-lg text-gray-200 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Expanded panel */}
        {m.expanded && (
          <div className="border-t border-[#DDE4ED]" style={{ background: "#F6F8FA" }}>
            {/* Identity fields */}
            <div className="p-5 grid grid-cols-2 gap-3 border-b border-[#DDE4ED] bg-white">
              <div>
                <label className={lbl}>Title</label>
                <select value={m.title} onChange={e => updateMember(m.id, { title: e.target.value })} className={inp}>
                  <option value="">—</option>
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Role</label>
                <select value={m.participantRole}
                  onChange={e => updateMember(m.id, { participantRole: e.target.value, isHeadOfDelegation: e.target.value === "Head of Delegation" })}
                  className={inp}>
                  {MEMBER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" value={m.email} onChange={e => updateMember(m.id, { email: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={lbl}>Phone</label>
                <input type="tel" value={m.phone} onChange={e => updateMember(m.id, { phone: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={lbl}>Position</label>
                <input type="text" value={m.position} onChange={e => updateMember(m.id, { position: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={lbl}>Institution</label>
                <input type="text" value={m.institution} onChange={e => updateMember(m.id, { institution: e.target.value })} className={inp} />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#DDE4ED] bg-white px-4">
              {(["travel","accommodation","vip","notes"] as MemberTab[]).map(tab => (
                <button key={tab} type="button"
                  onClick={() => updateMember(m.id, { activeTab: tab })}
                  className="px-4 py-2.5 text-xs font-semibold border-b-2 transition"
                  style={{
                    borderColor: m.activeTab === tab ? "#C9A84C" : "transparent",
                    color: m.activeTab === tab ? "#0B1E3D" : "#9ca3af",
                  }}>
                  {tab === "vip" ? "VIP / Protocol" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Travel tab */}
              {m.activeTab === "travel" && (
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-navy/50 mb-3">Arrival</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={lbl}>Date</label><input type="date" value={m.arrivalDate} onChange={e => updateMember(m.id, { arrivalDate: e.target.value })} className={inp} /></div>
                      <div><label className={lbl}>Time</label><input type="time" value={m.arrivalTime} onChange={e => updateMember(m.id, { arrivalTime: e.target.value })} className={inp} /></div>
                      <div><label className={lbl}>Airport</label><input type="text" value={m.arrivalAirport} onChange={e => updateMember(m.id, { arrivalAirport: e.target.value })} className={inp} placeholder="TBS" /></div>
                      <div><label className={lbl}>Flight Number</label><input type="text" value={m.arrivalFlight} onChange={e => updateMember(m.id, { arrivalFlight: e.target.value })} className={inp} placeholder="TK 392" /></div>
                    </div>
                    <div className="mt-3"><label className={lbl}>Full Route</label><input type="text" value={m.arrivalRoute} onChange={e => updateMember(m.id, { arrivalRoute: e.target.value })} className={inp} placeholder="Kyiv – Istanbul – Tbilisi" /></div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        { key: "needsTransfer" as const, label: "Airport pickup" },
                        { key: "viaIstanbul" as const, label: "Via Istanbul" },
                      ].map(({ key, label }) => (
                        <button key={key} type="button"
                          onClick={() => updateMember(m.id, { [key]: !m[key] })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                          style={{
                            background: m[key] ? "#0B1E3D" : "white",
                            color: m[key] ? "white" : "#6b7280",
                            borderColor: m[key] ? "#0B1E3D" : "#DDE4ED",
                          }}>
                          {label}: {m[key] ? "Yes" : "No"}
                        </button>
                      ))}
                      {m.viaIstanbul && (
                        <button type="button"
                          onClick={() => updateMember(m.id, { istanbulVipLounge: !m.istanbulVipLounge })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                          style={{
                            background: m.istanbulVipLounge ? "#C9A84C" : "white",
                            color: m.istanbulVipLounge ? "#0B1E3D" : "#6b7280",
                            borderColor: m.istanbulVipLounge ? "#C9A84C" : "#DDE4ED",
                          }}>
                          VIP Lounge IST: {m.istanbulVipLounge ? "Yes" : "No"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-navy/50 mb-3">Departure</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={lbl}>Date</label><input type="date" value={m.departureDate} onChange={e => updateMember(m.id, { departureDate: e.target.value })} className={inp} /></div>
                      <div><label className={lbl}>Time</label><input type="time" value={m.departureTime} onChange={e => updateMember(m.id, { departureTime: e.target.value })} className={inp} /></div>
                      <div><label className={lbl}>Airport</label><input type="text" value={m.departureAirport} onChange={e => updateMember(m.id, { departureAirport: e.target.value })} className={inp} placeholder="TBS" /></div>
                      <div><label className={lbl}>Flight Number</label><input type="text" value={m.departureFlight} onChange={e => updateMember(m.id, { departureFlight: e.target.value })} className={inp} placeholder="TK 393" /></div>
                    </div>
                    <div className="mt-3"><label className={lbl}>Full Return Route</label><input type="text" value={m.departureRoute} onChange={e => updateMember(m.id, { departureRoute: e.target.value })} className={inp} placeholder="Tbilisi – Istanbul – Kyiv" /></div>
                  </div>
                </div>
              )}

              {/* Accommodation tab */}
              {m.activeTab === "accommodation" && (
                <div className="space-y-4">
                  <button type="button" onClick={() => updateMember(m.id, { needsHotel: !m.needsHotel })}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border transition"
                    style={{ background: m.needsHotel ? "#0B1E3D" : "white", color: m.needsHotel ? "white" : "#6b7280", borderColor: m.needsHotel ? "#0B1E3D" : "#DDE4ED" }}>
                    Hotel needed: {m.needsHotel ? "Yes" : "No"}
                  </button>
                  {m.needsHotel && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Check-in</label><input type="date" value={m.hotelCheckIn} onChange={e => updateMember(m.id, { hotelCheckIn: e.target.value })} className={inp} /></div>
                        <div><label className={lbl}>Check-out</label><input type="date" value={m.hotelCheckOut} onChange={e => updateMember(m.id, { hotelCheckOut: e.target.value })} className={inp} /></div>
                      </div>
                      <div>
                        <label className={lbl}>Room Type</label>
                        <div className="flex gap-2">
                          {ROOM_TYPES.map(rt => (
                            <button key={rt} type="button" onClick={() => updateMember(m.id, { roomType: rt })}
                              className="flex-1 py-2 rounded-xl border text-xs font-semibold transition"
                              style={{ background: m.roomType === rt ? "#0B1E3D" : "white", color: m.roomType === rt ? "white" : "#6b7280", borderColor: m.roomType === rt ? "#0B1E3D" : "#DDE4ED" }}>
                              {rt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button type="button" onClick={() => updateMember(m.id, { sharingRoom: !m.sharingRoom })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                          style={{ background: m.sharingRoom ? "#0B1E3D" : "white", color: m.sharingRoom ? "white" : "#6b7280", borderColor: m.sharingRoom ? "#0B1E3D" : "#DDE4ED" }}>
                          Sharing: {m.sharingRoom ? "Yes" : "No"}
                        </button>
                        {m.sharingRoom && (
                          <input type="text" value={m.sharingWith} onChange={e => updateMember(m.id, { sharingWith: e.target.value })}
                            className={`${inp} flex-1`} placeholder="Colleague's full name" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        {["smoking","non-smoking"].map(p => (
                          <button key={p} type="button" onClick={() => updateMember(m.id, { smokingPreference: p })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition"
                            style={{ background: m.smokingPreference === p ? "#0B1E3D" : "white", color: m.smokingPreference === p ? "white" : "#6b7280", borderColor: m.smokingPreference === p ? "#0B1E3D" : "#DDE4ED" }}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* VIP tab */}
              {m.activeTab === "vip" && (
                <div className="space-y-4">
                  <div>
                    <label className={lbl}>Dietary Restrictions</label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map(opt => (
                        <button key={opt.value} type="button" onClick={() => updateMember(m.id, { dietaryRestrictions: opt.value })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                          style={{ background: m.dietaryRestrictions === opt.value ? "#0B1E3D" : "white", color: m.dietaryRestrictions === opt.value ? "white" : "#6b7280", borderColor: m.dietaryRestrictions === opt.value ? "#0B1E3D" : "#DDE4ED" }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {m.dietaryRestrictions === "other" && (
                      <input type="text" value={m.dietaryOther} onChange={e => updateMember(m.id, { dietaryOther: e.target.value })} className={`${inp} mt-2`} placeholder="Specify dietary requirement…" />
                    )}
                  </div>
                  <div><label className={lbl}>Special Protocol Requests</label><textarea value={m.specialProtocol} onChange={e => updateMember(m.id, { specialProtocol: e.target.value })} className={`${inp} resize-none`} rows={2} placeholder="VIP protocol, bilateral meetings…" /></div>
                  <div><label className={lbl}>Security Requirements</label><textarea value={m.securityNote} onChange={e => updateMember(m.id, { securityNote: e.target.value })} className={`${inp} resize-none`} rows={2} placeholder="Security escort, official status…" /></div>
                  <div><label className={lbl}>Accessibility Needs</label><input type="text" value={m.accessibilityNeeds} onChange={e => updateMember(m.id, { accessibilityNeeds: e.target.value })} className={inp} placeholder="Wheelchair, hearing loop…" /></div>
                </div>
              )}

              {/* Notes tab */}
              {m.activeTab === "notes" && (
                <div className="space-y-4">
                  <div><label className={lbl}>Special Requests</label><textarea value={m.specialRequests} onChange={e => updateMember(m.id, { specialRequests: e.target.value })} className={`${inp} resize-none`} rows={3} placeholder="Any other requests…" /></div>
                  {isSecretariat && (
                    <div>
                      <label className={lbl}>Admin Notes <span className="text-gray-300 font-normal normal-case">(Secretariat only)</span></label>
                      <textarea value={m.adminNotes} onChange={e => updateMember(m.id, { adminNotes: e.target.value })} className={`${inp} resize-none`} rows={3} placeholder="Internal notes…" style={{ background: "#fffbeb" }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // STEPS
  // ══════════════════════════════════════════════════════════════════════════

  const Step1 = () => (
    <div className="space-y-5">
      <div className={`${cardCls} p-6`} style={cardShadow}>
        <h3 className="font-playfair text-lg font-bold text-navy mb-4">Secretary Information</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className={lbl}>Secretary Name</label>
            <div className={`${inp} bg-gray-50 text-gray-400 cursor-not-allowed select-none`}>{secretaryName || "—"}</div>
          </div>
          <div>
            <label className={lbl}>Country</label>
            {isSecretariat ? (
              <select value={country} onChange={e => setCountry(e.target.value)} className={inp}>
                <option value="">Select country…</option>
                {PABSEC_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <div className={`${inp} bg-gray-50 text-gray-400 cursor-not-allowed select-none`}>{country || "—"}</div>
            )}
          </div>
        </div>
        {!isSecretariat && <p className="text-[11px] text-gray-400">Pre-filled from your account. Contact the Secretariat to update your details.</p>}
      </div>

      <div className={`${cardCls} p-6`} style={cardShadow}>
        <h3 className="font-playfair text-lg font-bold text-navy mb-4">Delegation Details</h3>
        <div className="space-y-4">
          <div>
            <label className={lbl}>Official Delegation Name <span className="text-red-400">*</span></label>
            <input type="text" className={inp} value={delegationInfo.delegationOfficialName}
              onChange={e => setDelegationInfo(d => ({ ...d, delegationOfficialName: e.target.value }))}
              placeholder={`Parliamentary Delegation of ${country || "…"}`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Contact Phone</label>
              <input type="tel" className={inp} value={delegationInfo.contactPhone}
                onChange={e => setDelegationInfo(d => ({ ...d, contactPhone: e.target.value }))}
                placeholder="+995 XXX XXX XXX" />
            </div>
            <div>
              <label className={lbl}>Contact Email <span className="text-red-400">*</span></label>
              <input type="email" className={inp} value={delegationInfo.contactEmail}
                onChange={e => setDelegationInfo(d => ({ ...d, contactEmail: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={lbl}>Official Delegation Title <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
            <input type="text" className={inp} value={delegationInfo.officialTitle}
              onChange={e => setDelegationInfo(d => ({ ...d, officialTitle: e.target.value }))}
              placeholder="e.g. Official Delegation of the Parliament of Georgia" />
          </div>
        </div>
      </div>
    </div>
  );

  const Step2 = () => {
    const selCount = members.filter(m => m.selected).length;
    const applyGroupTravel = () => {
      const src = members.find(m => m.selected && (m.arrivalDate || m.departureDate));
      if (!src) return;
      setMembers(ms => ms.map(m => !m.selected ? m : {
        ...m,
        arrivalDate: src.arrivalDate, arrivalAirport: src.arrivalAirport,
        arrivalFlight: src.arrivalFlight, arrivalRoute: src.arrivalRoute,
        arrivalTime: src.arrivalTime, needsTransfer: src.needsTransfer,
        viaIstanbul: src.viaIstanbul, istanbulVipLounge: src.istanbulVipLounge,
        departureDate: src.departureDate, departureAirport: src.departureAirport,
        departureFlight: src.departureFlight, departureRoute: src.departureRoute,
        departureTime: src.departureTime,
      }));
    };

    return (
      <div className={`${cardCls} p-6`} style={cardShadow}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-playfair text-lg font-bold text-navy">Delegation Members</h3>
            {members.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: "#0B1E3D" }}>{members.length}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selCount > 1 && (
              <button type="button" onClick={applyGroupTravel}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#DDE4ED] text-gray-600 hover:bg-gray-50 transition flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Apply travel to {selCount} selected
              </button>
            )}
            <button type="button" onClick={() => setShowImportModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition hover:opacity-90"
              style={{ background: "#C9A84C", color: "#0B1E3D" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import from pabsec.org
            </button>
            <button type="button" onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition flex items-center gap-1.5"
              style={{ background: "#0B1E3D" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add manually
            </button>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#F6F8FA" }}>
              <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-navy mb-1">No Members Added Yet</h4>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">Import from pabsec.org or add members manually.</p>
            <div className="flex items-center gap-3 justify-center">
              <button type="button" onClick={() => setShowImportModal(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
                style={{ background: "#C9A84C", color: "#0B1E3D" }}>
                Import from pabsec.org
              </button>
              <button type="button" onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
                style={{ background: "#0B1E3D" }}>
                Add manually
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-[#DDE4ED]">
              <div className="w-4" /><span className="w-5">#</span>
              <span className="flex-1">Name / Position</span>
              <span>Role</span>
              <span className="w-10 text-center">Info</span>
              <span className="w-16 text-right">Actions</span>
            </div>
            {members.map((m, i) => <MemberRow key={m.id} m={m} idx={i} />)}
          </>
        )}
      </div>
    );
  };

  const Step3 = () => (
    <div className={`${cardCls} p-6`} style={cardShadow}>
      <h3 className="font-playfair text-lg font-bold text-navy mb-4">Travel Details Overview</h3>
      {members.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No delegation members added yet. Go to Step 2 to add members.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-[#DDE4ED]">
                {["Member","Role","Arrival","Flight","Transfer","Departure","Status"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => {
                const done = !!(m.arrivalDate && m.departureDate);
                const partial = !!(m.arrivalDate || m.departureDate);
                return (
                  <tr key={m.id} className="border-b border-[#DDE4ED]/50 hover:bg-gray-50 transition">
                    <td className="px-3 py-3 font-medium text-navy">{m.firstName} {m.lastName}</td>
                    <td className="px-3 py-3 text-xs text-gray-400">{m.participantRole}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{m.arrivalDate || <span className="text-gray-200">—</span>}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{m.arrivalFlight || <span className="text-gray-200">—</span>}</td>
                    <td className="px-3 py-3 text-xs">{m.needsTransfer ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-gray-300">No</span>}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{m.departureDate || <span className="text-gray-200">—</span>}</td>
                    <td className="px-3 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: done ? "rgba(34,197,94,0.12)" : partial ? "rgba(249,115,22,0.12)" : "rgba(239,68,68,0.10)", color: done ? "#15803d" : partial ? "#c2410c" : "#b91c1c" }}>
                        {done ? "Complete" : partial ? "Partial" : "Missing"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">Expand a member in Step 2 → Travel tab to edit flight details.</p>
    </div>
  );

  const Step4 = () => (
    <div className={`${cardCls} p-6`} style={cardShadow}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-playfair text-lg font-bold text-navy">Accommodation Overview</h3>
        {members.length > 0 && (
          <button type="button" onClick={() => setMembers(ms => ms.map(m => ({ ...m, needsHotel: true })))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DDE4ED] text-navy hover:bg-gray-50 transition">
            Assign hotel to all
          </button>
        )}
      </div>
      {members.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No delegation members added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[#DDE4ED]">
                {["Member","Hotel","Room Type","Check-in","Check-out","Sharing"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b border-[#DDE4ED]/50 hover:bg-gray-50 transition">
                  <td className="px-3 py-3 font-medium text-navy">{m.firstName} {m.lastName}</td>
                  <td className="px-3 py-3">
                    <button type="button" onClick={() => updateMember(m.id, { needsHotel: !m.needsHotel })}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold transition"
                      style={{ background: m.needsHotel ? "#0B1E3D" : "#f3f4f6", color: m.needsHotel ? "white" : "#6b7280" }}>
                      {m.needsHotel ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{m.needsHotel ? m.roomType : <span className="text-gray-200">—</span>}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{m.hotelCheckIn || <span className="text-gray-200">—</span>}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{m.hotelCheckOut || <span className="text-gray-200">—</span>}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{m.sharingRoom ? (m.sharingWith || "Yes") : <span className="text-gray-200">No</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const Step5 = () => (
    <div className={`${cardCls} p-6`} style={cardShadow}>
      <h3 className="font-playfair text-lg font-bold text-navy mb-4">Protocol Requests Overview</h3>
      {members.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No delegation members added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[#DDE4ED]">
                {["Member","Dietary","Accessibility","VIP / Protocol","Security"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b border-[#DDE4ED]/50 hover:bg-gray-50 transition">
                  <td className="px-3 py-3 font-medium text-navy">{m.firstName} {m.lastName}</td>
                  <td className="px-3 py-3 text-xs text-gray-500">{m.dietaryRestrictions !== "none" ? m.dietaryRestrictions : <span className="text-gray-200">None</span>}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 max-w-[120px] truncate">{m.accessibilityNeeds || <span className="text-gray-200">—</span>}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 max-w-[140px] truncate">{m.specialProtocol || <span className="text-gray-200">—</span>}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 max-w-[140px] truncate">{m.securityNote || <span className="text-gray-200">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const Step6 = () => {
    const Sec = ({ title, s, children }: { title: string; s: StepId; children: React.ReactNode }) => (
      <div className={cardCls} style={cardShadow}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#DDE4ED]">
          <span className="text-xs font-bold uppercase tracking-wider text-navy">{title}</span>
          <button type="button" onClick={() => goTo(s)} className="text-xs font-semibold hover:opacity-70 transition" style={{ color: "#C9A84C" }}>Edit →</button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    );
    const Row = ({ label, value }: { label: string; value?: string | null }) => value ? (
      <div className="flex gap-3 py-1.5 border-b border-gray-50">
        <span className="text-xs text-gray-400 w-36 flex-shrink-0">{label}</span>
        <span className="text-xs text-navy font-medium">{value}</span>
      </div>
    ) : null;

    return (
      <div className="space-y-4">
        <div className="rounded-xl px-5 py-3 border" style={{ background: "rgba(201,168,76,0.05)", borderColor: "rgba(201,168,76,0.30)" }}>
          <p className="text-sm text-navy font-semibold">Please review all details before submitting.</p>
        </div>
        <Sec title="Delegation Information" s={1}>
          <Row label="Secretary" value={secretaryName} />
          <Row label="Country" value={country} />
          <Row label="Delegation Name" value={delegationInfo.delegationOfficialName} />
          <Row label="Contact Email" value={delegationInfo.contactEmail} />
          <Row label="Contact Phone" value={delegationInfo.contactPhone} />
        </Sec>
        <Sec title={`Delegation Members (${members.length})`} s={2}>
          {members.length === 0 ? (
            <p className="text-sm text-red-500">No members added. Please go back and add delegation members.</p>
          ) : members.map((m, i) => (
            <div key={m.id} className="flex items-start gap-3 py-2 border-b border-gray-50">
              <span className="text-xs text-gray-300 w-5 flex-shrink-0">{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy">{m.title && `${m.title} `}{m.firstName} {m.lastName}</p>
                {m.position && <p className="text-xs text-gray-400">{m.position}{m.institution && ` · ${m.institution}`}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-navy">{m.participantRole}</p>
                {m.isHeadOfDelegation && <p className="text-[10px] font-bold" style={{ color: "#C9A84C" }}>Head of Delegation</p>}
              </div>
            </div>
          ))}
        </Sec>
        <Sec title="Travel Summary" s={3}>
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50">
              <span className="text-xs font-medium text-navy w-40 truncate">{m.firstName} {m.lastName}</span>
              <span className="text-xs text-gray-500 flex-1">{m.arrivalDate ? `Arr. ${m.arrivalDate}` : <span className="text-orange-400">No arrival</span>}</span>
              <span className="text-xs text-gray-500">{m.departureDate ? `Dep. ${m.departureDate}` : <span className="text-orange-400">No departure</span>}</span>
            </div>
          ))}
        </Sec>
        <Sec title="Hotel Summary" s={4}>
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50">
              <span className="text-xs font-medium text-navy w-40 truncate">{m.firstName} {m.lastName}</span>
              <span className="text-xs text-gray-500">{m.needsHotel ? `Hotel: ${m.roomType}${m.hotelCheckIn ? ` · ${m.hotelCheckIn}` : ""}` : "Own arrangement"}</span>
            </div>
          ))}
        </Sec>
        {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">{error}</div>}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LAYOUT
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">
      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-0 h-screen overflow-y-auto" style={{ background: "#0B1E3D" }}>
        <SidebarContent />
      </aside>

      {/* CENTER + RIGHT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile step bar */}
        <div className="lg:hidden overflow-x-auto border-b border-[#DDE4ED] bg-white">
          <div className="flex gap-0 min-w-max px-2 py-2">
            {STEPS.map(s => (
              <button key={s.id} type="button" onClick={() => goTo(s.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition"
                style={{ background: step === s.id ? "#0B1E3D" : "transparent", color: step === s.id ? "white" : "#9ca3af" }}>
                <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: step === s.id ? "#C9A84C" : "#e5e7eb", color: step === s.id ? "#0B1E3D" : "#9ca3af" }}>{s.id}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex gap-6 max-w-[1400px] mx-auto">
            {/* Main */}
            <main className="flex-1 min-w-0 space-y-5">
              {/* Step header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px w-6" style={{ background: "#C9A84C" }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: "#C9A84C" }}>Step {step} of 6</span>
                </div>
                <h2 className="font-playfair text-2xl font-bold text-navy">{STEPS[step - 1].label}</h2>
              </div>

              {error && step < 6 && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">{error}</div>
              )}

              {step === 1 && <Step1 />}
              {step === 2 && <Step2 />}
              {step === 3 && <Step3 />}
              {step === 4 && <Step4 />}
              {step === 5 && <Step5 />}
              {step === 6 && <Step6 />}

              {/* Bottom nav */}
              <div className="flex items-center justify-between pt-4 pb-8">
                <div>
                  {step > 1 && (
                    <button type="button" onClick={() => goTo((step - 1) as StepId)}
                      className="px-5 py-2.5 rounded-xl border border-[#DDE4ED] text-sm font-semibold text-navy hover:bg-white transition">
                      ← Back
                    </button>
                  )}
                </div>
                <button type="button" className="text-sm text-gray-400 hover:text-navy transition">Save as draft</button>
                <div>
                  {step < 6 ? (
                    <button type="button" onClick={() => {
                      if (step === 1 && !delegationInfo.delegationOfficialName) { setError("Please fill in the Delegation Name."); return; }
                      if (step === 2 && members.length === 0) { setError("Please add at least one delegation member."); return; }
                      goTo((step + 1) as StepId);
                    }}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
                      style={{ background: "#0B1E3D" }}>
                      Next →
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={submitting || members.length === 0}
                      className="px-8 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition hover:opacity-90"
                      style={{ background: "#0B1E3D", border: "1.5px solid #C9A84C" }}>
                      {submitting ? "Submitting…" : "Submit Registration"}
                    </button>
                  )}
                </div>
              </div>
            </main>

            {/* RIGHT PANEL */}
            <aside className="hidden xl:block w-72 2xl:w-80 flex-shrink-0">
              <div className="sticky top-6">
                <RightPanel />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddMemberModal />}
      {showImportModal && <ImportModal />}
    </div>
  );
}
