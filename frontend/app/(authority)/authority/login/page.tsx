"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck, Lock, User, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthorityLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [officerName, setOfficerName] = useState("Inspector Deshmukh");
  const [officerId, setOfficerId] = useState("MH-POL-2026-889");
  const [passcode, setPasscode] = useState("admin2026");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login("AUTHORITY", officerName);
    router.push("/authority");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-stone-200/80 rounded-3xl p-8 shadow-xl space-y-6"
      >
        {/* Emblem & Top Header (Screen 1) */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-lg mx-auto flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-amber-50 flex items-center justify-center text-orange-600 font-black text-2xl">
              🏛️
            </div>
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-amber-300/50">
              <Shield className="w-3 h-3 text-orange-600" />
              <span>Government of Maharashtra</span>
            </span>
            <h1 className="text-xl font-black text-stone-900 tracking-tight pt-1">
              Pandharpur Wari Authority Command Center
            </h1>
            <p className="text-xs font-medium text-stone-500">
              Authorized Personnel Portal • वारी प्रशासन कक्ष
            </p>
          </div>
        </div>

        {/* Form Fields (Screen 1) */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">
              अधिकारी आयडी / Officer Badge ID
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-orange-500 rounded-2xl text-xs font-bold text-stone-900 focus:outline-none"
              />
              <User className="absolute right-4 top-3.5 h-4 w-4 text-stone-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">
              पासकोड / Security Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-orange-500 rounded-2xl text-xs font-bold text-stone-900 focus:outline-none"
              />
              <Lock className="absolute right-4 top-3.5 h-4 w-4 text-stone-400" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-stone-300 text-orange-600 focus:ring-orange-500" />
              <span>Remember Device</span>
            </label>
            <button type="button" className="text-orange-600 hover:underline">
              Request OTP
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 transition-transform"
          >
            <span>कंट्रोल रूममध्ये प्रवेश करा (Access Command Center)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-[10px] font-medium text-stone-400 border-t border-stone-100">
          WariVaani Control Center v2.4 • Hackathon Prototype Demo
        </div>
      </motion.div>
    </div>
  );
}

