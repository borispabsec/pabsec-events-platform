import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/auth/password";
import { sendPasswordReset } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const user = await db.authUser.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      const resetToken = generateToken();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await db.authUser.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });
      sendPasswordReset({ to: user.email, firstName: user.firstName, token: resetToken }).catch(
        console.error
      );
    }

    return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
