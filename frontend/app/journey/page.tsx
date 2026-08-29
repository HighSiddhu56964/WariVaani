'use client';

import React from 'react';
import BottomNav from '../../components/BottomNav';

export default function JourneyPage() {
  const scheduleItems = [
    {
      time: 'सकाळी ६:००',
      title: 'प्रस्थान',
      location: 'पुणे - सोलापूर महामार्ग',
      status: 'completed',
      detail: 'पालखीचे मार्गक्रमण सुरू झाले.',
    },
    {
      time: 'दुपारी १२:००',
      title: 'दुपारचा विसावा & महाप्रसाद',
      location: 'हडपसर परिसर',
      status: 'current',
      detail: 'अन्नछत्र व वैद्यकीय सेवा उपलब्ध.',
    },
    {
      time: 'संध्याकाळी ६:००',
      title: 'रात्रीचा मुक्काम',
      location: 'सासवड (पालखी तळ)',
      status: 'upcoming',
      detail: 'भजन व कीर्तन सोहळा.',
    },
    {
      time: 'उद्या सकाळी ५:३०',
      title: 'पुढील प्रवास',
      location: 'जेजुरीकडे प्रस्थान',
      status: 'upcoming',
      detail: 'दिवे घाट पार पडणे.',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between relative bg-[#FFF8E8] text-[#4A3219] overflow-y-auto pb-24">
      {/* Header */}
      <header className="pt-8 pb-4 px-5 bg-gradient-to-b from-[#FCF3D7] to-transparent sticky top-0 z-20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[#E27730] fill text-2xl">
            directions_walk
          </span>
          <h1 className="text-2xl font-bold text-[#351000] marathi-text">वारी मार्ग व वेळापत्रक</h1>
        </div>
        <p className="text-xs text-[#554336] marathi-text font-medium">
          आजचा एकूण प्रवास: <strong className="text-[#E27730]">१५ किमी</strong> | सासवड मुक्काम
        </p>
      </header>

      {/* Main Schedule Container */}
      <main className="px-5 py-2 flex flex-col gap-4 z-10 relative">
        <div className="relative border-l-2 border-[#E27730]/40 ml-4 pl-6 space-y-6">
          {scheduleItems.map((item, idx) => (
            <div key={idx} className="relative">
              {/* Timeline Marker Icon */}
              <div
                className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
                  item.status === 'completed'
                    ? 'bg-green-600'
                    : item.status === 'current'
                    ? 'bg-[#E27730] animate-bounce ring-4 ring-[#E27730]/30'
                    : 'bg-amber-300 text-amber-900'
                }`}
              >
                {item.status === 'completed' ? '✓' : idx + 1}
              </div>

              {/* Schedule Card */}
              <div
                className={`bg-[#FCF3D7] border rounded-2xl p-4 shadow-sm ${
                  item.status === 'current'
                    ? 'border-2 border-[#E27730] shadow-md'
                    : 'border-[#E9D8A6]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#E27730] bg-[#E27730]/10 px-2.5 py-0.5 rounded-full marathi-text">
                    {item.time}
                  </span>
                  {item.status === 'current' && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full marathi-text">
                      सध्या सुरू आहे
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-[#351000] marathi-text mb-0.5">
                  {item.title}
                </h2>
                <p className="text-sm font-semibold text-[#554336] marathi-text flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#E27730]">
                    location_on
                  </span>
                  {item.location}
                </p>
                <p className="text-xs text-[#554336]/80 marathi-text mt-2 border-t border-[#E9D8A6]/60 pt-2">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Shared Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
