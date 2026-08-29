import { palkhiService as basePalkhiService, PalkhiDetail, PalkhiCurrentDetail } from "./palkhi";
import { PalkhiLocation } from "../types";

export const palkhiService = {
  /**
   * Fetches current telemetry positions for all active Palkhis.
   */
  async getCurrentPalkhis(): Promise<PalkhiLocation[]> {
    const list = await basePalkhiService.getPalkhis();
    const details = await Promise.all(
      list.map(async (p) => {
        try {
          return await basePalkhiService.getPalkhiCurrent(p.id);
        } catch {
          return null;
        }
      })
    );

    return list.map((p, idx) => {
      const curr = details[idx];
      return {
        id: String(p.id),
        name: p.name,
        saint: p.saint_name,
        currentPlace: curr?.current_checkpoint || "Hadapsar, Pune",
        lat: curr?.latitude || p.current_latitude || 18.5089,
        lng: curr?.longitude || p.current_longitude || 73.9259,
        lastUpdated: curr?.updated_at || p.updated_at || new Date().toISOString(),
        warkariCount: p.id === 1 ? 450000 : 380000,
        contactNo: "+91 98765 43210",
        routeName: p.route_name || "Alandi to Pandharpur",
        speed: "Walking (4 km/h)",
        nextHalt: curr?.next_checkpoint || "Loni Kalbhor",
      };
    });
  },

  async getPalkhis(): Promise<PalkhiLocation[]> {
    return this.getCurrentPalkhis();
  },
};
