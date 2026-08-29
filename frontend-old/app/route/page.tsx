"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MobileShell } from "@/components/common/MobileShell";
import { WariVaaniNavbar } from "@/components/nav/WariVaaniNavbar";
import { 
  ArrowLeft, 
  Flag, 
  Bell, 
  Footprints, 
  Compass, 
  Plus, 
  Minus, 
  Crosshair, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  ArrowRight 
} from "lucide-react";

export default function LiveWariRoutePage() {
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <MobileShell className="justify-between">
      {/* Top Bar Header */}
      <header className="px-4 pt-5 pb-2 flex items-center justify-between relative z-10">
        <Link
          href="/home"
          className="w-9 h-9 rounded-full bg-[#F5E6CD] border border-[#E2CDAA] text-[#4A2411] flex items-center justify-center shadow-sm hover:bg-[#EBDAB7] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-2 text-[#290F05] font-serif font-black text-2xl">
          <Flag className="w-6 h-6 fill-[#C2410C] text-[#C2410C]" />
          <span>वारी</span>
        </div>

        <button className="w-9 h-9 rounded-full bg-[#F5E6CD] border border-[#E2CDAA] text-[#4A2411] flex items-center justify-center shadow-sm hover:bg-[#EBDAB7] transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-2 space-y-3.5 relative z-10 flex-1 overflow-y-auto">
        
        {/* Stats Card 1: 今日 Wari Overview */}
        <div className="bg-[#FFF8EE] border-2 border-[#E5D1B3] rounded-[24px] p-3.5 shadow-sm flex items-center justify-between">
          {/* Today's Journey */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#C2410C]">
              <Flag className="w-4 h-4 fill-[#C2410C] text-[#C2410C]" />
              <span>आजची वारी</span>
            </div>
            <div className="text-3xl font-black text-[#290F05] font-sans mt-0.5">
              12.4 <span className="text-sm font-bold text-[#78350F]">km</span>
            </div>
            <p className="text-[10px] font-bold text-[#78350F]">आजचा प्रवास</p>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-9 bg-[#E5D1B3] mx-3" />

          {/* Distance to Halt */}
          <div className="flex-1 pl-2">
            <div className="flex items-center gap-1 text-xs font-black text-[#C2410C]">
              <Footprints className="w-4 h-4 text-[#DA9B26]" />
              <span>मुक्कामाकडे</span>
            </div>
            <div className="text-3xl font-black text-[#C2410C] font-sans mt-0.5">
              4.6 <span className="text-sm font-bold text-[#78350F]">km</span>
            </div>
          </div>
        </div>

        {/* Card 2: Interactive GIS Route Map Container */}
        <div className="relative w-full h-72 bg-[#EFE8D5] border-2 border-[#E5D1B3] rounded-[24px] overflow-hidden shadow-inner flex flex-col justify-between p-3">
          {/* Top Left Compass Rose */}
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 border border-[#E5D1B3] flex items-center justify-center text-red-700 shadow-sm z-10">
            <Compass className="w-5 h-5 text-red-700" />
          </div>

          {/* Top Right Next Halt Tag */}
          <div className="absolute top-2 right-2 text-right bg-white/90 px-3 py-1 rounded-xl border border-[#E5D1B3] shadow-sm z-10">
            <span className="text-[9px] font-bold text-[#78350F] block">पुढचा मुक्काम</span>
            <span className="text-xs font-black text-[#290F05]">माळशिरस</span>
          </div>

          {/* SVG Map Canvas matching Photo 4 */}
          <div className="relative w-full h-full my-auto flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 320 200">
              {/* Topographic River / Road background lines */}
              <path d="M 10 170 Q 80 130 160 150 T 310 100" stroke="#CBD5E1" strokeWidth="5" fill="none" />
              <path d="M 20 70 Q 120 110 220 80 T 300 30" stroke="#93C5FD" strokeWidth="4" fill="none" opacity="0.6" />

              {/* Palkhi Route Orange Line */}
              <path
                d="M 30 165 L 70 140 L 110 135 L 155 110 L 200 85 L 260 55"
                stroke="#EA580C"
                strokeWidth="4"
                strokeDasharray="6 3"
                fill="none"
              />

              {/* Start Point */}
              <g transform="translate(30, 165)">
                <circle r="6" fill="#15803D" />
                <text x="-10" y="18" fontSize="8" fontWeight="bold" fill="#166534">सुरवात</text>
              </g>

              {/* Loni Kalbhor */}
              <g transform="translate(70, 140)">
                <circle r="4" fill="#EA580C" />
                <text x="-25" y="-8" fontSize="8" fontWeight="bold" fill="#78350F">लोणी काळभोर</text>
              </g>

              {/* Yawat */}
              <g transform="translate(110, 135)">
                <circle r="4" fill="#EA580C" />
                <text x="-10" y="14" fontSize="8" fontWeight="bold" fill="#78350F">यवत</text>
              </g>

              {/* Active Palkhi Location Pin */}
              <g transform="translate(155, 110)">
                <circle r="14" fill="#3B82F6" fillOpacity="0.3" className="animate-ping" />
                <circle r="9" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2" />
                <text x="-35" y="-16" fontSize="8" fontWeight="extrabold" fill="#991B1B">पालखी सध्या येथे</text>
                <rect x="-35" y="-13" width="70" height="13" rx="3" fill="#FEF3C7" stroke="#F59E0B" />
                <text x="0" y="-4" fontSize="8" fontWeight="black" textAnchor="middle" fill="#78350F">माळशिरसजवळ</text>
              </g>

              {/* Baramati */}
              <g transform="translate(180, 145)">
                <circle r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="-15" y="14" fontSize="8" fontWeight="bold" fill="#1E3A8A">बारामती</text>
              </g>

              {/* Destination Halt: Malshiras */}
              <g transform="translate(260, 55)">
                <circle r="8" fill="#B45309" stroke="#FFFFFF" strokeWidth="2" />
                <text x="0" y="-3" fontSize="8" textAnchor="middle">🛕</text>
                <text x="10" y="14" fontSize="9" fontWeight="black" fill="#78350F">माळशिरस</text>
              </g>
            </svg>

            {/* Right Zoom Buttons */}
            <div className="absolute right-2 bottom-10 flex flex-col gap-1 z-10">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
                className="w-7 h-7 bg-white border border-[#E5D1B3] rounded-lg flex items-center justify-center text-[#4A2411] font-bold shadow-sm hover:bg-[#F5E6CD]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
                className="w-7 h-7 bg-white border border-[#E5D1B3] rounded-lg flex items-center justify-center text-[#4A2411] font-bold shadow-sm hover:bg-[#F5E6CD]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Right "My Location" Button */}
            <button className="absolute right-2 bottom-2 bg-white border border-[#E5D1B3] px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] font-bold text-[#290F05] shadow-md hover:bg-[#F5E6CD] z-10">
              <Crosshair className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>माझे ठिकाण</span>
            </button>
          </div>
        </div>

        {/* Card 3: Live Status Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#FFF8EE] via-[#FAF3E7] to-[#F5E6CD]/60 border border-[#E5D1B3] rounded-2xl p-3 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-white" />
              <h3 className="text-base font-black text-[#290F05]">
                पालखी सध्या <span className="text-emerald-700">माळशिरसजवळ</span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#78350F] mt-0.5">
              <span>🛕</span>
              <span>पुढचा मुक्काम • <strong>माळशिरस</strong></span>
            </div>
          </div>

          <div className="text-xl">🛺</div>
        </div>

        {/* Card 4: Timeline ("आजचा प्रवास") */}
        <div className="bg-[#FFF8EE] border border-[#E5D1B3] rounded-2xl p-3.5 space-y-2.5 shadow-sm">
          <h3 className="text-sm font-black text-[#290F05]">आजचा प्रवास</h3>

          <div className="space-y-3.5 pl-1 relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-[#E5D1B3]" />

            {/* Step 1 */}
            <div className="flex items-start gap-3 relative z-10">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-black text-[#290F05]">सुरवात</div>
                <div className="text-[10px] font-bold text-emerald-700">आजचा प्रारंभ पूर्ण</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-4 h-4 rounded-full bg-[#EA580C] border-2 border-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div>
                <div className="text-xs font-black text-[#EA580C]">सध्याचे ठिकाण</div>
                <div className="text-xs font-black text-[#290F05]">माळशिरसजवळ</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 relative z-10">
              <Circle className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#78350F]">पुढचा मुक्काम</div>
                  <div className="text-xs font-black text-[#290F05]">माळशिरस</div>
                </div>
                <span className="text-[10px] font-extrabold text-[#C2410C] bg-[#F5E6CD] px-2 py-0.5 rounded-full border border-[#E5D1B3]">
                  4.6 km बाकी
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 relative z-10 opacity-60">
              <Circle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-stone-700">पुढील टप्पा</div>
                <div className="text-[10px] font-semibold text-stone-500">आगेचा प्रवास सुरु राहील</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: View Full Route CTA */}
        <Link
          href="/app/palkhi"
          className="bg-white border border-[#E5D1B3] rounded-2xl p-3 flex items-center justify-between shadow-sm hover:bg-[#FFF8EE] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5E6CD] text-[#78350F] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-[#290F05]">संपूर्ण मार्ग पहा</div>
              <div className="text-[10px] font-bold text-[#78350F]">देहू ते पंढरपूर संपूर्ण वारी मार्ग</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#C2410C]" />
        </Link>
      </main>

      {/* Bottom Navigation */}
      <WariVaaniNavbar />
    </MobileShell>
  );
}
