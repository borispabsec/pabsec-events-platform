import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — emails will not be sent");
    return null;
  }
  return new Resend(key);
}

const FROM = "PABSEC Events <noreply@pabsecevents.org>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "borispabsec@gmail.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pabsecevents.org";

export async function sendRegistrationReceived(opts: {
  to: string;
  firstName: string;
  lastName: string;
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: "Registration request received – PABSEC Events",
    html: `
      <p>Dear ${opts.firstName} ${opts.lastName},</p>
      <p>Your registration request for the PABSEC Events Platform has been received.</p>
      <p>Your account is currently <strong>pending review</strong>. You will receive another email once an administrator has reviewed your request.</p>
      <p>Please allow up to 2 business days for processing.</p>
      <br/>
      <p>Best regards,<br/>PABSEC International Secretariat</p>
    `,
  });
}

export async function sendAdminNewRequest(opts: {
  firstName: string;
  lastName: string;
  country: string;
  role: string;
  email: string;
  userId: string;
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New registration request: ${opts.firstName} ${opts.lastName}`,
    html: `
      <p>A new user has requested access to the PABSEC Events Platform.</p>
      <ul>
        <li><strong>Name:</strong> ${opts.firstName} ${opts.lastName}</li>
        <li><strong>Email:</strong> ${opts.email}</li>
        <li><strong>Country:</strong> ${opts.country}</li>
        <li><strong>Role:</strong> ${opts.role}</li>
      </ul>
      <p>
        <a href="${APP_URL}/admin?key=${process.env.ADMIN_KEY ?? "changeme"}">
          Review in Admin Panel
        </a>
      </p>
    `,
  });
}

export async function sendRegistrationApproved(opts: {
  to: string;
  firstName: string;
  lastName: string;
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: "Registration approved – PABSEC Events",
    html: `
      <p>Dear ${opts.firstName} ${opts.lastName},</p>
      <p>Your registration has been <strong>approved</strong>. You can now log in to the PABSEC Events Platform.</p>
      <p><a href="${APP_URL}/en">Login to PABSEC Events</a></p>
      <br/>
      <p>Best regards,<br/>PABSEC International Secretariat</p>
    `,
  });
}

export async function sendRegistrationRejected(opts: {
  to: string;
  firstName: string;
  lastName: string;
  reason?: string;
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: "Registration not approved – PABSEC Events",
    html: `
      <p>Dear ${opts.firstName} ${opts.lastName},</p>
      <p>Unfortunately, your registration request for the PABSEC Events Platform has not been approved.</p>
      ${opts.reason ? `<p><strong>Reason:</strong> ${opts.reason}</p>` : ""}
      <p>If you believe this is an error, please contact the PABSEC Secretariat.</p>
      <br/>
      <p>Best regards,<br/>PABSEC International Secretariat</p>
    `,
  });
}

export async function sendPasswordReset(opts: {
  to: string;
  firstName: string;
  token: string;
}) {
  const resend = getResend();
  if (!resend) return;
  const resetUrl = `${APP_URL}/en/reset-password?token=${opts.token}`;
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: "Password reset – PABSEC Events",
    html: `
      <p>Dear ${opts.firstName},</p>
      <p>A password reset was requested for your account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request a reset, please ignore this email.</p>
      <br/>
      <p>Best regards,<br/>PABSEC International Secretariat</p>
    `,
  });
}
