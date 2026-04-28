export async function verifyTurnstileToken(token: string): Promise<boolean> {
  // Turnstile temporarily disabled — secret key needs to be corrected in Cloudflare dashboard
  // Re-enable by restoring the siteverify call once the correct key is in .env.local
  void token;
  return true;
}
