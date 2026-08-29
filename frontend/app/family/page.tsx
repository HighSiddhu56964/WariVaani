'use client';

import React from 'react';
import BottomNav from '../../components/BottomNav';

export default function FamilyPage() {
  const familyMembers = [
    {
      name: 'सुनिता पाटील',
      relation: 'पत्नी',
      distance: '२०० मी (पालखी जवळ)',
      status: 'सुरक्षित',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: 'face_3',
      battery: '८५%',
    },
    {
      name: 'रमेश पाटील',
      relation: 'भाऊ',
      distance: '१.५ किमी (अन्नछत्र कक्ष)',
      status: 'विश्रांती',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: 'face',
      battery: '६२%',
    },
    {
      name: 'सकुबाई पाटील',
      relation: 'आई',
      distance: '५०० मी (वैद्यकीय मदत कक्ष)',
      status: 'वैद्यकीय तपासणी',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: 'elderly_woman',
      battery: '४५%',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between relative bg-[#FFF8E8] text-[#4A3219] overflow-y-auto pb-24">
      {/* Header */}
      <header className="pt-6 pb-4 px-5 bg-gradient-to-b from-[#FCF3D7] to-transparent sticky top-0 z-20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E27730] fill text-2xl">
              diversity_3
            </span>
            <h1 className="text-xl font-bold text-[#351000] marathi-text">माझे वारी कुटुंब (Group)</h1>
          </div>
          <button className="bg-[#E27730] text-white text-xs font-bold px-3 py-1.5 rounded-xl marathi-text shadow-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">person_add</span>
            सदस्य जोडा
          </button>
        </div>
        <p className="text-xs text-[#554336] marathi-text">
          तुमच्या कुटुंबाचे थेट लोकेशन ट्रॅकिंग & लाईव्ह स्टेट्स
        </p>
      </header>

      <main className="px-5 flex flex-col gap-3.5 z-10 relative">
        {familyMembers.map((member, idx) => (
          <div
            key={idx}
            className="bg-[#FCF3D7] border border-[#E9D8A6] rounded-2xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#E27730]/15 text-[#E27730] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">{member.icon}</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#351000] marathi-text">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#554336] marathi-text">
                    नाते: {member.relation}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border marathi-text ${member.statusColor}`}
              >
                ● {member.status}
              </span>
            </div>

            <div className="bg-white/80 rounded-xl p-2.5 border border-[#E9D8A6]/60 flex items-center justify-between text-xs mt-1">
              <div className="flex items-center gap-1.5 text-[#351000]">
                <span className="material-symbols-outlined text-[#E27730] text-base">
                  near_me
                </span>
                <span className="font-medium marathi-text">{member.distance}</span>
              </div>
              <div className="flex items-center gap-1 text-[#554336] text-[11px]">
                <span className="material-symbols-outlined text-xs">battery_charging_full</span>
                <span>{member.battery}</span>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Shared Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
