'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthorityLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('officer@warivaani.gov.in');
  const [password, setPassword] = useState('wari2026');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/authority');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Government Branding Top Header */}
        <div className="bg-slate-950 p-6 border-b border-amber-500/40 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-3xl shadow-inner mb-3">
            🏛️
          </div>
          <div className="text-xs font-bold text-amber-400 tracking-widest uppercase">
            महाराष्ट्र शासन • POLICE & DISTRICT ADMINISTRATION
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">
            WariVaani Authority Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pandharpur Wari Emergency Command & Control Room
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div className="bg-amber-950/40 border border-amber-500/30 rounded p-3 text-xs text-amber-200">
            <strong>📌 HACKATHON DEMO AUTHENTICATION</strong>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              Pre-loaded with authorized control room credentials. Click Sign In to access the live dashboard.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Officer Email / ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              placeholder="officer@warivaani.gov.in"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Access Code / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded text-sm transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating Control Room...</span>
            ) : (
              <>
                <span>Sign In to Control Room</span>
                <span>➔</span>
              </>
            )}
          </button>
        </form>

        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-400">
          Official Access Restricted to Authorized Personnel • Wari 2026
        </div>
      </div>
    </div>
  );
}
