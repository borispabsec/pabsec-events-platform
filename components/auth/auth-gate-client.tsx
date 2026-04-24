"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginModal, ForgotPasswordModal } from "./login-modal";
import { RegisterModal } from "./register-modal";
import { useAuth } from "./auth-provider";

type ModalView = "login" | "register" | "forgot" | null;

export function AuthGateClient() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [modal, setModal] = useState<ModalView>(null);

  async function onLoginSuccess() {
    await refresh();
    router.refresh();
    setModal(null);
  }

  return (
    <>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setModal("login")}
          className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition"
        >
          Sign In
        </button>
        <button
          onClick={() => setModal("register")}
          className="px-5 py-2.5 rounded-xl border border-navy/20 text-navy text-sm font-semibold hover:bg-navy/5 transition"
        >
          Register
        </button>
      </div>

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
