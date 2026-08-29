import { missingPersonService as baseService, MissingPersonReport } from "./missingPerson";
import { MissingReport } from "../types";

export const missingPersonService = {
  /**
   * Fetch all missing person reports.
   */
  async getMissingReports(status?: string): Promise<MissingReport[]> {
    const list = await baseService.getMissingReports(status);
    return list.map(mapToUI);
  },

  /**
   * Fetch a specific missing report by ticket ID.
   */
  async getMissingReportByTicket(ticketId: string): Promise<MissingReport> {
    const report = await baseService.getMissingReportByTicket(ticketId);
    return mapToUI(report);
  },

  /**
   * Register a new missing person report.
   */
  async createMissingReport(data: any, sourceChannel: string = "Web"): Promise<MissingReport> {
    const payload = {
      name: data.personName || data.name,
      age: Number(data.age) || 45,
      clothing: data.clothing || data.description || "",
      description: data.description || "",
      last_seen_location: data.lastSeenLocation || data.last_seen_location || "",
      last_seen_time: data.lastSeenTime || data.last_seen_time || new Date().toISOString(),
      contact: data.contactPhone || data.contact || "+91 98220 00000",
    };
    const report = await baseService.createMissingReport(payload);
    return mapToUI(report);
  },

  /**
   * Transition status flags (e.g. OPEN, UNDER_REVIEW, RESOLVED).
   */
  async updateMissingReportStatus(
    ticketId: string,
    status: string,
    sourceChannel: string = "Web"
  ): Promise<MissingReport> {
    // Map status string if needed
    let mappedStatus = status;
    if (status === "Missing") mappedStatus = "OPEN";
    if (status === "In Progress") mappedStatus = "UNDER_REVIEW";
    if (status === "Found") mappedStatus = "RESOLVED";

    const report = await baseService.updateMissingReportStatus(ticketId, mappedStatus);
    return mapToUI(report);
  },
};

function mapToUI(r: MissingPersonReport): MissingReport {
  let uiStatus: "Missing" | "Found" | "In Progress" = "Missing";
  if (r.status === "OPEN" || r.status === "Missing") uiStatus = "Missing";
  else if (r.status === "UNDER_REVIEW" || r.status === "In Progress") uiStatus = "In Progress";
  else if (r.status === "RESOLVED" || r.status === "Found") uiStatus = "Found";

  return {
    id: r.ticket_id || `WR-${r.id}`,
    personName: r.name,
    age: r.age,
    gender: "Other",
    description: r.description || r.clothing || "No additional description",
    contactPerson: "Family Contact",
    contactPhone: r.contact,
    status: uiStatus,
    reportedAt: r.created_at || new Date().toISOString(),
    reportedBy: "Family",
    lastSeenLocation: r.last_seen_location || "Unknown",
  };
}
