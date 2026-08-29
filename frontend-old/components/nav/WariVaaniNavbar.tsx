"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flag, Mic, Bell, User } from "lucide-react";

export function WariVaaniNavbar() {
  const pathname = usePathname();

  const navItems = [
    {
      id: "home",
      label: "Home",
      marathi: "",
      path: "/home",
      altPath: "/app",
      icon: Home,
    },
    {
      id: "wari",
      label: "Wari",
      marathi: "",
      path: "/route",
      altPath: "/app/wari",
      icon: Flag,
    },
    {
      id: "vaani",
      label: "Vaani",
      marathi: "फोनवर बोला",
      path: "/app/voice",
      icon: Mic,
      isCenterMic: true,
    },
    {
      id: "updates",
      label: "Updates",
      marathi: "",
      path: "/app/updates",
      icon: Bell,
    },
    {
      id: "profile",
      label: "Profile",
      marathi: "",
      path: "/app/profile",
      icon: User,
    },
  ];

  return (
    <div className="sticky bottom-0 left-0 right-0 z-50 w-full mt-auto">
      <nav className="w-full bg-[#FFFBF4] border-t border-[#E5D1B3] rounded-t-[28px] px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path ||
            pathname === item.altPath ||
            (item.id === "home" && (pathname === "/app" || pathname === "/home")) ||
            (item.id === "wari" && (pathname === "/route" || pathname.includes("/wari") || pathname.includes("/palkhi")));

          if (item.isCenterMic) {
            return (
              <div key={item.id} className="relative -top-5 flex flex-col items-center">
                <Link href={item.path}>
                  <div className="w-15 h-15 w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-[#E59E18] via-[#F5C242] to-[#F59E0B] text-[#290F05] flex items-center justify-center shadow-lg shadow-amber-500/40 border-4 border-[#FAF5EB] cursor-pointer hover:scale-105 transition-transform active:scale-95">
                    <Mic className="w-7 h-7 stroke-[2.5]" />
                  </div>
                </Link>
                <span className="text-[11px] font-black text-[#852C06] mt-0.5">Vaani</span>
                <span className="text-[8px] font-bold text-[#852C06]/80 -mt-0.5">{item.marathi}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.path}
              className="flex flex-col items-center justify-center text-center flex-1 py-1"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-[#C2410C] fill-[#C2410C]" : "text-[#78350F]/70"
                }`}
              />
              <span
                className={`text-[10px] font-bold mt-1 ${
                  isActive ? "text-[#C2410C] font-black" : "text-[#78350F]/80"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export const WarkariBottomNav = WariVaaniNavbar;
export const AuthorityBottomNav = WariVaaniNavbar;
