import { MissingReport } from "../types";
import { MOCK_MISSING_REPORTS } from "../mock/data";
import { delay } from "./authService";

let sessionReports = [...MOCK_MISSING_REPORTS];

export const reportService = {
  async getMissingReports(): Promise<MissingReport[]> {
    await delay(500);
    return [...sessionReports];
  },

  async createMissingReport(
    report: Omit<MissingReport, "id" | "reportedAt" | "status" | "reportedBy">
  ): Promise<MissingReport> {
    await delay(700);
    const newReport: MissingReport = {
      ...report,
      id: `report-${Date.now()}`,
      status: "Missing",
      reportedAt: new Date().toISOString(),
      reportedBy: report.contactPerson, // set as contact person for mock simplicity
    };
    
    sessionReports = [newReport, ...sessionReports]; // prepend
    return newReport;
  },

  async resolveReport(id: string): Promise<MissingReport> {
    await delay(500);
    const index = sessionReports.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error("Report not found");
    }
    sessionReports[index] = {
      ...sessionReports[index],
      status: "Found",
    };
    return { ...sessionReports[index] };
  }
};
