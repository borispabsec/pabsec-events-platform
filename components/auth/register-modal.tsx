"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ModalShell } from "./login-modal";
import { TurnstileWidget } from "./turnstile-widget";

const PABSEC_ROLES = [
  { value: "President of PABSEC",                en: "President of PABSEC",              ru: "Президент ПАЧЭС",                     tr: "PABSEC Başkanı" },
  { value: "Vice-President of PABSEC",           en: "Vice-President of PABSEC",         ru: "Вице-президент ПАЧЭС",                tr: "PABSEC Başkan Yardımcısı" },
  { value: "Member of PABSEC Bureau",            en: "Member of PABSEC Bureau",          ru: "Член Бюро ПАЧЭС",                    tr: "PABSEC Büro Üyesi" },
  { value: "Head of National Delegation",         en: "Head of National Delegation",       ru: "Руководитель национальной делегации", tr: "Ulusal Delegasyon Başkanı" },
  { value: "Member of PABSEC",                   en: "Member of PABSEC",                 ru: "Член ПАЧЭС",                         tr: "PABSEC Üyesi" },
  { value: "Secretary of National Delegation",   en: "Secretary of National Delegation", ru: "Секретарь делегации",                 tr: "Delegasyon Sekreteri" },
  { value: "Member of International Secretariat",en: "Member of International Secretariat", ru: "Член Международного секретариата",tr: "Uluslararası Sekreterya Üyesi" },
] as const;

const PABSEC_COUNTRIES = [
  "Albania", "Armenia", "Azerbaijan", "Bulgaria", "Georgia",
  "Greece", "Moldova", "North Macedonia", "Romania", "Russia",
  "Serbia", "Türkiye", "Ukraine", "International Secretariat",
] as const;

interface Props {
  onClose: () => void;
  onOpenLogin: () => void;
}

export function RegisterModal({ onClose, onOpenLogin }: Props) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";
  const roleLang: "en" | "ru" | "tr" = locale === "ru" ? "ru" : locale === "tr" ? "tr" : "en";

  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [turnstileToken, setTurnstileToken] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    usernameConfirm: "",
    password: "",
    passwordConfirm: "",
    country: "",
    role: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (form.username !== form.usernameConfirm) {
      setError("Usernames do not match.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("firstName", form.firstName);
      fd.append("lastName", form.lastName);
      fd.append("email", form.email);
      fd.append("username", form.username);
      fd.append("password", form.password);
      fd.append("country", form.country);
      fd.append("role", form.role);
      fd.append("turnstileToken", turnstileToken);
      if (photo) fd.append("photo", photo);

      const res = await fetch("/api/auth/register", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        if (data.details) setFieldErrors(data.details);
        setError(data.error ?? "Registration failed.");
        return;
      }
      setStep("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <ModalShell onClose={onClose} title="Request Submitted">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-navy font-bold mb-2">Registration Received</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-5">
            Your registration request has been received. Please wait for administrator approval.
            You will be notified by email.
          </p>
          <button onClick={onOpenLogin} className="text-navy font-semibold text-sm hover:underline">
            Back to Sign In
          </button>
        </div>
      </ModalShell>
    );
  }

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1";

  return (
    <ModalShell onClose={onClose} title="Create Account">
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
              <input type="text" required value={form.firstName} onChange={field("firstName")} className={inputClass} />
              {fieldErrors.firstName && <p className="text-red-500 text-[11px] mt-0.5">{fieldErrors.firstName[0]}</p>}
            </div>
            <div>
              <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
              <input type="text" required value={form.lastName} onChange={field("lastName")} className={inputClass} />
              {fieldErrors.lastName && <p className="text-red-500 text-[11px] mt-0.5">{fieldErrors.lastName[0]}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Email <span className="text-red-500">*</span></label>
            <input type="email" required value={form.email} onChange={field("email")} className={inputClass} />
            {fieldErrors.email && <p className="text-red-500 text-[11px] mt-0.5">{fieldErrors.email[0]}</p>}
          </div>

          <div>
            <label className={labelClass}>Username <span className="text-red-500">*</span></label>
            <input type="text" required value={form.username} onChange={field("username")} className={inputClass} placeholder="Letters, numbers, . - _" />
            {fieldErrors.username && <p className="text-red-500 text-[11px] mt-0.5">{fieldErrors.username[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Confirm Username <span className="text-red-500">*</span></label>
            <input type="text" required value={form.usernameConfirm} onChange={field("usernameConfirm")} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Password <span className="text-red-500">*</span></label>
            <input type="password" required minLength={8} value={form.password} onChange={field("password")} className={inputClass} placeholder="Minimum 8 characters" />
            {fieldErrors.password && <p className="text-red-500 text-[11px] mt-0.5">{fieldErrors.password[0]}</p>}
          </div>
          <div>
            <label className={labelClass}>Confirm Password <span className="text-red-500">*</span></label>
            <input type="password" required value={form.passwordConfirm} onChange={field("passwordConfirm")} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Country <span className="text-red-500">*</span></label>
            <select required value={form.country} onChange={field("country")} className={inputClass}>
              <option value="">Select country…</option>
              {PABSEC_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {fieldErrors.country && <p className="text-red-500 text-[11px] mt-0.5">{fieldErrors.country[0]}</p>}
          </div>

          <div>
            <label className={labelClass}>Role <span className="text-red-500">*</span></label>
            <select required value={form.role} onChange={field("role")} className={inputClass}>
              <option value="">Select role…</option>
              {PABSEC_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r[roleLang]}</option>
              ))}
            </select>
            {fieldErrors.role && <p className="text-red-500 text-[11px] mt-0.5">{fieldErrors.role[0]}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Profile Photo
              <span className="ml-1 text-gray-400 font-normal normal-case">(required if not on pabsec.org)</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy/5 file:text-navy hover:file:bg-navy/10 transition"
            />
            <p className="text-gray-400 text-[11px] mt-1">Max 5 MB. JPG, PNG or WebP.</p>
          </div>

          <p className="text-gray-400 text-[11px]">
            Names must be in English. All other fields support your preferred language.
          </p>

          <TurnstileWidget
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
          />

          {error && (
            <p className="text-red-600 text-xs rounded-lg bg-red-50 px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit Registration Request"}
          </button>

          <div className="text-center">
            <button type="button" onClick={onOpenLogin} className="text-navy/60 text-xs hover:text-navy transition">
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
