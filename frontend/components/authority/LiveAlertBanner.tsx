'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { wsManager, WSEvent } from '@/services/websocket';

interface NewCaseAlert {
  ticket_id: string;
  name: string;
  age: number;
  clothing: string;
  last_seen_location: string;
  contact: string;
  source?: string;
  created_at?: string;
}

export default function LiveAlertBanner() {
  const [activeAlert, setActiveAlert] = useState<NewCaseAlert | null>(null);

  useEffect(() => {
    const handleNewMissingPerson = (event: WSEvent) => {
      const data = event.data as NewCaseAlert;
      if (data && data.ticket_id) {
        setActiveAlert({
          ticket_id: data.ticket_id,
          name: data.name || 'Unknown',
          age: data.age || 0,
          clothing: data.clothing || 'Not specified',
          last_seen_location: data.last_seen_location || 'Wari Route',
          contact: data.contact || 'N/A',
          source: data.source || 'VOICE_CALL',
        });

        // Auto dismiss after 12 seconds
        setTimeout(() => {
          setActiveAlert((current) => (current?.ticket_id === data.ticket_id ? null : current));
        }, 12000);
      }
    };

    const unsubscribe = wsManager.subscribe('MISSING_PERSON_CREATED', handleNewMissingPerson);
    return () => unsubscribe();
  }, []);

  if (!activeAlert) return null;

  const isVoiceCall = activeAlert.source === 'VOICE_CALL' || !activeAlert.source;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-md w-full bg-rose-950 text-white border-2 border-rose-500 rounded-lg shadow-2xl overflow-hidden animate-bounce-once">
      {/* Alert Header Bar */}
      <div className="bg-rose-900 px-4 py-2 flex items-center justify-between border-b border-rose-700">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <span className="font-extrabold text-xs tracking-wider text-rose-100 uppercase">
            🚨 CRITICAL ALERT: NEW MISSING PERSON REPORT
          </span>
        </div>
        <button
          onClick={() => setActiveAlert(null)}
          className="text-rose-300 hover:text-white font-bold text-sm px-1"
        >
          ✕
        </button>
      </div>

      {/* Alert Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span>{activeAlert.name}</span>
              <span className="text-sm font-normal text-rose-200">({activeAlert.age} yrs)</span>
            </div>
            <div className="text-xs text-rose-200 mt-0.5">
              Clothing: <span className="text-white font-medium">{activeAlert.clothing}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold bg-rose-900/90 text-amber-300 px-2 py-0.5 rounded border border-rose-600 inline-block">
              {activeAlert.ticket_id}
            </div>
            <div className="mt-1">
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  isVoiceCall ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                }`}
              >
                {isVoiceCall ? '📞 VOICE CALL' : '📱 MOBILE APP'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs bg-rose-900/60 p-2 rounded border border-rose-800/80 flex items-center justify-between text-rose-100">
          <div>
            📍 Last Seen: <strong className="text-white">{activeAlert.last_seen_location}</strong>
          </div>
          <div>
            📞 Contact: <strong className="text-white">{activeAlert.contact}</strong>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-1 flex justify-end">
          <Link
            href={`/authority/missing-persons/${activeAlert.ticket_id}`}
            onClick={() => setActiveAlert(null)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded text-xs font-bold shadow transition flex items-center gap-1"
          >
            <span>Open Case Dossier</span>
            <span>➔</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
