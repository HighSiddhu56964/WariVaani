import api from "./api";
import { AlertItem } from "../types/api/alert";

export const alertService = {
  async getAlerts(): Promise<AlertItem[]> {
    const response = await api.get<AlertItem[]>("/alerts");
    return response.data;
  },
};
