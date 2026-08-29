export interface FacilityResponse {
  id: number;
  name: string;
  type: "MedicalCamp" | "WaterPoint" | "Toilet" | "HelpCenter";
  lat: number;
  lng: number;
  landmark?: string;
  status: string;
  opening_time: string;
  closing_time: string;
  distance_km?: number;
}
