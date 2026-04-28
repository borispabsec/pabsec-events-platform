"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  status: string;
  adminNotes: string | null;
  hotelAssigned: string | null;
  isVip: boolean;
  onUpdated: () => void;
}

export function RegistrationRowActions({ id, status, adminNotes, hotelAssigned, isVip, onUpdated }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [hotel, setHotel] = useState(hotelAssigned ?? "");
  const [loading, setLoading] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setLoading(JSON.stringify(body));
    try {
      const res = await fetch(`/api/admin/event-registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { onUpdated(); router.refresh(); }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "approved" && (
        <button
          onClick={() => patch({ status: "approved" })}
          disabled={!!loading}
          className="px-2.5 py-1 rounded-lg bg-green-600 text-white text-[11px] font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading === JSON.stringify({ status: "approved" }) ? "…" : "Approve"}
        </button>
      )}
      {status !== "rejected" && (
        <button
          onClick={() => patch({ status: "rejected" })}
          disabled={!!loading}
          className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-[11px] font-semibold hover:bg-red-600 transition disabled:opacity-50"
        >
          {loading === JSON.stringify({ status: "rejected" }) ? "…" : "Reject"}
        </button>
      )}
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-semibold hover:bg-amber-600 transition"
      >
        Notes
      </button>
      <button
        onClick={() => patch({ isVip: !isVip })}
        disabled={!!loading}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
          isVip ? "bg-gold text-white hover:bg-gold/80" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        VIP
      </button>

      {showNotes && (
        <div className="w-full mt-2 flex flex-col gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Admin notes (visible to admin only)"
            rows={2}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold"
          />
          <input
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            placeholder="Assign hotel (e.g. Marriott Sofia)"
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-gold"
          />
          <div className="flex gap-2">
            <button
              onClick={() => patch({ adminNotes: notes, hotelAssigned: hotel, status: "changes_requested" })}
              disabled={!!loading}
              className="px-3 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-semibold hover:bg-amber-600 transition disabled:opacity-50"
            >
              Request Changes
            </button>
            <button
              onClick={() => patch({ adminNotes: notes, hotelAssigned: hotel })}
              disabled={!!loading}
              className="px-3 py-1 rounded-lg bg-navy/10 text-navy text-[11px] font-semibold hover:bg-navy/20 transition disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
