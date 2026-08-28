"use client";

import React, { useState } from "react";
import { AlertTriangle, Info, Bell, X, ShieldAlert } from "lucide-react";
import { useAlerts } from "../hooks/useAlerts";

interface AlertBannerProps {
  role?: "warkari" | "authority";
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ role = "warkari" }) => {
  const { data: alerts, isLoading } = useAlerts();
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeAlerts = alerts.filter((a) => !dismissed.includes(a.id));

  if (isLoading || activeAlerts.length === 0) {
    return null;
  }

  const currentAlert = activeAlerts[currentIndex % activeAlerts.length];

  const isWarning = currentAlert.severity === "warning" || currentAlert.severity === "critical";

  return (
    <div
      className={`w-full px-4 py-2.5 flex items-center justify-between border-b transition-colors shadow-md ${
        isWarning
          ? "bg-amber-950/80 border-amber-800/60 text-amber-200"
          : "bg-blue-950/80 border-blue-800/60 text-blue-200"
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className={`p-1.5 rounded-full shrink-0 ${
            isWarning ? "bg-amber-500/20 text-amber-400 animate-pulse" : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {role === "authority" ? (
            <ShieldAlert className="w-4 h-4" />
          ) : isWarning ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Info className="w-4 h-4" />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium truncate">
          <span
            className={`font-semibold uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded ${
              isWarning ? "bg-amber-500/30 text-amber-300" : "bg-blue-500/30 text-blue-300"
            }`}
          >
            {currentAlert.severity}
          </span>
          <span className="font-bold shrink-0">{currentAlert.title}:</span>
          <span className="truncate text-zinc-300">{currentAlert.message}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        {activeAlerts.length > 1 && (
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % activeAlerts.length)}
            className="text-xs px-2 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 transition"
          >
            {currentIndex + 1}/{activeAlerts.length} Next
          </button>
        )}
        <button
          onClick={() => setDismissed((prev) => [...prev, currentAlert.id])}
          className="p-1 rounded hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
