'use client';

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export default function ChatbotLogoWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto group">
      {/* Tooltip on Hover */}
      <div className="absolute bottom-full right-0 mb-3 hidden group-hover:flex flex-col items-end pointer-events-none transition-all duration-200">
        <div className="bg-slate-900/95 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xl border border-amber-500/30 whitespace-nowrap flex items-center gap-2 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>WariVaani Voice AI Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        {/* Tooltip Arrow */}
        <div className="w-2.5 h-2.5 bg-slate-900 border-r border-b border-amber-500/30 transform rotate-45 mr-6 -mt-1.5" />
      </div>

      {/* Floating Logo + Chatbot Icon Widget */}
      <div className="relative cursor-pointer transition-all duration-300 transform group-hover:scale-110 active:scale-95">
        {/* Subtle Ambient Glow */}
        <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 opacity-50 blur-md group-hover:opacity-85 transition duration-300 animate-pulse" />

        {/* Main Card with WariVaani Logo */}
        <div className="relative bg-white/95 backdrop-blur-md p-2 rounded-2xl border-2 border-amber-500/90 shadow-2xl flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 overflow-hidden">
          <img
            src="/warivaani-logo.png"
            alt="WariVaani Authority AI"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Floating Chatbot Badge Icon (Bottom Right Corner) */}
        <div className="absolute -bottom-1 -right-1 bg-slate-900 text-amber-400 p-1.5 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
          <Bot className="w-4 h-4" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
