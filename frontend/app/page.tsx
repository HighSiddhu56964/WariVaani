"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, ShieldCheck, ArrowRight, Volume2 } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-950">
      
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none bg-[radial-gradient(#F77F00_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Header */}
      <header className="w-full py-6 px-8 flex justify-between items-center border-b border-orange-100 dark:border-zinc-800 backdrop-blur-md bg-white/60 dark:bg-zinc-900/60 z-10">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="WariVaani Logo"
            width={48}
            height={42}
            className="rounded-lg shadow-sm"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-secondary dark:text-orange-500">
              वारीवाणी <span className="text-primary dark:text-white">WariVaani</span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Pandharpur Wari AI Assistance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Live Control Room Active</span>
        </div>
      </header>

      {/* Main Hero and Selection Section */}
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-6 max-w-6xl mx-auto z-10 w-full">
        <div className="text-center max-w-2xl mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold mb-6"
          >
            <Volume2 className="h-4 w-4 animate-bounce" />
            <span>AI-Powered Voice Assistance for Pilgrims</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-secondary dark:text-white mb-6 leading-tight"
          >
            वारकरी सेवेसाठी <span className="text-primary">वारीवाणी</span> प्लॅटफॉर्म
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Welcome to WariVaani—an AI-powered, voice-first assistance platform designed for the pilgrims of Pandharpur Wari. Access real-time route tracking, nearby facility managers, and missing person reports instantly.
          </motion.p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
          
          {/* Card 1: Warkari */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="flex flex-col justify-between p-8 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-orange-100 hover:border-primary dark:border-zinc-800 dark:hover:border-primary shadow-xl shadow-orange-100/50 dark:shadow-none transition-all duration-300 group"
          >
            <div>
              <div className="h-14 w-14 rounded-2xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-secondary dark:text-white mb-2">
                वारकरी इंटरफेस (Warkari Pilgrim)
              </h3>
              <p className="text-sm text-primary font-semibold mb-4">Optimized for Mobile & Voice</p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Mobile-first application dashboard featuring large visual action cards, live GPS Palkhi tracking, voice assistance, medical emergency buttons, and missing reports reporting.
              </p>
            </div>
            
            <Link href="/login?role=WARKARI" className="inline-flex items-center justify-between px-6 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all w-full">
              <span>वारकरी म्हणून प्रवेश करा</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Card 2: Authority */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="flex flex-col justify-between p-8 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-blue-50 hover:border-secondary dark:border-zinc-800 dark:hover:border-blue-600 shadow-xl shadow-blue-50/50 dark:shadow-none transition-all duration-300 group"
          >
            <div>
              <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-secondary dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-secondary dark:text-white mb-2">
                नियंत्रण कक्ष प्रशासन (Authority Dashboard)
              </h3>
              <p className="text-sm text-secondary dark:text-blue-400 font-semibold mb-4">Responsive Control Dashboard</p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Control room portal to update Palkhi locations, monitor missing reports database, verify facility updates, and broadcast emergency notices to Warkaris.
              </p>
            </div>
            
            <Link href="/login?role=AUTHORITY" className="inline-flex items-center justify-between px-6 py-4 bg-secondary dark:bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-secondary/20 hover:bg-secondary/95 dark:hover:bg-blue-500 transition-all w-full">
              <span>प्रशासक म्हणून लॉगिन करा</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-orange-100 dark:border-zinc-800 text-xs text-muted-foreground z-10 bg-white/40 dark:bg-zinc-900/40">
        <p>© 2026 WariVaani. AI Voice-First Pilgrim Support Project. All Rights Reserved.</p>
        <p className="mt-1">Developed for Wari Pilgrimage Safety and Assistance.</p>
      </footer>
    </div>
  );
}
