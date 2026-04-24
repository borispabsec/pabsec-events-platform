import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "../globals.css";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Admin — PABSEC Events",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const authenticated = cookieStore.get("admin_session")?.value === "1";

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans">
        {authenticated ? (
          <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 min-w-0 overflow-auto">
              {children}
            </main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
