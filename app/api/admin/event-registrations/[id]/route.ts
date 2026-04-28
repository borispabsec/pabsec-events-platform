import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  sendEventRegistrationApproved,
  sendEventRegistrationChangesRequested,
} from "@/lib/email";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "1";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, adminNotes, hotelAssigned, isVip } = body;

  const existing = await db.eventRegistration.findUnique({
    where: { id },
    include: {
      event: { select: { translations: { where: { locale: "en" }, select: { title: true } } } },
    },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.eventRegistration.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
      ...(hotelAssigned !== undefined && { hotelAssigned }),
      ...(isVip !== undefined && { isVip }),
    },
  });

  const referenceNumber = `REG-${id.slice(0, 8).toUpperCase()}`;
  const eventTitle = existing.event.translations[0]?.title ?? "PABSEC Event";

  if (status === "approved" && existing.status !== "approved") {
    await sendEventRegistrationApproved({
      to: existing.email,
      firstName: existing.firstName,
      lastName: existing.lastName,
      referenceNumber,
      eventTitle,
      hotelInfo: hotelAssigned ?? existing.hotelAssigned ?? undefined,
    });
  }

  if (status === "changes_requested" && existing.status !== "changes_requested") {
    await sendEventRegistrationChangesRequested({
      to: existing.email,
      firstName: existing.firstName,
      lastName: existing.lastName,
      referenceNumber,
      eventTitle,
      notes: adminNotes ?? "",
    });
  }

  return NextResponse.json(updated);
}
