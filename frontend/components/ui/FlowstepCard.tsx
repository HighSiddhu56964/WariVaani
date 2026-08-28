"use client";

import React from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  trend?: string;
  iconBg?: string;
  iconColor?: string;
}

export function FlowstepMetricCard({
  icon: Icon,
  value,
  label,
  trend,
  iconBg = "bg-blue-100/70",
  iconColor = "text-blue-600",
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex-shrink-0 w-36 sm:w-44 bg-white/90 backdrop-blur-sm border border-stone-200/80 rounded-3xl p-4 shadow-sm flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {trend}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">{value}</div>
        <div className="text-xs font-medium text-stone-500 mt-0.5 leading-snug">{label}</div>
      </div>
    </motion.div>
  );
}

interface StatusBadgeProps {
  status: "on_route" | "resolved" | "pending" | "critical" | string;
  customText?: string;
}

export function FlowstepBadge({ status, customText }: StatusBadgeProps) {
  let bgClass = "bg-emerald-100/80 text-emerald-800 border-emerald-300/60";
  let dotClass = "bg-emerald-500";
  let label = customText || status;

  switch (status.toLowerCase()) {
    case "on_route":
    case "on route":
    case "resolved":
    case "live":
      bgClass = "bg-emerald-100/80 text-emerald-800 border-emerald-300/60";
      dotClass = "bg-emerald-500 animate-pulse";
      label = customText || "On Route";
      break;
    case "pending":
    case "in progress":
    case "under_review":
      bgClass = "bg-amber-100/80 text-amber-800 border-amber-300/60";
      dotClass = "bg-amber-500";
      label = customText || "Pending";
      break;
    case "critical":
    case "open":
    case "urgent":
      bgClass = "bg-rose-100/80 text-rose-800 border-rose-300/60";
      dotClass = "bg-rose-500 animate-ping";
      label = customText || "Critical";
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${bgClass}`}>
      <span className={`w-2 h-2 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

interface RouteProgressBarProps {
  percentage: number;
  currentLoc: string;
  nextLoc: string;
  kmRemaining: number;
}

export function FlowstepRouteProgress({
  percentage = 72,
  currentLoc = "Wakhari",
  nextLoc = "Pandharpur",
  kmRemaining = 8.4,
}: RouteProgressBarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-stone-200/80 rounded-3xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
            🦶
          </div>
          <span className="text-sm font-bold text-stone-900">Palkhi Status</span>
        </div>
        <FlowstepBadge status="on_route" />
      </div>

      <div className="flex items-center justify-between text-xs text-stone-600 font-medium mb-1.5">
        <span>Current: <strong className="text-stone-900 font-bold">{currentLoc}</strong></span>
        <span>Next: <strong className="text-stone-900 font-bold">{nextLoc}</strong></span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
        />
      </div>

      <div className="flex items-center justify-between text-xs font-semibold mt-2">
        <span className="text-emerald-700">{percentage}% completed</span>
        <span className="text-stone-500">{kmRemaining} km remaining</span>
      </div>
    </div>
  );
}
