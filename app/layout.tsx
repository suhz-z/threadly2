// Root layout component for the Threadly application
// This file sets up the global structure, fonts, metadata, and providers for the entire app

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/sessionproviderwrapper";
import { ThemeProviderWrapper } from "@/components/providers/themeprovider";


// Load Google Fonts for the application
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the application (used by Next.js for SEO and page title)
export const metadata: Metadata = {
  title: "Threadly",
};

// Root layout component that wraps all pages
// Provides theme and session context to the entire application
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors`}
      >
        {/* Wrap children with theme and session providers */}
        <ThemeProviderWrapper>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </ThemeProviderWrapper>

      </body>
    </html>
  );
}
