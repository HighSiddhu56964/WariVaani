import { FacilityResponse } from "../../types/api/facility";
import { MedicalFacility } from "../../types";

export function mapFacilityResponseToUI(response: FacilityResponse): MedicalFacility {
  // Map backend types to frontend supported types
  let type: "Ambulance" | "Hospital" | "FirstAidCamp" = "FirstAidCamp";
  if (response.name.toLowerCase().includes("hospital")) {
    type = "Hospital";
  } else if (response.name.toLowerCase().includes("ambulance")) {
    type = "Ambulance";
  }

  // Determine resources counts
  let doctorsAvailable = 0;
  let bedsAvailable = 0;
  if (response.type === "MedicalCamp") {
    doctorsAvailable = response.name.includes("Mobile") ? 2 : 4;
    bedsAvailable = response.name.includes("Mobile") ? 1 : 8;
  }

  return {
    id: `med-${response.id}`,
    name: response.name,
    type,
    lat: response.lat,
    lng: response.lng,
    contactNo: response.type === "MedicalCamp" ? "+91 99999 11111" : "+91 99999 22222",
    doctorsAvailable,
    bedsAvailable,
    distance: response.distance_km ?? 0.0,
    status: (response.status === "Active" || response.status === "Busy" || response.status === "Inactive")
      ? response.status
      : "Active",
  };
}

export function mapFacilitiesList(list: FacilityResponse[]): MedicalFacility[] {
  return list.map(mapFacilityResponseToUI);
}
