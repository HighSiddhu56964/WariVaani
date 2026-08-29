"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { missingPersonService, MissingPersonReport } from "@/services/missingPerson";
import { useWariVaaniSocket } from "@/hooks/useWariVaaniSocket";
import { ShieldAlert, ArrowLeft, Clock, CheckCircle2, AlertCircle, Phone, MapPin, User, FileText, Check } from "lucide-react";

export default function AuthorityMissingPersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = (params?.ticketId as string) || "";

  const [report, setReport] = useState<MissingPersonReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (ticketId) {
      loadTicketDetails(ticketId);
    }
  }, [ticketId]);

  const loadTicketDetails = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await missingPersonService.getMissingReportByTicket(id);
      setReport(data);
    } catch (err) {
      console.error("Failed to load ticket:", err);
      setError("तक्रार तपशील लोड करताना त्रुटी आली.");
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time WebSocket listener
  useWariVaaniSocket("MISSING_PERSON_STATUS_UPDATED", (event) => {
    if (event.data && event.data.ticket_id === ticketId) {
      setReport((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: event.data.status || prev.status,
        };
      });
    }
  });

  const handleUpdateStatus = async (newStatus: "OPEN" | "UNDER_REVIEW" | "RESOLVED") => {
    if (!report) return;
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await missingPersonService.updateMissingReportStatus(ticketId, newStatus);
      setReport(updated);
      setSuccessMessage(`Status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("स्थिती अपडेट करताना त्रुटी आली.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Back Link */}
      <button
        onClick={() => router.push("/authority/missing-persons")}
        className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Missing Persons Registry</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">
            Case Incident File
          </span>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
            <span>Ticket:</span>
            <span className="font-mono text-orange-400">{ticketId}</span>
          </h1>
        </div>

        {report && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-bold">Current Case Status:</span>
            <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs font-black uppercase text-white">
              {report.status}
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-zinc-400 bg-zinc-900 rounded-3xl border border-zinc-800">
          <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading incident case details...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-800 rounded-3xl text-center space-y-2">
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto" />
          <p className="text-xs font-bold text-red-300">{error}</p>
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Case Info (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <User className="h-4 w-4 text-orange-400" />
                <span>व्यक्तिगत माहिती (Person Profile & Info)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <span className="text-zinc-500 font-bold">Name</span>
                  <p className="text-sm font-extrabold text-white mt-0.5">{report.name}</p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <span className="text-zinc-500 font-bold">Age</span>
                  <p className="text-sm font-extrabold text-white mt-0.5">{report.age} Years</p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <span className="text-zinc-500 font-bold flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-400" />
                    <span>Last Seen Location</span>
                  </span>
                  <p className="text-xs font-extrabold text-white mt-0.5">
                    {report.last_seen_location || "Not specified"}
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <span className="text-zinc-500 font-bold flex items-center gap-1">
                    <Phone className="h-3 w-3 text-emerald-400" />
                    <span>Contact Number</span>
                  </span>
                  <p className="text-xs font-mono font-extrabold text-white mt-0.5">
                    {report.contact}
                  </p>
                </div>
              </div>

              {/* Description & Attire */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs space-y-2">
                <span className="text-zinc-500 font-bold flex items-center gap-1">
                  <FileText className="h-3 w-3 text-blue-400" />
                  <span>Attire & Additional Details</span>
                </span>
                <p className="text-zinc-200 leading-relaxed font-medium">
                  {report.clothing || report.description || "No specific attire description recorded."}
                </p>
              </div>
            </div>
          </div>

          {/* Status Management Panel (Right 1 col) */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border-2 border-orange-900/40 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-orange-400" />
                <span>केस स्थिती बदल (Update Status)</span>
              </h2>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Select an action to update the ticket status. All changes broadcast live to Warkari users and field teams.
              </p>

              {successMessage && (
                <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-300">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                {/* Button: OPEN */}
                <button
                  onClick={() => handleUpdateStatus("OPEN")}
                  disabled={isUpdating}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase flex items-center justify-between border transition ${
                    report.status === "OPEN"
                      ? "bg-amber-600 text-white border-amber-500 shadow-md"
                      : "bg-zinc-950 text-amber-400 border-zinc-800 hover:border-amber-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>OPEN (तपास सुरू)</span>
                  </span>
                  {report.status === "OPEN" && <Check className="h-4 w-4" />}
                </button>

                {/* Button: UNDER_REVIEW */}
                <button
                  onClick={() => handleUpdateStatus("UNDER_REVIEW")}
                  disabled={isUpdating}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase flex items-center justify-between border transition ${
                    report.status === "UNDER_REVIEW"
                      ? "bg-blue-600 text-white border-blue-500 shadow-md"
                      : "bg-zinc-950 text-blue-400 border-zinc-800 hover:border-blue-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>UNDER REVIEW (शोध प्रक्रिया)</span>
                  </span>
                  {report.status === "UNDER_REVIEW" && <Check className="h-4 w-4" />}
                </button>

                {/* Button: RESOLVED */}
                <button
                  onClick={() => handleUpdateStatus("RESOLVED")}
                  disabled={isUpdating}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase flex items-center justify-between border transition ${
                    report.status === "RESOLVED"
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                      : "bg-zinc-950 text-emerald-400 border-zinc-800 hover:border-emerald-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>RESOLVED (व्यक्ती सापडली)</span>
                  </span>
                  {report.status === "RESOLVED" && <Check className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
