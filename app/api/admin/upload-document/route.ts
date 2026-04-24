import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const ALLOWED_EXTS = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(req: NextRequest) {
  // Read cookie directly from request (more reliable in route handlers)
  const sessionCookie = req.cookies.get("admin_session")?.value;

  // Debug: log all cookies received
  const allCookies = [...req.cookies.getAll()].map((c) => `${c.name}=${c.value}`).join("; ");
  console.log(`[upload] Cookies received: ${allCookies || "(none)"}`);
  console.log(`[upload] admin_session value: "${sessionCookie ?? "(missing)"}"`);

  if (sessionCookie !== "1") {
    console.warn("[upload] Unauthorized — admin_session missing or wrong value");
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

    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");
    const filename = `${Date.now()}-${safeName}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/documents/${filename}`;
    console.log(`[upload] Document saved: ${filename} (${(file.size / 1024).toFixed(1)} KB)`);

    return NextResponse.json({ url, filename: file.name, size: file.size });
  } catch (err) {
    console.error("[upload] Error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
