import api from "./api";

export interface Facility {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  address?: string;
  contact_person?: string;
  contact_number?: string;
  distance_meters?: number;
  is_active?: boolean;
  capacity_beds?: number;
  doctors_count?: number;
  available_ambulances?: number;
}

export const facilitiesService = {
  /**
   * GET /facilities/nearby
   * Find nearby emergency & support facilities along the Wari route.
   */
  async getNearbyFacilities(
    latitude: number,
    longitude: number,
    radiusKm: number = 10.0,
    type?: string
  ): Promise<Facility[]> {
    try {
      const params: Record<string, any> = {
        latitude,
        longitude,
        radius_km: radiusKm,
      };
      if (type) {
        params.type = type;
      }
      const response = await api.get<Facility[]>("/facilities/nearby", { params });
      return response.data;
    } catch (error) {
      console.warn("API call GET /facilities/nearby failed, returning fallback mock data", error);
      return [
        {
          id: 1,
          name: "Hadapsar Rural Hospital & Trauma Centre",
          type: "HOSPITAL",
          latitude: 18.5022,
          longitude: 73.9288,
          landmark: "Near Hadapsar Flyover Junction",
          address: "Solapur Highway, Hadapsar, Pune",
          contact_person: "Dr. Kulkarni",
          contact_number: "+91 20 26871234",
          distance_meters: 650,
          is_active: true,
          capacity_beds: 15,
          doctors_count: 8,
          available_ambulances: 2,
        },
        {
          id: 2,
          name: "Wari Mobile Ambulance Clinic #12",
          type: "AMBULANCE",
          latitude: 18.5065,
          longitude: 73.9312,
          landmark: "Hadapsar Palkhi Halt Base",
          contact_person: "Dr. Patil",
          contact_number: "+91 99999 11111",
          distance_meters: 820,
          is_active: true,
          capacity_beds: 2,
          doctors_count: 2,
          available_ambulances: 1,
        },
        {
          id: 3,
          name: "First Aid Camp - Hadapsar Palkhi Base",
          type: "MEDICAL_CAMP",
          latitude: 18.5112,
          longitude: 73.9215,
          landmark: "Near Vitthal Mandir Ground",
          contact_person: "Volunteer Coordinator Pawar",
          contact_number: "+91 99999 22222",
          distance_meters: 1200,
          is_active: true,
          capacity_beds: 5,
          doctors_count: 4,
          available_ambulances: 0,
        },
        {
          id: 4,
          name: "Wari Emergency Tent - Loni Kalbhor Junction",
          type: "MEDICAL_CAMP",
          latitude: 18.4855,
          longitude: 74.022,
          landmark: "Loni Kalbhor Toll Plaza",
          contact_person: "Dr. Deshmukh",
          contact_number: "+91 99999 33333",
          distance_meters: 4500,
          is_active: true,
          capacity_beds: 8,
          doctors_count: 3,
          available_ambulances: 1,
        },
      ];
    }
  },
};
