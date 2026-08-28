"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { missingPersonService, MissingPersonReport } from "@/services/missingPerson";
import { useWariVaaniSocket } from "@/hooks/useWariVaaniSocket";
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, ArrowLeft, Phone, MapPin, Copy } from "lucide-react";
import { motion } from "framer-motion";

export default function TicketTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = (params?.ticketId as string) || "";

  const [report, setReport] = useState<MissingPersonReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (ticketId) {
      fetchTicket(ticketId);
    }
  }, [ticketId]);

  const fetchTicket = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await missingPersonService.getMissingReportByTicket(id);
      setReport(data);
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
      setError("तिकीट माहिती सापडली नाही किंवा सर्व्हरशी संपर्क होऊ शकला नाही.");
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time status update via WebSocket
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

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusDisplay = (status: string) => {
    const s = status.toUpperCase();
    if (s === "OPEN" || s === "MISSING") {
      return {
        label: "तक्रार नोंदवली (Open)",
        desc: "तुमची तक्रार नियंत्रण कक्षाला प्राप्त झाली आहे.",
        bgColor: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
        icon: Clock,
      };
    }
    if (s === "UNDER_REVIEW" || s === "IN PROGRESS") {
      return {
        label: "शोध सुरू आहे (Under Review)",
        desc: "स्वयंसेवक आणि पोलिस पथक शोध घेत आहेत.",
        bgColor: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
        icon: Clock,
      };
    }
    if (s === "RESOLVED" || s === "FOUND") {
      return {
        label: "व्यक्ति सापडली (Resolved)",
        desc: "आपल्या नातेवाईकाशी संपर्क प्रस्थापित झाला आहे.",
        bgColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle2,
      };
    }
    return {
      label: status,
      desc: "Status update pending",
      bgColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200",
      icon: ShieldCheck,
    };
  };

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Back button */}
      <button
        onClick={() => router.push("/app/missing-person")}
        className="flex items-center gap-1.5 text-xs font-black text-muted-foreground hover:text-secondary transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>मागे जा (Back to Missing Person Portal)</span>
      </button>

      {/* Main Ticket Card */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-blue-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5">
        
        {/* Ticket Header & Copy */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              तक्रार तिकीट क्रमांक / Ticket ID
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                {ticketId}
              </h1>
              <button
                onClick={handleCopyTicket}
                className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition text-xs flex items-center gap-1"
                title="Copy Ticket ID"
              >
                <Copy className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold">{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-black self-start sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Wari Control Room Tracked</span>
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground font-semibold">तिकीट माहिती लोड होत आहे...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : report ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Status Highlight Banner */}
            {(() => {
              const statusInfo = getStatusDisplay(report.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div className={`p-4 rounded-2xl border ${statusInfo.bgColor} space-y-1`}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-5 w-5 shrink-0" />
                    <h2 className="text-sm font-black uppercase tracking-wide">
                      {statusInfo.label}
                    </h2>
                  </div>
                  <p className="text-xs opacity-90 pl-7 font-medium">
                    {statusInfo.desc}
                  </p>
                </div>
              );
            })()}

            {/* Person Profile */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                नोंदवलेली माहिती (Report Details)
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50/30 dark:bg-zinc-800/40 rounded-2xl border border-blue-100 dark:border-zinc-800">
                  <span className="text-[10px] text-muted-foreground font-bold">नाव / Name</span>
                  <p className="font-black text-secondary dark:text-white mt-0.5">{report.name}</p>
                </div>

                <div className="p-3 bg-blue-50/30 dark:bg-zinc-800/40 rounded-2xl border border-blue-100 dark:border-zinc-800">
                  <span className="text-[10px] text-muted-foreground font-bold">वय / Age</span>
                  <p className="font-black text-secondary dark:text-white mt-0.5">{report.age} वर्षांचे</p>
                </div>

                <div className="p-3 bg-blue-50/30 dark:bg-zinc-800/40 rounded-2xl border border-blue-100 dark:border-zinc-800 col-span-2">
                  <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-500" />
                    <span>शेवटचे स्थान / Last Seen</span>
                  </span>
                  <p className="font-bold text-secondary dark:text-white mt-0.5">
                    {report.last_seen_location || "नकाशा विसावा क्षेत्र"}
                  </p>
                </div>

                <div className="p-3 bg-blue-50/30 dark:bg-zinc-800/40 rounded-2xl border border-blue-100 dark:border-zinc-800 col-span-2">
                  <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                    <Phone className="h-3 w-3 text-emerald-500" />
                    <span>संपर्क क्रमांक / Contact</span>
                  </span>
                  <p className="font-mono font-bold text-secondary dark:text-white mt-0.5">
                    {report.contact}
                  </p>
                </div>
              </div>
            </div>

            {/* Helpline Box */}
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-secondary dark:text-white">नियंत्रण कक्ष हेल्पलाइन</p>
                <p className="text-[10px] text-muted-foreground">Emergency Support Helpline</p>
              </div>
              <a
                href="tel:+912026123456"
                className="px-3.5 py-2 bg-orange-600 text-white rounded-xl font-black text-xs hover:bg-orange-500 transition"
              >
                +91 20 26123456
              </a>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
