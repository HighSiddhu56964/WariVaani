import { MissingPersonResponse } from "../../types/api/missingPerson";
import { MissingReport } from "../../types";

export function mapMissingResponseToUI(response: MissingPersonResponse): MissingReport {
  return {
    id: response.ticket_id, // Map ticket_id to id for WR-XXXXX UI displays
    personName: response.name,
    age: response.age,
    gender: (response.gender === "Male" || response.gender === "Female" || response.gender === "Other")
      ? response.gender
      : "Male",
    description: response.description || `Clothing: ${response.clothing || "N/A"}. Last seen time: ${response.last_seen_time || "N/A"}`,
    contactPerson: response.contact_person,
    contactPhone: response.phone_number,
    status: response.status === "Found" ? "Found" : "Missing",
    reportedAt: response.created_at,
    reportedBy: response.contact_person,
    lastSeenLocation: response.last_seen,
  };
}

export function mapMissingReportsList(list: MissingPersonResponse[]): MissingReport[] {
  return list.map(mapMissingResponseToUI);
}
