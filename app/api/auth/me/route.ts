import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const user = await db.authUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        photoUrl: true,
        uploadedPhotoUrl: true,
      },
    });
    if (!user || user.status !== "APPROVED") {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        photoUrl: user.photoUrl ?? user.uploadedPhotoUrl,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
