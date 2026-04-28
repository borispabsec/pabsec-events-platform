import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { sendEventRegistrationReceived } from "@/lib/email";

const schema = z.object({
  eventId: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  title: z.string().optional(),
  position: z.string().optional(),
  institution: z.string().optional(),
  country: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  passportNationality: z.string().optional(),
  participantRole: z.string().min(1),
  isHeadOfDelegation: z.string().optional(),
  participationDates: z.string().optional(),
  committeeMeetings: z.string().optional(),
  arrivalDate: z.string().optional(),
  arrivalAirport: z.string().optional(),
  arrivalFlight: z.string().optional(),
  arrivalRoute: z.string().optional(),
  arrivalTime: z.string().optional(),
  needsTransfer: z.string().optional(),
  viaIstanbul: z.string().optional(),
  istanbulVipLounge: z.string().optional(),
  departureDate: z.string().optional(),
  departureAirport: z.string().optional(),
  departureFlight: z.string().optional(),
  departureRoute: z.string().optional(),
  departureTime: z.string().optional(),
  needsHotel: z.string().optional(),
  hotelCheckIn: z.string().optional(),
  hotelCheckOut: z.string().optional(),
  roomType: z.string().optional(),
  sharingRoom: z.string().optional(),
  hotelName: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  securityNote: z.string().optional(),
  specialRequests: z.string().optional(),
  delegationGroupId: z.string().optional(),
});

async function saveUpload(file: File, folder: string): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${filename}`;
}

function parseDate(s?: string): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const formData = await req.formData();

    const fields: Record<string, string> = {};
    let passportFile: File | null = null;
    let photoFile: File | null = null;

    for (const [key, value] of formData.entries()) {
      if (key === "passport" && value instanceof File && value.size > 0) {
        passportFile = value;
      } else if (key === "photo" && value instanceof File && value.size > 0) {
        photoFile = value;
      } else if (typeof value === "string") {
        fields[key] = value;
      }
    }

    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const event = await db.event.findUnique({
      where: { id: data.eventId },
      select: {
        id: true, status: true, registrationDeadline: true,
        translations: { where: { locale: "en" }, select: { title: true } },
      },
    });

    if (!event || event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event not available for registration" }, { status: 400 });
    }

    if (event.registrationDeadline && event.registrationDeadline < new Date()) {
      return NextResponse.json({ error: "Registration deadline has passed" }, { status: 400 });
    }

    let passportUrl: string | null = null;
    let photoUrl: string | null = null;

    if (passportFile) {
      const allowed = ["pdf", "jpg", "jpeg", "png"];
      const ext = (passportFile.name.split(".").pop() ?? "").toLowerCase();
      if (!allowed.includes(ext)) return NextResponse.json({ error: "Invalid passport file type" }, { status: 400 });
      if (passportFile.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Passport file too large (max 10MB)" }, { status: 400 });
      passportUrl = await saveUpload(passportFile, "registrations/passports");
    }

    if (photoFile) {
      const allowed = ["jpg", "jpeg", "png", "webp"];
      const ext = (photoFile.name.split(".").pop() ?? "").toLowerCase();
      if (!allowed.includes(ext)) return NextResponse.json({ error: "Invalid photo file type" }, { status: 400 });
      if (photoFile.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Photo too large (max 5MB)" }, { status: 400 });
      photoUrl = await saveUpload(photoFile, "registrations/photos");
    }

    const reg = await db.eventRegistration.create({
      data: {
        eventId: data.eventId,
        firstName: data.firstName,
        lastName: data.lastName,
        title: data.title || null,
        position: data.position || null,
        institution: data.institution || null,
        country: data.country,
        email: data.email,
        phone: data.phone || null,
        passportNationality: data.passportNationality || null,
        participantRole: data.participantRole,
        isHeadOfDelegation: data.isHeadOfDelegation === "true",
        participationDates: data.participationDates || null,
        committeeMeetings: data.committeeMeetings || null,
        arrivalDate: parseDate(data.arrivalDate) ?? null,
        arrivalAirport: data.arrivalAirport || null,
        arrivalFlight: data.arrivalFlight || null,
        arrivalRoute: data.arrivalRoute || null,
        arrivalTime: data.arrivalTime || null,
        needsTransfer: data.needsTransfer === "true",
        viaIstanbul: data.viaIstanbul === "true",
        istanbulVipLounge: data.istanbulVipLounge === "true",
        departureDate: parseDate(data.departureDate) ?? null,
        departureAirport: data.departureAirport || null,
        departureFlight: data.departureFlight || null,
        departureRoute: data.departureRoute || null,
        departureTime: data.departureTime || null,
        needsHotel: data.needsHotel === "true",
        hotelCheckIn: parseDate(data.hotelCheckIn) ?? null,
        hotelCheckOut: parseDate(data.hotelCheckOut) ?? null,
        roomType: data.roomType || null,
        sharingRoom: data.sharingRoom === "true",
        hotelName: data.hotelName || null,
        dietaryRestrictions: data.dietaryRestrictions || null,
        accessibilityNeeds: data.accessibilityNeeds || null,
        securityNote: data.securityNote || null,
        specialRequests: data.specialRequests || null,
        passportUrl,
        photoUrl,
        registeredBy: session?.userId ?? null,
        delegationGroupId: data.delegationGroupId || null,
        status: "pending",
      },
    });

    const referenceNumber = `REG-${reg.id.slice(0, 8).toUpperCase()}`;
    const eventTitle = event.translations[0]?.title ?? "PABSEC Event";

    await sendEventRegistrationReceived({
      to: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      referenceNumber,
      eventTitle,
    });

    return NextResponse.json({ success: true, id: reg.id, referenceNumber }, { status: 201 });
  } catch (err) {
    console.error("Event registration error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
