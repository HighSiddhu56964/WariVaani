"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { facilitiesService, Facility } from "@/services/facilities";
import { HeartHandshake, MapPin, Compass, Phone, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const WariMap = dynamic(() => import("@/components/maps/WariMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] bg-red-50/50 dark:bg-zinc-900 border border-red-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-muted-foreground font-semibold">आरोग्य केंद्र नकाशा लोड होत आहे...</p>
    </div>
  ),
});

const PRESET_LOCATIONS = [
  { name: "Hadapsar, Pune", lat: 18.5089, lng: 73.9259 },
  { name: "Loni Kalbhor", lat: 18.4842, lng: 74.0204 },
  { name: "Saswad", lat: 18.3414, lng: 74.0305 },
  { name: "Jejuri", lat: 18.2762, lng: 74.1611 },
  { name: "Alandi", lat: 18.6757, lng: 73.8893 },
  { name: "Pandharpur", lat: 17.6782, lng: 75.3289 },
];

export default function UserMedicalPage() {
  const [selectedLoc, setSelectedLoc] = useState<{ lat: number; lng: number; name: string }>(PRESET_LOCATIONS[0]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  useEffect(() => {
    fetchFacilities(selectedLoc.lat, selectedLoc.lng);
  }, [selectedLoc]);

  const fetchFacilities = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const data = await facilitiesService.getNearbyFacilities(lat, lng, 15.0);
      setFacilities(data);
    } catch (err) {
      console.error("Failed to fetch nearby medical facilities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Option A: Explicit Browser Geolocation Request
  const handleRequestGPS = () => {
    setIsLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("तुमच्या ब्राउझरमध्ये GPS सुविधा उपलब्ध नाही.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setSelectedLoc({
          lat: userLat,
          lng: userLng,
          name: "तुमचे सध्याचे स्थान (My Current Location)",
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation permission error:", err);
        setGeoError("GPS परवानगी नाकारली किंवा स्थान सापडले नाही. कृपया खालील ठिकाण निवडा.");
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Convert for WariMap component
  const mapFacilities = facilities.map((f) => ({
    id: String(f.id),
    name: f.name,
    type: (f.type as any) || "MedicalCamp",
    lat: f.latitude,
    lng: f.longitude,
    contactNo: f.contact_number || "+91 20 26123456",
    doctorsAvailable: f.doctors_count || 2,
    bedsAvailable: f.capacity_beds || 5,
    distance: f.distance_meters ? round(f.distance_meters / 1000, 1) : 0.5,
    status: f.is_active ? ("Active" as const) : ("Busy" as const),
  }));

  return (
    <div className="space-y-5 select-none pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-black text-secondary dark:text-white flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-red-600" />
          <span>वैद्यकीय मदत (Medical Facilities)</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          जवळचे डॉक्टर, रुग्णवाहिका आणि प्रथमोपचार केंद्र (Find nearby medical clinics & ambulances)
        </p>
      </div>

      {/* Location Selector Card (Option A + Option B) */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-red-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          स्थान निवडा (Select Search Location)
        </h2>

        {/* Option A Button */}
        <button
          onClick={handleRequestGPS}
          disabled={isLocating}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
        >
          {isLocating ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Compass className="h-4 w-4" />
          )}
          <span>माझे GPS स्थान वापरा (Use My Current Location)</span>
        </button>

        {geoError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{geoError}</span>
          </div>
        )}

        {/* Option B Dropdown */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold text-muted-foreground">
            किंवा वारी मार्गावरील ठिकाण निवडा (Or Choose Stop):
          </label>
          <select
            value={selectedLoc.name}
            onChange={(e) => {
              const found = PRESET_LOCATIONS.find((loc) => loc.name === e.target.value);
              if (found) setSelectedLoc(found);
            }}
            className="w-full p-3 rounded-2xl border border-red-200 dark:border-zinc-800 bg-red-50/30 dark:bg-zinc-800 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {PRESET_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map display */}
      <div className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
          आरोग्य केंद्र नकाशा / Medical Facilities Map
        </h2>
        <div className="h-[320px] rounded-3xl overflow-hidden shadow-md border-2 border-red-100 dark:border-zinc-800">
          <WariMap
            palkhis={[]}
            facilities={mapFacilities}
            routeStops={[]}
            lightMode={true}
          />
        </div>
      </div>

      {/* Facilities List */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1 flex items-center justify-between">
          <span>जवळची वैद्यकीय केंद्रे (Nearby Medical Camps)</span>
          <span className="text-[10px] text-red-600 font-bold">{facilities.length} Found</span>
        </h2>

        {isLoading ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl">
            <div className="h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground font-semibold">वैद्यकीय केंद्रे शोधत आहे...</p>
          </div>
        ) : facilities.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border text-xs text-muted-foreground">
            या परिसरात वैद्यकीय केंद्र सापडले नाही.
          </div>
        ) : (
          <div className="space-y-3">
            {facilities.map((fac) => {
              const distanceKm = fac.distance_meters ? round(fac.distance_meters / 1000, 1) : 0.5;
              const phone = fac.contact_number || "+91 20 26123456";

              return (
                <motion.div
                  key={fac.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-white dark:bg-zinc-900 border-2 border-red-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-full text-[10px] font-black uppercase">
                        {fac.type}
                      </span>
                      <h3 className="font-extrabold text-secondary dark:text-white text-sm mt-1">
                        {fac.name}
                      </h3>
                      {fac.landmark && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                          <span>{fac.landmark}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-red-600 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-xl border border-red-100 dark:border-red-900/30 inline-block">
                        {distanceKm} km
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-red-50 dark:border-zinc-800 pt-3">
                    <div className="text-[11px] space-x-3 text-muted-foreground font-semibold">
                      <span>👨‍⚕️ Doctors: {fac.doctors_count || 2}</span>
                      <span>🛏️ Beds: {fac.capacity_beds || 5}</span>
                    </div>

                    <a
                      href={`tel:${phone}`}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>कॉल करा</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function round(val: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(val * factor) / factor;
}
