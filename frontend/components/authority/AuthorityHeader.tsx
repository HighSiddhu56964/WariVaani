'use client';

import React, { useState, useEffect } from 'react';
import { wsManager } from '@/services/websocket';

export default function AuthorityHeader() {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        }) + ' IST'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const unsubscribe = wsManager.subscribe('CONNECTED', () => {
      setIsConnected(true);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return (
    <header className="bg-[#0f172a] text-white border-b-2 border-amber-500 shadow-md h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left: Government Title & Emblem */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center font-bold text-amber-400 text-lg shadow-inner">
          🏛️
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            महाराष्ट्र शासन • POLICE & DISTRICT ADMINISTRATION
          </div>
          <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            <span>WariVaani</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-amber-200">Authority Control Room & Command Center</span>
          </h1>
        </div>
      </div>

      {/* Right: Clock, Live Badge & Officer Badge */}
      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="bg-slate-800/80 px-3 py-1 rounded border border-slate-700 font-mono text-xs text-slate-200 tracking-wider">
          ⏰ {timeStr || '00:00:00 IST'}
        </div>

        {/* Live WebSocket Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
            isConnected
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
              : 'bg-rose-950/80 border-rose-600 text-rose-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
        </div>

        {/* Officer Profile Badge */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded text-xs">
          <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[10px]">
            AD
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-100">Control Room Admin</div>
            <div className="text-[10px] text-amber-400 font-mono">ID: MH-ADM-2026</div>
          </div>
        </div>
      </div>
    </header>
  );
}
