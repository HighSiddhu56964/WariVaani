import { facilitiesService, Facility } from "./facilities";
import { MedicalFacility } from "../types";

export const facilityService = {
  async getFacilities(): Promise<MedicalFacility[]> {
    const list = await facilitiesService.getNearbyFacilities(18.5089, 73.9259, 100.0);
    return list.map(mapFacilityToMedicalFacility);
  },

  async getNearbyFacilities(
    lat: number,
    lng: number,
    radiusKm: number = 10.0,
    type?: string
  ): Promise<MedicalFacility[]> {
    const list = await facilitiesService.getNearbyFacilities(lat, lng, radiusKm, type);
    return list.map(mapFacilityToMedicalFacility);
  },

  async getMedicalFacilities(): Promise<MedicalFacility[]> {
    return this.getFacilities();
  },

  async getNearbyMedical(lat: number, lng: number, radiusKm: number = 10.0): Promise<MedicalFacility[]> {
    return this.getNearbyFacilities(lat, lng, radiusKm, "MEDICAL_CAMP");
  },
};

function mapFacilityToMedicalFacility(f: Facility): MedicalFacility {
  return {
    id: String(f.id),
    name: f.name,
    type: (f.type as any) || "MedicalCamp",
    lat: f.latitude,
    lng: f.longitude,
    landmark: f.landmark,
    contactNo: f.contact_number || "+91 20 26123456",
    doctorsAvailable: f.doctors_count || 2,
    bedsAvailable: f.capacity_beds || 5,
    distance: f.distance_meters ? round(f.distance_meters / 1000, 1) : 0.5,
    status: f.is_active ? "Active" : "Busy",
  };
}

function round(val: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(val * factor) / factor;
}
