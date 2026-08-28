"use client";

import React from "react";
import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";

interface WariVaaniHeaderProps {
  title?: string;
  subtitle?: string;
  role?: "warkari" | "authority";
  unreadCount?: number;
}

export function WariVaaniHeader({
  title = "WariVaani",
  subtitle = "राम कृष्ण हरी 🙏",
  role = "warkari",
  unreadCount = 3,
}: WariVaaniHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 bg-amber-50/90 backdrop-blur-md border-b border-amber-200/50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Emblem Logo */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-amber-50 flex items-center justify-center text-orange-600 font-bold text-lg">
            🛕
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-extrabold text-amber-950 tracking-tight">{title}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
              Wari 2026
            </span>
          </div>
          <p className="text-xs font-medium text-amber-800/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative p-2.5 rounded-full bg-amber-100/70 hover:bg-amber-200/60 text-amber-900 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 stroke-[2.2]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-amber-50">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
