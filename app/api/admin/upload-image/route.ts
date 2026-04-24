import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "avif"];
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get("admin_session")?.value;
  if (sessionCookie !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json(
        { error: `File type not allowed. Accepted: ${ALLOWED_EXTS.join(", ")}` },
        { status: 400 }
      );
    }

    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");
    const filename = `${Date.now()}-${safeName}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "images");
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/images/${filename}`;
    return NextResponse.json({ url, filename: file.name, size: file.size });
  } catch (err) {
    console.error("[upload-image] Error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
