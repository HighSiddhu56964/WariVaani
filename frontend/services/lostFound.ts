import { apiFetch } from './api';

export interface LostItemReport {
  id: number;
  ticket_id: string;
  report_type: 'LOST' | 'FOUND';
  item_type: string;
  color?: string;
  description?: string;
  location: string;
  contact_number: string;
  source: 'VOICE_CALL' | 'MOBILE_APP';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  created_at: string;
  updated_at: string;
}

export async function getLostFoundReports(params?: {
  report_type?: string;
  status?: string;
  source?: string;
}): Promise<LostItemReport[]> {
  const searchParams = new URLSearchParams();
  if (params?.report_type && params.report_type !== 'ALL') {
    searchParams.append('report_type', params.report_type);
  }
  if (params?.status && params.status !== 'ALL') {
    searchParams.append('status', params.status);
  }
  if (params?.source && params.source !== 'ALL') {
    searchParams.append('source', params.source);
  }

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return apiFetch<LostItemReport[]>(`/api/v1/lost-found${queryString}`);
}

export async function updateLostFoundStatus(
  id: number,
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED'
): Promise<LostItemReport> {
  return apiFetch<LostItemReport>(`/api/v1/lost-found/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
