'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getPalkhis, PalkhiData } from '@/services/palkhi';
import { wsManager, WSEvent } from '@/services/websocket';

// Dynamic import of Leaflet Map Component to prevent SSR issues
const PalkhiMapComponent = dynamic(
  () => import('@/components/authority/PalkhiMapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[620px] w-full bg-slate-100 rounded-[24px] flex flex-col items-center justify-center text-slate-500 font-mono text-sm animate-pulse border border-slate-200">
        <span className="text-3xl mb-2">🗺️</span>
        <span>Loading GIS Spatial Map & Dual Palkhi Route Engines...</span>
      </div>
    ),
  }
);

export default function LivePalkhiControlRoom() {
  const [palkhis, setPalkhis] = useState<PalkhiData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const fetchPalkhiData = async () => {
    setLoading(true);
    try {
      const data = await getPalkhis();
      setPalkhis(data);
      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load Palkhi tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPalkhiData();

    // Listen for real-time WebSocket PALKHI_LOCATION_UPDATED updates
    const unsub = wsManager.subscribe('PALKHI_LOCATION_UPDATED', (event: WSEvent) => {
      const updatedData = event.data as Partial<PalkhiData> & { id: number };
      if (updatedData && updatedData.id) {
        setPalkhis((prev) =>
          prev.map((p) => (p.id === updatedData.id ? { ...p, ...updatedData } : p))
        );
        setLastSyncTime('Just now');
      }
    });

    return () => unsub();
  }, []);

  const tukaramPalkhi = palkhis.find((p) =>
    p.saint_name?.toLowerCase().includes('tukaram')
  ) || palkhis[0];

  const dnyaneshwarPalkhi = palkhis.find((p) =>
    p.saint_name?.toLowerCase().includes('dnyaneshwar')
  ) || palkhis[1] || palkhis[0];

  return (
    <div className="space-y-6">
      {/* Top Banner: Authority Control Room Title */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border-b-4 border-amber-500 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <span>🗺️ GIS SPATIAL INTELLIGENCE & PALKHI TRACKING</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Live Palkhi Operations Map
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GPS telemetry, dual-route polyline overlays, next halts, and Ringan ceremony locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE TELEMETRY ACTIVE
          </span>
          <button
            onClick={fetchPalkhiData}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition border border-slate-700 shadow-sm"
          >
            🔄 Sync GIS
          </button>
        </div>
      </div>

      {/* Top Status Cards Row (Matching prompt reference screenshot layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sant Tukaram Maharaj Palkhi Status Section */}
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-4 h-4 rounded-full bg-[#f0643b] shrink-0 shadow-[0_0_8px_#f0643b]" />
            <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
              Sant Tukaram Maharaj Palkhi
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Current Stop
              </div>
              <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-slate-200 text-slate-800 font-bold text-sm sm:text-base">
                {tukaramPalkhi?.current_location || 'Loni Kalbhor'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Last Updated
              </div>
              <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-slate-200 text-slate-800 font-bold text-sm sm:text-base font-mono">
                {lastSyncTime}
              </div>
            </div>
          </div>
        </div>

        {/* Sant Dnyaneshwar Maharaj Palkhi Status Section */}
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-4 h-4 rounded-full bg-[#3d3b98] shrink-0 shadow-[0_0_8px_#3d3b98]" />
            <h2 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
              Sant Dnyaneshwar Maharaj Palkhi
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Current Stop
              </div>
              <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-slate-200 text-slate-800 font-bold text-sm sm:text-base">
                {dnyaneshwarPalkhi?.current_location || 'Saswad'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Last Updated
              </div>
              <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-slate-200 text-slate-800 font-bold text-sm sm:text-base font-mono">
                {lastSyncTime}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Width Leaflet OpenStreetMap Engine Container with Floating Card */}
      <div className="w-full">
        <PalkhiMapComponent palkhis={palkhis} />
      </div>
    </div>
  );
}
