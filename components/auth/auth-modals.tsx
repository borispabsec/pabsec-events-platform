"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginModal, ForgotPasswordModal } from "./login-modal";
import { RegisterModal } from "./register-modal";
import { useAuth } from "./auth-provider";
import Image from "next/image";

type ModalView = "login" | "register" | "forgot" | null;

export function AuthButton() {
  const { user, loading, logout, refresh } = useAuth();
  const router = useRouter();
  const [modal, setModal] = useState<ModalView>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  async function onLoginSuccess() {
    await refresh();
    router.refresh();
    setModal(null);
  }

  if (loading) {
    return <div className="w-16 h-7 rounded-lg bg-gray-100 animate-pulse" />;
  }

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150 hover:bg-gold/10"
          style={{ border: "1px solid rgba(201,168,76,0.45)", minWidth: 100 }}
        >
          {user.photoUrl ? (
            <Image
              src={user.photoUrl}
              alt={user.firstName}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              unoptimized
            />
          ) : (
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
              {user.firstName[0]}{user.lastName[0]}
            </span>
          )}
          <span className="text-[11px] font-semibold hidden sm:block max-w-[100px] truncate" style={{ color: "rgba(255,255,255,0.9)" }}>
            {user.firstName}
          </span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "rgba(255,255,255,0.45)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-[100] bg-white rounded-2xl border border-gray-100 shadow-xl py-1 min-w-[160px]"
              style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}>
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-navy">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.role}</p>
              </div>
              <button
                onClick={async () => { setMenuOpen(false); await logout(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setModal("login")}
        className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] rounded-lg transition-all duration-150"
        style={{
          color: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(201,168,76,0.45)",
          background: "transparent",
          padding: "8px 16px",
          minWidth: 100,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#C9A84C";
          (e.currentTarget as HTMLButtonElement).style.color = "#070F1A";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.92)";
        }}
      >
        Login
      </button>

      {modal === "login" && (
        <LoginModal
          onClose={onLoginSuccess}
          onOpenRegister={() => setModal("register")}
          onOpenForgot={() => setModal("forgot")}
        />
      )}
      {modal === "register" && (
        <RegisterModal
          onClose={() => setModal(null)}
          onOpenLogin={() => setModal("login")}
        />
      )}
      {modal === "forgot" && (
        <ForgotPasswordModal
          onClose={() => setModal(null)}
          onOpenLogin={() => setModal("login")}
        />
      )}
    </>
  );
}
