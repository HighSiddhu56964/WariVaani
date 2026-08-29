"use client";

import React, { useState } from "react";
import { AuthorityBottomNav } from "@/components/nav/WariVaaniNavbar";
import { FlowstepMetricCard, FlowstepBadge } from "@/components/ui/FlowstepCard";
import {
  Activity,
  FileCheck,
  Clock,
  ShieldCheck,
  TrendingUp,
  Download,
  Filter,
  Calendar
} from "lucide-react";

export default function AuthorityReportsPage() {
  const [timeFilter, setTimeFilter] = useState<string>("today");

  const metrics = [
    { label: "Total Incidents", value: "142", icon: Activity, trend: "+8%", bg: "bg-amber-100", color: "text-amber-700" },
    { label: "Resolution Rate", value: "94.2%", icon: FileCheck, trend: "+3%", bg: "bg-emerald-100", color: "text-emerald-700" },
    { label: "Avg Response", value: "12m", icon: Clock, trend: "-2m", bg: "bg-blue-100", color: "text-blue-600" },
    { label: "Active Guards", value: "88", icon: ShieldCheck, trend: "100%", bg: "bg-orange-100", color: "text-orange-700" },
  ];

  const reportItems = [
    { id: "REP-9041", title: "Crowd density advisory near Lonand junction", category: "Traffic Control", status: "resolved", time: "10:30 AM" },
    { id: "REP-9042", title: "Ambulance unit dispatched to Wakhari Sector 3", category: "Medical Dispatch", status: "on_route", time: "11:15 AM" },
    { id: "REP-9043", title: "Water supply replenishment at Bajirao Road", category: "Sanitation", status: "pending", time: "11:40 AM" },
    { id: "REP-9044", title: "Missing child alert broadcast to field officers", category: "Missing Person", status: "critical", time: "12:05 PM" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-24 flex flex-col justify-between select-none">
      <div>
        {/* Header (Screen 4) */}
        <header className="sticky top-0 z-40 w-full px-4 py-3 bg-white border-b border-stone-200/80 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-base font-black text-stone-900 tracking-tight">Operations Analytics</h1>
            <p className="text-xs text-stone-500 font-medium">Pandharpur Wari Telemetry Reports</p>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-orange-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </header>

        <main className="max-w-xl mx-auto px-4 py-4 space-y-5">
          
          {/* Time Filter Tabs (Screen 4) */}
          <div className="flex items-center justify-between bg-stone-100 p-1 rounded-2xl border border-stone-200/60">
            {["today", "7days", "30days", "custom"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`py-1.5 px-3 rounded-xl text-xs font-extrabold capitalize transition-all ${
                  timeFilter === tab
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {tab === "7days" ? "7 Days" : tab === "30days" ? "30 Days" : tab}
              </button>
            ))}
          </div>

          {/* Metrics Horizontal Slider (Screen 4) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {metrics.map((m, i) => (
              <FlowstepMetricCard
                key={i}
                icon={m.icon}
                value={m.value}
                label={m.label}
                trend={m.trend}
                iconBg={m.bg}
                iconColor={m.color}
              />
            ))}
          </div>

          {/* Incident Analytics Graph Visual Representation (Screen 4) */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Incident Volume by Hour</h3>
                <p className="text-lg font-black text-stone-900 tracking-tight mt-0.5">Peak Activity: 11:00 AM - 1:00 PM</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>

            {/* Simple CSS Bar Graph Visual */}
            <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2 border-b border-stone-100">
              {[35, 50, 75, 90, 60, 40, 80, 95, 45].map((h, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    style={{ height: `${h}%` }}
                    className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-lg group-hover:from-orange-600 group-hover:to-amber-500 transition-all"
                  />
                  <span className="text-[9px] font-mono font-bold text-stone-400">{idx + 8}h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Operations Log (Screen 4) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Operations Activity Stream</h3>
              <span className="text-xs font-semibold text-orange-600 cursor-pointer">Filter</span>
            </div>

            <div className="space-y-2.5">
              {reportItems.map((rep) => (
                <div key={rep.id} className="p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-orange-600">{rep.id}</span>
                    <FlowstepBadge status={rep.status} />
                  </div>
                  <h4 className="text-xs font-black text-stone-900">{rep.title}</h4>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-stone-400 pt-1 border-t border-stone-100">
                    <span>{rep.category}</span>
                    <span>{rep.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      <AuthorityBottomNav />
    </div>
  );
}
