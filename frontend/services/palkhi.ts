import { apiFetch } from './api';

export interface RouteCheckpoint {
  id: number;
  palkhi_id?: number;
  sequence_order?: number;
  sequence_number?: number;
  location_name: string;
  district?: string;
  taluka?: string;
  latitude: number;
  longitude: number;
  arrival_date?: string;
  departure_date?: string;
  is_ringan_location?: boolean;
  is_ringan?: boolean;
  ringan_type?: string;
  halt_type?: string;
  notes?: string;
  next_checkpoint?: string | null;
}

export interface PalkhiData {
  id: number;
  name: string;
  saint_name: string;
  start_location?: string;
  end_location?: string;
  current_location: string;
  next_checkpoint?: string | null;
  latitude: number;
  longitude: number;
  sequence_number?: number;
  updated_at: string;
  checkpoints?: RouteCheckpoint[];
}

export async function getPalkhis(): Promise<PalkhiData[]> {
  try {
    return await apiFetch<PalkhiData[]>('/api/v1/palkhis');
  } catch {
    return await apiFetch<PalkhiData[]>('/palkhis');
  }
}

export async function getPalkhiRoute(palkhiId: number): Promise<RouteCheckpoint[]> {
  try {
    return await apiFetch<RouteCheckpoint[]>(`/api/v1/palkhis/${palkhiId}/route`);
  } catch {
    return await apiFetch<RouteCheckpoint[]>(`/palkhis/${palkhiId}/route`);
  }
}
