'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getMissingPersonReports,
  MissingPersonReport,
} from '@/services/missingPersons';
import { wsManager, WSEvent } from '@/services/websocket';

export default function MissingPersonsControlRoom() {
  const [reports, setReports] = useState<MissingPersonReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getMissingPersonReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch missing person reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Subscribe to real-time WebSocket events
    const unsubCreated = wsManager.subscribe('MISSING_PERSON_CREATED', (event: WSEvent) => {
      const newReport = event.data as MissingPersonReport;
      if (newReport && newReport.ticket_id) {
        const normalized: MissingPersonReport = {
          ...newReport,
          source: newReport.source || (newReport.ticket_id.endsWith('-M') ? 'MOBILE_APP' : 'VOICE_CALL'),
          created_at: newReport.created_at || new Date().toISOString(),
        };

        setReports((prev) => {
          // Avoid duplicate insertion
          if (prev.some((r) => r.ticket_id === normalized.ticket_id)) return prev;
          return [normalized, ...prev];
        });
      }
    });

    const unsubStatus = wsManager.subscribe('MISSING_PERSON_STATUS_UPDATED', (event: WSEvent) => {
      const data = event.data as { ticket_id: string; status: string };
      if (data && data.ticket_id) {
        setReports((prev) =>
          prev.map((r) =>
            r.ticket_id === data.ticket_id ? { ...r, status: data.status } : r
          )
        );
      }
    });

    return () => {
      unsubCreated();
      unsubStatus();
    };
  }, []);

  // Filtered dataset
  const filteredReports = reports.filter((r) => {
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : r.status.toUpperCase() === statusFilter.toUpperCase();

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      r.ticket_id.toLowerCase().includes(query) ||
      r.name.toLowerCase().includes(query) ||
      r.last_seen_location.toLowerCase().includes(query) ||
      r.contact.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  const countOpen = reports.filter((r) => r.status === 'OPEN').length;
  const countReview = reports.filter((r) => r.status === 'UNDER_REVIEW').length;
  const countResolved = reports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Control Room Section Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest">
            <span>🚨 HIGH PRIORITY CONTROL ROOM MODULE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Missing Persons Operations Table
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time emergency missing person tracking combining Feature Phone Voice Calls and Mobile Web App submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3.5 py-2 rounded text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Refresh Table</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Summary Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-lg border text-left transition ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 border-slate-900 text-white shadow'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reports</div>
          <div className="text-2xl font-bold mt-1">{reports.length}</div>
        </button>

        <button
          onClick={() => setStatusFilter('OPEN')}
          className={`p-4 rounded-lg border text-left transition ${
            statusFilter === 'OPEN'
              ? 'bg-rose-900 border-rose-900 text-white shadow'
              : 'bg-white border-slate-200 text-rose-700 hover:border-rose-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center justify-between">
            <span>Open Cases</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold mt-1">{countOpen}</div>
        </button>

        <button
          onClick={() => setStatusFilter('UNDER_REVIEW')}
          className={`p-4 rounded-lg border text-left transition ${
            statusFilter === 'UNDER_REVIEW'
              ? 'bg-blue-900 border-blue-900 text-white shadow'
              : 'bg-white border-slate-200 text-blue-700 hover:border-blue-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">Under Review</div>
          <div className="text-2xl font-bold mt-1">{countReview}</div>
        </button>

        <button
          onClick={() => setStatusFilter('RESOLVED')}
          className={`p-4 rounded-lg border text-left transition ${
            statusFilter === 'RESOLVED'
              ? 'bg-emerald-900 border-emerald-900 text-white shadow'
              : 'bg-white border-slate-200 text-emerald-700 hover:border-emerald-300'
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Resolved Cases</div>
          <div className="text-2xl font-bold mt-1">{countResolved}</div>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by Ticket ID, Name, Location, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{filteredReports.length}</strong> of{' '}
          <strong className="text-slate-800">{reports.length}</strong> total cases
        </div>
      </div>

      {/* Main Operational Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm font-medium">Loading missing person reports from PostgreSQL database...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-base font-bold text-slate-700">No missing person reports found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Try adjusting your search criteria.' : 'No cases matching the current status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Age</th>
                  <th className="py-3.5 px-4">Clothing</th>
                  <th className="py-3.5 px-4">Last Seen</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Created At</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredReports.map((report) => {
                  const isVoiceCall = report.source === 'VOICE_CALL' || !report.source;
                  const formattedDate = report.created_at
                    ? new Date(report.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Just now';

                  return (
                    <tr
                      key={report.ticket_id}
                      className="hover:bg-amber-50/50 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {report.ticket_id}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        {report.name}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {report.age} yrs
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate">
                        {report.clothing}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        📍 {report.last_seen_location}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        📞 {report.contact}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isVoiceCall
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-blue-100 border-blue-300 text-blue-900'
                          }`}
                        >
                          {isVoiceCall ? '📞 VOICE CALL' : '📱 MOBILE APP'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {formattedDate}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/authority/missing-persons/${report.ticket_id}`}
                          className="inline-flex items-center gap-1 bg-slate-900 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
                        >
                          <span>View Case</span>
                          <span>➔</span>
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
  );
}

function StatusBadge({ status }: { status: string }) {
  const upper = status?.toUpperCase() || 'OPEN';
  if (upper === 'OPEN') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-rose-100 border border-rose-300 text-rose-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
        OPEN
      </span>
    );
  }
  if (upper === 'UNDER_REVIEW') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-blue-100 border border-blue-300 text-blue-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        UNDER REVIEW
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      RESOLVED
    </span>
  );
}
