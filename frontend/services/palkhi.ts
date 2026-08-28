import api from "./api";

export interface RouteCheckpoint {
  id: number;
  palkhi_id: number;
  sequence_number: number;
  location_name: string;
  district?: string;
  taluka?: string;
  latitude: number;
  longitude: number;
  halt_type: string;
  arrival_date?: string;
  departure_date?: string;
  is_ringan: boolean;
  ringan_type?: string;
  notes?: string;
  next_checkpoint?: string;
  distance_from_previous_km?: number;
  cumulative_distance_km?: number;
  data_type?: string;
  source_year?: number;
}

export interface PalkhiDetail {
  id: number;
  name: string;
  saint_name: string;
  route_name?: string;
  source_year?: number;
  data_type?: string;
  current_checkpoint_id?: number;
  current_latitude?: number;
  current_longitude?: number;
  updated_at?: string;
}

export interface PalkhiCurrentDetail {
  palkhi_id: number;
  palkhi: string;
  saint_name: string;
  current_checkpoint: string;
  next_checkpoint?: string;
  sequence_number?: number;
  latitude: number;
  longitude: number;
  halt_type?: string;
  notes?: string;
  is_ringan?: boolean;
  ringan_type?: string;
  data_mode?: string;
  source_year?: number;
  updated_at?: string;
}

export const palkhiService = {
  /**
   * GET /palkhis
   * Get all active Palkhis.
   */
  async getPalkhis(): Promise<PalkhiDetail[]> {
    try {
      const response = await api.get<PalkhiDetail[]>("/palkhis");
      return response.data;
    } catch (error) {
      console.warn("API call GET /palkhis failed, returning fallback mock data", error);
      return [
        {
          id: 1,
          name: "Sant Dnyaneshwar Maharaj Palkhi",
          saint_name: "Sant Dnyaneshwar Maharaj",
          route_name: "Alandi to Pandharpur Route",
          source_year: 2025,
          data_type: "REFERENCE_2025",
          current_latitude: 18.5089,
          current_longitude: 73.9259,
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Sant Tukaram Maharaj Palkhi",
          saint_name: "Sant Tukaram Maharaj",
          route_name: "Dehu to Pandharpur Route",
          source_year: 2025,
          data_type: "REFERENCE_2025",
          current_latitude: 18.4842,
          current_longitude: 74.0204,
          updated_at: new Date().toISOString(),
        },
      ];
    }
  },

  /**
   * GET /palkhis/{id}/route
   * Get complete sequence of route checkpoints for Leaflet map rendering.
   */
  async getPalkhiRoute(palkhiId: number): Promise<RouteCheckpoint[]> {
    try {
      const response = await api.get<RouteCheckpoint[]>(`/palkhis/${palkhiId}/route`);
      return response.data;
    } catch (error) {
      console.warn(`API call GET /palkhis/${palkhiId}/route failed, returning fallback route mock data`, error);
      // Return sample checkpoints
      return [
        {
          id: 101,
          palkhi_id: palkhiId,
          sequence_number: 1,
          location_name: palkhiId === 1 ? "Alandi" : "Dehu",
          latitude: palkhiId === 1 ? 18.6757 : 18.7188,
          longitude: palkhiId === 1 ? 73.8893 : 73.7667,
          halt_type: "NIGHT_HALT",
          is_ringan: false,
          source_year: 2025,
        },
        {
          id: 102,
          palkhi_id: palkhiId,
          sequence_number: 2,
          location_name: "Pune City",
          latitude: 18.5204,
          longitude: 73.8567,
          halt_type: "STAY",
          is_ringan: false,
          source_year: 2025,
        },
        {
          id: 103,
          palkhi_id: palkhiId,
          sequence_number: 3,
          location_name: "Hadapsar",
          latitude: 18.5089,
          longitude: 73.9259,
          halt_type: "TEA_HALT",
          is_ringan: true,
          ringan_type: "GOL_RINGAN",
          source_year: 2025,
        },
        {
          id: 104,
          palkhi_id: palkhiId,
          sequence_number: 4,
          location_name: "Loni Kalbhor",
          latitude: 18.4842,
          longitude: 74.0204,
          halt_type: "NIGHT_HALT",
          is_ringan: false,
          source_year: 2025,
        },
        {
          id: 105,
          palkhi_id: palkhiId,
          sequence_number: 5,
          location_name: "Pandharpur",
          latitude: 17.6782,
          longitude: 75.3289,
          halt_type: "NIGHT_HALT",
          is_ringan: true,
          ringan_type: "FINAL_RINGAN",
          source_year: 2025,
        },
      ];
    }
  },

  /**
   * GET /palkhis/{id}/current
   * Get current position details for a specific Palkhi.
   */
  async getPalkhiCurrent(palkhiId: number): Promise<PalkhiCurrentDetail> {
    try {
      const response = await api.get<PalkhiCurrentDetail>(`/palkhis/${palkhiId}/current`);
      return response.data;
    } catch (error) {
      console.warn(`API call GET /palkhis/${palkhiId}/current failed, returning fallback mock data`, error);
      return {
        palkhi_id: palkhiId,
        palkhi: palkhiId === 1 ? "Sant Dnyaneshwar Maharaj Palkhi" : "Sant Tukaram Maharaj Palkhi",
        saint_name: palkhiId === 1 ? "Sant Dnyaneshwar Maharaj" : "Sant Tukaram Maharaj",
        current_checkpoint: palkhiId === 1 ? "Hadapsar, Pune" : "Loni Kalbhor",
        next_checkpoint: palkhiId === 1 ? "Loni Kalbhor" : "Yavat",
        sequence_number: 3,
        latitude: palkhiId === 1 ? 18.5089 : 18.4842,
        longitude: palkhiId === 1 ? 73.9259 : 74.0204,
        halt_type: "TEA_HALT",
        notes: "Pilgrim procession moving peacefully along Solapur highway",
        is_ringan: palkhiId === 1,
        ringan_type: palkhiId === 1 ? "GOL_RINGAN" : undefined,
        data_mode: "DEMO",
        source_year: 2025,
        updated_at: new Date().toISOString(),
      };
    }
  },

  /**
   * GET /palkhis/{id}/next-halt
   * Get next planned halt checkpoint for a Palkhi.
   */
  async getPalkhiNextHalt(palkhiId: number): Promise<RouteCheckpoint> {
    try {
      const response = await api.get<RouteCheckpoint>(`/palkhis/${palkhiId}/next-halt`);
      return response.data;
    } catch (error) {
      console.warn(`API call GET /palkhis/${palkhiId}/next-halt failed, returning fallback mock data`, error);
      return {
        id: 104,
        palkhi_id: palkhiId,
        sequence_number: 4,
        location_name: "Loni Kalbhor",
        latitude: 18.4842,
        longitude: 74.0204,
        halt_type: "NIGHT_HALT",
        is_ringan: false,
        source_year: 2025,
      };
    }
  },
};
