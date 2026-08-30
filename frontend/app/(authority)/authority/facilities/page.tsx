'use client';

import React, { useState, useEffect } from 'react';
import { getFacilities, Facility } from '@/services/facilities';

export default function FacilitiesControlRoom() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const data = await getFacilities();
      setFacilities(data);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleStatusToggle = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'LIMITED' : 'ACTIVE';
    setFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: nextStatus } : f))
    );
  };

  const filteredFacilities = facilities.filter(
    (f) => typeFilter === 'ALL' || f.type.toUpperCase() === typeFilter.toUpperCase()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest">
            <span>🏥 PUBLIC HEALTH & EMERGENCY LOGISTICS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Facilities & Emergency Infrastructure
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time operational monitoring of medical camps, ambulance stations, water points, and shelter centers across Wari route.
          </p>
        </div>

        <button
          onClick={fetchFacilities}
          className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3.5 py-2 rounded text-xs font-bold transition flex items-center gap-1.5"
        >
          <span>🔄</span>
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'MEDICAL', 'WATER', 'SHELTER', 'SANITATION'].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-md text-xs font-extrabold transition ${
              typeFilter === type
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {type === 'ALL' ? 'ALL FACILITIES' : `${type} CAMPS`}
          </button>
        ))}
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-lg border border-slate-200">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-sm font-medium">Loading Wari emergency facility records...</p>
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded-lg border border-slate-200">
          <p className="text-base font-bold text-slate-700">No facilities registered for filter '{typeFilter}'</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFacilities.map((f) => {
            const isActive = f.status === 'ACTIVE';
            return (
              <div
                key={f.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {f.type} FACILITY
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{f.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {f.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span>📍 Location:</span>
                    <strong className="text-slate-900">{f.location_name}</strong>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <span>📞 Contact:</span>
                    <strong className="text-slate-900">{f.contact_number || 'N/A'}</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">ID: FC-{f.id}</span>
                  <button
                    onClick={() => handleStatusToggle(f.id, f.status)}
                    className="bg-slate-900 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded text-[11px] transition shadow-sm"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
