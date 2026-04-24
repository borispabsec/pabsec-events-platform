import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/jwt";
import { SESSION_COOKIE, cookieOptions } from "@/lib/auth/session";
import { sendPasswordReset } from "@/lib/email";
import { generateToken } from "@/lib/auth/password";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 30;

const schema = z.object({
  usernameOrEmail: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { usernameOrEmail, password } = parsed.data;

    const user = await db.authUser.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account locked. Try again in ${minutesLeft} minute(s).` },
        { status: 423 }
      );
    }

    // Check status
    if (user.status === "PENDING") {
      return NextResponse.json(
        { error: "Your registration is pending administrator approval." },
        { status: 403 }
      );
    }
    if (user.status === "REJECTED") {
      return NextResponse.json(
        { error: "Your registration was not approved. Contact the Secretariat for assistance." },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      const newAttempts = user.failedLoginAttempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        const resetToken = generateToken();
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await db.authUser.update({
          where: { id: user.id },
          data: { failedLoginAttempts: newAttempts, lockedUntil, resetToken, resetTokenExpiry },
        });
        sendPasswordReset({ to: user.email, firstName: user.firstName, token: resetToken }).catch(
          console.error
        );
        return NextResponse.json(
          {
            error: `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes. A password reset link has been sent to your email.`,
          },
          { status: 423 }
        );
      }
      await db.authUser.update({
        where: { id: user.id },
        data: { failedLoginAttempts: newAttempts },
      });
      return NextResponse.json(
        { error: `Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.` },
        { status: 401 }
      );
    }

    // Reset failed attempts on success
    await db.authUser.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    const token = await signSession({
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      photoUrl: user.photoUrl ?? user.uploadedPhotoUrl,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        photoUrl: user.photoUrl ?? user.uploadedPhotoUrl,
      },
    });
    res.cookies.set(SESSION_COOKIE, token, cookieOptions());
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
