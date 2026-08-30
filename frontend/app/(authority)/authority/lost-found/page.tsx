'use client';

import React, { useState, useEffect } from 'react';
import {
  getLostFoundReports,
  updateLostFoundStatus,
  LostItemReport,
} from '@/services/lostFound';
import { wsManager, WSEvent } from '@/services/websocket';

export default function LostAndFoundControlRoom() {
  const [reports, setReports] = useState<LostItemReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getLostFoundReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch Lost & Found reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Subscribe to real-time WebSocket events
    const unsubCreated = wsManager.subscribe('LOST_FOUND_CREATED', (event: WSEvent) => {
      const newReport = event.data as LostItemReport;
      if (newReport && newReport.ticket_id) {
        setReports((prev) => {
          if (prev.some((r) => r.ticket_id === newReport.ticket_id)) return prev;
          return [newReport, ...prev];
        });
      }
    });

    const unsubStatus = wsManager.subscribe('LOST_FOUND_STATUS_UPDATED', (event: WSEvent) => {
      const data = event.data as { id?: number; ticket_id?: string; status: LostItemReport['status'] };
      if (data && (data.id || data.ticket_id)) {
        setReports((prev) =>
          prev.map((r) =>
            (data.id && r.id === data.id) || (data.ticket_id && r.ticket_id === data.ticket_id)
              ? { ...r, status: data.status }
              : r
          )
        );
      }
    });

    return () => {
      unsubCreated();
      unsubStatus();
    };
  }, []);

  const handleStatusUpdate = async (id: number, newStatus: LostItemReport['status']) => {
    setUpdatingId(id);
    try {
      const updated = await updateLostFoundStatus(id, newStatus);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r))
      );
    } catch (err) {
      console.error(`Failed to update status for report #${id}:`, err);
      alert('Failed to update report status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered dataset
  const filteredReports = reports.filter((r) => {
    const matchesType =
      reportTypeFilter === 'ALL'
        ? true
        : r.report_type.toUpperCase() === reportTypeFilter.toUpperCase();

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : r.status.toUpperCase() === statusFilter.toUpperCase();

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      r.ticket_id.toLowerCase().includes(query) ||
      r.item_type.toLowerCase().includes(query) ||
      (r.color && r.color.toLowerCase().includes(query)) ||
      r.location.toLowerCase().includes(query) ||
      r.contact_number.toLowerCase().includes(query);

    return matchesType && matchesStatus && matchesQuery;
  });

  const countLost = reports.filter((r) => r.report_type === 'LOST').length;
  const countFound = reports.filter((r) => r.report_type === 'FOUND').length;
  const countOpen = reports.filter((r) => r.status === 'OPEN').length;
  const countReview = reports.filter((r) => r.status === 'UNDER_REVIEW').length;
  const countResolved = reports.filter((r) => r.status === 'RESOLVED').length;
  const countClosed = reports.filter((r) => r.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Control Room Section Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest">
            <span>📦 PROPERTY & BELONGINGS REGISTRY</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Lost & Found Property Control Room
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time tracking of lost belongings and recovered property across Wari encampments and routes.
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <button
          onClick={() => { setReportTypeFilter('ALL'); setStatusFilter('ALL'); }}
          className={`p-3.5 rounded-lg border text-left transition ${
            reportTypeFilter === 'ALL' && statusFilter === 'ALL'
              ? 'bg-slate-900 border-slate-900 text-white shadow'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Items</div>
          <div className="text-2xl font-bold mt-0.5">{reports.length}</div>
        </button>

        <button
          onClick={() => setReportTypeFilter('LOST')}
          className={`p-3.5 rounded-lg border text-left transition ${
            reportTypeFilter === 'LOST'
              ? 'bg-amber-900 border-amber-900 text-white shadow'
              : 'bg-white border-slate-200 text-amber-700 hover:border-amber-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-500">Lost Items</div>
          <div className="text-2xl font-bold mt-0.5">{countLost}</div>
        </button>

        <button
          onClick={() => setReportTypeFilter('FOUND')}
          className={`p-3.5 rounded-lg border text-left transition ${
            reportTypeFilter === 'FOUND'
              ? 'bg-teal-900 border-teal-900 text-white shadow'
              : 'bg-white border-slate-200 text-teal-700 hover:border-teal-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-500">Found Items</div>
          <div className="text-2xl font-bold mt-0.5">{countFound}</div>
        </button>

        <button
          onClick={() => setStatusFilter('OPEN')}
          className={`p-3.5 rounded-lg border text-left transition ${
            statusFilter === 'OPEN'
              ? 'bg-rose-900 border-rose-900 text-white shadow'
              : 'bg-white border-slate-200 text-rose-700 hover:border-rose-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 flex items-center justify-between">
            <span>Open</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold mt-0.5">{countOpen}</div>
        </button>

        <button
          onClick={() => setStatusFilter('UNDER_REVIEW')}
          className={`p-3.5 rounded-lg border text-left transition ${
            statusFilter === 'UNDER_REVIEW'
              ? 'bg-blue-900 border-blue-900 text-white shadow'
              : 'bg-white border-slate-200 text-blue-700 hover:border-blue-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Under Review</div>
          <div className="text-2xl font-bold mt-0.5">{countReview}</div>
        </button>

        <button
          onClick={() => setStatusFilter('RESOLVED')}
          className={`p-3.5 rounded-lg border text-left transition ${
            statusFilter === 'RESOLVED'
              ? 'bg-emerald-900 border-emerald-900 text-white shadow'
              : 'bg-white border-slate-200 text-emerald-700 hover:border-emerald-300'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Resolved / Closed</div>
          <div className="text-2xl font-bold mt-0.5">{countResolved + countClosed}</div>
        </button>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type & Status Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-slate-500 uppercase mr-1">Type:</span>
          {['ALL', 'LOST', 'FOUND'].map((type) => (
            <button
              key={type}
              onClick={() => setReportTypeFilter(type)}
              className={`px-3 py-1.5 rounded font-bold transition ${
                reportTypeFilter === type
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}

          <span className="font-bold text-slate-500 uppercase ml-3 mr-1">Status:</span>
          {['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded font-bold transition ${
                statusFilter === st
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search Ticket, Item, Location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Main Operational Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm font-medium">Loading property reports from database...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-base font-bold text-slate-700">No property reports found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Try adjusting your search criteria.' : 'No cases matching selected filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Item Description</th>
                  <th className="py-3.5 px-4">Color</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Logged At</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReports.map((report) => {
                  const isVoiceCall = report.source === 'VOICE_CALL' || !report.source;
                  const isLost = report.report_type === 'LOST';
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
                      key={report.id}
                      className="hover:bg-amber-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {report.ticket_id}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isLost
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-teal-100 border-teal-300 text-teal-900'
                          }`}
                        >
                          {isLost ? '🔴 LOST' : '🟢 FOUND'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {report.item_type}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {report.color || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-semibold">
                        📍 {report.location}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        📞 {report.contact_number}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isVoiceCall
                              ? 'bg-slate-100 border-slate-300 text-slate-800'
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
                        <div className="inline-flex items-center gap-1">
                          {report.status !== 'UNDER_REVIEW' && (
                            <button
                              disabled={updatingId === report.id}
                              onClick={() => handleStatusUpdate(report.id, 'UNDER_REVIEW')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded text-[10px] transition disabled:opacity-50"
                            >
                              Review
                            </button>
                          )}
                          {report.status !== 'RESOLVED' && (
                            <button
                              disabled={updatingId === report.id}
                              onClick={() => handleStatusUpdate(report.id, 'RESOLVED')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[10px] transition disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          )}
                          {report.status !== 'CLOSED' && (
                            <button
                              disabled={updatingId === report.id}
                              onClick={() => handleStatusUpdate(report.id, 'CLOSED')}
                              className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded text-[10px] transition disabled:opacity-50"
                            >
                              Close
                            </button>
                          )}
                        </div>
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
  if (upper === 'CLOSED') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-slate-200 border border-slate-400 text-slate-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        CLOSED
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
