import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("file");

  if (!filename) {
    return new NextResponse("Missing file parameter", { status: 400 });
  }

  // Prevent path traversal — only allow plain filenames
  const safeName = path.basename(filename);
  if (safeName !== filename || filename.includes("..") || filename.includes("/")) {
    return new NextResponse("Invalid file name", { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", "documents", safeName);

  try {
    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=2592000",
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
