import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import path from "path";
import fs from "fs/promises";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

async function dirStats(dir: string) {
  try {
    const entries = await fs.readdir(dir);
    let bytes = 0;
    let count = 0;
    for (const name of entries) {
      try {
        const stat = await fs.stat(path.join(dir, name));
        if (stat.isFile()) { bytes += stat.size; count++; }
      } catch { /* skip */ }
    }
    return { count, bytes };
  } catch {
    return { count: 0, bytes: 0 };
  }
}

function fmtBytes(b: number) {
  if (b === 0) return "0 B";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function SettingsPage() {
  await requireAdmin();

  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const [imagesStats, docsStats] = await Promise.all([
    dirStats(path.join(uploadsRoot, "images")),
    dirStats(path.join(uploadsRoot, "documents")),
  ]);
  const totalBytes = imagesStats.bytes + docsStats.bytes;

  const settings = [
    {
      label: "Admin Key",
      value: process.env.ADMIN_KEY ? "••••••••" : "changeme (default — set ADMIN_KEY env var)",
      note: process.env.ADMIN_KEY ? "Set via ADMIN_KEY environment variable." : "⚠️ Using default key. Set ADMIN_KEY in production.",
      warn: !process.env.ADMIN_KEY,
    },
    {
      label: "Admin Email",
      value: process.env.ADMIN_EMAIL ?? "borispabsec@gmail.com (default)",
      note: "Receives new registration request alerts. Set via ADMIN_EMAIL env var.",
      warn: false,
    },
    {
      label: "App URL",
      value: process.env.NEXT_PUBLIC_APP_URL ?? "https://pabsecevents.org (default)",
      note: "Used in email links. Set via NEXT_PUBLIC_APP_URL env var.",
      warn: false,
    },
    {
      label: "Resend API Key",
      value: process.env.RESEND_API_KEY ? "••••••••••• (set)" : "Not configured — emails will not be sent",
      note: process.env.RESEND_API_KEY ? "Email delivery active." : "⚠️ Set RESEND_API_KEY to enable email delivery.",
      warn: !process.env.RESEND_API_KEY,
    },
    {
      label: "Database",
      value: process.env.DATABASE_URL ? "Connected (DATABASE_URL set)" : "⚠️ DATABASE_URL not set",
      note: "PostgreSQL connection via Prisma.",
      warn: !process.env.DATABASE_URL,
    },
    {
      label: "JWT Secret",
      value: process.env.JWT_SECRET ? "Set" : "⚠️ JWT_SECRET not set — using fallback (insecure in production)",
      note: "Used for session token signing. Set JWT_SECRET in production.",
      warn: !process.env.JWT_SECRET,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-gold">Configuration</span>
        </div>
        <h1 className="text-navy text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Environment configuration and platform settings.</p>
      </div>

      {/* Storage */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Storage</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Hero Images</p>
            <p className="text-navy font-bold text-lg">{fmtBytes(imagesStats.bytes)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{imagesStats.count} file{imagesStats.count !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Documents</p>
            <p className="text-navy font-bold text-lg">{fmtBytes(docsStats.bytes)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{docsStats.count} file{docsStats.count !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-navy/5 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Uploads</p>
            <p className="text-navy font-bold text-lg">{fmtBytes(totalBytes)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{imagesStats.count + docsStats.count} files total</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-300 mt-3">
          Hero images: auto-cleanup keeps the {10} newest events only.
          Files are deleted automatically when an event is deleted.
        </p>
      </div>

      {/* Environment */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-8" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {settings.map((s) => (
          <div key={s.label} className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                <p className={`text-sm font-mono font-medium ${s.warn ? "text-red-600" : "text-navy"}`}>{s.value}</p>
                <p className={`text-xs mt-1 ${s.warn ? "text-amber-600" : "text-gray-400"}`}>{s.note}</p>
              </div>
              {s.warn && (
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Required Environment Variables</p>
        <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs text-gray-600 space-y-1">
          <p><span className="text-navy font-bold">ADMIN_KEY</span>=your-secret-admin-key</p>
          <p><span className="text-navy font-bold">ADMIN_EMAIL</span>=admin@yourorg.org</p>
          <p><span className="text-navy font-bold">JWT_SECRET</span>=your-jwt-secret-32-chars-min</p>
          <p><span className="text-navy font-bold">RESEND_API_KEY</span>=re_xxxxxxxxxxxxxxxx</p>
          <p><span className="text-navy font-bold">DATABASE_URL</span>=postgresql://user:pass@host/db</p>
          <p><span className="text-navy font-bold">NEXT_PUBLIC_APP_URL</span>=https://pabsecevents.org</p>
        </div>
      </div>
    </div>
  );
}
