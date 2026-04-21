import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PABSEC Events Platform",
  description:
    "Parliamentary Assembly of the Black Sea Economic Cooperation – official events and meetings platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
