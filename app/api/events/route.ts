import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locale = (searchParams.get("locale") ?? "en") as "en" | "ru" | "tr";
  const status = searchParams.get("status");

  const events = await db.event.findMany({
    where: status ? { status: status as "PUBLISHED" } : { status: "PUBLISHED" },
    include: { translations: { where: { locale } } },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(events);
}
