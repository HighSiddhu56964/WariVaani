'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthoritySidebar() {
  const pathname = usePathname();
  const router = Router();

  const navItems = [
    {
      name: 'Dashboard Overview',
      href: '/authority',
      icon: '📊',
      badge: null,
    },
    {
      name: 'Missing Persons',
      href: '/authority/missing-persons',
      icon: '🚨',
      badge: 'LIVE',
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      name: 'Live Palkhi Operations',
      href: '/authority/palkhi',
      icon: '🗺️',
      badge: 'MAP',
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      name: 'Facilities & Logistics',
      href: '/authority/facilities',
      icon: '🏥',
      badge: null,
    },
    {
      name: 'Lost & Found',
      href: '/authority/lost-found',
      icon: '📦',
      badge: null,
    },
    {
      name: 'Operational Alerts',
      href: '/authority/alerts',
      icon: '🔔',
      badge: null,
    },
  ];

  const handleLogout = () => {
    router.push('/authority/login');
  };

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 text-slate-300 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 shrink-0 select-none">
      {/* Top Menu Section */}
      <div className="py-4">
        <div className="px-4 pb-3 mb-2 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            CONTROL ROOM NAVIGATION
          </span>
          <span className="text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
            v2.6
          </span>
        </div>

        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              item.href === '/authority'
                ? pathname === '/authority'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isActive ? 'bg-slate-950 text-amber-300' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Authority Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="bg-slate-800/90 rounded-lg p-3 border border-slate-700/60 mb-3">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">
            SYSTEM ENVIRONMENT
          </div>
          <div className="text-xs text-slate-200 font-medium mt-0.5">
            Wari Command Center Node #01
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            PostgreSQL + Voicebot Active
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-slate-800 hover:bg-rose-900/40 hover:text-rose-200 border border-slate-700 text-slate-300 py-2 rounded text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <span>🚪</span>
          <span>Exit Control Room</span>
        </button>
      </div>
    </aside>
  );
}

function Router() {
  return useRouter();
}
