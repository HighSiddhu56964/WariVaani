import { apiFetch } from './api';

export interface MissingPersonReport {
  id?: number;
  ticket_id: string;
  name: string;
  age: number;
  clothing: string;
  description?: string | null;
  last_seen_location: string;
  last_seen_time?: string;
  contact: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | string;
  source?: 'VOICE_CALL' | 'MOBILE_APP' | string;
  created_at: string;
}

export async function getMissingPersonReports(statusFilter?: string): Promise<MissingPersonReport[]> {
  const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
  let reports: MissingPersonReport[] = [];
  try {
    reports = await apiFetch<MissingPersonReport[]>(`/api/v1/missing-person${query}`);
  } catch {
    reports = await apiFetch<MissingPersonReport[]>(`/missing-person${query}`);
  }

  // Standardize source badge
  return reports.map((report) => ({
    ...report,
    source: report.source || (report.ticket_id.endsWith('-M') ? 'MOBILE_APP' : 'VOICE_CALL'),
  }));
}

export async function getMissingPersonByTicket(ticketId: string): Promise<MissingPersonReport> {
  let report: MissingPersonReport;
  try {
    report = await apiFetch<MissingPersonReport>(`/api/v1/missing-person/${ticketId}`);
  } catch {
    report = await apiFetch<MissingPersonReport>(`/missing-person/${ticketId}`);
  }

  return {
    ...report,
    source: report.source || (report.ticket_id.endsWith('-M') ? 'MOBILE_APP' : 'VOICE_CALL'),
  };
}

export async function updateMissingPersonStatus(
  ticketId: string,
  newStatus: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED'
): Promise<MissingPersonReport> {
  let report: MissingPersonReport;
  try {
    report = await apiFetch<MissingPersonReport>(`/api/v1/missing-person/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  } catch {
    report = await apiFetch<MissingPersonReport>(`/missing-person/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  }

  return {
    ...report,
    source: report.source || (report.ticket_id.endsWith('-M') ? 'MOBILE_APP' : 'VOICE_CALL'),
  };
}
