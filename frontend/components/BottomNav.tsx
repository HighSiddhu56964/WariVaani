'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import VaaniModal from './VaaniModal';

export default function BottomNav() {
  const pathname = usePathname();
  const [isVaaniOpen, setIsVaaniOpen] = useState(false);

  // Hidden on splash/welcome/profile-setup pages
  if (pathname === '/' || pathname === '/welcome' || pathname === '/profile-setup') {
    return null;
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: 'home', href: '/home' },
    { id: 'wari', label: 'Wari', icon: 'flag', href: '/journey' },
    // Center Mic FAB will sit here
    { id: 'updates', label: 'Updates', icon: 'notifications', href: '/map' },
    { id: 'profile', label: 'Profile', icon: 'person', href: '/profile' },
  ];

  return (
    <>
      <nav className="fixed md:absolute bottom-0 left-0 right-0 w-full z-40 flex justify-around items-end pb-3 pt-3 px-2 h-20 bg-[#FCF3D7] shadow-[0_-4px_16px_rgba(69,26,3,0.12)] rounded-t-3xl border-t border-[#E9D8A6]/60">
        {/* Wavy Notch SVG shape under center FAB */}
        <div className="absolute -top-5 left-0 w-full h-10 pointer-events-none flex justify-center z-[-1]">
          <svg fill="none" height="26" viewBox="0 0 120 26" width="120" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 26 C35 26 42 0 60 0 C78 0 85 26 120 26 Z" fill="#FCF3D7" stroke="#E9D8A6" strokeWidth="1"></path>
          </svg>
        </div>

        {/* Tab 1: Home */}
        <Link
          href={tabs[0].href}
          className={`flex flex-col items-center justify-center w-16 gap-0.5 group transition-transform ${
            pathname === tabs[0].href ? 'scale-105' : ''
          }`}
        >
          <span
            className={`material-symbols-outlined text-2xl transition-all ${
              pathname === tabs[0].href
                ? 'fill text-[#E27730]'
                : 'text-[#554336] group-hover:text-[#E27730]'
            }`}
          >
            {tabs[0].icon}
          </span>
          <span
            className={`text-[11px] font-bold ${
              pathname === tabs[0].href ? 'text-[#E27730]' : 'text-[#554336]'
            }`}
          >
            {tabs[0].label}
          </span>
        </Link>

        {/* Tab 2: Wari */}
        <Link
          href={tabs[1].href}
          className={`flex flex-col items-center justify-center w-16 gap-0.5 group transition-transform ${
            pathname === tabs[1].href ? 'scale-105' : ''
          }`}
        >
          <span
            className={`material-symbols-outlined text-2xl transition-all ${
              pathname === tabs[1].href
                ? 'fill text-[#E27730]'
                : 'text-[#554336] group-hover:text-[#E27730]'
            }`}
          >
            {tabs[1].icon}
          </span>
          <span
            className={`text-[11px] font-bold ${
              pathname === tabs[1].href ? 'text-[#E27730]' : 'text-[#554336]'
            }`}
          >
            {tabs[1].label}
          </span>
        </Link>

        {/* Center Mic FAB: Vaani */}
        <div className="relative -top-6 flex flex-col items-center z-10 w-20">
          <button
            onClick={() => setIsVaaniOpen(true)}
            aria-label="Open Vaani Voice Assistant"
            className="w-16 h-16 rounded-full bg-gradient-to-b from-[#FAD28A] to-[#F1B945] p-[2px] shadow-[0_8px_20px_rgba(226,119,48,0.35)] flex items-center justify-center mb-1 group hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#FBE8B7] to-[#F1C55C] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined fill text-[#351000] text-3xl group-hover:scale-110 transition-transform">
                mic
              </span>
            </div>
          </button>
          <span className="text-[12px] font-bold text-[#E27730] mb-0">Vaani</span>
          <span className="text-[9px] font-medium text-[#554336] whitespace-nowrap">फोनवर बोला</span>
        </div>

        {/* Tab 3: Updates */}
        <Link
          href={tabs[2].href}
          className={`flex flex-col items-center justify-center w-16 gap-0.5 group transition-transform ${
            pathname === tabs[2].href ? 'scale-105' : ''
          }`}
        >
          <span
            className={`material-symbols-outlined text-2xl transition-all ${
              pathname === tabs[2].href
                ? 'fill text-[#E27730]'
                : 'text-[#554336] group-hover:text-[#E27730]'
            }`}
          >
            {tabs[2].icon}
          </span>
          <span
            className={`text-[11px] font-bold ${
              pathname === tabs[2].href ? 'text-[#E27730]' : 'text-[#554336]'
            }`}
          >
            {tabs[2].label}
          </span>
        </Link>

        {/* Tab 4: Profile */}
        <Link
          href={tabs[3].href}
          className={`flex flex-col items-center justify-center w-16 gap-0.5 group transition-transform ${
            pathname === tabs[3].href ? 'scale-105' : ''
          }`}
        >
          <span
            className={`material-symbols-outlined text-2xl transition-all ${
              pathname === tabs[3].href
                ? 'fill text-[#E27730]'
                : 'text-[#554336] group-hover:text-[#E27730]'
            }`}
          >
            {tabs[3].icon}
          </span>
          <span
            className={`text-[11px] font-bold ${
              pathname === tabs[3].href ? 'text-[#E27730]' : 'text-[#554336]'
            }`}
          >
            {tabs[3].label}
          </span>
        </Link>
      </nav>

      {/* Vaani Voice Modal */}
      <VaaniModal isOpen={isVaaniOpen} onClose={() => setIsVaaniOpen(false)} />
    </>
  );
}
