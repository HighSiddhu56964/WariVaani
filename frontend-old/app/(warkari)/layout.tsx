"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { WARKARI_NAV_ITEMS } from "../../constants";
import { motion } from "framer-motion";
import { Mic, LogOut, Volume2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { AlertBanner } from "../../components/AlertBanner";

export default function WarkariLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading, login, switchRole, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Guard: Auto-set warkari role if accessing direct route
  useEffect(() => {
    if (!isLoading) {
      if (!role) {
        login("WARKARI", "विठ्ठल भक्त");
      } else if (role !== "WARKARI") {
        switchRole("WARKARI");
      }
    }
  }, [role, isLoading]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50/20 dark:bg-zinc-950 gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-muted-foreground">वारकरी सेवा ॲप सुरू होत आहे...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 pb-28">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-orange-100 dark:border-zinc-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="WariVaani Logo"
            width={36}
            height={32}
            className="rounded"
          />
          <div>
            <h2 className="text-md font-bold text-secondary dark:text-orange-500">वारीवाणी</h2>
            <p className="text-[10px] text-muted-foreground font-medium">पंढरपूर वारी सेवा</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/authority"
            className="flex items-center gap-1 text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-secondary dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-full hover:bg-blue-100 transition"
          >
            <span>🛡️ Control Room</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-primary rounded-full hover:bg-orange-50"
            title="Voice Guide"
          >
            <Volume2 className="h-4 w-4 animate-pulse" />
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-full hover:bg-red-50"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Live Alert Banner */}
      <AlertBanner role="warkari" />

      {/* Main content container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6">
        {children}
      </main>

      {/* Floating Voice Assistant Microphone Bar */}
      <div className="fixed bottom-20 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto flex items-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-white font-bold px-5 py-3.5 rounded-full shadow-lg shadow-primary/30 border border-orange-400 hover:brightness-105 active:brightness-95 transition-all text-xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <Mic className="h-4 w-4" />
          <span>बोलून माहिती मिळवा (Tap to Speak)</span>
        </motion.button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-orange-100 dark:border-zinc-800 shadow-2xl pb-safe">
        <div className="flex h-20 items-center justify-around px-2 max-w-md mx-auto">
          {WARKARI_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link key={item.path} href={item.path} className="relative flex flex-col items-center justify-center flex-1 h-full select-none">
                <div className="flex flex-col items-center justify-center gap-1 group">
                  <motion.div
                    className={`p-2 rounded-2xl transition-all ${
                      isActive 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "text-muted-foreground group-hover:text-primary group-hover:bg-orange-50/50 dark:group-hover:bg-zinc-800"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <span className={`text-[10px] font-bold tracking-tight ${isActive ? "text-primary font-black" : "text-muted-foreground"}`}>
                    {item.name}
                  </span>
                </div>
                {/* Active Underline Pill */}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabPill"
                    className="absolute bottom-1.5 h-1 w-5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
