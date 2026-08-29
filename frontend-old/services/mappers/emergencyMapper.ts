import { EmergencyContactResponse } from "../../types/api/emergency";

export interface EmergencyContactUI {
  id: string;
  name: string;
  designation: string;
  phone: string;
  location?: string;
  category: string;
}

export function mapEmergencyResponseToUI(response: EmergencyContactResponse): EmergencyContactUI {
  return {
    id: String(response.id),
    name: response.name,
    designation: response.designation,
    phone: response.phone_number,
    location: response.location_name || undefined,
    category: response.category,
  };
}

export function mapEmergencyList(list: EmergencyContactResponse[]): EmergencyContactUI[] {
  return list.map(mapEmergencyResponseToUI);
}
