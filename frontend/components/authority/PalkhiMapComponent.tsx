'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PalkhiData, RouteCheckpoint, getPalkhiRoute } from '@/services/palkhi';

interface MapProps {
  palkhis: PalkhiData[];
  selectedPalkhiId?: number | null;
}

// Built-in Spatial Route Fallbacks for Offline / Unconnected Backend Mode
const DNYANESHWAR_FALLBACK_ROUTE: RouteCheckpoint[] = [
  { id: 101, palkhi_id: 1, sequence_number: 1, location_name: 'Alandi', latitude: 18.6775, longitude: 73.8967, halt_type: 'START', is_ringan: false },
  { id: 102, palkhi_id: 1, sequence_number: 2, location_name: 'Pune (Bhavani Peth)', latitude: 18.5135, longitude: 73.8690, halt_type: 'MUKKAM', is_ringan: false },
  { id: 103, palkhi_id: 1, sequence_number: 3, location_name: 'Saswad', latitude: 18.3444, longitude: 74.0305, halt_type: 'MUKKAM', is_ringan: false },
  { id: 104, palkhi_id: 1, sequence_number: 4, location_name: 'Jejuri', latitude: 18.2741, longitude: 74.1565, halt_type: 'HALT', is_ringan: false },
  { id: 105, palkhi_id: 1, sequence_number: 5, location_name: 'Walhe', latitude: 18.1793, longitude: 74.2057, halt_type: 'HALT', is_ringan: false },
  { id: 106, palkhi_id: 1, sequence_number: 6, location_name: 'Lonand', latitude: 18.0416, longitude: 74.1866, halt_type: 'MUKKAM', is_ringan: false },
  { id: 107, palkhi_id: 1, sequence_number: 7, location_name: 'Tardgaon', latitude: 17.9944, longitude: 74.2411, halt_type: 'RINGAN', is_ringan: true },
  { id: 108, palkhi_id: 1, sequence_number: 8, location_name: 'Phaltan', latitude: 17.9866, longitude: 74.4300, halt_type: 'HALT', is_ringan: false },
  { id: 109, palkhi_id: 1, sequence_number: 9, location_name: 'Barad', latitude: 17.9264, longitude: 74.5511, halt_type: 'HALT', is_ringan: false },
  { id: 110, palkhi_id: 1, sequence_number: 10, location_name: 'Natepute', latitude: 17.8967, longitude: 74.7570, halt_type: 'HALT', is_ringan: false },
  { id: 111, palkhi_id: 1, sequence_number: 11, location_name: 'Malshiras', latitude: 17.8344, longitude: 74.8021, halt_type: 'RINGAN', is_ringan: true },
  { id: 112, palkhi_id: 1, sequence_number: 12, location_name: 'Khudus Phata', latitude: 17.8105, longitude: 74.9012, halt_type: 'RINGAN', is_ringan: true },
  { id: 113, palkhi_id: 1, sequence_number: 13, location_name: 'Velapur', latitude: 17.7850, longitude: 75.0210, halt_type: 'RINGAN', is_ringan: true },
  { id: 114, palkhi_id: 1, sequence_number: 14, location_name: 'Bhandishegaon', latitude: 17.7310, longitude: 75.1840, halt_type: 'RINGAN', is_ringan: true },
  { id: 115, palkhi_id: 1, sequence_number: 15, location_name: 'Vakhri', latitude: 17.6980, longitude: 75.2850, halt_type: 'RINGAN', is_ringan: true },
  { id: 116, palkhi_id: 1, sequence_number: 16, location_name: 'Pandharpur', latitude: 17.6773, longitude: 75.3239, halt_type: 'DESTINATION', is_ringan: false },
];

