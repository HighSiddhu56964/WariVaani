export type UserRole = "WARKARI" | "AUTHORITY";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  contactNo: string;
}

export interface PalkhiLocation {
  id: string;
  name: string; // e.g., "Sant Dnyaneshwar Maharaj Palkhi"
  saint: string; // e.g., "Sant Dnyaneshwar"
  currentPlace: string; // e.g., "Hadapsar, Pune"
  lat: number;
  lng: number;
  lastUpdated: string;
  warkariCount: number;
  contactNo: string;
  routeName: string;
  speed: string; // e.g., "Walking at 4 km/h"
  nextHalt: string; // e.g., "Loni Kalbhor"
}

export interface MedicalFacility {
  id: string;
  name: string;
  type: "MedicalCamp" | "WaterPoint" | "Toilet" | "PoliceBooth" | "HelpCenter" | "Ambulance" | "Hospital" | "FirstAidCamp" | string;
  lat: number;
  lng: number;
  landmark?: string;
  contactNo: string;
  doctorsAvailable: number;
  bedsAvailable: number;
  distance: number; // calculated in km
  status: "Active" | "Busy" | "Inactive";
}

export interface MissingReport {
  id: string;
  personName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  description: string;
  contactPerson: string;
  contactPhone: string;
  photoUrl?: string;
  status: "Missing" | "Found" | "In Progress" | string;
  reportedAt: string;
  reportedBy: string;
  lastSeenLocation: string;
}

export interface RouteStop {
  id: string;
  name: string;
  distanceFromStart: number; // in km
  lat: number;
  lng: number;
  hasPalkhi: boolean;
  facilitiesAvailable: ("Medical" | "Water" | "Food" | "Toilets")[];
  haltDurationHours?: number;
  isMajorHalt?: boolean;
}
