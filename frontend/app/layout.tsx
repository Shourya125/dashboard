import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Internal Dashboard for Varahe",
};

import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        <AuthProvider>
          <ThemeProvider>
            <ProtectedRoute>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
            </ProtectedRoute>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
