import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs/promises";

const ALLOWED_EXTS = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(req: NextRequest) {
  // Check admin session
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 100 MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json(
        { error: `File type not allowed. Accepted: ${ALLOWED_EXTS.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate unique filename preserving original name (sanitized)
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");
    const filename = `${Date.now()}-${safeName}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/documents/${filename}`;
    console.log(`[upload] Document uploaded: ${filename} (${(file.size / 1024).toFixed(1)} KB)`);

    return NextResponse.json({
      url,
      filename: file.name,
      size: file.size,
    });
  } catch (err) {
    console.error("[upload] Document upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
