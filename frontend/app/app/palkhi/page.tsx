"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { WariVaaniHeader } from "@/components/nav/WariVaaniHeader";
import { WarkariBottomNav } from "@/components/nav/WariVaaniNavbar";
import { FlowstepRouteProgress } from "@/components/ui/FlowstepCard";
import { palkhiService, PalkhiDetail, PalkhiCurrentDetail, RouteCheckpoint } from "@/services/palkhi";
import { useWariVaaniSocket } from "@/hooks/useWariVaaniSocket";
import { MapPin, Navigation, Clock, CheckCircle2, Circle, Radio, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const WariMap = dynamic(() => import("@/components/maps/WariMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] bg-amber-50/50 border border-amber-200/60 rounded-3xl flex flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-stone-500 font-semibold">पालखी नकाशा लोड होत आहे (Loading Map)...</p>
    </div>
  ),
});

export default function UserPalkhiPage() {
  const [palkhis, setPalkhis] = useState<PalkhiDetail[]>([]);
  const [selectedPalkhiId, setSelectedPalkhiId] = useState<number>(1);
  const [currentPalkhi, setCurrentPalkhi] = useState<PalkhiCurrentDetail | null>(null);
  const [routeCheckpoints, setRouteCheckpoints] = useState<RouteCheckpoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, [selectedPalkhiId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allPalkhis = await palkhiService.getPalkhis();
      setPalkhis(allPalkhis);

      const current = await palkhiService.getPalkhiCurrent(selectedPalkhiId);
      setCurrentPalkhi(current);

      const route = await palkhiService.getPalkhiRoute(selectedPalkhiId);
      setRouteCheckpoints(route);
    } catch (err) {
      console.error("Failed to load Palkhi telemetry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useWariVaaniSocket("PALKHI_LOCATION_UPDATED", (event) => {
    if (event.data && (event.data.palkhi_id === selectedPalkhiId || Number(event.data.palkhi_id) === selectedPalkhiId)) {
      setCurrentPalkhi((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          current_checkpoint: event.data.current_location || event.data.current_checkpoint || prev.current_checkpoint,
          latitude: event.data.latitude || prev.latitude,
          longitude: event.data.longitude || prev.longitude,
          next_checkpoint: event.data.next_checkpoint || prev.next_checkpoint,
          updated_at: event.data.updated_at || new Date().toISOString(),
        };
      });
    }
  });

  const mapPalkhis = currentPalkhi
    ? [
        {
          id: String(currentPalkhi.palkhi_id),
          name: currentPalkhi.palkhi,
          saint: currentPalkhi.saint_name,
          currentPlace: currentPalkhi.current_checkpoint,
          lat: currentPalkhi.latitude,
          lng: currentPalkhi.longitude,
          lastUpdated: currentPalkhi.updated_at || new Date().toISOString(),
          warkariCount: currentPalkhi.palkhi_id === 1 ? 450000 : 380000,
          contactNo: "+91 98765 43210",
          routeName: "Alandi/Dehu to Pandharpur",
          speed: "Walking (4 km/h)",
          nextHalt: currentPalkhi.next_checkpoint || "Next Halt",
        },
      ]
    : [];

  const mapStops = routeCheckpoints.map((cp) => ({
    id: `cp-${cp.id}`,
    name: cp.location_name,
    distanceFromStart: cp.cumulative_distance_km || cp.sequence_number * 15,
    lat: cp.latitude,
    lng: cp.longitude,
    hasPalkhi: currentPalkhi?.current_checkpoint === cp.location_name,
    facilitiesAvailable: (cp.is_ringan ? ["Medical", "Water"] : ["Medical"]) as ("Medical" | "Water" | "Food" | "Toilets")[],
  }));

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-24">
      <WariVaaniHeader title="Live Palkhi Tracking" subtitle="थेट पालखी स्थान" role="warkari" />

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        
        {/* Palkhi Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-amber-100/60 p-1 rounded-2xl border border-amber-200/60">
          <button
            onClick={() => setSelectedPalkhiId(1)}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
              selectedPalkhiId === 1
                ? "bg-white text-orange-600 shadow-sm"
                : "text-amber-900/70 hover:text-amber-900"
            }`}
          >
            ज्ञानेश्वर महाराज पालखी
          </button>
          <button
            onClick={() => setSelectedPalkhiId(2)}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
              selectedPalkhiId === 2
                ? "bg-white text-orange-600 shadow-sm"
                : "text-amber-900/70 hover:text-amber-900"
            }`}
          >
            तुकाराम महाराज पालखी
          </button>
        </div>

        {/* Current Location Card (Screen 10) */}
        {currentPalkhi && (
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Navigation className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Current Location</span>
                  <h3 className="text-xl font-black text-stone-900 tracking-tight">{currentPalkhi.current_checkpoint}</h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-xs font-bold border border-emerald-300/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live
              </span>
            </div>

            {/* Embedded Mini Map Preview (Screen 10) */}
            <div className="h-[200px] rounded-2xl overflow-hidden border border-stone-200">
              <WariMap palkhis={mapPalkhis} facilities={[]} routeStops={mapStops} lightMode={true} />
            </div>
          </div>
        )}

        {/* Next Mukam & ETA Cards (Screen 10 Grid) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-stone-200/80 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Next Mukam</span>
              <h4 className="text-lg font-black text-stone-900 tracking-tight mt-0.5">
                {currentPalkhi?.next_checkpoint || "Pandharpur"}
              </h4>
              <p className="text-[11px] font-semibold text-stone-500 mt-0.5">
                {currentPalkhi?.km_remaining || 8.4} km remaining
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Estimated Arrival</span>
              <h4 className="text-lg font-black text-orange-600 tracking-tight mt-0.5">
                2h 15m
              </h4>
              <p className="text-[11px] font-semibold text-stone-500 mt-0.5">
                Today, 5:30 PM
              </p>
            </div>
          </div>
        </div>

        {/* Route Progress (Screen 10) */}
        <FlowstepRouteProgress
          percentage={currentPalkhi?.progress_percentage || 72}
          currentLoc={currentPalkhi?.current_checkpoint || "Wakhari"}
          nextLoc={currentPalkhi?.next_checkpoint || "Pandharpur"}
          kmRemaining={currentPalkhi?.km_remaining || 8.4}
        />

        {/* Route Stops Vertical Timeline (Screen 10) */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Route Stops</h4>
            <span className="text-xs font-bold text-orange-600 flex items-center gap-0.5">
              <span>View map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {routeCheckpoints.slice(0, 5).map((cp, idx) => {
              const isCurrent = currentPalkhi?.current_checkpoint === cp.location_name;
              const isCompleted = idx < 2;

              return (
                <div key={cp.id} className="flex items-start gap-3 relative">
                  <div className="flex flex-col items-center shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isCurrent ? (
                      <Radio className="w-5 h-5 text-orange-600 animate-pulse stroke-[2.5]" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 stroke-[2]" />
                    )}
                    {idx < 4 && <div className="w-0.5 h-7 bg-stone-200 mt-1" />}
                  </div>

                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <h5 className={`text-xs font-black ${isCurrent ? "text-orange-600 text-sm" : "text-stone-900"}`}>
                        {cp.location_name}
                      </h5>
                      <p className="text-[10px] font-medium text-stone-400">
                        {isCompleted ? "Completed stop" : isCurrent ? "Current location" : "Next Mukam"}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-stone-500 font-mono">
                      {isCurrent ? "Now" : `${8 + idx * 2}:30 AM`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      <WarkariBottomNav />
    </div>
  );
}

