import api from "./api";
import { EmergencyContactResponse } from "../types/api/emergency";
import { mapEmergencyList, EmergencyContactUI } from "./mappers/emergencyMapper";

export const emergencyService = {
  /**
   * Fetch list of all official emergency contacts.
   */
  async getEmergencyContacts(): Promise<EmergencyContactUI[]> {
    const response = await api.get<EmergencyContactResponse[]>("/emergency");
    return mapEmergencyList(response.data);
  },
};
