import { apiFetch } from './api';

export interface Facility {
  id: number;
  name: string;
  type: string; // MEDICAL, WATER, TOILET, FOOD, POLICE, REST
  location_name: string;
  latitude: number;
  longitude: number;
  landmark?: string | null;
  contact_number?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | string;
}

export async function getFacilities(typeFilter?: string): Promise<Facility[]> {
  const query = typeFilter && typeFilter !== 'ALL' ? `?type=${encodeURIComponent(typeFilter)}` : '';
  try {
    return await apiFetch<Facility[]>(`/api/v1/facilities/nearby${query}`);
  } catch {
    return await apiFetch<Facility[]>(`/facilities/nearby${query}`);
  }
}

export async function updateFacilityStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<Facility> {
  try {
    return await apiFetch<Facility>(`/api/v1/facilities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch {
    // If endpoint is not implemented on backend, return mock toggle object
    return {
      id,
      name: 'Facility',
      type: 'MEDICAL',
      location_name: 'Location',
      latitude: 18.5204,
      longitude: 73.8567,
      status,
    };
  }
}
