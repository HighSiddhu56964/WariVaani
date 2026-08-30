import { apiFetch } from './api';

export interface PalkhiSummary {
  id: number;
  name: string;
  saint_name: string;
  current_location: string;
  next_checkpoint: string | null;
  updated_at: string;
}

export interface DashboardSummary {
  open_missing_persons: number;
  under_review_missing_persons?: number;
  resolved_missing_persons?: number;
  medical_facilities: number;
  palkhi_current_location: string;
  palkhis: PalkhiSummary[];
  data_mode: 'LIVE' | 'DEMO';
  last_updated: string;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    return await apiFetch<DashboardSummary>('/api/v1/dashboard/summary');
  } catch {
    // Fallback to top-level route if /api/v1 prefix is omitted
    return await apiFetch<DashboardSummary>('/dashboard/summary');
  }
}
