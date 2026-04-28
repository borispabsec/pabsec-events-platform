import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const country = searchParams.get("country") ?? undefined;
  const role = searchParams.get("role") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const where: Record<string, unknown> = {};
  if (eventId) where.eventId = eventId;
  if (status && status !== "all") where.status = status;
  if (country && country !== "all") where.country = country;
  if (role && role !== "all") where.participantRole = role;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const registrations = await db.eventRegistration.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    include: {
      event: {
        select: {
          slug: true,
          translations: { where: { locale: "en" }, select: { title: true } },
        },
      },
    },
  });

  return NextResponse.json(registrations);
}
