"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { WariVaaniHeader } from "@/components/nav/WariVaaniHeader";
import { WarkariBottomNav } from "@/components/nav/WariVaaniNavbar";
import { FlowstepRouteProgress } from "@/components/ui/FlowstepCard";
import { palkhiService, PalkhiCurrentDetail } from "@/services/palkhi";
import {
  Mic,
  Navigation,
  UserSearch,
  HeartPulse,
  Store,
  Sparkles,
  ChevronRight,
  Volume2,
  BellRing
} from "lucide-react";

export default function WarkariHomePage() {
  const [palkhiDetail, setPalkhiDetail] = useState<PalkhiCurrentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const detail = await palkhiService.getCurrentDetail(1);
        setPalkhiDetail(detail);
      } catch (err) {
        console.error("Failed to load Palkhi detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const quickActions = [
    {
      id: "palkhi",
      title: "Track Palkhi",
      marathi: "पालखी कुठे आहे",
      path: "/app/palkhi",
      icon: Navigation,
      color: "text-amber-700",
      bg: "bg-amber-100/80 border-amber-200",
    },
    {
      id: "missing",
      title: "Report Missing",
      marathi: "हरवलेली व्यक्ती",
      path: "/app/missing-person",
      icon: UserSearch,
      color: "text-emerald-700",
      bg: "bg-emerald-100/80 border-emerald-200",
    },
    {
      id: "medical",
      title: "Medical Help",
      marathi: "वैद्यकीय मदत",
      path: "/app/medical",
      icon: HeartPulse,
      color: "text-blue-700",
      bg: "bg-blue-100/80 border-blue-200",
    },
    {
      id: "facilities",
      title: "Facilities",
      marathi: "जवळच्या सुविधा",
      path: "/app/medical",
      icon: Store,
      color: "text-amber-800",
      bg: "bg-orange-100/80 border-orange-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-24">
      {/* Top Branded Header */}
      <WariVaaniHeader title="WariVaani" subtitle="Namaskar, Warkari" role="warkari" />

      <main className="max-w-md mx-auto px-4 py-4 space-y-5">
        
        {/* Welcome Banner */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
              <span>Jai Hari Vitthal</span> 🙏
            </span>
            <h2 className="text-2xl font-black tracking-tight text-stone-900">Good morning</h2>
          </div>
          <span className="px-3 py-1 bg-amber-200/60 text-amber-900 rounded-full text-xs font-bold border border-amber-300/60">
            Wari 2026
          </span>
        </div>

        {/* Hero AI Voice Assistant Card (Screen 8) */}
        <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white border border-amber-200/70 rounded-3xl p-6 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-orange-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>AI Voice Assistant</span>
          </div>

          <h3 className="text-xl font-black text-stone-900 tracking-tight">
            Ask WariVaani anything
          </h3>
          <p className="text-xs font-medium text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Get instant help with routes, Palkhi timings, medical facilities, and lost family members in Marathi.
          </p>

          {/* Pulsing Mic Button Ring (Screen 8) */}
          <div className="my-6 relative flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute w-28 h-28 rounded-full bg-orange-400/20 border border-orange-300/40"
            />
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.2 }}
              className="absolute w-20 h-20 rounded-full bg-orange-500/25 border border-orange-400/50"
            />
            <Link
              href="/app/voice"
              className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border-2 border-white transition-transform active:scale-90 hover:scale-105"
            >
              <Mic className="w-8 h-8 stroke-[2.2]" />
            </Link>
          </div>

          <Link
            href="/app/voice"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-700 font-bold text-xs border border-orange-200 hover:bg-orange-100 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>बोलण्यासाठी इथे टॅप करा (Tap to Speak)</span>
          </Link>
        </div>

        {/* Today's Wari Card (Screen 8 & 10) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Today's Wari Status
            </span>
            <span className="text-xs font-bold text-orange-600">Day 12 · Palkhi Yatra</span>
          </div>

          <FlowstepRouteProgress
            percentage={palkhiDetail?.progress_percentage || 72}
            currentLoc={palkhiDetail?.current_checkpoint?.name || "Wakhari"}
            nextLoc={palkhiDetail?.next_checkpoint?.name || "Pandharpur"}
            kmRemaining={palkhiDetail?.km_remaining || 8.4}
          />
        </div>

        {/* Quick Actions Grid (Screen 8) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Quick Actions
            </h4>
            <Link href="/app/palkhi" className="text-xs font-bold text-orange-600 flex items-center gap-0.5">
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {quickActions.map((act) => {
              const Icon = act.icon;
              return (
                <Link
                  key={act.id}
                  href={act.path}
                  className="flex flex-col items-center text-center p-3 bg-white border border-stone-200/80 rounded-2xl shadow-sm hover:shadow transition-all active:scale-95"
                >
                  <div className={`w-11 h-11 rounded-2xl border ${act.bg} ${act.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold text-stone-900 leading-tight">{act.title}</span>
                  <span className="text-[9px] font-medium text-stone-500 leading-tight mt-0.5">{act.marathi}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Latest Updates Section (Screen 8) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Latest Updates
            </h4>
            <span className="text-xs font-semibold text-stone-400">Real-time</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-stone-900 truncate">Palkhi route update for today's procession</h5>
                <p className="text-[10px] text-stone-500">15 minutes ago · Mukam 4</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-stone-900 truncate">New drinking water station near Wakhari</h5>
                <p className="text-[10px] text-stone-500">1 hour ago · Bajirao Road</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Navigation */}
      <WarkariBottomNav />
    </div>
  );
}

