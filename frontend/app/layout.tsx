import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../components/common/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WariVaani (वारीवाणी) - Pandharpur Wari AI Assistance",
  description: "AI-powered voice-first assistance platform for the Pandharpur Wari pilgrims",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WariVaani",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} style={{ colorScheme: "light dark" }} suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans text-foreground" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
