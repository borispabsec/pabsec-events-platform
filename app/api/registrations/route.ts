import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  eventId: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  country: z.string().min(1).max(100),
  organization: z.string().max(200).optional(),
  position: z.string().max(200).optional(),
  dietaryNeeds: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const event = await db.event.findUnique({ where: { id: parsed.data.eventId } });
  if (!event || event.status !== "PUBLISHED" || event.endDate < new Date()) {
    return NextResponse.json({ error: "Event not available for registration" }, { status: 400 });
  }

  const existing = await db.registration.findFirst({
    where: { eventId: parsed.data.eventId, email: parsed.data.email },
  });
  if (existing) {
    return NextResponse.json({ error: "Already registered" }, { status: 409 });
  }

  const registration = await db.registration.create({ data: parsed.data });
  return NextResponse.json(registration, { status: 201 });
}
