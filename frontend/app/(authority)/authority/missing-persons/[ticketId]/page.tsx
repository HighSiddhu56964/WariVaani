'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getMissingPersonByTicket,
  updateMissingPersonStatus,
  MissingPersonReport,
} from '@/services/missingPersons';

export default function MissingPersonDossierPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.ticketId;
  const router = useRouter();

  const [report, setReport] = useState<MissingPersonReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const loadTicket = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await getMissingPersonByTicket(ticketId);
      setReport(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(`Failed to load case dossier for ticket '${ticketId}'.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const handleStatusChange = async (newStatus: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED') => {
    if (!report) return;
    setUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const updated = await updateMissingPersonStatus(report.ticket_id, newStatus);
      setReport(updated);
      setSuccessMessage(`Ticket status successfully updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed';
      setErrorMessage(`Failed to update status: ${msg}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-lg border border-slate-200 shadow-sm text-center">
        <div className="inline-block animate-spin text-3xl mb-3">⏳</div>
        <p className="text-base font-bold text-slate-700">Loading Case Dossier for {ticketId}...</p>
      </div>
    );
  }

  if (errorMessage && !report) {
    return (
      <div className="space-y-4">
        <Link
          href="/authority/missing-persons"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <span>⬅</span>
          <span>Back to Missing Persons Control Room</span>
        </Link>
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-lg text-rose-800">
          <h2 className="text-lg font-bold">Ticket Not Found</h2>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const isVoiceCall = report.source === 'VOICE_CALL' || !report.source;
  const createdDateStr = report.created_at
    ? new Date(report.created_at).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'medium',
      })
    : 'Recorded';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/authority/missing-persons"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3.5 py-2 rounded shadow-sm transition"
        >
          <span>⬅</span>
          <span>Back to Missing Persons Table</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Case Ticket:</span>
          <span className="font-mono text-sm font-bold bg-slate-900 text-amber-400 px-2.5 py-1 rounded">
            {report.ticket_id}
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-900 text-emerald-100 border border-emerald-600 p-4 rounded-lg text-sm font-bold flex items-center justify-between shadow">
          <span>✅ {successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-xs text-emerald-300">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="bg-rose-900 text-rose-100 border border-rose-600 p-4 rounded-lg text-sm font-bold">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Case Dossier Main Card */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-md overflow-hidden">
        {/* Dossier Header */}
        <div className="bg-slate-900 text-white p-6 border-b-2 border-amber-500 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <span>MAHARASHTRA POLICE • CASE DOSSIER</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-1">{report.name}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Registered on: <span className="text-slate-200 font-mono">{createdDateStr}</span>
            </p>
          </div>

          <div className="text-right space-y-2">
            <StatusBadge status={report.status} size="large" />
            <div>
              <span
                className={`inline-block text-xs font-extrabold px-3 py-1 rounded border uppercase tracking-wider ${
                  isVoiceCall
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-blue-500/20 border-blue-500 text-blue-300'
                }`}
              >
                {isVoiceCall ? '📞 VOICE CALL SOURCE' : '📱 MOBILE APP SOURCE'}
              </span>
            </div>
          </div>
        </div>

        {/* Dossier Field Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">
              PERSONAL DETAILS
            </h3>

            <div>
              <span className="text-xs text-slate-500 font-medium">Full Name:</span>
              <div className="text-base font-bold text-slate-900">{report.name}</div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium">Age:</span>
              <div className="text-base font-bold text-slate-900">{report.age} years old</div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium">Clothing / Attire:</span>
              <div className="text-sm font-semibold text-slate-800 bg-amber-50 border border-amber-200 p-2.5 rounded mt-0.5">
                {report.clothing}
              </div>
            </div>

            {report.description && (
              <div>
                <span className="text-xs text-slate-500 font-medium">Additional Features / Details:</span>
                <div className="text-xs text-slate-700 mt-0.5">{report.description}</div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">
              LAST KNOWN LOCATION & CONTACT
            </h3>

            <div>
              <span className="text-xs text-slate-500 font-medium">Last Seen Location:</span>
              <div className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <span>📍</span>
                <span>{report.last_seen_location}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium">Guardian / Reporter Contact Phone:</span>
              <div className="text-base font-mono font-bold text-slate-900 bg-slate-100 p-2.5 rounded border border-slate-200 mt-0.5 flex items-center justify-between">
                <span>📞 {report.contact}</span>
                <a
                  href={`tel:${report.contact}`}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1 rounded font-sans font-bold"
                >
                  Call Contact
                </a>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium">Case Source Workflow:</span>
              <div className="text-xs text-slate-700 mt-0.5 font-medium">
                {isVoiceCall
                  ? 'Collected directly over Exotel Telecom Voicebot (Phone Call)'
                  : 'Submitted via WariVaani Mobile Web App Interface'}
              </div>
            </div>
          </div>
        </div>

        {/* Authority Action Control Bar */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              AUTHORITY DISPATCH ACTION
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Update status in real-time across central Wari Control Room and database.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {report.status !== 'UNDER_REVIEW' && (
              <button
                onClick={() => handleStatusChange('UNDER_REVIEW')}
                disabled={updating}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded text-xs transition shadow border border-blue-400 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Mark UNDER REVIEW'}
              </button>
            )}

            {report.status !== 'RESOLVED' && (
              <button
                onClick={() => handleStatusChange('RESOLVED')}
                disabled={updating}
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded text-xs transition shadow border border-emerald-400 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Mark RESOLVED'}
              </button>
            )}

            {report.status !== 'OPEN' && (
              <button
                onClick={() => handleStatusChange('OPEN')}
                disabled={updating}
                className="flex-1 md:flex-none bg-rose-700 hover:bg-rose-600 text-white font-bold px-4 py-2.5 rounded text-xs transition shadow border border-rose-500 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Re-Open Case'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, size }: { status: string; size?: string }) {
  const upper = status?.toUpperCase() || 'OPEN';
  const isLarge = size === 'large';

  if (upper === 'OPEN') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-rose-500 text-white font-extrabold rounded-full uppercase tracking-wider shadow ${
          isLarge ? 'text-xs px-4 py-1.5' : 'text-[10px] px-2.5 py-1'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        STATUS: OPEN
      </span>
    );
  }
  if (upper === 'UNDER_REVIEW') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-blue-500 text-white font-extrabold rounded-full uppercase tracking-wider shadow ${
          isLarge ? 'text-xs px-4 py-1.5' : 'text-[10px] px-2.5 py-1'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-white" />
        STATUS: UNDER REVIEW
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-emerald-500 text-white font-extrabold rounded-full uppercase tracking-wider shadow ${
        isLarge ? 'text-xs px-4 py-1.5' : 'text-[10px] px-2.5 py-1'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-white" />
      STATUS: RESOLVED
    </span>
  );
}
