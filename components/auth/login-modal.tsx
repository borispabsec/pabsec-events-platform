"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";

interface Props {
  onClose: () => void;
  onOpenRegister: () => void;
  onOpenForgot: () => void;
}

export function LoginModal({ onClose, onOpenRegister, onOpenForgot }: Props) {
  const { refresh } = useAuth();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      await refresh();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell onClose={onClose} title="Sign In">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Username or Email
          </label>
          <input
            type="text"
            required
            autoFocus
            value={form.usernameOrEmail}
            onChange={(e) => setForm((f) => ({ ...f, usernameOrEmail: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition"
          />
        </div>

        {error && (
          <p className="text-red-600 text-xs rounded-lg bg-red-50 px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={onOpenForgot}
            className="text-navy/60 hover:text-navy transition"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={onOpenRegister}
            className="text-navy font-semibold hover:underline"
          >
            Create account
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function ForgotPasswordModal({ onClose, onOpenLogin }: { onClose: () => void; onOpenLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error sending reset email");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell onClose={onClose} title="Reset Password">
      {sent ? (
        <div className="text-center py-4">
          <p className="text-gray-600 text-sm mb-4">
            If an account with that email exists, a reset link has been sent.
          </p>
          <button onClick={onOpenLogin} className="text-navy font-semibold text-sm hover:underline">
            Back to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition"
            />
          </div>
          {error && <p className="text-red-600 text-xs rounded-lg bg-red-50 px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
          <div className="text-center">
            <button type="button" onClick={onOpenLogin} className="text-navy/60 text-xs hover:text-navy transition">
              Back to Sign In
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

// Shared modal shell
export function ModalShell({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-px w-6 bg-gold mb-2" />
            <h2 className="text-navy font-bold text-lg">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
