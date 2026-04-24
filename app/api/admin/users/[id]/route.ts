import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendRegistrationApproved, sendRegistrationRejected } from "@/lib/email";

function checkKey(req: NextRequest): boolean {
  const key = req.nextUrl.searchParams.get("key");
  return key === (process.env.ADMIN_KEY ?? "changeme");
}

const approveSchema = z.object({
  action: z.literal("approve"),
  notes: z.string().optional(),
});

const rejectSchema = z.object({
  action: z.literal("reject"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

const bodySchema = z.union([approveSchema, rejectSchema]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkKey(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const user = await db.authUser.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (parsed.data.action === "approve") {
    // Try to find photo on pabsec.org
    let photoUrl: string | null = user.photoUrl;
    if (!photoUrl) {
      try {
        const { findMemberPhoto } = await import("@/lib/services/pabsec-data");
        const found = await findMemberPhoto(user.firstName, user.lastName);
        if (found) photoUrl = found;
      } catch {
        // Photo lookup is best-effort
      }
    }

    const updated = await db.authUser.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: "admin",
        photoUrl: photoUrl ?? user.uploadedPhotoUrl,
        adminNotes: parsed.data.notes ?? null,
      },
    });

    sendRegistrationApproved({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }).catch(console.error);

    return NextResponse.json({ success: true, user: updated });
  }

  if (parsed.data.action === "reject") {
    const data = parsed.data as z.infer<typeof rejectSchema>;
    const updated = await db.authUser.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminNotes: data.notes ?? null,
      },
    });

    sendRegistrationRejected({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      reason: data.reason,
    }).catch(console.error);

    return NextResponse.json({ success: true, user: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
