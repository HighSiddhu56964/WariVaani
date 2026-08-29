"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/common/MobileShell";
import { WariVaaniLogo } from "@/components/common/WariVaaniLogo";
import { Footprints } from "lucide-react";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <MobileShell className="justify-between">
      {/* Background Vitthal Watermark & Tree Branch Decorative Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" suppressHydrationWarning>
        {/* Top Left Leaf Branch Silhouette */}
        <div className="absolute -top-4 -left-4 w-32 h-32 opacity-25 bg-[radial-gradient(#15803D_2px,transparent_2px)] [background-size:16px_16px]" suppressHydrationWarning />
        
        {/* Upper Center Vitthal Faint Watermark */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-80 opacity-[0.07] border-2 border-amber-900 rounded-t-full flex items-center justify-center" suppressHydrationWarning>
          <div className="text-center font-serif text-9xl font-black text-amber-900" suppressHydrationWarning>वि</div>
        </div>

        {/* Flying Birds Silhouette */}
        <div className="absolute top-20 right-6 opacity-30 text-amber-950 text-xs tracking-widest" suppressHydrationWarning>
          🕊️ 🕊️
        </div>
      </div>

      {/* Top Banner Header */}
      <header className="relative z-10 w-full pt-8 pb-3 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-[#3E1F09]">
          <span className="text-[#DA9B26]">॥</span>
          <span>राम कृष्ण हरी</span>
          <span className="text-[#DA9B26]">॥</span>
        </div>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#DA9B26]/60 to-transparent mx-auto mt-1" />
      </header>

      {/* Main Logo & Loading Spinner */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center my-auto cursor-pointer" onClick={() => router.push("/login")}>
        {/* Exact WariVaani Logo Component */}
        <WariVaaniLogo showTagline={true} size="lg" />

        {/* Circular Loading Spinner */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Spinning Ring */}
            <div className="w-10 h-10 rounded-full border-2 border-[#E5D1B3] border-t-[#DA9B26] animate-spin" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-ping" />
          </div>

          <p className="text-xs font-bold text-[#5C2406] tracking-wide animate-pulse">
            वारीची वाट खुलत आहे...
          </p>
        </div>
      </main>

      {/* Bottom Procession Illustration & Sanctum Footer Banner */}
      <footer className="relative z-10 w-full mt-auto">
        {/* Warkari Procession Background Illustration Box */}
        <div className="relative w-full h-36 overflow-hidden flex items-end justify-center px-4">
          <div className="absolute inset-0 bg-gradient-to-t from-[#F5E6CD]/90 via-[#FAF5EB]/50 to-transparent pointer-events-none z-10" />

          {/* SVG Silhouette representation of Warkaris walking to Pandharpur Temple */}
          <div className="relative z-0 w-full flex items-end justify-between px-2 pb-1 opacity-85">
            {/* Pilgrims with Flags */}
            <div className="flex items-end gap-2 text-[#4A1D07]">
              <div className="flex flex-col items-center">
                <div className="w-2 h-7 bg-[#EA580C] -mb-1 transform -rotate-12" />
                <div className="w-4 h-10 bg-[#3E1F09] rounded-t-sm" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-8 bg-[#EA580C] -mb-1 transform -rotate-6" />
                <div className="w-5 h-12 bg-[#4A1D07] rounded-t-md" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-9 bg-[#EA580C] -mb-1" />
                <div className="w-5 h-14 bg-[#290F05] rounded-t-md" />
              </div>
            </div>

            {/* Pandharpur Temple Tower Silhouette */}
            <div className="flex flex-col items-center text-[#78350F]">
              <div className="w-2 h-4 bg-[#DA9B26] rounded-t-sm" />
              <div className="w-8 h-12 bg-[#92400E] rounded-t-md" />
              <div className="w-16 h-10 bg-[#451A03] rounded-t-xl" />
            </div>
          </div>
        </div>

        {/* Curved Maroon Sanctum Footer Bar */}
        <div className="w-full bg-gradient-to-r from-[#3E0A03] via-[#5C1105] to-[#3E0A03] text-[#FDE68A] py-3.5 px-4 text-center rounded-t-[28px] shadow-2xl border-t-2 border-[#DA9B26]/60 flex items-center justify-center gap-3">
          <Footprints className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-emerald-400 text-xs">🌿</span>

          <span className="text-sm font-black tracking-widest font-serif">
            ॥ जय हरी विठ्ठल ॥
          </span>

          <span className="text-emerald-400 text-xs">🌿</span>
          <Footprints className="w-4 h-4 text-[#F59E0B]" />
        </div>
      </footer>
    </MobileShell>
  );
}
