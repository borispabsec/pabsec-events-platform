export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification");
    return true;
  }
  if (!token) {
    console.warn("[turnstile] empty token received");
    return false;
  }

  // Log key prefix + length to catch encoding issues without exposing the full key
  console.log(
    `[turnstile] secret prefix="${secret.slice(0, 10)}" len=${secret.length} | token len=${token.length}`
  );

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body }
    );
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    console.log("[turnstile] siteverify →", data.success, data["error-codes"] ?? []);
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] siteverify error:", err);
    return false;
  }
}