const TUKARAM_FALLBACK_ROUTE: RouteCheckpoint[] = [
  { id: 201, palkhi_id: 2, sequence_number: 1, location_name: 'Dehu', latitude: 18.7208, longitude: 73.7711, halt_type: 'START', is_ringan: false },
  { id: 202, palkhi_id: 2, sequence_number: 2, location_name: 'Akurdi', latitude: 18.6494, longitude: 73.7806, halt_type: 'HALT', is_ringan: false },
  { id: 203, palkhi_id: 2, sequence_number: 3, location_name: 'Pune (Nana Peth)', latitude: 18.5186, longitude: 73.8647, halt_type: 'MUKKAM', is_ringan: false },
  { id: 204, palkhi_id: 2, sequence_number: 4, location_name: 'Loni Kalbhor', latitude: 18.4878, longitude: 74.0202, halt_type: 'HALT', is_ringan: false },
  { id: 205, palkhi_id: 2, sequence_number: 5, location_name: 'Yavat', latitude: 18.4651, longitude: 74.2085, halt_type: 'HALT', is_ringan: false },
  { id: 206, palkhi_id: 2, sequence_number: 6, location_name: 'Varvand', latitude: 18.3995, longitude: 74.3411, halt_type: 'HALT', is_ringan: false },
  { id: 207, palkhi_id: 2, sequence_number: 7, location_name: 'Undavadi Gawlyachi', latitude: 18.2811, longitude: 74.4510, halt_type: 'MUKKAM', is_ringan: false },
  { id: 208, palkhi_id: 2, sequence_number: 8, location_name: 'Baramati', latitude: 18.1517, longitude: 74.5771, halt_type: 'HALT', is_ringan: false },
  { id: 209, palkhi_id: 2, sequence_number: 9, location_name: 'Sansar', latitude: 18.0645, longitude: 74.6512, halt_type: 'MUKKAM', is_ringan: false },
  { id: 210, palkhi_id: 2, sequence_number: 10, location_name: 'Nimgaon Ketki', latitude: 18.0123, longitude: 74.7210, halt_type: 'HALT', is_ringan: false },
  { id: 211, palkhi_id: 2, sequence_number: 11, location_name: 'Indapur', latitude: 17.9644, longitude: 74.8010, halt_type: 'MUKKAM', is_ringan: false },
  { id: 212, palkhi_id: 2, sequence_number: 12, location_name: 'Sarati', latitude: 17.9120, longitude: 74.9210, halt_type: 'HALT', is_ringan: false },
  { id: 213, palkhi_id: 2, sequence_number: 13, location_name: 'Akluj', latitude: 17.8860, longitude: 75.0210, halt_type: 'RINGAN', is_ringan: true },
  { id: 214, palkhi_id: 2, sequence_number: 14, location_name: 'Malinagar', latitude: 17.8420, longitude: 75.1012, halt_type: 'HALT', is_ringan: false },
  { id: 215, palkhi_id: 2, sequence_number: 15, location_name: 'Borgaon', latitude: 17.7710, longitude: 75.1912, halt_type: 'MUKKAM', is_ringan: false },
  { id: 216, palkhi_id: 2, sequence_number: 16, location_name: 'Vakhri', latitude: 17.6980, longitude: 75.2850, halt_type: 'MUKKAM', is_ringan: false },
  { id: 217, palkhi_id: 2, sequence_number: 17, location_name: 'Pandharpur', latitude: 17.6773, longitude: 75.3239, halt_type: 'DESTINATION', is_ringan: false },
];

