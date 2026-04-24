import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkKey(req: NextRequest): boolean {
  const key = req.nextUrl.searchParams.get("key");
  return key === (process.env.ADMIN_KEY ?? "changeme");
}

export async function GET(req: NextRequest) {
  if (!checkKey(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status");
  const users = await db.authUser.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      country: true,
      role: true,
      status: true,
      photoUrl: true,
      uploadedPhotoUrl: true,
      adminNotes: true,
      createdAt: true,
      approvedAt: true,
      approvedBy: true,
    },
  });

  return NextResponse.json({ users });
}
