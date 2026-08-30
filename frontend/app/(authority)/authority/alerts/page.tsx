'use client';

import React, { useState } from 'react';

interface AlertItem {
  id: string;
  marathi_text: string;
  english_text: string;
  severity: 'HIGH' | 'MEDIUM' | 'INFO';
  timestamp: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export default function OperationalAlertsControlRoom() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'ALT-101',
      marathi_text: 'पुढील मार्गावर गर्दी आहे. कृपया पर्यायी मार्ग वापरावा.',
      english_text: 'Heavy crowd congestion ahead on Dive Ghat. Please use designated side pedestrian lanes.',
      severity: 'HIGH',
      timestamp: '2026-08-29 11:00 AM',
      status: 'ACTIVE',
    },
    {
      id: 'ALT-102',
      marathi_text: 'सासवाड मुक्काम तळावर वैद्यकीय मदत कक्ष कार्यरत आहे.',
      english_text: '24/7 Medical camp & ambulance unit active at Saswad stabling ground.',
      severity: 'MEDIUM',
      timestamp: '2026-08-29 09:30 AM',
      status: 'ACTIVE',
    },
  ]);

  const [newMarathi, setNewMarathi] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newSeverity, setNewSeverity] = useState<'HIGH' | 'MEDIUM' | 'INFO'>('HIGH');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarathi.trim()) return;

    const newItem: AlertItem = {
      id: `ALT-${Date.now().toString().slice(-3)}`,
      marathi_text: newMarathi,
      english_text: newEnglish || newMarathi,
      severity: newSeverity,
      timestamp: new Date().toLocaleString('en-IN'),
      status: 'ACTIVE',
    };

    setAlerts([newItem, ...alerts]);
    setNewMarathi('');
    setNewEnglish('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest">
            <span>📢 PUBLIC SAFETY & ROUTE BROADCASTS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Operational Bulletins & Route Warnings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Broadcast emergency alerts directly to WariVaani mobile apps and public sound systems.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Creation Form */}
        <form
          onSubmit={handleBroadcast}
          className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4"
        >
          <h2 className="text-sm font-extrabold text-slate-900 border-b pb-2 uppercase tracking-wider">
            Issue New Advisory / Announcement
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Marathi Notice Text (आजची सूचना):
            </label>
            <textarea
              rows={3}
              value={newMarathi}
              onChange={(e) => setNewMarathi(e.target.value)}
              placeholder="उदा. पुढील मार्गावर गर्दी आहे..."
              required
              className="w-full border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              English Advisory Text:
            </label>
            <textarea
              rows={2}
              value={newEnglish}
              onChange={(e) => setNewEnglish(e.target.value)}
              placeholder="e.g. Heavy crowd traffic reported near Dive Ghat..."
              className="w-full border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Severity Level:</label>
            <select
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value as 'HIGH' | 'MEDIUM' | 'INFO')}
              className="w-full border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="HIGH">🔴 HIGH (Route Blocked / Crowd Emergency)</option>
              <option value="MEDIUM">🟡 MEDIUM (Weather / Slow Movement)</option>
              <option value="INFO">🔵 INFO (Water / Camp Announcement)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded text-xs transition shadow flex items-center justify-center gap-1.5"
          >
            <span>📢 Broadcast Advisory</span>
          </button>
        </form>

        {/* Active Bulletins Stream */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Active Public Bulletins ({alerts.length})
          </h2>

          <div className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2 border-l-4 border-l-amber-500"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-900">{a.id}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{a.timestamp}</span>
                </div>

                <div className="text-base font-bold text-slate-900 bg-amber-50/60 p-2.5 rounded border border-amber-200/60">
                  {a.marathi_text}
                </div>

                <div className="text-xs text-slate-700">{a.english_text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