export default function PalkhiMapComponent({ palkhis, selectedPalkhiId }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const [routesData, setRoutesData] = useState<Record<number, RouteCheckpoint[]>>({});

  // Dynamic Live Countdown Timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 34, seconds: 6 });

  // Fetch complete route checkpoints for each Palkhi
  useEffect(() => {
    async function loadRoutes() {
      const activePalkhis = palkhis && palkhis.length > 0 ? palkhis : [
        { id: 1, name: 'Sant Dnyaneshwar Maharaj Palkhi', saint_name: 'Sant Dnyaneshwar Maharaj', route_name: 'Alandi to Pandharpur', current_location: 'Saswad', next_checkpoint: 'Jejuri', latitude: 18.3444, longitude: 74.0305, sequence_number: 3, updated_at: new Date().toISOString() },
        { id: 2, name: 'Sant Tukaram Maharaj Palkhi', saint_name: 'Sant Tukaram Maharaj', route_name: 'Dehu to Pandharpur', current_location: 'Loni Kalbhor', next_checkpoint: 'Yavat', latitude: 18.4878, longitude: 74.0202, sequence_number: 4, updated_at: new Date().toISOString() }
      ];

      const routesMap: Record<number, RouteCheckpoint[]> = {};

      await Promise.all(
        activePalkhis.map(async (p) => {
          try {
            const cps = await getPalkhiRoute(p.id);
            if (cps && cps.length > 0) {
              routesMap[p.id] = cps;
            } else {
              routesMap[p.id] = p.id === 2 ? TUKARAM_FALLBACK_ROUTE : DNYANESHWAR_FALLBACK_ROUTE;
            }
          } catch {
            routesMap[p.id] = p.id === 2 ? TUKARAM_FALLBACK_ROUTE : DNYANESHWAR_FALLBACK_ROUTE;
          }
        })
      );

      setRoutesData(routesMap);
    }
    loadRoutes();
  }, [palkhis]);

  // Live timer tick hook
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 34, seconds: 6 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map Instance once
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([18.4500, 74.0500], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!layersGroup) return;

    layersGroup.clearLayers();

    const allCoordinates: [number, number][] = [];

    const activePalkhis = palkhis && palkhis.length > 0 ? palkhis : [
      { id: 1, name: 'Sant Dnyaneshwar Maharaj Palkhi', saint_name: 'Sant Dnyaneshwar Maharaj', route_name: 'Alandi to Pandharpur', current_location: 'Saswad', next_checkpoint: 'Jejuri', latitude: 18.3444, longitude: 74.0305, sequence_number: 3, updated_at: new Date().toISOString() },
      { id: 2, name: 'Sant Tukaram Maharaj Palkhi', saint_name: 'Sant Tukaram Maharaj', route_name: 'Dehu to Pandharpur', current_location: 'Loni Kalbhor', next_checkpoint: 'Yavat', latitude: 18.4878, longitude: 74.0202, sequence_number: 4, updated_at: new Date().toISOString() }
    ];

    const getPalkhiTheme = (saintName: string) => {
      if (saintName.toLowerCase().includes('tukaram')) {
        return { primary: '#f0643b', name: 'Sant Tukaram Maharaj Palkhi' };
      }
      return { primary: '#3d3b98', name: 'Sant Dnyaneshwar Maharaj Palkhi' };
    };

    activePalkhis.forEach((p) => {
      const theme = getPalkhiTheme(p.saint_name || p.name);
      const fallbackRoute = p.id === 2 ? TUKARAM_FALLBACK_ROUTE : DNYANESHWAR_FALLBACK_ROUTE;
      const checkpoints = routesData[p.id] && routesData[p.id].length > 0 ? routesData[p.id] : fallbackRoute;
      const isSelected = selectedPalkhiId ? selectedPalkhiId === p.id : true;

      const routePoints: [number, number][] = checkpoints.map((cp) => [cp.latitude, cp.longitude]);

      if (routePoints.length > 0) {
        routePoints.forEach((pt) => allCoordinates.push(pt));

        // 1. BROAD LINE showcasing the whole route of the Palkhi
        L.polyline(routePoints, {
          color: theme.primary,
          weight: isSelected ? 7 : 5,
          opacity: isSelected ? 0.95 : 0.65,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layersGroup);

        // 2. SMALL DOT markers for locations/checkpoints (NO heavy cards/boxes blocking the map!)
        checkpoints.forEach((cp) => {
          const isRingan = cp.is_ringan || cp.is_ringan_location;
          const circleDot = L.circleMarker([cp.latitude, cp.longitude], {
            radius: isRingan ? 6 : 4.5,
            fillColor: isRingan ? '#f59e0b' : theme.primary,
            color: '#ffffff',
            weight: 1.5,
            fillOpacity: 0.95,
          });

          circleDot.bindTooltip(
            `<div style="font-family: sans-serif; font-size: 11px; font-weight: bold; color: #0f172a;">
              ${cp.sequence_number}. ${cp.location_name} ${isRingan ? '🚩 (Ringan)' : ''}
            </div>`,
            { direction: 'top', offset: [0, -4] }
          );

          circleDot.addTo(layersGroup);
        });
      }

      // 3. SMALL DOT marker for current active Palkhi position
      const curLat = p.latitude || (p.id === 2 ? 18.4878 : 18.3444);
      const curLng = p.longitude || (p.id === 2 ? 74.0202 : 74.0305);
      allCoordinates.push([curLat, curLng]);

      const smallDotHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: ${theme.primary}; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background-color: ${theme.primary}; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.5);"></div>
        </div>
      `;

      const smallDotIcon = L.divIcon({
        html: smallDotHtml,
        className: 'palkhi-small-dot-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const liveMarker = L.marker([curLat, curLng], { icon: smallDotIcon }).addTo(layersGroup);

      liveMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; max-width: 220px;">
          <div style="font-size: 10px; font-weight: 800; color: ${theme.primary}; text-transform: uppercase;">
            ${theme.name}
          </div>
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-top: 2px;">
            📍 ${p.current_location}
          </strong>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">
            Next Halt: <strong>${p.next_checkpoint || 'Pandharpur'}</strong>
          </div>
        </div>
      `);
    });

    if (allCoordinates.length > 0) {
      const bounds = L.latLngBounds(allCoordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [palkhis, routesData, selectedPalkhiId]);

  // Compute combined dynamic destination text for live tracking card
  const activePalkhis = palkhis && palkhis.length > 0 ? palkhis : [
    { id: 1, saint_name: 'Sant Dnyaneshwar Maharaj', current_location: 'Saswad' },
    { id: 2, saint_name: 'Sant Tukaram Maharaj', current_location: 'Loni Kalbhor' }
  ];
  const tukaramStop = activePalkhis.find((p) => p.saint_name?.toLowerCase().includes('tukaram'))?.current_location || 'Loni Kalbhor';
  const dnyaneshwarStop = activePalkhis.find((p) => p.saint_name?.toLowerCase().includes('dnyaneshwar'))?.current_location || 'Saswad';
  const destinationText = `${tukaramStop} & ${dnyaneshwarStop}`;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative w-full h-[620px] rounded-[24px] overflow-hidden shadow-xl border border-slate-200/80 bg-slate-100">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Live Tracking Card (Overlaid inside map top-left) */}
      <div className="absolute top-6 left-6 z-[1000] w-[310px] sm:w-[350px] bg-[#2b296c]/90 backdrop-blur-md text-white rounded-[22px] border border-white/15 shadow-2xl overflow-hidden pointer-events-auto">
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
            </span>
            <span className="font-extrabold text-white text-base tracking-wide">Live Tracking</span>
          </div>

          <div className="border-t border-white/15 my-3" />

          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <div className="text-[11px] font-medium text-slate-300 tracking-wide">
                Today's Destination:
              </div>
              <div className="font-extrabold text-sm text-white mt-1 leading-snug truncate" title={destinationText}>
                {destinationText}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-300 tracking-wide">
                Estimated Arrival Time:
              </div>
              <div className="font-extrabold text-sm text-white mt-1 leading-snug">
                5:45 PM
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Timer Strip (Coral/Orange #f0643b) */}
        <div className="bg-[#f0643b] text-white px-4 py-3 text-center border-t border-white/10">
          <div className="font-mono text-lg sm:text-xl font-extrabold tracking-widest flex items-center justify-center gap-2">
            <span>{pad(timeLeft.hours)}h</span>
            <span className="text-white/70">-</span>
            <span>{pad(timeLeft.minutes)}m</span>
            <span className="text-white/70">-</span>
            <span>{pad(timeLeft.seconds)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
