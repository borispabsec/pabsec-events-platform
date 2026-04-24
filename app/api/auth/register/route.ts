import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import {
  sendRegistrationReceived,
  sendAdminNewRequest,
} from "@/lib/email";

const PABSEC_ROLES = [
  "President of PABSEC",
  "Vice-President of PABSEC",
  "Member of PABSEC Bureau",
  "Member of Standing Committee",
  "Member of PABSEC",
  "Secretary of National Delegation",
  "Member of International Secretariat",
] as const;

const PABSEC_COUNTRIES = [
  "Albania", "Armenia", "Azerbaijan", "Bulgaria", "Georgia",
  "Greece", "Moldova", "North Macedonia", "Romania", "Russia",
  "Serbia", "Türkiye", "Ukraine", "International Secretariat",
] as const;

const schema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/, "Username may only contain letters, numbers, dots, hyphens, underscores"),
  password: z.string().min(8).max(128),
  country: z.enum(PABSEC_COUNTRIES),
  role: z.enum(PABSEC_ROLES),
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let fields: Record<string, string> = {};
    let photoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (key === "photo" && value instanceof File && value.size > 0) {
          photoFile = value;
        } else if (typeof value === "string") {
          fields[key] = value;
        }
      }
    } else {
      fields = await req.json();
    }

    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, username, password, country, role } = parsed.data;

    // Check uniqueness
    const existing = await db.authUser.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    });
    if (existing?.email === email) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    if (existing?.username === username) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    // Save uploaded photo
    let uploadedPhotoUrl: string | null = null;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const allowed = ["jpg", "jpeg", "png", "webp"];
      if (!allowed.includes(ext)) {
        return NextResponse.json({ error: "Photo must be JPG, PNG or WebP" }, { status: 400 });
      }
      if (photoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Photo must be under 5 MB" }, { status: 400 });
      }
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
      await fs.mkdir(uploadDir, { recursive: true });
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      uploadedPhotoUrl = `/uploads/profiles/${filename}`;
    }

    const passwordHash = await hashPassword(password);

    const user = await db.authUser.create({
      data: {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        country,
        role,
        uploadedPhotoUrl,
        status: "PENDING",
      },
    });

    // Fire emails — awaited but errors are handled inside send()
    await Promise.all([
      sendRegistrationReceived({ to: email, firstName, lastName }),
      sendAdminNewRequest({ firstName, lastName, country, role, email, userId: user.id }),
    ]);

    return NextResponse.json({ success: true, message: "Registration submitted" }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
