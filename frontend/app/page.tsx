'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="w-full h-full flex flex-col relative z-10 bg-wari-theme bg-amber-50 select-none overflow-hidden">
      {/* 
        The background image `bg-wari-theme.jpg` contains:
        1. "|| राम कृष्ण हरी ||" top banner
        2. Clean, unobstructed Vitthal photo / artwork in upper half
        3. "वारीवाणी WARIVAANI" logo and slogan
        4. Warkari procession artwork
        5. "|| जय हरी विठ्ठल ||" bottom banner
        No overlaying text needed so Vitthal's photo is 100% visible!
      */}

      {/* Loading Spinner positioned over the designated loader spot */}
      <div className="absolute bottom-[20%] left-0 w-full flex flex-col items-center justify-center pointer-events-none">
        <div className="loader mb-2 shadow-[0_0_15px_rgba(255,165,0,0.6)]"></div>
        <p className="text-[#351000] text-xs font-bold marathi-text bg-[#fff8f6]/70 px-3 py-1 rounded-full border border-[#8d4b00]/20">
          वारीची वाट खुलत आहे...
        </p>
      </div>
    </main>
  );
}
