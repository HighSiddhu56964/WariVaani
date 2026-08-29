"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/common/MobileShell";
import { WariVaaniLogo } from "@/components/common/WariVaaniLogo";
import { 
  Users, 
  MapPin, 
  Plus, 
  Mic, 
  BarChart2, 
  Ambulance, 
  Settings, 
  ArrowRight, 
  Footprints,
  Building
} from "lucide-react";

export default function WelcomeLoginPage() {
  const router = useRouter();

  const handleSelectDevotee = () => {
    router.push("/home");
  };

  const handleSelectAuthority = () => {
    router.push("/authority");
  };

  return (
    <MobileShell className="justify-between p-4">
      {/* Top Banner Header */}
      <header className="w-full text-center pt-2 space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#3E1F09]">
          <span className="text-[#DA9B26]">॥</span>
          <span>राम कृष्ण हरी</span>
          <span className="text-[#DA9B26]">॥</span>
        </div>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#DA9B26]/60 to-transparent mx-auto" />

        {/* Logo Header */}
        <div className="mt-2 scale-90">
          <WariVaaniLogo showTagline={false} size="sm" />
        </div>
      </header>

      {/* Main Title Area */}
      <main className="w-full space-y-4 my-2">
        <div className="text-center space-y-0.5">
          <h2 className="text-2xl font-black text-[#290F05] font-serif tracking-tight">
            वारीवाणीत आपले स्वागत आहे
          </h2>
          <p className="text-xs font-bold text-[#652809]">
            आपला अनुभव निवडा
          </p>
        </div>

        {/* Dual Selection Cards */}
        <div className="grid grid-cols-2 gap-3 w-full">
          
          {/* Left Card: Devotee (भक्त) */}
          <div className="bg-[#FFF8EE] border-2 border-[#E5D1B3] rounded-[24px] p-3 shadow-md flex flex-col justify-between hover:border-[#D97706] transition-all">
            <div>
              {/* Badge Icon: Praying hands */}
              <div className="w-12 h-12 rounded-full border border-[#E5D1B3] bg-[#F5E6CD]/60 mx-auto flex items-center justify-center text-xl mb-2 shadow-inner">
                🙏
              </div>

              <div className="text-center mb-2">
                <h3 className="text-2xl font-black text-[#C2410C] font-serif">भक्त</h3>
                <p className="text-[10px] font-bold text-[#451A03] mt-0.5">वारीसोबत जोडलेले रहा</p>
              </div>

              {/* Artwork Banner Illustration */}
              <div className="w-full h-20 rounded-xl bg-[#F5E6CD]/50 border border-[#E5D1B3] overflow-hidden relative mb-3 flex items-end justify-center p-1">
                <div className="flex items-end gap-1.5 opacity-85">
                  <div className="w-1.5 h-6 bg-[#EA580C] -mb-0.5" />
                  <Users className="w-6 h-6 text-[#78350F]" />
                  <div className="w-2 h-8 bg-[#451A03] rounded-t-sm" />
                </div>
              </div>

              {/* 5 Feature Icons Row */}
              <div className="grid grid-cols-5 gap-1 mb-3 text-center">
                <div className="p-1 rounded-lg bg-white border border-[#E5D1B3] flex flex-col items-center">
                  <Users className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span className="text-[8px] font-bold text-[#451A03] mt-0.5">वारी</span>
                </div>
                <div className="p-1 rounded-lg bg-white border border-[#E5D1B3] flex flex-col items-center">
                  <span className="text-[10px]">🛕</span>
                  <span className="text-[8px] font-bold text-[#451A03] mt-0.5">पालखी</span>
                </div>
                <div className="p-1 rounded-lg bg-white border border-[#E5D1B3] flex flex-col items-center">
                  <MapPin className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span className="text-[8px] font-bold text-[#451A03] mt-0.5">मार्ग</span>
                </div>
                <div className="p-1 rounded-lg bg-white border border-[#E5D1B3] flex flex-col items-center">
                  <Plus className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span className="text-[8px] font-bold text-[#451A03] mt-0.5">सुविधा</span>
                </div>
                <div className="p-1 rounded-lg bg-white border border-[#E5D1B3] flex flex-col items-center">
                  <Mic className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span className="text-[8px] font-bold text-[#451A03] mt-0.5">वाणी</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleSelectDevotee}
              className="w-full py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#C2410C] text-white font-black text-xs flex items-center justify-center gap-1 shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <span>भक्त अनुभव सुरू करा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Card: Authority (प्रशासन) */}
          <div className="bg-[#F0F4F8] border-2 border-[#B0BEC5] rounded-[24px] p-3 shadow-md flex flex-col justify-between hover:border-[#1E3A8A] transition-all">
            <div>
              {/* Badge Icon: Government Dome */}
              <div className="w-12 h-12 rounded-full border border-[#B0BEC5] bg-[#CFD8DC]/60 mx-auto flex items-center justify-center text-slate-800 mb-2 shadow-inner">
                <Building className="w-6 h-6 text-[#1E3A8A]" />
              </div>

              <div className="text-center mb-2">
                <h3 className="text-2xl font-black text-[#1E3A8A] font-serif">प्रशासन</h3>
                <p className="text-[10px] font-bold text-[#334155] mt-0.5">वारी व्यवस्थापनासाठी</p>
              </div>

              {/* Artwork Banner Illustration */}
              <div className="w-full h-20 rounded-xl bg-[#CFD8DC]/50 border border-[#B0BEC5] overflow-hidden relative mb-3 flex items-end justify-center p-1">
                <div className="flex items-end gap-1.5 opacity-85">
                  <BarChart2 className="w-6 h-6 text-[#1E3A8A]" />
                  <Settings className="w-5 h-5 text-[#334155]" />
                </div>
              </div>

              {/* 4 Feature Icons Row */}
              <div className="grid grid-cols-4 gap-1 mb-3 text-center">
                <div className="p-1 rounded-lg bg-white border border-[#B0BEC5] flex flex-col items-center">
                  <BarChart2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span className="text-[8px] font-bold text-[#1E293B] mt-0.5">निरीक्षण</span>
                </div>
                <div className="p-1 rounded-lg bg-white border border-[#B0BEC5] flex flex-col items-center">
                  <MapPin className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span className="text-[8px] font-bold text-[#1E293B] mt-0.5">सुविधा</span>
                </div>
                <div className="p-1 rounded-lg bg-white border border-[#B0BEC5] flex flex-col items-center">
                  <Ambulance className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span className="text-[8px] font-bold text-[#1E293B] mt-0.5">आपत्कालीन मदत</span>
                </div>
                <div className="p-1 rounded-lg bg-white border border-[#B0BEC5] flex flex-col items-center">
                  <Settings className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span className="text-[8px] font-bold text-[#1E293B] mt-0.5">नियंत्रण</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleSelectAuthority}
              className="w-full py-2.5 px-2 rounded-xl bg-[#0F2942] text-white font-black text-xs flex items-center justify-center gap-1 shadow-md hover:bg-[#091E33] active:scale-95 transition-all"
            >
              <span>प्रशासन प्रवेश करा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </main>

      {/* Footer Banner */}
      <footer className="w-full text-center py-2.5 border-t border-[#E5D1B3] flex items-center justify-center gap-2 text-xs font-bold text-[#451A03] mt-auto">
        <Footprints className="w-4 h-4 text-[#DA9B26]" />
        <span>विठ्ठलाच्या कृपेने, वारीवाणी आपल्यासोबत आहे.</span>
        <Footprints className="w-4 h-4 text-[#DA9B26]" />
      </footer>
    </MobileShell>
  );
}
