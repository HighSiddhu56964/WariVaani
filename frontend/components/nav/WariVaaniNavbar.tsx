"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Activity, 
  Map, 
  FileText, 
  User, 
  Home, 
  Mic, 
  AlertCircle 
} from "lucide-react";

export function WarkariBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/app", icon: Home },
    { label: "Map", href: "/app/palkhi", icon: Map },
    { label: "Voice", href: "/app/voice", icon: Mic, isHero: true },
    { label: "Reports", href: "/app/missing-person", icon: AlertCircle },
    { label: "Profile", href: "/app/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-amber-50/90 backdrop-blur-md border-t border-amber-200/60 py-2 px-4 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/app" && pathname === "/warkari");
          const Icon = item.icon;

          if (item.isHero) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center -mt-5">
                <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border-2 border-amber-50 transition-transform active:scale-95 hover:scale-105">
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[11px] font-semibold mt-1 ${isActive ? "text-orange-600" : "text-amber-800/70"}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                isActive ? "text-orange-600 font-bold" : "text-amber-900/60 hover:text-amber-800"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className="text-[11px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AuthorityBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/authority", icon: LayoutDashboard },
    { label: "Operations", href: "/authority/reports", icon: Activity },
    { label: "Map", href: "/authority/map", icon: Map },
    { label: "Reports", href: "/authority/missing-persons", icon: FileText },
    { label: "Profile", href: "/authority/settings", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 py-2.5 px-4 shadow-xl text-stone-300">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-orange-400 font-semibold bg-orange-500/10"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5] text-orange-400" : "stroke-2"}`} />
              <span className="text-[11px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
