'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardSummary, DashboardSummary } from '@/services/dashboard';
import { getMissingPersonReports, MissingPersonReport } from '@/services/missingPersons';
import { wsManager, WSEvent } from '@/services/websocket';

export default function AuthorityDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentReports, setRecentReports] = useState<MissingPersonReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentAlerts, setRecentAlerts] = useState<
    { id: string; title: string; time: string; type: string }[]
  >([
    {
      id: '1',
      title: 'Dnyaneshwar Palkhi reached Saswad Halt checkpoint',
      time: '10 mins ago',
      type: 'PALKHI',
    },
    {
      id: '2',
      title: 'Medical Camp #04 status set to ACTIVE',
      time: '25 mins ago',
      type: 'FACILITY',
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumData, reportsData] = await Promise.all([
        getDashboardSummary(),
        getMissingPersonReports(),
      ]);
      setSummary(sumData);
      setRecentReports(reportsData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load control room overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to real-time WebSocket events for automatic count increment & alerts
    const unsubCreated = wsManager.subscribe('MISSING_PERSON_CREATED', (event: WSEvent) => {
      const data = event.data as MissingPersonReport;
      if (data && data.ticket_id) {
        setSummary((prev) =>
          prev
            ? {
                ...prev,
                open_missing_persons: prev.open_missing_persons + 1,
              }
            : prev
        );

        setRecentReports((prev) => [data, ...prev.slice(0, 4)]);

        setRecentAlerts((prev) => [
          {
            id: String(Date.now()),
            title: `NEW MISSING REPORT: ${data.ticket_id} (${data.name}) at ${data.last_seen_location}`,
            time: 'Just now',
            type: 'MISSING',
          },
          ...prev,
        ]);
      }
    });

    const unsubPalkhi = wsManager.subscribe('PALKHI_LOCATION_UPDATED', (event: WSEvent) => {
      const data = event.data as { saint_name?: string; location_name?: string };
      setRecentAlerts((prev) => [
        {
          id: String(Date.now()),
          title: `PALKHI UPDATE: ${data.saint_name || 'Palkhi'} location updated to ${
            data.location_name || 'Route'
          }`,
          time: 'Just now',
          type: 'PALKHI',
        },
        ...prev,
      ]);
    });

    return () => {
      unsubCreated();
      unsubPalkhi();
    };
  }, []);

  const dnyaneshwarPalkhi = summary?.palkhis?.find((p) =>
    p.saint_name.toLowerCase().includes('dnyaneshwar')
  ) || summary?.palkhis?.[0];

  const tukaramPalkhi = summary?.palkhis?.find((p) =>
    p.saint_name.toLowerCase().includes('tukaram')
  ) || summary?.palkhis?.[1];

  return (
    <div className="space-y-6">
      {/* Control Room Operational Title Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-lg border-b-4 border-amber-500 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <span>STATE DISASTER MANAGEMENT & DISTRICT CONTROL ROOM</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Wari Command Center Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Integrated Monitoring for Feature Phone Telecom Calls, Mobile Web App Reports, and Real-time Palkhi Tracking.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-bold bg-slate-800 text-amber-300 px-3 py-1 rounded border border-slate-700">
            MODE: {summary?.data_mode || 'LIVE DEMO'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Sync Time: {new Date().toLocaleTimeString('en-IN')}
          </div>
        </div>
      </div>

      {/* Operational Summary Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Open Missing Reports Card */}
        <Link
          href="/authority/missing-persons"
          className="bg-white border-2 border-rose-500 rounded-lg p-4 shadow-sm hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-extrabold uppercase tracking-wider">Open Reports</span>
            <span className="text-base group-hover:scale-110 transition">🚨</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {summary ? summary.open_missing_persons : '0'}
          </div>
          <div className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
            <span>Action Required</span>
            <span>➔</span>
          </div>
        </Link>

        {/* Under Review Reports Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold uppercase tracking-wider">Under Review</span>
            <span className="text-base">📋</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {summary?.under_review_missing_persons ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active Investigation</div>
        </div>

        {/* Resolved Reports Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <span className="text-base">✅</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {summary?.resolved_missing_persons ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Reunited Cases</div>
        </div>

        {/* Active Medical Facilities */}
        <Link
          href="/authority/facilities"
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider">Medical Camps</span>
            <span className="text-base">🏥</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {summary ? summary.medical_facilities : '0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Operational On Route</div>
        </Link>

        {/* Dnyaneshwar Palkhi Card */}
        <Link
          href="/authority/palkhi"
          className="bg-slate-900 text-white rounded-lg p-4 shadow border-l-4 border-amber-500 hover:border-amber-400 transition"
        >
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Sant Dnyaneshwar Palkhi
          </div>
          <div className="text-sm font-bold truncate mt-1 text-amber-100">
            📍 {dnyaneshwarPalkhi?.current_location || summary?.palkhi_current_location || 'Alandi'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Next: {dnyaneshwarPalkhi?.next_checkpoint || 'Pune'}
          </div>
        </Link>

        {/* Tukaram Palkhi Card */}
        <Link
          href="/authority/palkhi"
          className="bg-slate-900 text-white rounded-lg p-4 shadow border-l-4 border-amber-500 hover:border-amber-400 transition"
        >
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Sant Tukaram Palkhi
          </div>
          <div className="text-sm font-bold truncate mt-1 text-amber-100">
            📍 {tukaramPalkhi?.current_location || 'Dehu'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Next: {tukaramPalkhi?.next_checkpoint || 'Akurdi'}
          </div>
        </Link>
      </div>

      {/* Main Content Layout: Recent Missing Persons + Operational Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Missing Person Reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Missing Person Cases</h2>
              <p className="text-xs text-slate-500">
                Latest live entries from Exotel Telecom Voice Calls & Mobile PWA
              </p>
            </div>
            <Link
              href="/authority/missing-persons"
              className="bg-slate-900 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-sm"
            >
              View All Cases ➔
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs">Loading recent cases...</div>
            ) : recentReports.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No missing person cases reported yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Ticket ID</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Age</th>
                      <th className="py-2.5 px-3">Last Seen</th>
                      <th className="py-2.5 px-3">Source</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentReports.map((r) => {
                      const isVoice = r.source === 'VOICE_CALL' || !r.source;
                      return (
                        <tr key={r.ticket_id} className="hover:bg-amber-50/50 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {r.ticket_id}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{r.name}</td>
                          <td className="py-2.5 px-3 text-slate-700">{r.age} yrs</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            📍 {r.last_seen_location}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                                isVoice
                                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                                  : 'bg-blue-100 border-blue-300 text-blue-900'
                              }`}
                            >
                              {isVoice ? 'VOICE CALL' : 'MOBILE APP'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                r.status === 'OPEN'
                                  ? 'bg-rose-100 text-rose-800'
                                  : r.status === 'UNDER_REVIEW'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Link
                              href={`/authority/missing-persons/${r.ticket_id}`}
                              className="text-amber-700 hover:text-amber-900 font-bold"
                            >
                              View ➔
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Live Operational Alerts Stream */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🔔 Operational Alerts</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <Link href="/authority/alerts" className="text-xs text-amber-700 font-bold hover:underline">
              View All ➔
            </Link>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-bold text-slate-700 uppercase">{alert.type}</span>
                  <span className="font-mono">{alert.time}</span>
                </div>
                <div className="font-medium text-slate-800">{alert.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
