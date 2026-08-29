"use client";

import React, { useState, useEffect } from "react";
import { AuthorityBottomNav } from "@/components/nav/WariVaaniNavbar";
import { FlowstepBadge } from "@/components/ui/FlowstepCard";
import { missingPersonService, MissingPersonReport } from "@/services/missingPerson";
import { useWariVaaniSocket } from "@/hooks/useWariVaaniSocket";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle2,
  Phone,
  MapPin,
  X,
  UserCheck,
  Radio
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthorityMissingPersonsPage() {
  const [reports, setReports] = useState<MissingPersonReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<MissingPersonReport | null>(null);

  useEffect(() => {
    loadReports();
  }, [filterStatus]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const statusParam = filterStatus === "ALL" ? undefined : filterStatus;
      const data = await missingPersonService.getMissingReports(statusParam);
      setReports(data);
    } catch (err) {
      console.error("Failed to load missing reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useWariVaaniSocket("*", (event) => {
    if (event.type === "MISSING_PERSON_CREATED" || event.type === "MISSING_PERSON_STATUS_UPDATED") {
      loadReports();
    }
  });

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await missingPersonService.updateReportStatus(ticketId, newStatus);
      if (selectedReport && selectedReport.ticket_id === ticketId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
      loadReports();
    } catch (err) {
      console.error("Failed to update ticket status:", err);
    }
  };

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.ticket_id.toLowerCase().includes(q) ||
      (r.last_seen_location && r.last_seen_location.toLowerCase().includes(q)) ||
      r.contact.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-24 flex flex-col justify-between select-none">
      <div>
        {/* Top Header (Screen 6) */}
        <header className="sticky top-0 z-40 w-full px-4 py-3 bg-white border-b border-stone-200/80 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-base font-black text-stone-900 tracking-tight">Missing Registry</h1>
            <p className="text-xs text-stone-500 font-medium">Pandharpur Control Room Incident Board</p>
          </div>

          <button
            onClick={loadReports}
            disabled={isLoading}
            className="p-2.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-xl flex items-center gap-1.5 text-xs font-bold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </header>

        <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
          
          {/* Search Bar (Screen 6) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ticket ID, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
          </div>

          {/* Status Filter Slider (Screen 6) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {["ALL", "OPEN", "UNDER_REVIEW", "RESOLVED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
                  filterStatus === st
                    ? "bg-orange-600 text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Missing Person Cards Feed (Screen 6) */}
          {isLoading ? (
            <div className="p-12 text-center text-stone-400 space-y-2">
              <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold">Fetching missing person registry...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center bg-white border border-stone-200/80 rounded-3xl text-stone-400 text-xs font-semibold space-y-1">
              <ShieldAlert className="w-8 h-8 text-stone-300 mx-auto" />
              <p>No missing person tickets found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 bg-white border border-stone-200/80 rounded-3xl shadow-sm space-y-3 hover:border-orange-200 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-orange-600">
                        {report.ticket_id}
                      </span>
                      <h3 className="text-base font-black text-stone-900 leading-tight">
                        {report.name} <span className="text-xs font-bold text-stone-400">({report.age} yrs)</span>
                      </h3>
                    </div>
                    <FlowstepBadge status={report.status} />
                  </div>

                  <div className="space-y-1 text-xs text-stone-600 font-medium">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Last Seen: <strong>{report.last_seen_location || "Pandharpur Procession"}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Contact: <strong className="font-mono">{report.contact}</strong></span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(report.created_at || Date.now()).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage Case</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Review Modal Drawer (Screen 7) */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="w-full max-w-lg bg-white border border-stone-200 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5"
            >
              {/* Modal Header (Screen 7) */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-orange-600">{selectedReport.ticket_id}</span>
                  <h2 className="text-lg font-black text-stone-900 tracking-tight">
                    Case Management Details
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Case Profile Details (Screen 7) */}
              <div className="space-y-3 bg-stone-50 border border-stone-200/70 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-stone-900">{selectedReport.name}</h3>
                    <p className="text-xs text-stone-500 font-medium">Age: {selectedReport.age} years</p>
                  </div>
                  <FlowstepBadge status={selectedReport.status} />
                </div>

                <div className="text-xs space-y-1.5 text-stone-700 pt-1">
                  <p><strong>Description:</strong> {selectedReport.description || "No special clothing notes."}</p>
                  <p><strong>Last Seen Location:</strong> {selectedReport.last_seen_location || "Lonand Junction"}</p>
                  <p><strong>Guardian Contact:</strong> <span className="font-mono font-bold text-orange-600">{selectedReport.contact}</span></p>
                </div>
              </div>

              {/* Quick Action Controls (Screen 7) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Update Ticket Status
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.ticket_id, "OPEN")}
                    className={`py-3 rounded-2xl text-xs font-black uppercase transition-all ${
                      selectedReport.status.toUpperCase() === "OPEN"
                        ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-300"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    Open
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedReport.ticket_id, "UNDER_REVIEW")}
                    className={`py-3 rounded-2xl text-xs font-black uppercase transition-all ${
                      selectedReport.status.toUpperCase() === "UNDER_REVIEW"
                        ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    In Review
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedReport.ticket_id, "RESOLVED")}
                    className={`py-3 rounded-2xl text-xs font-black uppercase transition-all ${
                      selectedReport.status.toUpperCase() === "RESOLVED"
                        ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-full py-3 bg-stone-900 text-white text-xs font-extrabold rounded-2xl hover:bg-stone-800 transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthorityBottomNav />
    </div>
  );
}

