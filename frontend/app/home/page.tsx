'use client';

import React from 'react';
import Link from 'next/link';
import BottomNav from '../../components/BottomNav';

export default function HomePage() {
  return (
    <div className="w-full h-full flex flex-col relative bg-[#FFF8E8] text-[#4A3219] overflow-y-auto pb-36 select-none">
      {/* Top Header */}
      <header className="relative pt-6 pb-4 px-5 flex justify-between items-start z-10 bg-gradient-to-b from-[#FCF3D7] to-transparent flex-shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[#E27730] text-sm">॥</span>
            <h1 className="text-[#E27730] font-bold text-base tracking-wide marathi-text">
              जय हरी विठ्ठल
            </h1>
            <span className="text-[#E27730] text-sm">॥</span>
          </div>
          <h2 className="text-2xl text-[#351000] font-extrabold mb-0.5 marathi-text">
            नमस्कार, गणेश
          </h2>
          <p className="text-xs text-[#554336] marathi-text font-medium">
            वारीवाणी तुमच्या सोबत आहे.
          </p>
        </div>

        <Link
          href="/profile"
          className="w-11 h-11 rounded-full bg-[#FCF3D7] shadow-sm flex items-center justify-center text-[#351000] hover:bg-[#F3E5BB] transition-colors border border-[#E9D8A6]"
        >
          <span className="material-symbols-outlined fill text-2xl">person</span>
        </Link>
      </header>

      <main className="px-5 flex flex-col gap-4 z-10 relative flex-1">
        {/* TODAY'S JOURNEY CARD */}
        <section className="bg-[#FCF3D7] rounded-2xl border border-[#E9D8A6] shadow-md p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[#E27730]">
              <span className="material-symbols-outlined fill text-xl">flag</span>
              <h3 className="font-bold text-base text-[#351000] marathi-text">आजची वारी</h3>
            </div>
            <span className="text-xs bg-[#E27730]/15 text-[#E27730] font-bold px-2.5 py-1 rounded-full marathi-text">
              लाइव्ह ट्रॅकिंग
            </span>
          </div>

          <div className="flex justify-between items-baseline mb-2">
            <div>
              <span className="text-3xl font-extrabold text-[#351000]">
                12.4 <span className="text-base font-bold text-[#554336]">km</span>
              </span>
              <p className="text-xs text-[#554336] marathi-text">आजचा पार केलेला प्रवास</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-[#E27730]">4.6 km</span>
              <p className="text-[10px] text-[#554336] marathi-text">मुक्कामाकडे बाकी</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center w-full my-3 relative">
            <div className="h-1.5 bg-[#E27730] w-2/3 rounded-l-full relative z-10"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#E27730] shadow-sm relative z-20 -ml-1"></div>
            <div className="h-1 bg-amber-200 w-1/3 rounded-r-full relative z-10"></div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E27730] fill text-2xl">
                temple_hindu
              </span>
              <div>
                <p className="text-[10px] text-[#554336] marathi-text">पुढचा मुक्काम:</p>
                <p className="text-sm font-bold text-[#351000] marathi-text">माळशिरस</p>
              </div>
            </div>

            <Link
              href="/journey"
              className="bg-[#FFF8E8] border border-[#E9D8A6] px-3 py-1.5 rounded-xl text-[#351000] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-white transition-colors marathi-text"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              मार्ग पहा
            </Link>
          </div>
        </section>

        {/* ROUTE LOCATION MAP PREVIEW CARD */}
        <section className="bg-[#FCF3D7] rounded-2xl border border-[#E9D8A6] shadow-md overflow-hidden flex flex-col">
          <div className="p-3 pb-2 flex items-center gap-2 text-[#351000]">
            <span className="material-symbols-outlined fill text-[#E27730]">location_on</span>
            <h3 className="font-bold text-base marathi-text">वारी सध्या कुठे आहे?</h3>
          </div>

          {/* Styled Interactive Route Map Preview */}
          <div className="relative w-full h-36 bg-[#E8E1D5] border-y border-[#E9D8A6]/50 p-3 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8d4b00_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="flex justify-between text-xs font-bold text-[#351000] z-10 marathi-text">
              <span className="bg-white/80 px-2 py-0.5 rounded shadow-xs">बारामती</span>
              <span className="bg-[#E27730] text-white px-2 py-0.5 rounded shadow-xs animate-pulse">
                माळशिरस (सध्या)
              </span>
              <span className="bg-white/80 px-2 py-0.5 rounded shadow-xs">पंढरपूर</span>
            </div>

            <div className="relative w-full h-10 flex items-center justify-between z-10 px-4">
              <div className="w-4 h-4 rounded-full bg-[#E27730] flex items-center justify-center text-white text-[9px] font-bold">
                ✓
              </div>
              <div className="h-1 flex-1 bg-gradient-to-r from-[#E27730] to-[#E27730] mx-1"></div>
              <div className="w-8 h-8 rounded-full bg-[#E27730] text-white flex items-center justify-center shadow-lg animate-bounce">
                <span className="material-symbols-outlined text-lg">directions_walk</span>
              </div>
              <div className="h-1 flex-1 bg-amber-300 mx-1"></div>
              <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white"></div>
            </div>
          </div>

          <Link
            href="/map"
            className="w-full py-2.5 text-[#E27730] font-bold text-xs flex justify-center items-center gap-1.5 hover:bg-[#E27730]/10 transition-colors marathi-text"
          >
            लाइव्ह नकाशा उघडा <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </section>

        {/* QUICK HELP GRID */}
        <section>
          <h3 className="font-bold text-base text-[#351000] mb-3 marathi-text">त्वरित मदत</h3>
          <div className="grid grid-cols-4 gap-2.5">
            <Link
              href="/map"
              className="bg-[#FCF3D7] rounded-2xl border border-[#E9D8A6] p-3 flex flex-col items-center justify-center gap-2 shadow-sm hover:scale-105 transition-transform text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#E27730] flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined fill text-xl">home_repair_service</span>
              </div>
              <span className="text-[11px] font-bold text-[#351000] marathi-text">सुविधा</span>
            </Link>

            <Link
              href="/map"
              className="bg-[#FCF3D7] rounded-2xl border border-[#E9D8A6] p-3 flex flex-col items-center justify-center gap-2 shadow-sm hover:scale-105 transition-transform text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#E27730] flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined fill text-xl">inventory_2</span>
              </div>
              <span className="text-[11px] font-bold text-[#351000] marathi-text">हरवलेले</span>
            </Link>

            <Link
              href="/missing-person"
              className="bg-[#FCF3D7] rounded-2xl border border-[#E9D8A6] p-3 flex flex-col items-center justify-center gap-2 shadow-sm hover:scale-105 transition-transform text-center"
            >
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined fill text-xl">person_search</span>
              </div>
              <span className="text-[11px] font-bold text-[#351000] marathi-text">
                बेपत्ता व्यक्ती
              </span>
            </Link>

            <Link
              href="/family"
              className="bg-[#FCF3D7] rounded-2xl border border-[#E9D8A6] p-3 flex flex-col items-center justify-center gap-2 shadow-sm hover:scale-105 transition-transform text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#E27730] flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined fill text-xl">support</span>
              </div>
              <span className="text-[11px] font-bold text-[#351000] marathi-text">मदत</span>
            </Link>
          </div>
        </section>

        {/* NOTICE CARD: "आजची सूचना - पुढील मार्गावर गर्दी आहे." */}
        <section className="bg-gradient-to-br from-[#FCF3D7] to-[#F3E5BB] rounded-2xl border border-[#E9D8A6] shadow-md p-4 flex items-center justify-between mb-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined fill text-[#E27730] text-3xl mt-0.5">
              campaign
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#E27730] marathi-text">आजची सूचना</h3>
              <p className="text-xs text-[#351000] font-bold marathi-text mt-0.5">
                पुढील मार्गावर गर्दी आहे.
              </p>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-[#FFF8E8] shadow-xs flex items-center justify-center text-[#351000] hover:bg-white transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </section>
      </main>

      {/* Shared Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
