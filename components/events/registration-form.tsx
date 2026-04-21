"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RegistrationFormProps {
  eventId: string;
  locale: string;
}

export function RegistrationForm({ eventId, locale }: RegistrationFormProps) {
  const t = useTranslations("registration");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, eventId }),
      });

      if (res.status === 409) {
        setError("You are already registered for this event.");
        setStatus("error");
        return;
      }
      if (!res.ok) {
        const body = await res.json();
        setError(body?.error ?? "Registration failed.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-green-800">
        {t("success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("first_name")} *
          </label>
          <Input name="firstName" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("last_name")} *
          </label>
          <Input name="lastName" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("email")} *
        </label>
        <Input name="email" type="email" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("country")} *
        </label>
        <Input name="country" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("organization")}
        </label>
        <Input name="organization" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("position")}
        </label>
        <Input name="position" />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>
      )}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "..." : t("submit")}
      </Button>
    </form>
  );
}
