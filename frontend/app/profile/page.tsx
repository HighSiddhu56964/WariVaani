'use client';

import React from 'react';
import BottomNav from '../../components/BottomNav';

export default function ProfilePage() {
  return (
    <div className="w-full h-full flex flex-col justify-between relative bg-[#FFF8E8] text-[#4A3219] overflow-y-auto pb-24">
      {/* Header */}
      <header className="pt-8 pb-4 px-5 bg-gradient-to-b from-[#FCF3D7] to-transparent sticky top-0 z-20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[#E27730] fill text-2xl">
            badge
          </span>
          <h1 className="text-2xl font-bold text-[#351000] marathi-text">वारकरी ओळखपत्र & प्रोफाईल</h1>
        </div>
      </header>

      {/* Main Profile Info */}
      <main className="px-5 flex flex-col gap-4 z-10 relative">
        {/* Profile Card */}
        <section className="bg-[#FCF3D7] rounded-2xl border-2 border-[#E9D8A6] p-5 shadow-md flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-[#E27730] text-white flex items-center justify-center text-3xl font-extrabold shadow-lg mb-3 border-4 border-[#FFF8E8]">
            ग
          </div>
          <h2 className="text-2xl font-extrabold text-[#351000] marathi-text">गणेश पाटील</h2>
          <p className="text-sm font-semibold text-[#E27730] marathi-text mb-2">+९१ ९८७६५४३२१०</p>

          <div className="flex gap-2 text-xs font-bold my-2">
            <span className="bg-[#E27730]/15 text-[#E27730] px-3 py-1 rounded-full marathi-text">
              दिंडी क्र. ४२
            </span>
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full marathi-text">
              माऊली सोहळा
            </span>
          </div>

          {/* QR Code Section */}
          <div className="mt-4 p-4 bg-white rounded-xl border border-[#E9D8A6] flex flex-col items-center shadow-xs w-full max-w-[220px]">
            <div className="w-36 h-36 bg-gray-900 rounded-lg p-2 flex items-center justify-center relative">
              {/* Simulated QR Pattern */}
              <div className="w-full h-full border-4 border-white grid grid-cols-5 gap-1 p-1 bg-white">
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-white"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-white"></div>
                <div className="bg-black"></div>
                <div className="bg-white"></div>
                <div className="bg-black"></div>
                <div className="bg-white"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-white"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-white"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-black"></div>
                <div className="bg-white"></div>
                <div className="bg-black"></div>
                <div className="bg-white"></div>
                <div className="bg-black"></div>
              </div>
            </div>
            <p className="text-[10px] font-bold text-[#554336] mt-2 marathi-text">
              आपत्कालीन क्यूआर कोड scan करा
            </p>
          </div>
        </section>

        {/* Emergency Contacts Section */}
        <section className="bg-[#FCF3D7] rounded-2xl border border-[#E9D8A6] p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-base text-[#351000] marathi-text flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">contact_emergency</span>
            आपत्कालीन संपर्क (Emergency Contacts)
          </h3>

          <div className="bg-white/80 rounded-xl p-3 border border-[#E9D8A6] flex justify-between items-center">
            <div>
              <p className="text-xs text-[#554336] marathi-text">नातेवाईक / कुटुंब</p>
              <p className="text-sm font-bold text-[#351000] marathi-text">सुनिता पाटील (पत्नी)</p>
              <p className="text-xs text-[#E27730] font-semibold">+९१ ९८१२३४५६७८</p>
            </div>
            <a
              href="tel:+919812345678"
              className="bg-emerald-600 text-white p-2.5 rounded-full flex items-center justify-center shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">call</span>
            </a>
          </div>

          <div className="bg-white/80 rounded-xl p-3 border border-[#E9D8A6] flex justify-between items-center">
            <div>
              <p className="text-xs text-[#554336] marathi-text">दिंडी प्रमुख</p>
              <p className="text-sm font-bold text-[#351000] marathi-text">ह.भ.प. तुकाराम महाराज</p>
              <p className="text-xs text-[#E27730] font-semibold">+९१ ९७००००११२२</p>
            </div>
            <a
              href="tel:+919700001122"
              className="bg-emerald-600 text-white p-2.5 rounded-full flex items-center justify-center shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">call</span>
            </a>
          </div>
        </section>
      </main>

      {/* Shared Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
