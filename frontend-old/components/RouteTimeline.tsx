"use client";

import React from "react";
import { RouteStop } from "../types";
import { MapPin, Clock, Flag, CheckCircle2 } from "lucide-react";

interface RouteTimelineProps {
  stops: RouteStop[];
  currentHaltName?: string;
  totalDistance?: number;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({
  stops,
  currentHaltName = "",
  totalDistance = 224,
}) => {
  if (!stops || stops.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-zinc-400">
        थांबे माहिती उपलब्ध नाही (No timeline stops available)
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-200 dark:before:bg-zinc-800">
        {stops.map((stop, idx) => {
          const isCurrent = stop.hasPalkhi || (currentHaltName && stop.name.toLowerCase().includes(currentHaltName.toLowerCase()));
          const isFirst = idx === 0;
          const isLast = idx === stops.length - 1;

          return (
            <div key={stop.id || idx} className="relative flex items-start justify-between gap-3 text-xs">
              {/* Stepper Dot */}
              <div
                className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full flex items-center justify-center border-2 ${
                  isCurrent
                    ? "bg-orange-500 border-white text-white shadow-md shadow-orange-500/40 animate-pulse z-10"
                    : isFirst || isLast
                    ? "bg-secondary border-white text-white z-10"
                    : "bg-white dark:bg-zinc-900 border-orange-300 dark:border-zinc-700 text-orange-500"
                }`}
              >
                {isCurrent ? (
                  <MapPin className="w-3 h-3" />
                ) : isLast ? (
                  <Flag className="w-2.5 h-2.5" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </div>

              {/* Stop Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    className={`font-black text-xs truncate ${
                      isCurrent ? "text-orange-600 dark:text-orange-400 text-sm" : "text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {stop.name.split(" (")[0]}
                  </h4>
                  {isCurrent && (
                    <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-[8px] font-black uppercase px-1.5 py-0.5 rounded animate-pulse">
                      Current Location
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                  <span>{stop.distanceFromStart} KM from Start</span>
                  {(stop.haltDurationHours ?? 0) > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {stop.haltDurationHours}h Halt
                    </span>
                  )}
                  {stop.isMajorHalt && (
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[8px] px-1.5 py-0.2 rounded font-bold">
                      Major Rest Camp
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Percentage badge */}
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono font-bold text-zinc-400">
                  {Math.round((stop.distanceFromStart / totalDistance) * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
