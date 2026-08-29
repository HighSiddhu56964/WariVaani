"use client";

import React from "react";
import { Wifi } from "lucide-react";

interface WariVaaniLogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export function WariVaaniLogo({ showTagline = true, size = "md" }: WariVaaniLogoProps) {
  const isLg = size === "lg";
  const isSm = size === "sm";

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Arch Emblem */}
      <div className={`relative mb-3 ${isLg ? "w-28 h-36" : isSm ? "w-16 h-20" : "w-24 h-32"}`}>
        {/* Golden Arch Frame */}
        <div className="w-full h-full rounded-t-full border-[3px] border-[#DA9B26] bg-gradient-to-b from-[#F5E6CD]/40 via-transparent to-transparent flex flex-col items-center justify-end p-2 relative shadow-inner">
          
          {/* Vitthal Dark Silhouette */}
          <div className="relative w-full h-full flex flex-col items-center justify-end pb-1">
            {/* Crown / Top Knot */}
            <div className="w-4 h-5 bg-[#1B2838] rounded-t-sm relative flex justify-center -mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E59E18] mt-1" />
            </div>

            {/* Head & Yellow Tilak */}
            <div className="w-7 h-7 bg-[#1B2838] rounded-sm relative flex justify-center items-start pt-1 -mb-0.5">
              <div className="w-2 h-2.5 bg-[#E59E18] rounded-full" />
            </div>

            {/* Shoulders & Body with Golden Footprints Road */}
            <div className="w-14 h-12 bg-[#1B2838] rounded-t-lg relative overflow-hidden flex flex-col items-center">
              {/* Golden Path Inside Body */}
              <div className="w-7 h-full bg-gradient-to-b from-[#F5C242] via-[#E59E18] to-[#D97706] rounded-full flex flex-col items-center justify-around py-1 shadow-md">
                <div className="w-1 h-1 rounded-full bg-[#1B2838]" />
                <div className="w-1 h-1 rounded-full bg-[#1B2838] translate-x-1" />
                <div className="w-1 h-1 rounded-full bg-[#1B2838] -translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title & Wifi Waves */}
      <div className="relative inline-block">
        <h1
          className={`font-black tracking-tight text-[#1B2838] font-serif ${
            isLg ? "text-4xl" : isSm ? "text-2xl" : "text-3xl"
          }`}
        >
          वारीवाणी
        </h1>
        {/* Wifi / Voice Signal Wave Icon over णी */}
        <div className="absolute -top-1 -right-5 text-[#E59E18] transform rotate-45">
          <Wifi className={isLg ? "w-5 h-5" : "w-4 h-4"} />
        </div>
      </div>

      {/* Subtitle WARIVAANI with gold lines */}
      <div className="flex items-center justify-center gap-2 mt-1">
        <div className="h-px w-6 bg-[#D4B886]" />
        <span className="text-[10px] font-black tracking-[0.25em] text-[#C2410C] uppercase">
          WARIVAANI
        </span>
        <div className="h-px w-6 bg-[#D4B886]" />
      </div>

      {/* Tagline */}
      {showTagline && (
        <div className="mt-2 text-center">
          <p className="text-sm font-bold text-[#451A03] max-w-[240px] mx-auto leading-relaxed">
            वारीच्या वाटेवर, वारीवाणी तुमच्या सोबती.
          </p>
          <div className="flex items-center justify-center gap-1 text-[#E59E18] text-xs mt-1">
            <span>◆</span>
            <span className="text-[8px]">●</span>
            <span>◆</span>
          </div>
        </div>
      )}
    </div>
  );
}
