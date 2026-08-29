import api from "./api";

export interface PalkhiSummary {
  id: number;
  name: string;
  saint_name: string;
  current_location: string;
  next_checkpoint?: string;
  updated_at: string;
}

export interface DashboardSummary {
  open_missing_persons: number;
  medical_facilities: number;
  palkhi_current_location: string;
  palkhis: PalkhiSummary[];
  data_mode: "DEMO" | "LIVE" | string;
  last_updated: string;
}

export const dashboardService = {
  /**
   * GET /dashboard/summary
   * Retrieve summary metrics for control room dashboard.
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await api.get<DashboardSummary>("/dashboard/summary");
      return response.data;
    } catch (error) {
      console.warn("API call GET /dashboard/summary failed, returning fallback mock data", error);
      return {
        open_missing_persons: 2,
        medical_facilities: 4,
        palkhi_current_location: "Hadapsar, Pune",
        palkhis: [
          {
            id: 1,
            name: "Sant Dnyaneshwar Maharaj Palkhi",
            saint_name: "Sant Dnyaneshwar Maharaj",
            current_location: "Hadapsar, Pune",
            next_checkpoint: "Loni Kalbhor",
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Sant Tukaram Maharaj Palkhi",
            saint_name: "Sant Tukaram Maharaj",
            current_location: "Loni Kalbhor",
            next_checkpoint: "Yavat",
            updated_at: new Date().toISOString(),
          },
        ],
        data_mode: "DEMO",
        last_updated: new Date().toISOString(),
      };
    }
  },
};
