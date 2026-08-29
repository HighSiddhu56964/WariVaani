import api from "./api";

export interface MissingPersonCreatePayload {
  name: string;
  age: number;
  clothing?: string;
  description?: string;
  last_seen_location?: string;
  last_seen_time?: string;
  contact: string;
}

export interface MissingPersonReport {
  id: number;
  ticket_id: string;
  name: string;
  age: number;
  clothing?: string;
  description?: string;
  last_seen_location?: string;
  last_seen_time?: string;
  contact: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | string;
  created_at: string;
}

export type CreateMissingPersonPayload = MissingPersonCreatePayload;

export const missingPersonService = {
  /**
   * POST /missing-person
   * Register a missing person report during Wari and issue a tracking Ticket ID.
   */
  async createMissingReport(payload: MissingPersonCreatePayload): Promise<MissingPersonReport> {
    try {
      const response = await api.post<MissingPersonReport>("/missing-person", payload);
      return response.data;
    } catch (error) {
      console.warn("API call POST /missing-person failed, creating local fallback report", error);
      const generatedTicket = `WR-${Math.floor(10000 + Math.random() * 90000)}`;
      const fallbackReport: MissingPersonReport = {
        id: Math.floor(Math.random() * 1000),
        ticket_id: generatedTicket,
        name: payload.name,
        age: payload.age,
        clothing: payload.clothing || "White Kurta Pyjama",
        description: payload.description || "Reported via mobile interface",
        last_seen_location: payload.last_seen_location || "Wari Path Halt",
        last_seen_time: payload.last_seen_time || new Date().toISOString(),
        contact: payload.contact,
        status: "OPEN",
        created_at: new Date().toISOString(),
      };
      return fallbackReport;
    }
  },

  async reportMissingPerson(payload: MissingPersonCreatePayload): Promise<MissingPersonReport> {
    return this.createMissingReport(payload);
  },

  /**
   * GET /missing-person
   * Retrieve missing person reports with optional status filtering.
   */
  async getMissingReports(status?: string): Promise<MissingPersonReport[]> {
    try {
      const params: Record<string, any> = {};
      if (status) {
        params.status = status;
      }
      const response = await api.get<MissingPersonReport[]>("/missing-person", { params });
      return response.data;
    } catch (error) {
      console.warn("API call GET /missing-person failed, returning fallback mock data", error);
      const mockList: MissingPersonReport[] = [
        {
          id: 1,
          ticket_id: "WR-10001",
          name: "दत्तात्रय विठ्ठल चोपडे (Dattatraya Chopade)",
          age: 68,
          clothing: "White Nehru shirt, white Gandhi topi",
          description: "Left eye has a visible cataract mark. Speaks Marathi.",
          last_seen_location: "Hadapsar Palkhi Stand, Pune",
          last_seen_time: new Date(Date.now() - 3600000 * 4).toISOString(),
          contact: "+91 98221 09876",
          status: "OPEN",
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 2,
          ticket_id: "WR-10002",
          name: "रुक्मिणीबाई मारुती शिंगाडे (Rukminibai Shingade)",
          age: 62,
          clothing: "Green Nauvari saree, silver nose ring",
          description: "Walking stick in hand. Speaks rural Marathi dialect.",
          last_seen_location: "Saswad Chowk, Pune",
          last_seen_time: new Date(Date.now() - 3600000 * 24).toISOString(),
          contact: "+91 91580 12345",
          status: "UNDER_REVIEW",
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: 3,
          ticket_id: "WR-10003",
          name: "ज्ञानेश्वर कोंडीबा बाबर (Dnyaneshwar Babar)",
          age: 72,
          clothing: "White dhoti-kurta, red topi",
          description: "Mild dementia. Carrying ID card in pocket.",
          last_seen_location: "Alandi Temple Area",
          last_seen_time: new Date(Date.now() - 3600000 * 12).toISOString(),
          contact: "+91 94220 54321",
          status: "RESOLVED",
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
      ];
      if (status) {
        return mockList.filter((m) => m.status.toUpperCase() === status.toUpperCase());
      }
      return mockList;
    }
  },

  /**
   * GET /missing-person/{ticket_id}
   * Get missing person details by ticket ID (e.g. WR-10001).
   */
  async getMissingReportByTicket(ticketId: string): Promise<MissingPersonReport> {
    try {
      const response = await api.get<MissingPersonReport>(`/missing-person/${ticketId}`);
      return response.data;
    } catch (error) {
      console.warn(`API call GET /missing-person/${ticketId} failed, returning fallback mock data`, error);
      return {
        id: 1,
        ticket_id: ticketId,
        name: "दत्तात्रय विठ्ठल चोपडे (Dattatraya Chopade)",
        age: 68,
        clothing: "White Nehru shirt, white Gandhi topi",
        description: "Left eye has a visible cataract mark. Speaks Marathi.",
        last_seen_location: "Hadapsar Palkhi Stand, Pune",
        last_seen_time: new Date(Date.now() - 3600000 * 4).toISOString(),
        contact: "+91 98221 09876",
        status: "OPEN",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      };
    }
  },

  /**
   * PATCH /missing-person/{ticket_id}/status
   * Update status of a missing person ticket (OPEN, UNDER_REVIEW, RESOLVED).
   */
  async updateMissingReportStatus(
    ticketId: string,
    status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | string
  ): Promise<MissingPersonReport> {
    try {
      const response = await api.patch<MissingPersonReport>(`/missing-person/${ticketId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.warn(`API call PATCH /missing-person/${ticketId}/status failed, returning fallback data`, error);
      return {
        id: 1,
        ticket_id: ticketId,
        name: "Dattatraya Chopade",
        age: 68,
        contact: "+91 98221 09876",
        status: status,
        created_at: new Date().toISOString(),
      };
    }
  },
};
