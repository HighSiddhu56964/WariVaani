'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function WelcomePage() {
  const [adminNotice, setAdminNotice] = useState(false);

  return (
    <main className="w-full h-full flex flex-col justify-between relative bg-[#FFF8F6] text-[#351000] p-4 overflow-y-auto">
      {/* Background Textures */}
      <div className="bg-texture"></div>
      <div className="bg-overlay-gradient"></div>

      {/* Header Section */}
      <header className="w-full pt-6 flex flex-col items-center z-10 relative text-center flex-shrink-0">
        <div className="text-sm font-bold tracking-wider mb-1 text-[#351000] flex items-center justify-center gap-2 marathi-text">
          <span>॥ राम कृष्ण हरी ॥</span>
        </div>

        {/* Small ornamental divider */}
        <div className="flex items-center justify-center gap-2 mb-2 w-24">
          <div className="h-px bg-[#8d4b00] flex-1"></div>
          <div className="w-1.5 h-1.5 rotate-45 bg-[#8d4b00]"></div>
          <div className="h-px bg-[#8d4b00] flex-1"></div>
        </div>

        {/* Logo Area */}
        <div className="mt-2 mb-2 flex flex-col items-center">
          <div className="w-14 h-14 bg-[#351000] rounded-t-full rounded-b-md mb-2 flex items-center justify-center text-[#fff8f6] relative shadow-md">
            <span className="material-symbols-outlined text-3xl">person_celebrate</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#351000] mb-0 tracking-wide marathi-text">
            वारीवाणी
          </h1>
          <div className="flex items-center w-full max-w-[120px] mt-1">
            <div className="h-px bg-[#887364] flex-1"></div>
            <span className="px-2 text-[10px] font-semibold text-[#8d4b00] tracking-[0.2em]">
              WARIVAANI
            </span>
            <div className="h-px bg-[#887364] flex-1"></div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-xl font-bold text-[#351000] mt-3 mb-1 marathi-text">
          वारीवाणीत आपले स्वागत आहे
        </h2>
        <div className="w-full max-w-[180px] flex items-center justify-center my-1 opacity-60">
          <div className="h-px bg-[#887364] flex-1"></div>
        </div>
        <p className="text-sm font-medium text-[#554336] marathi-text">
          आपला अनुभव निवडा
        </p>
      </header>

      {/* Main Role Selection */}
      <div className="w-full max-w-md my-auto px-2 flex flex-col gap-4 z-10 py-6 items-center">
        {/* BHAKT CARD */}
        <Link
          href="/profile-setup"
          className="h-24 w-full bg-[#fff8f6] border-2 border-[#8d4b00]/40 rounded-2xl flex items-center soft-shadow relative overflow-hidden p-4 hover:border-[#8d4b00] transition-colors group"
        >
          <div className="flex items-center gap-4 w-full h-full">
            <div className="w-12 h-12 rounded-full border border-[#8d4b00] flex items-center justify-center bg-[#fff8f6] flex-shrink-0 group-hover:bg-[#8d4b00] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl text-[#8d4b00] group-hover:text-white">
                sign_language
              </span>
            </div>
            <div className="flex flex-col items-start text-left flex-1">
              <h3 className="text-lg font-bold text-[#8d4b00] marathi-text">भक्त</h3>
              <p className="text-xs font-medium text-[#554336] marathi-text">
                वारीसोबत जोडलेले रहा
              </p>
            </div>
            <button className="bg-[#8d4b00] text-white p-2.5 rounded-full flex items-center justify-center transition-colors shadow-md group-hover:scale-105">
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </Link>

        {/* ADMINISTRATION CARD */}
        <div
          onClick={() => setAdminNotice(true)}
          className="h-24 w-full bg-[#f4f6fa] border-2 border-[#1e3a8a]/40 rounded-2xl flex items-center soft-shadow relative overflow-hidden p-4 hover:border-[#1e3a8a] cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-4 w-full h-full">
            <div className="w-12 h-12 rounded-full border border-[#1e3a8a] flex items-center justify-center bg-white flex-shrink-0 group-hover:bg-[#1e3a8a] transition-colors">
              <span className="material-symbols-outlined text-2xl text-[#1e3a8a] group-hover:text-white">
                account_balance
              </span>
            </div>
            <div className="flex flex-col items-start text-left flex-1">
              <h3 className="text-lg font-bold text-[#1e3a8a] marathi-text">प्रशासन</h3>
              <p className="text-xs font-medium text-[#1e3a8a]/80 marathi-text">
                वारी व्यवस्थापनासाठी
              </p>
            </div>
            <button className="bg-[#1e3a8a] text-white p-2.5 rounded-full flex items-center justify-center transition-colors shadow-md group-hover:scale-105">
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </div>

        {adminNotice && (
          <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 marathi-text text-center animate-fade-in">
            ℹ️ प्रशासन डॅशबोर्ड उपलब्ध आहे. कृपया भक्त म्हणून पुढे जा.
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full pb-4 pt-2 flex items-center justify-center z-10 px-4 text-center flex-shrink-0 bg-[#fff8f6]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#8d4b00] -rotate-12 text-sm">
            footprint
          </span>
          <p className="text-xs font-semibold text-[#351000] marathi-text">
            विठ्ठलाच्या कृपेने, वारीवाणी आपल्यासोबत आहे.
          </p>
          <span className="material-symbols-outlined text-[#8d4b00] rotate-12 text-sm">
            footprint
          </span>
        </div>
      </footer>
    </main>
  );
}
