"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PalkhiLocation, MedicalFacility, RouteStop } from "../../types";

interface WariMapProps {
  palkhis: PalkhiLocation[];
  facilities: MedicalFacility[];
  routeStops: RouteStop[];
  lightMode?: boolean;
}

export default function WariMap({ palkhis, facilities, routeStops, lightMode = false }: WariMapProps) {
  // Fix for Leaflet default icon issues in Next.js environment
  useEffect(() => {
    // Override defaults just in case standard markers are fallback-loaded
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  // Center on Hadapsar (where the active Palkhi current coordinate lies)
  const centerLat = 18.495;
  const centerLng = 74.000;

  // Custom Saffron pulsing marker for Palkhi
  const getPalkhiIcon = (saintName: string) => {
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-9 h-9 bg-orange-500 rounded-full animate-ping opacity-50"></div>
          <div class="relative w-8 h-8 bg-orange-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg font-bold text-xs" title="${saintName}">
            🚩
          </div>
        </div>
      `,
      className: "custom-palkhi-icon",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  // Custom icon generator per Facility Type (Medical, Water, Toilet, Police, Help)
  const getFacilityIcon = (type: string, status: "Active" | "Busy" | "Inactive") => {
    let iconSymbol = "🏥";
    let bgGradient = "from-emerald-500 to-teal-600";

    if (type === "WaterPoint") {
      iconSymbol = "💧";
      bgGradient = "from-blue-500 to-cyan-600";
    } else if (type === "Toilet") {
      iconSymbol = "🚻";
      bgGradient = "from-emerald-600 to-green-700";
    } else if (type === "PoliceBooth") {
      iconSymbol = "🚔";
      bgGradient = "from-indigo-600 to-blue-800";
    } else if (type === "HelpCenter") {
      iconSymbol = "ℹ️";
      bgGradient = "from-amber-500 to-orange-600";
    } else if (status === "Busy") {
      bgGradient = "from-red-500 to-rose-700";
    }

    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center group cursor-pointer">
          <div class="w-7 h-7 bg-gradient-to-tr ${bgGradient} rounded-full border border-white flex items-center justify-center text-white shadow-lg font-bold text-xs" style="font-size: 13px; line-height: 1;">
            ${iconSymbol}
          </div>
        </div>
      `,
      className: "custom-facility-icon",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // Custom Silver marker for normal Route Milestones
  const getStopIcon = (hasPalkhi: boolean) => {
    const color = hasPalkhi ? "bg-orange-500 scale-110 border-orange-200" : "bg-blue-600 border-blue-200";
    return L.divIcon({
      html: `
        <div class="w-3.5 h-3.5 ${color} rounded-full border-2 shadow-sm"></div>
      `,
      className: "custom-stop-icon",
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  };

  // Generate coordinates array for drawing the Route Polyline
  // Sort stops by distance to ensure the polyline is drawn sequentially
  const polylineCoords = routeStops
    .map(stop => [stop.lat, stop.lng] as [number, number]);

  return (
    <div className={`w-full h-full min-h-[400px] rounded-2xl overflow-hidden border relative ${lightMode ? "bg-white border-zinc-200" : "bg-zinc-950 border-zinc-800"}`}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={11}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
        className="z-10"
      >
        {/* Dynamic tiles based on command vs pilgrim daylight theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={lightMode ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
        />

        {/* Route Polyline (Saffron colored route) */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{ color: "#F77F00", weight: 4, opacity: 0.7, dashArray: "5, 10" }}
          />
        )}

        {/* Route Stops / Milestones Markers */}
        {routeStops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={getStopIcon(stop.hasPalkhi)}
          >
            <Popup className="dark-popup">
              <div className="text-zinc-950 dark:text-zinc-150 p-1">
                <h4 className="font-extrabold text-xs text-orange-600">{stop.name}</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Distance: {stop.distanceFromStart} KM from Start</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {stop.facilitiesAvailable.map((f, i) => (
                    <span key={i} className="text-[8px] px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-semibold text-zinc-600 dark:text-zinc-400">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Palkhis Markers */}
        {palkhis.map((palkhi) => (
          <Marker
            key={palkhi.id}
            position={[palkhi.lat, palkhi.lng]}
            icon={getPalkhiIcon(palkhi.saint)}
          >
            <Popup className="dark-popup">
              <div className="text-zinc-950 p-1.5 max-w-[200px]">
                <h4 className="font-black text-xs text-orange-600 flex items-center gap-1">
                  <span>🚩</span> {palkhi.name}
                </h4>
                <p className="text-[10px] text-zinc-600 mt-1">
                  <strong>Current:</strong> {palkhi.currentPlace}
                </p>
                <p className="text-[10px] text-zinc-650 mt-0.5">
                  <strong>Next Halt:</strong> {palkhi.nextHalt}
                </p>
                <p className="text-[10px] text-zinc-650 mt-0.5">
                  <strong>Speed:</strong> {palkhi.speed}
                </p>
                <p className="text-[10px] text-zinc-650 mt-0.5">
                  <strong>Pilgrims:</strong> {palkhi.warkariCount.toLocaleString()}
                </p>
                <div className="mt-2 text-[9px] text-zinc-400 border-t pt-1 flex justify-between">
                  <span>Live telemetry tracking</span>
                  <span className="font-mono">Updated just now</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Medical Facilities Clinics Markers */}
        {facilities.map((clinic) => (
          <Marker
            key={clinic.id}
            position={[clinic.lat, clinic.lng]}
            icon={getFacilityIcon(clinic.type, clinic.status)}
          >
            <Popup className="dark-popup">
              <div className="text-zinc-950 p-1.5">
                <h4 className="font-black text-xs text-blue-700 flex items-center gap-1">
                  <span>🏥</span> {clinic.name}
                </h4>
                <p className="text-[10px] text-zinc-600 mt-1">
                  <strong>Type:</strong> {clinic.type}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  <strong>Beds Available:</strong> {clinic.bedsAvailable}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  <strong>Doctors:</strong> {clinic.doctorsAvailable}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  <strong>Status:</strong> {clinic.status}
                </p>
                <p className="text-[10px] text-zinc-400 border-t pt-1 mt-1.5">
                  Call Clinic: <span className="font-mono">{clinic.contactNo}</span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
