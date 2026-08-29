"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { AUTHORITY_NAV_ITEMS } from "../../constants";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, ShieldCheck, Bell, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { AlertBanner } from "../../components/AlertBanner";

export default function AuthorityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading, login, switchRole, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Guard: Auto-set authority role or redirect if necessary
  useEffect(() => {
    if (!isLoading) {
      if (!role) {
        // Auto sign in as Authority if accessing direct route
        login("AUTHORITY", "Control Room Officer");
      } else if (role !== "AUTHORITY") {
        switchRole("AUTHORITY");
      }
    }
  }, [role, isLoading]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-zinc-400">प्रशासक नियंत्रण कक्ष सुरू होत आहे...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex bg-zinc-950 text-zinc-100">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 flex-shrink-0">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-850 bg-zinc-900">
          <Image
            src="/logo.png"
            alt="WariVaani Logo"
            width={32}
            height={28}
            className="rounded"
          />
          <div>
            <h1 className="text-sm font-black text-orange-500">वारीवाणी नियंत्रण कक्ष</h1>
            <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Control Dashboard</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {AUTHORITY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info / Log out at bottom */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-zinc-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-zinc-400 truncate">Control Room Admin</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded-xl"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-45 md:hidden"
            />
            {/* Sidebar drawer content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-zinc-900 z-50 flex flex-col md:hidden border-r border-zinc-800"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo.png"
                    alt="WariVaani Logo"
                    width={28}
                    height={24}
                  />
                  <h1 className="text-xs font-black text-orange-500">वारीवाणी नियंत्रण</h1>
                </div>
                <Button
                  onClick={() => setSidebarOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-1.5">
                {AUTHORITY_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom section */}
              <div className="p-4 border-t border-zinc-850">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-zinc-850 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between px-6 z-30">
          {/* Left section: Hamburger & Brand Title */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSidebarOpen(true)}
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg animate-fade-in"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <h2 className="hidden md:block text-sm font-black tracking-widest text-zinc-100 uppercase">
                WARIVAANI COMMAND CENTER
              </h2>
              <h2 className="md:hidden text-sm font-black text-zinc-150">
                Wari Command
              </h2>
              <Link
                href="/warkari"
                className="hidden sm:inline-flex items-center gap-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-2.5 py-1 rounded-lg text-xs font-bold text-orange-400 transition"
              >
                <span>🚩 Switch to Warkari App</span>
              </Link>
            </div>
          </div>

          {/* Middle section: Telemetry Search */}
          <div className="relative hidden lg:block w-72">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search warkaris, clinics, or palkhis..."
              className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-700 focus:border-orange-500 rounded-xl py-1.5 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all"
            />
          </div>

          {/* Right section: System Nominal -> Clock -> Bell -> Profile */}
          <div className="flex items-center gap-4">
            
            {/* Live Ticking Clock */}
            <div className="hidden sm:flex flex-col items-end text-[11px] font-mono border-r border-zinc-850 pr-4">
              <span className="font-extrabold text-orange-500 tracking-wider">
                {time ? time.toLocaleTimeString("en-US", { hour12: false }) : "--:--:--"}
              </span>
              <span className="text-[9px] text-zinc-500 font-bold mt-0.5">
                {time ? time.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Loading date..."}
              </span>
            </div>

            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            </Button>

            {/* User Profile Avatar & Badge */}
            <div className="flex items-center gap-3 border-l border-zinc-850 pl-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-zinc-200">
                  {user?.name.split(" ")[0] || "Admin"}
                </span>
                <span className="text-[9px] font-extrabold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 uppercase tracking-wider">
                  Chief Operator
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md border border-orange-500 active:scale-95 transition-transform cursor-pointer">
                {user?.name ? user.name.charAt(0) : "A"}
              </div>
            </div>

          </div>
        </header>

        {/* Live Alert Banner */}
        <AlertBanner role="authority" />

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
