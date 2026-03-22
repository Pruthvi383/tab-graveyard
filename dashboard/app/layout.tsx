import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { getSiteUrl } from "../lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Tab Graveyard",
    template: "%s | Tab Graveyard",
  },
  description: "Tab Graveyard is an AI-powered Chrome extension and web app that groups, archives, searches, and restores browser tabs as private user-owned sessions.",
  applicationName: "Tab Graveyard",
  keywords: [
    "tab manager",
    "chrome extension",
    "browser tab organizer",
    "AI tab grouping",
    "session restore",
    "productivity",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tab Graveyard",
    description: "Archive browser chaos into private, searchable sessions with AI grouping and natural-language recovery.",
    url: "/",
    siteName: "Tab Graveyard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tab Graveyard",
    description: "AI-powered tab grouping, archive, search, and restore for Chrome.",
  },
  category: "productivity",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
