"use client";

import { useState, useCallback, useEffect, memo } from "react";

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
  emails: string[];
  phones: string[];
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
  istLeg1Flight: string; istLeg1Time: string;
  istLeg2Flight: string; istLeg2Time: string;
  istLeg3Flight: string; istLeg3Time: string;
  istLeg4Flight: string; istLeg4Time: string;
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
  "Head of Delegation", "Delegate", "Support Staff",
  "Secretary", "Security", "Observer", "Guest",
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function mkMember(): DelegationMember {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: "", firstName: "", lastName: "", position: "", institution: "",
    emails: [""], phones: [""],
    passportNationality: "",
    participantRole: "Delegate", isHeadOfDelegation: false,
    arrivalDate: "", arrivalAirport: "", arrivalFlight: "", arrivalRoute: "", arrivalTime: "",
    needsTransfer: true, viaIstanbul: false, istanbulVipLounge: false,
    istLeg1Flight: "", istLeg1Time: "", istLeg2Flight: "", istLeg2Time: "",
    istLeg3Flight: "", istLeg3Time: "", istLeg4Flight: "", istLeg4Time: "",
    departureDate: "", departureAirport: "", departureFlight: "", departureRoute: "", departureTime: "",
    needsHotel: true, roomType: "Single", hotelCheckIn: "", hotelCheckOut: "",
    sharingRoom: false, sharingWith: "", smokingPreference: "non-smoking",
    specialProtocol: "", securityNote: "", dietaryRestrictions: "none",
    dietaryOther: "", accessibilityNeeds: "", specialRequests: "", adminNotes: "",
    expanded: false, activeTab: "travel", selected: false,
  };
}

function hasIstanbul(route: string) {
  return /istanbul|\bIST\b/i.test(route);
}

// ── Styles ────────────────────────────────────────────────────────────────────

const inp = "w-full px-3.5 py-2.5 rounded-xl border border-[#DDE4ED] text-sm bg-white text-[#0B1E3D] focus:outline-none focus:ring-2 focus:ring-[#1A5FA8]/20 focus:border-[#1A5FA8] transition placeholder:text-gray-300";
const lbl = "block text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B7A99] mb-1.5";
const cardCls = "bg-white rounded-2xl border border-[#DDE4ED]";
const cardShadow = { boxShadow: "0 2px 8px rgba(11,30,61,0.07)" };

// ══════════════════════════════════════════════════════════════════════════════
// MemberRow — defined OUTSIDE parent to prevent React unmount/remount on render
// ══════════════════════════════════════════════════════════════════════════════

interface MemberRowProps {
  m: DelegationMember;
  idx: number;
  isSecretariat: boolean;
  prevMember?: DelegationMember;
  updateMember: (id: string, patch: Partial<DelegationMember>) => void;
  removeMember: (id: string) => void;
}

