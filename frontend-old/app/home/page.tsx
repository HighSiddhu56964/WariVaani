"use client";

import React from "react";
import Link from "next/link";
import { MobileShell } from "@/components/common/MobileShell";
import { WariVaaniNavbar } from "@/components/nav/WariVaaniNavbar";
import { 
  Flag, 
  MapPin, 
  BookOpen, 
  Plus, 
  Droplet, 
  LifeBuoy, 
  Megaphone, 
  ArrowRight, 
  User 
} from "lucide-react";

export default function WarkariHomePage() {
  return (
    <MobileShell className="justify-between">
      {/* Top Header Sanctum & User Profile Bar */}
      <header className="px-5 pt-5 pb-2 flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-1 text-xs font-black text-[#C2410C]">
            <span>•॥</span>
            <span>जय हरी विठ्ठल</span>
            <span>॥•</span>
          </div>

          <h1 className="text-3xl font-black text-[#290F05] font-serif mt-1">
            नमस्कार, गणेश
          </h1>
          <p className="text-xs font-bold text-[#652809]/80 mt-0.5">
            वारीवाणी तुमच्या सोबत आहे.
          </p>
        </div>

        {/* User Profile Avatar Circle */}
        <Link
          href="/app/profile"
          className="w-11 h-11 rounded-full bg-[#F5E6CD] border border-[#E2CDAA] text-[#4A2411] flex items-center justify-center shadow-sm hover:bg-[#EBDAB7] transition-colors"
        >
          <User className="w-5 h-5 fill-[#4A2411]" />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-2 space-y-4 relative z-10 flex-1 overflow-y-auto">
        
        {/* Card 1: आजची वारी (Today's Wari Card) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF8EE] via-[#FAF3E7] to-[#F5E6CD]/40 border-2 border-[#E5D1B3] rounded-[24px] p-4 shadow-md">
          {/* Background Illustration overlay */}
          <div className="absolute right-0 bottom-0 w-36 h-28 opacity-25 pointer-events-none bg-[radial-gradient(#EA580C_1px,transparent_1px)] [background-size:10px_10px]" />

          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-5 h-5 text-[#C2410C] fill-[#C2410C]" />
            <h3 className="text-xl font-black text-[#C2410C] font-serif">आजची वारी</h3>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-4xl font-black text-[#290F05] font-sans">
                12.4 <span className="text-lg font-bold text-[#78350F]">km</span>
              </div>
              <p className="text-[11px] font-bold text-[#78350F]/90 mt-0.5">आजचा प्रवास</p>
            </div>

            {/* View Route Button */}
            <Link
              href="/route"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF8EE] border border-[#E5D1B3] text-[#4A2411] font-bold text-xs shadow-sm hover:bg-[#F5E6CD] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#C2410C]" />
              <span>मार्ग पहा</span>
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-[#E5D1B3] rounded-full my-3 overflow-hidden flex items-center">
            <div className="w-2/3 h-full bg-gradient-to-r from-[#D97706] to-[#EA580C] rounded-full" />
            <div className="absolute left-[65%] w-3.5 h-3.5 rounded-full bg-[#EA580C] border-2 border-white shadow" />
          </div>

          {/* Next Halt Indicator */}
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#451A03]">
            <span className="text-base">🛕</span>
            <span>पुढचा मुक्काम: <strong className="text-[#290F05] font-black">माळशिरस</strong></span>
          </div>
        </div>

        {/* Card 2: वारी सध्या कुठे आहे? (Where is Wari right now?) */}
        <div className="bg-[#FFF8EE] border-2 border-[#E5D1B3] rounded-[24px] overflow-hidden shadow-sm space-y-2">
          <div className="p-3.5 pb-1 flex items-center gap-2 text-[#4A2411] font-extrabold text-base">
            <MapPin className="w-5 h-5 text-[#C2410C] fill-[#C2410C]" />
            <span>वारी सध्या कुठे आहे?</span>
          </div>

          {/* Route Schematic Box */}
          <div className="px-3">
            <div className="w-full h-24 bg-[#F2E8D5] rounded-xl border border-[#E5D1B3] p-2 flex items-center justify-between relative overflow-hidden">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#78350F]">बारामती</span>
                <div className="w-2.5 h-2.5 rounded-full bg-[#D97706] mt-1" />
              </div>

              {/* Dotted Line */}
              <div className="flex-1 mx-2 border-b-2 border-dashed border-[#D97706] relative flex items-center justify-center">
                {/* Active Palkhi Temple Pin */}
                <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-md border-2 border-white">
                  <span className="text-xs">🛕</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs font-black text-[#290F05] bg-[#F5E6CD] px-2 py-0.5 rounded-full border border-[#E5D1B3]">
                  माळशिरस
                </span>
              </div>

              <div className="flex-1 mx-2 border-b-2 border-dashed border-[#D4B886] opacity-60" />

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#78350F]">पंढरपूर</span>
                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#C2410C] bg-white mt-1" />
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <Link
            href="/route"
            className="w-full py-2.5 bg-[#FFF8EE] border-t border-[#E5D1B3] text-[#C2410C] font-extrabold text-xs flex items-center justify-center gap-1 hover:bg-[#F5E6CD]/50 transition-colors"
          >
            <span>नकाशा उघडा</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Section 3: त्वरित मदत (Quick Assistance) */}
        <div className="space-y-2">
          <h3 className="text-sm font-black text-[#290F05]">
            त्वरित मदत
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {/* Medical */}
            <Link
              href="/app/medical"
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#FFF8EE] border border-[#E5D1B3] shadow-sm hover:bg-red-50/40 transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1 shadow-inner">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-[#290F05]">मेडिकल</span>
            </Link>

            {/* Water */}
            <Link
              href="/app/medical"
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#FFF8EE] border border-[#E5D1B3] shadow-sm hover:bg-blue-50/40 transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1 shadow-inner">
                <Droplet className="w-5 h-5 fill-blue-600" />
              </div>
              <span className="text-xs font-bold text-[#290F05]">पाणी</span>
            </Link>

            {/* Toilet */}
            <Link
              href="/app/medical"
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#FFF8EE] border border-[#E5D1B3] shadow-sm hover:bg-emerald-50/40 transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 shadow-inner">
                <span className="text-base">🚽</span>
              </div>
              <span className="text-xs font-bold text-[#290F05]">शौचालय</span>
            </Link>

            {/* Help / Emergency */}
            <Link
              href="/app/missing-person"
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#FFF8EE] border border-[#E5D1B3] shadow-sm hover:bg-orange-50/40 transition-all active:scale-95 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-1 shadow-inner">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#290F05]">मदत</span>
            </Link>
          </div>
        </div>

        {/* Section 4: आजची सूचना (Notice Banner) */}
        <div className="bg-gradient-to-r from-[#FFF8EE] to-[#F5E6CD]/60 border border-[#E5D1B3] rounded-2xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-black text-[#EA580C] uppercase tracking-wide">
                आजची सूचना
              </div>
              <p className="text-xs font-bold text-[#4A2411] mt-0.5">
                पुढील मार्गावर गर्दी आहे.
              </p>
            </div>
          </div>

          <button className="w-8 h-8 rounded-full bg-white border border-[#E5D1B3] flex items-center justify-center text-[#4A2411] shadow-sm hover:bg-[#F5E6CD] transition-colors">
            <ArrowRight className="w-4 h-4 text-[#C2410C]" />
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <WariVaaniNavbar />
    </MobileShell>
  );
}
