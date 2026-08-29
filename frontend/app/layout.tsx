import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "वारीवाणी | WariVaani Mobile Platform",
  description: "वारीच्या वाटेवर, वारीवाणी तुमच्या सोबती. Palkhi route tracking, Devotee support & Voice assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr" className="h-full bg-[#351000] text-gray-900">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full flex items-center justify-center bg-[#2d1603] p-0 md:p-6 overflow-x-hidden antialiased">
        {/* Desktop Container Wrapper */}
        <div className="w-full h-full max-w-[430px] max-h-[932px] md:h-[844px] md:rounded-[36px] bg-[#fdf5e6] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border-0 md:border-[8px] md:border-[#522906] overflow-hidden relative flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
