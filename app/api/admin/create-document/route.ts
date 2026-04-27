import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (req.cookies.get("admin_session")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { eventId, locale, category, title, fileUrl, visibility } = body as Record<string, string>;

    if (!eventId || !locale || !category || !title || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!["en", "ru", "tr"].includes(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const doc = await db.eventDocument.create({
      data: {
        eventId,
        locale: locale as "en" | "ru" | "tr",
        category,
        title,
        fileUrl,
        visibility: visibility ?? "public",
      },
    });

    return NextResponse.json({ id: doc.id });
  } catch (err) {
    console.error("[create-document]", err);
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}
