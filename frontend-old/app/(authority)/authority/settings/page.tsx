"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthorityBottomNav } from "@/components/nav/WariVaaniNavbar";
import {
  User,
  Shield,
  Bell,
  Globe,
  Radio,
  LogOut,
  ChevronRight,
  Sparkles,
  Lock
} from "lucide-react";

export default function AuthoritySettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [selectedLang, setSelectedLang] = useState("mr");

  const handleLogout = () => {
    logout();
    router.push("/authority/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-24 flex flex-col justify-between select-none">
      <div>
        {/* Header */}
        <header className="sticky top-0 z-40 w-full px-4 py-3 bg-white border-b border-stone-200/80 shadow-sm">
          <h1 className="text-base font-black text-stone-900 tracking-tight">Officer Profile & Settings</h1>
          <p className="text-xs text-stone-500 font-medium">Pandharpur Wari Security Cell</p>
        </header>

        <main className="max-w-xl mx-auto px-4 py-4 space-y-5">
          
          {/* Officer Profile Hero Card (Screen 5) */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full bg-amber-50 flex items-center justify-center text-orange-600 font-black text-2xl">
                👮‍♂️
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-stone-900 tracking-tight truncate">
                  {user?.name || "Inspector Deshmukh"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  Verified
                </span>
              </div>
              <p className="text-xs font-mono font-semibold text-stone-500 mt-0.5">ID: MH-POL-2026-889</p>
              <p className="text-xs font-medium text-stone-400">Chief Command Controller · Pune Sector</p>
            </div>
          </div>

          {/* Preferences Section (Screen 5) */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">System Preferences</h3>

            <div className="space-y-3">
              {/* Language Selector */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Interface Language</h4>
                    <p className="text-[10px] text-stone-400">Display language for control dashboard</p>
                  </div>
                </div>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none"
                >
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>

              {/* Sound Notifications Toggle */}
              <div className="flex items-center justify-between py-1 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Critical Incident Chime</h4>
                    <p className="text-[10px] text-stone-400">Play alert sound for missing reports</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={() => setSoundEnabled(!soundEnabled)}
                  className="w-5 h-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* WebSocket Auto Reconnect Toggle */}
              <div className="flex items-center justify-between py-1 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">FastAPI Telemetry Stream</h4>
                    <p className="text-[10px] text-stone-400">Auto-reconnect WebSocket on network drop</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoReconnect}
                  onChange={() => setAutoReconnect(!autoReconnect)}
                  className="w-5 h-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Department Information (Screen 5) */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Security & Department</h3>

            <div className="space-y-2 text-xs font-medium text-stone-700">
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <span>Department</span>
                <span className="font-bold text-stone-900">Maharashtra Police Cyber & Traffic</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <span>Deployment Zone</span>
                <span className="font-bold text-stone-900">Pandharpur Procession Axis</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Server Endpoint</span>
                <span className="font-mono text-[10px] text-orange-600 font-bold">FastAPI :8000</span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-2xl border border-rose-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>लॉगआउट करा (Sign Out)</span>
          </button>

        </main>
      </div>

      <AuthorityBottomNav />
    </div>
  );
}

