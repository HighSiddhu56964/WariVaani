'use client';

import React, { useState } from 'react';
import BottomNav from '../../components/BottomNav';

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = [
    { id: 'all', label: 'सर्व सुविधा', icon: 'apps' },
    { id: 'water', label: 'पिण्याचे पाणी', icon: 'water_drop' },
    { id: 'medical', label: 'वैद्यकीय मदत', icon: 'medical_services' },
    { id: 'food', label: 'अन्नछत्र', icon: 'restaurant' },
    { id: 'shelter', label: 'विसावा / निवारा', icon: 'night_shelter' },
  ];

  const facilities = [
    {
      name: 'महात्मा गांधी विद्यालय - अन्नछत्र',
      type: 'food',
      distance: '३०० मीटर',
      status: 'सुरू आहे',
      icon: 'restaurant',
    },
    {
      name: 'प्राथमिक आरोग्य केंद्र (२४x७)',
      type: 'medical',
      distance: '५०० मीटर',
      status: 'डॉक्टर उपलब्ध',
      icon: 'medical_services',
    },
    {
      name: 'स्वच्छ पिण्याचे पाणी टँकर',
      type: 'water',
      distance: '१50 मीटर',
      status: 'उपलब्ध',
      icon: 'water_drop',
    },
  ];

  const filteredFacilities =
    activeFilter === 'all'
      ? facilities
      : facilities.filter((f) => f.type === activeFilter);

  return (
    <div className="w-full h-full flex flex-col justify-between relative bg-[#FFF8E8] text-[#4A3219] overflow-y-auto pb-24">
      {/* Header */}
      <header className="pt-6 pb-2 px-5 bg-gradient-to-b from-[#FCF3D7] to-transparent sticky top-0 z-20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E27730] fill text-2xl">
              map
            </span>
            <h1 className="text-xl font-bold text-[#351000] marathi-text">लाइव्ह नकाशा व सुविधा</h1>
          </div>
          <span className="text-xs bg-[#E27730]/15 text-[#E27730] font-bold px-2.5 py-1 rounded-full marathi-text flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#E27730] animate-ping"></span>
            लाइव्ह GPS
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                activeFilter === f.id
                  ? 'bg-[#E27730] text-white shadow-sm'
                  : 'bg-[#FCF3D7] text-[#351000] border border-[#E9D8A6]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{f.icon}</span>
              <span className="marathi-text">{f.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Map View Area */}
      <main className="px-5 flex flex-col gap-4 z-10 relative flex-1">
        {/* Interactive Map Visual Mock */}
        <div className="w-full h-64 bg-[#E8E1D5] rounded-2xl border-2 border-[#E9D8A6] shadow-md relative overflow-hidden flex flex-col justify-between p-4">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#8d4b00_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>

          {/* Map Controls */}
          <div className="flex justify-between items-start z-10">
            <span className="bg-[#351000] text-white text-[11px] font-bold px-3 py-1 rounded-lg marathi-text shadow-sm">
              📍 माळशिरस मार्ग
            </span>
            <div className="flex flex-col gap-1 bg-white/90 p-1 rounded-lg shadow-sm">
              <button className="w-7 h-7 flex items-center justify-center font-bold text-lg text-[#351000]">
                +
              </button>
              <div className="h-px bg-gray-200"></div>
              <button className="w-7 h-7 flex items-center justify-center font-bold text-lg text-[#351000]">
                -
              </button>
            </div>
          </div>

          {/* Map Pin Elements */}
          <div className="relative w-full h-28 z-10 flex items-center justify-around">
            <div className="flex flex-col items-center animate-bounce">
              <span className="bg-[#E27730] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm marathi-text">
                श्री जगद्गुरू पालखी
              </span>
              <span className="material-symbols-outlined fill text-3xl text-[#E27730]">
                temple_hindu
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm marathi-text">
                जलसेवा
              </span>
              <span className="material-symbols-outlined fill text-xl text-blue-600">
                water_drop
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm marathi-text">
                अन्नछत्र
              </span>
              <span className="material-symbols-outlined fill text-xl text-emerald-600">
                restaurant
              </span>
            </div>
          </div>
        </div>

        {/* Nearby Facilities List */}
        <section className="space-y-2.5">
          <h2 className="font-bold text-base text-[#351000] marathi-text">जवळपासच्या सुविधा</h2>
          {filteredFacilities.map((fac, idx) => (
            <div
              key={idx}
              className="bg-[#FCF3D7] border border-[#E9D8A6] rounded-xl p-3.5 flex items-center justify-between shadow-xs hover:border-[#E27730] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E27730]/15 text-[#E27730] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">{fac.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#351000] marathi-text">{fac.name}</h3>
                  <p className="text-xs text-[#554336] marathi-text">
                    अंतर: <strong>{fac.distance}</strong> | {fac.status}
                  </p>
                </div>
              </div>
              <button className="bg-[#E27730] text-white p-2 rounded-xl flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-lg">near_me</span>
              </button>
            </div>
          ))}
        </section>
      </main>

      {/* Shared Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
