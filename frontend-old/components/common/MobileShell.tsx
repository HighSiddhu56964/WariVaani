"use client";

import React from "react";

interface MobileShellProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileShell({ children, className = "" }: MobileShellProps) {
  return (
    <div
      className="min-h-screen w-full bg-stone-900 flex items-center justify-center p-0 sm:py-6 select-none font-sans"
      suppressHydrationWarning
    >
      <div
        className={`w-full max-w-[430px] min-h-screen sm:min-h-[844px] sm:h-[844px] bg-[#FAF5EB] text-amber-950 sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] sm:border-[8px] sm:border-stone-800 relative overflow-y-auto overflow-x-hidden flex flex-col ${className}`}
        suppressHydrationWarning
      >
        {children}
      </div>
    </div>
  );
}
