"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AuthorityBottomNav } from "@/components/nav/WariVaaniNavbar";
import { FlowstepMetricCard, FlowstepBadge, FlowstepRouteProgress } from "@/components/ui/FlowstepCard";
import { dashboardService, DashboardSummary } from "@/services/dashboard";
import { useWariVaaniSocket } from "@/hooks/useWariVaaniSocket";
import {
  Users,
  ShieldAlert,
  Hospital,
  ShieldCheck,
  Radio,
  Map,
  ChevronRight,
  Sparkles,
  Search,
  Bell
} from "lucide-react";

export default function AuthorityDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
    } font-sans finally {
      setIsLoading(false);
    }
  };

  useWariVaaniSocket("*", (event) => {
    setLastEvent(`${event.type} at ${new Date().toLocaleTimeString()}`);
    if (
      event.type === "PALKHI_LOCATION_UPDATED" ||
      event.type === "MISSING_PERSON_CREATED" ||
      event.type === "MISSING_PERSON_STATUS_UPDATED"
    ) {
      loadSummary();
    }
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-24 select-none">
      {/* Top Header (Screen 2) */}
      <header className="sticky top-0 z-40 w-full px-4 py-3 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-amber-50 flex items-center justify-center text-orange-600 font-black text-lg">
              🏛️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-stone-900 tracking-tight">Inspector Deshmukh</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                Command Room
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-500" />
              Wari Authority Telemetry Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition">
            <Search className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button type="button" className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition relative">
            <Bell className="w-4 h-4 stroke-[2.2]" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-600 rounded-full ring-2 ring-white" />
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-4 space-y-5">
        
        {/* Live Socket Stream Indicator Banner */}
        <div className="flex items-center justify-between p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Telemetry Stream Active</span>
          </div>
          {lastEvent ? (
            <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {lastEvent}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-stone-400">Synced via FastAPI WS</span>
          )}
        </div>

        {/* Metric Widgets Horizontal Scrollable Slider (Screen 2) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              System Telemetry Overview
            </h3>
            <span className="text-xs font-semibold text-stone-400">Real-time Metrics</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <FlowstepMetricCard
              icon={Users}
              value="450K+"
              label="Active Pilgrims"
              trend="+12%"
              iconBg="bg-amber-100"
              iconColor="text-amber-700"
            />
            <FlowstepMetricCard
              icon={ShieldAlert}
              value={summary ? summary.open_missing_persons : 3}
              label="Open Missing Cases"
              iconBg="bg-rose-100"
              iconColor="text-rose-600"
            />
            <FlowstepMetricCard
              icon={Hospital}
              value={summary ? summary.medical_facilities : 24}
              label="Medical Camps Active"
              trend="100%"
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <FlowstepMetricCard
              icon={ShieldCheck}
              value="1.2K"
              label="Deployed Personnel"
              iconBg="bg-emerald-100"
              iconColor="text-emerald-700"
            />
          </div>
        </div>

        {/* Live Palkhi Tracking Card (Screen 2) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Active Procession Status
            </h3>
            <Link href="/authority/map" className="text-xs font-bold text-orange-600 flex items-center gap-0.5">
              <span>Telemetry Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <FlowstepRouteProgress
            percentage={72}
            currentLoc={summary?.palkhi_current_location || "Wakhari"}
            nextLoc="Pandharpur"
            kmRemaining={8.4}
          />
        </div>

        {/* Live Incident Reports Stream (Screen 2 & Screen 4) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Live Missing Person Incidents
            </h3>
            <Link href="/authority/missing-persons" className="text-xs font-bold text-orange-600 flex items-center gap-0.5">
              <span>View Registry ({summary?.open_missing_persons || 3})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            <div className="p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-900">Ramesh Patil (68 yrs)</span>
                <FlowstepBadge status="critical" customText="OPEN TICKET" />
              </div>
              <p className="text-xs text-stone-500 font-medium leading-snug">
                Reported missing near Lonand halt. Last seen wearing saffron dhoti.
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium pt-1 border-t border-stone-100">
                <span>Reporter: Sunil Patil</span>
                <span>10 mins ago</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-900">Sunita Jadhav (12 yrs)</span>
                <FlowstepBadge status="resolved" customText="REUNITED" />
              </div>
              <p className="text-xs text-stone-500 font-medium leading-snug">
                Reunited with family at Wakhari Camp 2 by Control Team.
              </p>
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium pt-1 border-t border-stone-100">
                <span>Reporter: Police Post 4</span>
                <span>45 mins ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Navigation Button to Map */}
        <Link
          href="/authority/map"
          className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition active:scale-98"
        >
          <Map className="w-4 h-4 text-orange-400" />
          <span>Launch Full Telemetry Map</span>
        </Link>

      </main>

      <AuthorityBottomNav />
    </div>
  );
}

