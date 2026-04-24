"use client";

import { useRef } from "react";
import { deleteUser } from "@/lib/admin/user-actions";

export function DeleteUserForm({ userId, name }: { userId: string; name: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) {
      e.preventDefault();
    }
  }

  return (
    <form ref={formRef} action={deleteUser} onSubmit={handleSubmit}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="px-3 py-1.5 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition"
      >
        Delete
      </button>
    </form>
  );
}