const MemberRow = memo(function MemberRow({
  m, idx, isSecretariat, prevMember, updateMember, removeMember,
}: MemberRowProps) {
  const badge = ROLE_BADGE[m.participantRole] ?? { bg: "#f3f4f6", color: "#6b7280" };
  const travelOk = !!(m.arrivalDate && m.departureDate);
  const hotelOk = !m.needsHotel || !!(m.hotelCheckIn && m.hotelCheckOut);

  const upd = useCallback(
    (patch: Partial<DelegationMember>) => updateMember(m.id, patch),
    [updateMember, m.id],
  );

  const handleRouteChange = useCallback(
    (field: "arrivalRoute" | "departureRoute", val: string) => {
      const patch: Partial<DelegationMember> = { [field]: val };
      const combined = field === "arrivalRoute"
        ? val + " " + m.departureRoute
        : m.arrivalRoute + " " + val;
      if (hasIstanbul(combined) && !m.viaIstanbul) {
        patch.viaIstanbul = true;
        patch.istanbulVipLounge = true;
      }
      updateMember(m.id, patch);
    },
    [updateMember, m.id, m.arrivalRoute, m.departureRoute, m.viaIstanbul],
  );

  const copyFromPrev = useCallback(() => {
    if (!prevMember) return;
    updateMember(m.id, {
      arrivalDate: prevMember.arrivalDate, arrivalAirport: prevMember.arrivalAirport,
      arrivalFlight: prevMember.arrivalFlight, arrivalRoute: prevMember.arrivalRoute,
      arrivalTime: prevMember.arrivalTime, needsTransfer: prevMember.needsTransfer,
      viaIstanbul: prevMember.viaIstanbul, istanbulVipLounge: prevMember.istanbulVipLounge,
      istLeg1Flight: prevMember.istLeg1Flight, istLeg1Time: prevMember.istLeg1Time,
      istLeg2Flight: prevMember.istLeg2Flight, istLeg2Time: prevMember.istLeg2Time,
      istLeg3Flight: prevMember.istLeg3Flight, istLeg3Time: prevMember.istLeg3Time,
      istLeg4Flight: prevMember.istLeg4Flight, istLeg4Time: prevMember.istLeg4Time,
      departureDate: prevMember.departureDate, departureAirport: prevMember.departureAirport,
      departureFlight: prevMember.departureFlight, departureRoute: prevMember.departureRoute,
      departureTime: prevMember.departureTime,
    });
  }, [updateMember, m.id, prevMember]);

  return (
    <div className="border border-[#DDE4ED] rounded-xl overflow-hidden mb-2 bg-white">
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <input type="checkbox" checked={m.selected}
          onChange={e => upd({ selected: e.target.checked })}
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
        <div className="flex gap-1 flex-shrink-0" title="Travel / Hotel status">
          <div className="w-2 h-2 rounded-full" style={{ background: travelOk ? "#22c55e" : m.arrivalDate ? "#f97316" : "#e5e7eb" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: hotelOk ? "#22c55e" : m.needsHotel ? "#f97316" : "#e5e7eb" }} />
        </div>
        <button type="button" onClick={() => upd({ expanded: !m.expanded })}
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

      {m.expanded && (
        <div className="border-t border-[#DDE4ED]" style={{ background: "#F6F8FA" }}>
          {/* Identity */}
          <div className="p-5 bg-white border-b border-[#DDE4ED] space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lbl}>Title</label>
                <select value={m.title} onChange={e => upd({ title: e.target.value })} className={inp}>
                  <option value="">—</option>
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>First Name</label>
                <input type="text" value={m.firstName} onChange={e => upd({ firstName: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={lbl}>Last Name</label>
                <input type="text" value={m.lastName} onChange={e => upd({ lastName: e.target.value })} className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Role</label>
                <select value={m.participantRole}
                  onChange={e => upd({ participantRole: e.target.value, isHeadOfDelegation: e.target.value === "Head of Delegation" })}
                  className={inp}>
                  {MEMBER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Position</label>
                <input type="text" value={m.position} onChange={e => upd({ position: e.target.value })} className={inp} placeholder="Member of Parliament…" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Institution</label>
                <input type="text" value={m.institution} onChange={e => upd({ institution: e.target.value })} className={inp} />
              </div>
              <div>
                <label className={lbl}>Passport Nationality</label>
                <input type="text" value={m.passportNationality} onChange={e => upd({ passportNationality: e.target.value })} className={inp} />
              </div>
            </div>
            {/* Emails */}
            <div>
              <label className={lbl}>Email(s)</label>
              {m.emails.map((email, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <input type="email" value={email}
                    onChange={e => { const arr = [...m.emails]; arr[i] = e.target.value; upd({ emails: arr }); }}
                    className={`${inp} flex-1`} placeholder="name@parliament.gov" />
                  {m.emails.length > 1 && (
                    <button type="button" onClick={() => upd({ emails: m.emails.filter((_, j) => j !== i) })}
                      className="px-2 text-gray-300 hover:text-red-400 transition text-xl leading-none">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => upd({ emails: [...m.emails, ""] })}
                className="text-xs font-semibold hover:opacity-70 transition" style={{ color: "#1A5FA8" }}>+ Add email</button>
            </div>
            {/* Phones */}
            <div>
              <label className={lbl}>Phone(s)</label>
              {m.phones.map((phone, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <input type="tel" value={phone}
                    onChange={e => { const arr = [...m.phones]; arr[i] = e.target.value; upd({ phones: arr }); }}
                    className={`${inp} flex-1`} placeholder="+995 XXX XXX XXX" />
                  {m.phones.length > 1 && (
                    <button type="button" onClick={() => upd({ phones: m.phones.filter((_, j) => j !== i) })}
                      className="px-2 text-gray-300 hover:text-red-400 transition text-xl leading-none">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => upd({ phones: [...m.phones, ""] })}
                className="text-xs font-semibold hover:opacity-70 transition" style={{ color: "#1A5FA8" }}>+ Add phone</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#DDE4ED] bg-white px-4">
            {(["travel", "accommodation", "vip", "notes"] as MemberTab[]).map(tab => (
              <button key={tab} type="button" onClick={() => upd({ activeTab: tab })}
                className="px-4 py-2.5 text-xs font-semibold border-b-2 transition"
                style={{ borderColor: m.activeTab === tab ? "#C9A84C" : "transparent", color: m.activeTab === tab ? "#0B1E3D" : "#9ca3af" }}>
                {tab === "vip" ? "VIP / Protocol" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Travel tab */}
            {m.activeTab === "travel" && (
              <div className="space-y-5">
                {prevMember && (
                  <div className="flex justify-end">
                    <button type="button" onClick={copyFromPrev}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#DDE4ED] text-gray-600 hover:bg-gray-50 transition flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy travel from {prevMember.firstName || "member above"}
                    </button>
                  </div>
                )}

                {/* Arrival */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-navy/50 mb-3">Arrival</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={lbl}>Date</label><input type="date" value={m.arrivalDate} onChange={e => upd({ arrivalDate: e.target.value })} className={inp} /></div>
                    <div><label className={lbl}>Time</label><input type="time" value={m.arrivalTime} onChange={e => upd({ arrivalTime: e.target.value })} className={inp} /></div>
                    <div><label className={lbl}>Airport</label><input type="text" value={m.arrivalAirport} onChange={e => upd({ arrivalAirport: e.target.value })} className={inp} placeholder="TBS" /></div>
                    <div><label className={lbl}>Flight Number</label><input type="text" value={m.arrivalFlight} onChange={e => upd({ arrivalFlight: e.target.value })} className={inp} placeholder="TK 392" /></div>
                  </div>
                  <div className="mt-3">
                    <label className={lbl}>Full Route</label>
                    <input type="text" value={m.arrivalRoute} onChange={e => handleRouteChange("arrivalRoute", e.target.value)} className={inp} placeholder="Kyiv – Istanbul – Tbilisi" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => upd({ needsTransfer: !m.needsTransfer })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                      style={{ background: m.needsTransfer ? "#0B1E3D" : "white", color: m.needsTransfer ? "white" : "#6b7280", borderColor: m.needsTransfer ? "#0B1E3D" : "#DDE4ED" }}>
                      Airport pickup: {m.needsTransfer ? "Yes" : "No"}
                    </button>
                    <button type="button"
                      onClick={() => {
                        const next = !m.viaIstanbul;
                        upd({ viaIstanbul: next, istanbulVipLounge: next ? true : m.istanbulVipLounge });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                      style={{ background: m.viaIstanbul ? "#0B1E3D" : "white", color: m.viaIstanbul ? "white" : "#6b7280", borderColor: m.viaIstanbul ? "#0B1E3D" : "#DDE4ED" }}>
                      Via Istanbul: {m.viaIstanbul ? "Yes" : "No"}
                    </button>
                    {m.viaIstanbul && (
                      <button type="button" onClick={() => upd({ istanbulVipLounge: !m.istanbulVipLounge })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                        style={{ background: m.istanbulVipLounge ? "#C9A84C" : "white", color: m.istanbulVipLounge ? "#0B1E3D" : "#6b7280", borderColor: m.istanbulVipLounge ? "#C9A84C" : "#DDE4ED" }}>
                        VIP Lounge IST: {m.istanbulVipLounge ? "Yes" : "No"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Istanbul legs */}
                {m.viaIstanbul && (
                  <div className="rounded-xl border border-[#C9A84C]/30 p-4" style={{ background: "rgba(201,168,76,0.04)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#C9A84C" }}>Istanbul Transit — 4 Legs</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className={lbl}>Leg 1 · Origin → IST · Flight</label>
                        <input type="text" value={m.istLeg1Flight} onChange={e => upd({ istLeg1Flight: e.target.value })} className={inp} placeholder="TK 100" />
                      </div>
                      <div>
                        <label className={lbl}>Leg 1 · Arrival IST Time</label>
                        <input type="time" value={m.istLeg1Time} onChange={e => upd({ istLeg1Time: e.target.value })} className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Leg 2 · IST → TBS · Flight</label>
                        <input type="text" value={m.istLeg2Flight} onChange={e => upd({ istLeg2Flight: e.target.value })} className={inp} placeholder="TK 392" />
                      </div>
                      <div>
                        <label className={lbl}>Leg 2 · Departure IST Time</label>
                        <input type="time" value={m.istLeg2Time} onChange={e => upd({ istLeg2Time: e.target.value })} className={inp} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lbl}>Leg 3 · TBS → IST · Flight</label>
                        <input type="text" value={m.istLeg3Flight} onChange={e => upd({ istLeg3Flight: e.target.value })} className={inp} placeholder="TK 393" />
                      </div>
                      <div>
                        <label className={lbl}>Leg 3 · Arrival IST Time</label>
                        <input type="time" value={m.istLeg3Time} onChange={e => upd({ istLeg3Time: e.target.value })} className={inp} />
                      </div>
                      <div>
                        <label className={lbl}>Leg 4 · IST → Origin · Flight</label>
                        <input type="text" value={m.istLeg4Flight} onChange={e => upd({ istLeg4Flight: e.target.value })} className={inp} placeholder="TK 101" />
                      </div>
                      <div>
                        <label className={lbl}>Leg 4 · Departure IST Time</label>
                        <input type="time" value={m.istLeg4Time} onChange={e => upd({ istLeg4Time: e.target.value })} className={inp} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Departure */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-navy/50 mb-3">Departure</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={lbl}>Date</label><input type="date" value={m.departureDate} onChange={e => upd({ departureDate: e.target.value })} className={inp} /></div>
                    <div><label className={lbl}>Time</label><input type="time" value={m.departureTime} onChange={e => upd({ departureTime: e.target.value })} className={inp} /></div>
                    <div><label className={lbl}>Airport</label><input type="text" value={m.departureAirport} onChange={e => upd({ departureAirport: e.target.value })} className={inp} placeholder="TBS" /></div>
                    <div><label className={lbl}>Flight Number</label><input type="text" value={m.departureFlight} onChange={e => upd({ departureFlight: e.target.value })} className={inp} placeholder="TK 393" /></div>
                  </div>
                  <div className="mt-3">
                    <label className={lbl}>Full Return Route</label>
                    <input type="text" value={m.departureRoute} onChange={e => handleRouteChange("departureRoute", e.target.value)} className={inp} placeholder="Tbilisi – Istanbul – Kyiv" />
                  </div>
                </div>
              </div>
            )}

            {/* Accommodation tab */}
            {m.activeTab === "accommodation" && (
              <div className="space-y-4">
                <button type="button" onClick={() => upd({ needsHotel: !m.needsHotel })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border transition"
                  style={{ background: m.needsHotel ? "#0B1E3D" : "white", color: m.needsHotel ? "white" : "#6b7280", borderColor: m.needsHotel ? "#0B1E3D" : "#DDE4ED" }}>
                  Hotel needed: {m.needsHotel ? "Yes" : "No"}
                </button>
                {m.needsHotel && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={lbl}>Check-in</label><input type="date" value={m.hotelCheckIn} onChange={e => upd({ hotelCheckIn: e.target.value })} className={inp} /></div>
                      <div><label className={lbl}>Check-out</label><input type="date" value={m.hotelCheckOut} onChange={e => upd({ hotelCheckOut: e.target.value })} className={inp} /></div>
                    </div>
                    <div>
                      <label className={lbl}>Room Type</label>
                      <div className="flex gap-2">
                        {ROOM_TYPES.map(rt => (
                          <button key={rt} type="button" onClick={() => upd({ roomType: rt })}
                            className="flex-1 py-2 rounded-xl border text-xs font-semibold transition"
                            style={{ background: m.roomType === rt ? "#0B1E3D" : "white", color: m.roomType === rt ? "white" : "#6b7280", borderColor: m.roomType === rt ? "#0B1E3D" : "#DDE4ED" }}>
                            {rt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button type="button" onClick={() => upd({ sharingRoom: !m.sharingRoom })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                        style={{ background: m.sharingRoom ? "#0B1E3D" : "white", color: m.sharingRoom ? "white" : "#6b7280", borderColor: m.sharingRoom ? "#0B1E3D" : "#DDE4ED" }}>
                        Sharing: {m.sharingRoom ? "Yes" : "No"}
                      </button>
                      {m.sharingRoom && (
                        <input type="text" value={m.sharingWith} onChange={e => upd({ sharingWith: e.target.value })}
                          className={`${inp} flex-1`} placeholder="Colleague's full name" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      {["smoking", "non-smoking"].map(p => (
                        <button key={p} type="button" onClick={() => upd({ smokingPreference: p })}
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
                      <button key={opt.value} type="button" onClick={() => upd({ dietaryRestrictions: opt.value })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition"
                        style={{ background: m.dietaryRestrictions === opt.value ? "#0B1E3D" : "white", color: m.dietaryRestrictions === opt.value ? "white" : "#6b7280", borderColor: m.dietaryRestrictions === opt.value ? "#0B1E3D" : "#DDE4ED" }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {m.dietaryRestrictions === "other" && (
                    <input type="text" value={m.dietaryOther} onChange={e => upd({ dietaryOther: e.target.value })} className={`${inp} mt-2`} placeholder="Specify dietary requirement…" />
                  )}
                </div>
                <div><label className={lbl}>Special Protocol Requests</label><textarea value={m.specialProtocol} onChange={e => upd({ specialProtocol: e.target.value })} className={`${inp} resize-none`} rows={2} placeholder="VIP protocol, bilateral meetings…" /></div>
                <div><label className={lbl}>Security Requirements</label><textarea value={m.securityNote} onChange={e => upd({ securityNote: e.target.value })} className={`${inp} resize-none`} rows={2} placeholder="Security escort, official status…" /></div>
                <div><label className={lbl}>Accessibility Needs</label><input type="text" value={m.accessibilityNeeds} onChange={e => upd({ accessibilityNeeds: e.target.value })} className={inp} placeholder="Wheelchair, hearing loop…" /></div>
              </div>
            )}

            {/* Notes tab */}
            {m.activeTab === "notes" && (
              <div className="space-y-4">
                <div><label className={lbl}>Special Requests</label><textarea value={m.specialRequests} onChange={e => upd({ specialRequests: e.target.value })} className={`${inp} resize-none`} rows={3} placeholder="Any other requests…" /></div>
                {isSecretariat && (
                  <div>
                    <label className={lbl}>Admin Notes <span className="text-gray-300 font-normal normal-case">(Secretariat only)</span></label>
                    <textarea value={m.adminNotes} onChange={e => upd({ adminNotes: e.target.value })} className={`${inp} resize-none`} rows={3} placeholder="Internal notes…" style={{ background: "#fffbeb" }} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// AddMemberModal — outside parent
// ══════════════════════════════════════════════════════════════════════════════

function AddMemberModal({ country, onAdd, onClose }: { country: string; onAdd: (m: DelegationMember) => void; onClose: () => void }) {
  const [fm, setFm] = useState<DelegationMember>(mkMember);
  const [err, setErr] = useState("");

  function handleAdd() {
    if (!fm.firstName.trim() || !fm.lastName.trim()) { setErr("First and last name are required."); return; }
    onAdd({ ...fm, id: `m-${Date.now()}-${Math.random().toString(36).slice(2)}` });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(11,30,61,0.55)", backdropFilter: "blur(2px)" }}>
      <div className={`${cardCls} w-full max-w-2xl max-h-[90vh] flex flex-col`} style={cardShadow}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE4ED]">
          <div>
            <h3 className="font-playfair text-lg font-bold text-navy">Add Member Manually</h3>
            <p className="text-xs text-gray-400 mt-0.5">Person not listed on pabsec.org</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy hover:bg-gray-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lbl}>Title</label>
              <select value={fm.title} onChange={e => setFm(f => ({ ...f, title: e.target.value }))} className={inp}>
                <option value="">—</option>{TITLES.map(t => <option key={t} value={t}>{t}</option>)}
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
              <label className={lbl}>Institution</label>
              <input type="text" value={fm.institution} onChange={e => setFm(f => ({ ...f, institution: e.target.value }))} className={inp} placeholder={`Parliament of ${country}`} />
            </div>
            <div>
              <label className={lbl}>Passport Nationality</label>
              <input type="text" value={fm.passportNationality} onChange={e => setFm(f => ({ ...f, passportNationality: e.target.value }))} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Email</label>
              <input type="email" value={fm.emails[0]} onChange={e => setFm(f => ({ ...f, emails: [e.target.value] }))} className={inp} />
            </div>
            <div>
              <label className={lbl}>Phone</label>
              <input type="tel" value={fm.phones[0]} onChange={e => setFm(f => ({ ...f, phones: [e.target.value] }))} className={inp} placeholder="+995…" />
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={fm.isHeadOfDelegation}
              onChange={e => setFm(f => ({ ...f, isHeadOfDelegation: e.target.checked, participantRole: e.target.checked ? "Head of Delegation" : f.participantRole }))}
              className="w-4 h-4 rounded" />
            <span className="text-sm text-navy font-medium">Head of Delegation</span>
          </label>
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">{err}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#DDE4ED]">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-[#DDE4ED] text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">Cancel</button>
          <button type="button" onClick={handleAdd} className="px-6 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition" style={{ background: "#0B1E3D" }}>Add to Delegation</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ImportModal — outside parent
// ══════════════════════════════════════════════════════════════════════════════

interface ImportEntry { name: string; position: string; selected: boolean }

function ImportModal({
  country, list, loading, fetched, setList, onImport, onClose,
}: {
  country: string;
  list: ImportEntry[];
  loading: boolean;
  fetched: boolean;
  setList: (l: ImportEntry[]) => void;
  onImport: (sel: ImportEntry[]) => void;
  onClose: () => void;
}) {
  const selCount = list.filter(m => m.selected).length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(11,30,61,0.55)", backdropFilter: "blur(2px)" }}>
      <div className={`${cardCls} w-full max-w-lg max-h-[80vh] flex flex-col`} style={cardShadow}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE4ED]">
          <div>
            <h3 className="font-playfair text-lg font-bold text-navy">Import from pabsec.org</h3>
            <p className="text-xs text-gray-400 mt-0.5">{country} parliamentary delegation</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy hover:bg-gray-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
              <p className="text-sm text-gray-400">Fetching from pabsec.org…</p>
            </div>
          ) : !fetched ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
          ) : list.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500 mb-2">No delegation data found for {country}.</p>
              <p className="text-xs text-gray-400">Add members manually using the &quot;Add manually&quot; button.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">{selCount} of {list.length} selected</p>
                <button type="button" onClick={() => setList(list.map(m => ({ ...m, selected: !list.every(x => x.selected) })))}
                  className="text-xs font-semibold text-navy hover:opacity-70 transition">
                  {list.every(m => m.selected) ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="space-y-2">
                {list.map((m, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#DDE4ED] hover:border-navy/30 cursor-pointer transition">
                    <input type="checkbox" checked={m.selected}
                      onChange={e => setList(list.map((x, j) => j === i ? { ...x, selected: e.target.checked } : x))}
                      className="w-4 h-4 flex-shrink-0" />
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
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-[#DDE4ED] text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">Cancel</button>
            <button type="button" onClick={() => { onImport(list.filter(m => m.selected)); onClose(); }} disabled={selCount === 0}
              className="px-6 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
              style={{ background: "#C9A84C", color: "#0B1E3D" }}>
              Import {selCount > 0 ? `(${selCount})` : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Props
// ══════════════════════════════════════════════════════════════════════════════

interface Props {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  eventImageUrl: string | null;
  locale: string;
  isSecretariat: boolean;
  isPabsec: boolean;
  secretaryName: string;
  secretaryCountry: string;
  secretaryEmail: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function DelegationRegistrationForm({
  eventId, eventSlug, eventTitle, eventImageUrl,
  locale, isSecretariat, isPabsec,
  secretaryName, secretaryCountry, secretaryEmail,
}: Props) {
  const [step, setStep] = useState<StepId>(1);
  const [country, setCountry] = useState(secretaryCountry);
  const [delegationInfo, setDelegationInfo] = useState<DelegationInfo>({
    contactPhone: "",
    contactEmail: secretaryEmail,
    officialTitle: "",
  });
  const [members, setMembers] = useState<DelegationMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importList, setImportList] = useState<ImportEntry[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importFetched, setImportFetched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState("");

  // Delegation name is auto-generated, read-only
  const delegationName = country ? `${country} Delegation to PABSEC` : "";

  // Auto-fetch pabsec.org whenever country is set/changed
  useEffect(() => {
    if (!country) return;
    setImportFetched(false);
    setImportList([]);
    setImportLoading(true);
    fetch(`/api/delegation-import?country=${encodeURIComponent(country)}`)
      .then(r => r.ok ? r.json() : { members: [] })
      .then(data => setImportList((data.members ?? []).map((m: { name: string; position: string }) => ({ ...m, selected: false }))))
      .catch(() => {})
      .finally(() => { setImportLoading(false); setImportFetched(true); });
  }, [country]);

  // Stable callbacks
  const updateMember = useCallback((id: string, patch: Partial<DelegationMember>) => {
    setMembers(ms => ms.map(m => m.id === id ? { ...m, ...patch } : m));
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers(ms => ms.filter(m => m.id !== id));
  }, []);

  const handleImportMembers = useCallback((sel: ImportEntry[]) => {
    const newMembers = sel.map(s => {
      const parts = s.name.trim().split(" ");
      return { ...mkMember(), firstName: parts[0] ?? "", lastName: parts.slice(1).join(" "), position: s.position, id: `m-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    });
    setMembers(ms => [...ms, ...newMembers]);
  }, []);

  const handleAddMember = useCallback((m: DelegationMember) => {
    setMembers(ms => [...ms, m]);
  }, []);

  // Navigation
  const goTo = (s: StepId) => { setError(""); setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Group travel copy
  const applyGroupTravel = () => {
    const src = members.find(m => m.selected && (m.arrivalDate || m.departureDate));
    if (!src) return;
    setMembers(ms => ms.map(m => !m.selected ? m : {
      ...m,
      arrivalDate: src.arrivalDate, arrivalAirport: src.arrivalAirport, arrivalFlight: src.arrivalFlight,
      arrivalRoute: src.arrivalRoute, arrivalTime: src.arrivalTime, needsTransfer: src.needsTransfer,
      viaIstanbul: src.viaIstanbul, istanbulVipLounge: src.istanbulVipLounge,
      istLeg1Flight: src.istLeg1Flight, istLeg1Time: src.istLeg1Time,
      istLeg2Flight: src.istLeg2Flight, istLeg2Time: src.istLeg2Time,
      istLeg3Flight: src.istLeg3Flight, istLeg3Time: src.istLeg3Time,
      istLeg4Flight: src.istLeg4Flight, istLeg4Time: src.istLeg4Time,
      departureDate: src.departureDate, departureAirport: src.departureAirport,
      departureFlight: src.departureFlight, departureRoute: src.departureRoute, departureTime: src.departureTime,
    }));
  };

  // Submit
  async function handleSubmit() {
    if (members.length === 0) { setError("Please add at least one delegation member."); return; }
    setSubmitting(true); setError("");
    const delegationRef = `DEL-${Date.now().toString(36).toUpperCase().padEnd(8, "0").slice(-8)}`;
    const memberResults: { name: string; ref: string }[] = [];
    try {
      for (const m of members) {
        const istanbulInfo = m.viaIstanbul ? [
          "Istanbul Transit:",
          `  Leg 1 (Origin→IST): ${m.istLeg1Flight || "—"} @ ${m.istLeg1Time || "—"}`,
          `  Leg 2 (IST→TBS): ${m.istLeg2Flight || "—"} @ ${m.istLeg2Time || "—"}`,
          `  Leg 3 (TBS→IST): ${m.istLeg3Flight || "—"} @ ${m.istLeg3Time || "—"}`,
          `  Leg 4 (IST→Origin): ${m.istLeg4Flight || "—"} @ ${m.istLeg4Time || "—"}`,
        ].join("\n") : "";
        const specialRequests = [
          m.specialProtocol && `Protocol: ${m.specialProtocol}`,
          istanbulInfo,
          m.specialRequests,
          isSecretariat && m.adminNotes && `[Admin] ${m.adminNotes}`,
        ].filter(Boolean).join("\n\n");
        const fd = new FormData();
        const fields: Record<string, string> = {
          eventId,
          firstName: m.firstName || "Unknown",
          lastName: m.lastName || "Unknown",
          title: m.title,
          position: m.position,
          institution: m.institution || `Parliament of ${country}`,
          country,
          email: m.emails.filter(Boolean).join(", ") || delegationInfo.contactEmail,
          phone: m.phones.filter(Boolean).join(", "),
          passportNationality: m.passportNationality,
          participantRole: m.participantRole,
          isHeadOfDelegation: String(m.isHeadOfDelegation),
          arrivalDate: m.arrivalDate, arrivalAirport: m.arrivalAirport,
          arrivalFlight: m.arrivalFlight, arrivalRoute: m.arrivalRoute, arrivalTime: m.arrivalTime,
          needsTransfer: String(m.needsTransfer), viaIstanbul: String(m.viaIstanbul),
          istanbulVipLounge: String(m.istanbulVipLounge),
          departureDate: m.departureDate, departureAirport: m.departureAirport,
          departureFlight: m.departureFlight, departureRoute: m.departureRoute, departureTime: m.departureTime,
          needsHotel: String(m.needsHotel), hotelCheckIn: m.hotelCheckIn, hotelCheckOut: m.hotelCheckOut,
          roomType: m.roomType, sharingRoom: String(m.sharingRoom), hotelName: m.sharingWith,
          dietaryRestrictions: m.dietaryRestrictions === "other" ? m.dietaryOther : m.dietaryRestrictions,
          accessibilityNeeds: m.accessibilityNeeds, securityNote: m.securityNote,
          specialRequests, delegationGroupId: delegationRef,
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
    } finally { setSubmitting(false); }
  }

  // Computed
  const travelDone = members.filter(m => m.arrivalDate && m.departureDate).length;
  const istanbulCount = members.filter(m => m.viaIstanbul).length;
  const transferCount = members.filter(m => m.needsTransfer).length;
  const hotelCount = members.filter(m => m.needsHotel).length;
  const headOfDel = members.find(m => m.isHeadOfDelegation);
  const selCount = members.filter(m => m.selected).length;
  const stepDone = [
    !!(delegationName && delegationInfo.contactEmail),
    members.length > 0,
    travelDone === members.length && members.length > 0,
    true, true, false,
  ];

  // ── SUCCESS ─────────────────────────────────────────────────────────────────
  if (submitResult) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center p-6">
        <div className={`${cardCls} p-12 max-w-2xl w-full text-center`} style={cardShadow}>
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(201,168,76,0.10)" }}>
            <svg className="w-10 h-10" fill="none" stroke="#C9A84C" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="h-px w-8" style={{ background: "#C9A84C" }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: "#C9A84C" }}>Registration Submitted</span>
            <div className="h-px w-8" style={{ background: "#C9A84C" }} />
          </div>
          <h2 className="font-playfair text-3xl font-bold text-navy mb-3">Delegation Registered</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Your delegation for <strong>{eventTitle}</strong> has been submitted successfully.
          </p>
          <div className="rounded-2xl px-6 py-5 mb-8" style={{ background: "rgba(11,30,61,0.04)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Delegation Reference</p>
            <p className="font-mono text-2xl font-bold text-navy tracking-widest">{submitResult.delegationRef}</p>
          </div>
          <div className="text-left mb-8">
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
            style={{ background: "#0B1E3D" }}>← Back to Event</a>
        </div>
      </div>
    );
  }

  // ── MAIN LAYOUT ──────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">

      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-shrink-0 flex-col sticky top-0 h-screen overflow-y-auto" style={{ background: "#0B1E3D" }}>
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
          <p className="text-white font-bold text-sm leading-snug mb-1 line-clamp-2">{eventTitle}</p>
        </div>
        {/* Steps nav */}
        <nav className="px-3 mt-5 flex-1 space-y-0.5">
          {STEPS.map(s => {
            const active = step === s.id;
            const done = stepDone[s.id - 1] && step > s.id;
            return (
              <button key={s.id} type="button" onClick={() => goTo(s.id)}
                className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium"
                style={{ background: active ? "white" : "transparent", color: active ? "#0B1E3D" : done ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.45)" }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: active ? "#C9A84C" : done ? "rgba(201,168,76,0.50)" : "rgba(255,255,255,0.18)" }} />
                <span className="flex-1 text-[13px]">{s.label}</span>
                {done && <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="rgba(201,168,76,0.7)" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
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
      </aside>

      {/* CENTER + RIGHT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* pabsec impersonation banner */}
        {isPabsec && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Test Mode</span>
            <span className="text-xs text-amber-600">Registering as secretary of:</span>
            <select value={country} onChange={e => setCountry(e.target.value)}
              className="text-xs font-semibold border border-amber-300 rounded-lg px-2 py-1 bg-white text-navy">
              <option value="">Select country…</option>
              {PABSEC_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

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

            {/* MAIN */}
            <main className="flex-1 min-w-0 space-y-5">
              {/* Step header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px w-6" style={{ background: "#C9A84C" }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: "#C9A84C" }}>Step {step} of 6</span>
                </div>
                <h2 className="font-playfair text-2xl font-bold text-navy">{STEPS[step - 1].label}</h2>
              </div>

              {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">{error}</div>}

              {/* ── Step 1 ── */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Secretary info */}
                  <div className={`${cardCls} p-6`} style={cardShadow}>
                    <h3 className="font-playfair text-lg font-bold text-navy mb-4">Secretary Information</h3>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className={lbl}>Secretary Name</label>
                        <div className={`${inp} bg-gray-50 text-gray-400 cursor-not-allowed select-none`}>{secretaryName || "—"}</div>
                      </div>
                      <div>
                        <label className={lbl}>Country</label>
                        {(isSecretariat && !isPabsec) ? (
                          <select value={country} onChange={e => setCountry(e.target.value)} className={inp}>
                            <option value="">Select country…</option>
                            {PABSEC_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <div className={`${inp} bg-gray-50 text-gray-400 cursor-not-allowed select-none`}>{country || "—"}</div>
                        )}
                      </div>
                    </div>
                    {!isSecretariat && !isPabsec && (
                      <p className="text-[11px] text-gray-400">Pre-filled from your account. Contact the Secretariat to update your details.</p>
                    )}
                  </div>

                  {/* Delegation Details */}
                  <div className={`${cardCls} p-6`} style={cardShadow}>
                    <h3 className="font-playfair text-lg font-bold text-navy mb-4">Delegation Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={lbl}>Official Delegation Name</label>
                        <div className={`${inp} bg-gray-50 text-gray-600 cursor-not-allowed select-none font-medium`}>{delegationName || "Select a country first"}</div>
                        <p className="text-[11px] text-gray-400 mt-1">Auto-generated from country</p>
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

                  {/* Auto-fetch status */}
                  {country && (
                    <div className={`${cardCls} px-5 py-3`} style={cardShadow}>
                      <div className="flex items-center gap-3">
                        {importLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
                            <span className="text-xs text-gray-500">Fetching delegation list from pabsec.org…</span>
                          </>
                        ) : importFetched ? (
                          <>
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#22c55e" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            <span className="text-xs text-gray-500">
                              {importList.length > 0 ? `Found ${importList.length} members on pabsec.org — go to Step 2 to import.` : "No delegation data found on pabsec.org for this country."}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <div className={`${cardCls} p-6`} style={cardShadow}>
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
                        Import from pabsec.org {importFetched && importList.length > 0 ? `(${importList.length})` : ""}
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
                      <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">
                        {importFetched && importList.length > 0
                          ? `${importList.length} members found on pabsec.org. Import them or add manually.`
                          : "Import from pabsec.org or add members manually."}
                      </p>
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
                        <span className="w-10 text-center">Status</span>
                        <span className="w-16 text-right">Actions</span>
                      </div>
                      {members.map((m, i) => (
                        <MemberRow key={m.id} m={m} idx={i}
                          isSecretariat={isSecretariat}
                          prevMember={i > 0 ? members[i - 1] : undefined}
                          updateMember={updateMember}
                          removeMember={removeMember} />
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* ── Step 3: Travel Overview ── */}
              {step === 3 && (
                <div className={`${cardCls} p-6`} style={cardShadow}>
                  <h3 className="font-playfair text-lg font-bold text-navy mb-4">Travel Details Overview</h3>
                  {members.length === 0 ? (
                    <p className="text-gray-400 text-sm py-8 text-center">No delegation members added yet. Go to Step 2 to add members.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[640px]">
                        <thead>
                          <tr className="border-b border-[#DDE4ED]">
                            {["Member", "Role", "Arrival", "Flight", "Pickup", "Via IST", "VIP", "Departure", "Status"].map(h => (
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
                                <td className="px-3 py-3 text-xs">{m.viaIstanbul ? <span className="font-semibold" style={{ color: "#C9A84C" }}>Yes</span> : <span className="text-gray-300">No</span>}</td>
                                <td className="px-3 py-3 text-xs">{m.viaIstanbul && m.istanbulVipLounge ? <span className="text-purple-600 font-semibold">VIP</span> : <span className="text-gray-300">—</span>}</td>
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
              )}

              {/* ── Step 4: Accommodation ── */}
              {step === 4 && (
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
                            {["Member", "Hotel", "Room Type", "Check-in", "Check-out", "Sharing"].map(h => (
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
              )}

              {/* ── Step 5: Protocol ── */}
              {step === 5 && (
                <div className={`${cardCls} p-6`} style={cardShadow}>
                  <h3 className="font-playfair text-lg font-bold text-navy mb-4">Protocol Requests Overview</h3>
                  {members.length === 0 ? (
                    <p className="text-gray-400 text-sm py-8 text-center">No delegation members added yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[500px]">
                        <thead>
                          <tr className="border-b border-[#DDE4ED]">
                            {["Member", "Dietary", "Accessibility", "VIP / Protocol", "Security"].map(h => (
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
              )}

              {/* ── Step 6: Review ── */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="rounded-xl px-5 py-3 border" style={{ background: "rgba(201,168,76,0.05)", borderColor: "rgba(201,168,76,0.30)" }}>
                    <p className="text-sm text-navy font-semibold">Please review all details before submitting.</p>
                  </div>

                  {/* Delegation info review */}
                  <div className={cardCls} style={cardShadow}>
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#DDE4ED]">
                      <span className="text-xs font-bold uppercase tracking-wider text-navy">Delegation Information</span>
                      <button type="button" onClick={() => goTo(1)} className="text-xs font-semibold hover:opacity-70 transition" style={{ color: "#C9A84C" }}>Edit →</button>
                    </div>
                    <div className="px-5 py-4 space-y-0">
                      {[
                        ["Secretary", secretaryName], ["Country", country],
                        ["Delegation Name", delegationName],
                        ["Contact Email", delegationInfo.contactEmail],
                        ["Contact Phone", delegationInfo.contactPhone],
                      ].map(([label, value]) => value ? (
                        <div key={label} className="flex gap-3 py-1.5 border-b border-gray-50">
                          <span className="text-xs text-gray-400 w-36 flex-shrink-0">{label}</span>
                          <span className="text-xs text-navy font-medium">{value}</span>
                        </div>
                      ) : null)}
                    </div>
                  </div>

                  {/* Members review */}
                  <div className={cardCls} style={cardShadow}>
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#DDE4ED]">
                      <span className="text-xs font-bold uppercase tracking-wider text-navy">Delegation Members ({members.length})</span>
                      <button type="button" onClick={() => goTo(2)} className="text-xs font-semibold hover:opacity-70 transition" style={{ color: "#C9A84C" }}>Edit →</button>
                    </div>
                    <div className="px-5 py-4">
                      {members.length === 0 ? (
                        <p className="text-sm text-red-500">No members added. Please go back and add delegation members.</p>
                      ) : members.map((m, i) => (
                        <div key={m.id} className="flex items-start gap-3 py-2 border-b border-gray-50">
                          <span className="text-xs text-gray-300 w-5 flex-shrink-0">{i + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-navy">{m.title && `${m.title} `}{m.firstName} {m.lastName}</p>
                            {m.position && <p className="text-xs text-gray-400">{m.position}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-navy">{m.participantRole}</p>
                            {m.viaIstanbul && <p className="text-[10px]" style={{ color: "#C9A84C" }}>Via Istanbul{m.istanbulVipLounge ? " · VIP" : ""}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Travel summary */}
                  <div className={cardCls} style={cardShadow}>
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#DDE4ED]">
                      <span className="text-xs font-bold uppercase tracking-wider text-navy">Travel Summary</span>
                      <button type="button" onClick={() => goTo(3)} className="text-xs font-semibold hover:opacity-70 transition" style={{ color: "#C9A84C" }}>Edit →</button>
                    </div>
                    <div className="px-5 py-4 space-y-1.5">
                      <div className="flex justify-between"><span className="text-xs text-gray-400">Travel complete</span><span className="text-xs font-bold text-navy">{travelDone}/{members.length}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-gray-400">Via Istanbul</span><span className="text-xs font-bold text-navy">{istanbulCount}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-gray-400">Airport transfers</span><span className="text-xs font-bold text-navy">{transferCount}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-gray-400">Hotel needed</span><span className="text-xs font-bold text-navy">{hotelCount}</span></div>
                    </div>
                  </div>
                </div>
              )}

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
                      if (step === 1 && !delegationInfo.contactEmail) { setError("Please fill in the contact email."); return; }
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
              <div className="sticky top-6 space-y-4">
                {eventImageUrl && (
                  <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9", background: "#0B1E3D" }}>
                    <img src={eventImageUrl} alt={eventTitle} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`${cardCls} p-4`} style={cardShadow}>
                  <p className="font-playfair font-bold text-navy text-base leading-snug mb-1">{eventTitle}</p>
                </div>
                {/* Progress */}
                <div className={`${cardCls} p-4`} style={cardShadow}>
                  <p className={lbl}>Registration Progress</p>
                  <p className="text-2xl font-bold text-navy mb-1">{stepDone.filter(Boolean).length} <span className="text-base text-gray-300">of 6</span></p>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(stepDone.filter(Boolean).length / 6) * 100}%`, background: "linear-gradient(90deg,#0B1E3D,#C9A84C)" }} />
                  </div>
                  <div className="space-y-1">
                    {STEPS.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: stepDone[i] ? "#C9A84C" : "#e5e7eb" }} />
                        <span className="text-xs" style={{ color: stepDone[i] ? "#0B1E3D" : "#9ca3af" }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Delegation summary */}
                <div className={`${cardCls} p-4`} style={cardShadow}>
                  <p className={lbl}>Delegation Summary</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-xs text-gray-400">Country</span><span className="text-xs font-bold text-navy">{country || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-gray-400">Total Members</span><span className="text-xs font-bold text-navy">{members.length}</span></div>
                    {headOfDel && (
                      <div className="flex justify-between gap-2">
                        <span className="text-xs text-gray-400">Head</span>
                        <span className="text-xs font-bold text-navy truncate">{headOfDel.firstName} {headOfDel.lastName}</span>
                      </div>
                    )}
                    {members.length > 0 && (
                      <>
                        <div className="flex justify-between"><span className="text-xs text-gray-400">Via Istanbul</span><span className="text-xs font-bold text-navy">{istanbulCount}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-gray-400">Hotel needed</span><span className="text-xs font-bold text-navy">{hotelCount}</span></div>
                      </>
                    )}
                  </div>
                </div>
                {/* Security */}
                <div className={`${cardCls} p-4`} style={cardShadow}>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(11,30,61,0.05)" }}>
                      <svg className="w-4 h-4" fill="none" stroke="rgba(11,30,61,0.45)" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-navy mb-0.5">All personal data is protected</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed">Accessible only to PABSEC Secretariat</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddMemberModal country={country} onAdd={handleAddMember} onClose={() => setShowAddModal(false)} />
      )}
      {showImportModal && (
        <ImportModal
          country={country}
          list={importList}
          loading={importLoading}
          fetched={importFetched}
          setList={setImportList}
          onImport={handleImportMembers}
          onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
