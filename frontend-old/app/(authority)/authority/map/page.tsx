"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AuthorityBottomNav } from "@/components/nav/WariVaaniNavbar";
import { palkhiService } from "@/services/palkhi";
import { facilitiesService, Facility } from "@/services/facilities";
import { missingPersonService, MissingPersonReport } from "@/services/missingPerson";
import { useWariVaaniSocket } from "@/hooks/useWariVaaniSocket";
import { Search, Filter, Layers, Navigation, Hospital, ShieldAlert, Radio } from "lucide-react";

const WariMap = dynamic(() => import("@/components/maps/WariMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-stone-900 border border-stone-800 rounded-3xl flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-stone-400 font-semibold">नकाशा लोड होत आहे (Loading Telemetry Engine)...</p>
    </div>
  ),
});

export default function AuthorityMapPage() {
  const [palkhis, setPalkhis] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [missingReports, setMissingReports] = useState<MissingPersonReport[]>([]);
  const [routeStops, setRouteStops] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const allPalkhis = await palkhiService.getPalkhis();
      const currentList = await Promise.all(
        allPalkhis.map(async (p) => {
          try {
            const curr = await palkhiService.getPalkhiCurrent(p.id);
            return {
              id: String(p.id),
              name: p.name,
              saint: p.saint_name,
              currentPlace: curr.current_checkpoint,
              lat: curr.latitude,
              lng: curr.longitude,
              lastUpdated: curr.updated_at || new Date().toISOString(),
              warkariCount: p.id === 1 ? 450000 : 380000,
              contactNo: "+91 98765 43210",
              routeName: p.route_name || "Alandi/Dehu to Pandharpur",
              speed: "Walking (4 km/h)",
              nextHalt: curr.next_checkpoint || "Next Halt",
            };
          } catch {
            return null;
          }
        })
      );
      setPalkhis(currentList.filter(Boolean));

      const route1 = await palkhiService.getPalkhiRoute(1);
      const stops = route1.map((cp) => ({
        id: `cp-${cp.id}`,
        name: cp.location_name,
        distanceFromStart: cp.sequence_number * 15,
        lat: cp.latitude,
        lng: cp.longitude,
        hasPalkhi: false,
        facilitiesAvailable: (cp.is_ringan ? ["Medical", "Water"] : ["Medical"]) as ("Medical" | "Water" | "Food" | "Toilets")[],
      }));
      setRouteStops(stops);

      const facs = await facilitiesService.getNearbyFacilities(18.5089, 73.9259, 100.0);
      setFacilities(facs);

      const missing = await missingPersonService.getMissingReports("OPEN");
      setMissingReports(missing);
    } catch (err) {
      console.error("Failed to load command map telemetry:", err);
    }
  };

  useWariVaaniSocket("*", (event) => {
    if (event.type === "PALKHI_LOCATION_UPDATED" || event.type === "MISSING_PERSON_CREATED") {
      loadMapData();
    }
  });

  const mapFacilities = facilities.map((f) => ({
    id: String(f.id),
    name: f.name,
    type: (f.type as any) || "MedicalCamp",
    lat: f.latitude,
    lng: f.longitude,
    contactNo: f.contact_number || "+91 20 26123456",
    doctorsAvailable: f.doctors_count || 2,
    bedsAvailable: f.capacity_beds || 5,
    distance: 0.5,
    status: f.is_active ? ("Active" as const) : ("Busy" as const),
  }));

  const filterOptions = [
    { id: "all", label: "All Layers", icon: Layers },
    { id: "palkhi", label: "Palkhis", icon: Navigation },
    { id: "medical", label: "Medical", icon: Hospital },
    { id: "missing", label: "Incidents", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-24 flex flex-col justify-between select-none">
      <div>
        {/* Top Header & Search Bar (Screen 3 & 11) */}
        <div className="p-4 space-y-3 bg-white border-b border-stone-200/80 sticky top-0 z-40 shadow-sm">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, checkpoint, or report ID..."
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
          </div>

          {/* Filter Chips Horizontal Slider (Screen 3 & 11) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {filterOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = filter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-orange-600 text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Telemetry Map Container (Screen 3 & 11) */}
        <div className="relative h-[calc(100vh-210px)] w-full overflow-hidden">
          <WariMap
            palkhis={filter === "all" || filter === "palkhi" ? palkhis : []}
            facilities={filter === "all" || filter === "medical" ? mapFacilities : []}
            routeStops={routeStops}
            lightMode={true}
          />

          {/* Legend Overlay Card (Screen 11) */}
          <div className="absolute bottom-4 left-4 z-30 bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-2xl p-3.5 shadow-lg space-y-2 max-w-[200px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Map Legend</div>
            
            <div className="space-y-1.5 text-xs font-semibold text-stone-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-200" />
                <span>Palkhi (Live)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200" />
                <span>Medical Camp</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200" />
                <span>Missing Report</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthorityBottomNav />
    </div>
  );
}

