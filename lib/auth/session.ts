import { cookies } from "next/headers";
import { verifySession, type SessionPayload } from "./jwt";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "pabsec_session";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;
  // Live-fetch role and status so admin changes take effect without re-login
  const user = await db.authUser.findUnique({
    where: { id: payload.userId },
    select: { role: true, status: true },
  });
  if (!user) return null;
  return { ...payload, role: user.role, status: user.status };
}

export function cookieOptions(maxAge = 7 * 24 * 60 * 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
