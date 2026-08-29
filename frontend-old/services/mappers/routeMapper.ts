import { RouteCheckpointResponse, RouteResponse } from "../../types/api/route";
import { RouteStop } from "../../types";

export function mapCheckpointToStop(cp: RouteCheckpointResponse, currentPalkhiCheckpoint?: string): RouteStop {
  // Determine if palkhi is here by matching names
  const hasPalkhi = currentPalkhiCheckpoint 
    ? cp.name.toLowerCase().includes(currentPalkhiCheckpoint.toLowerCase()) 
    : false;
  
  // Construct dummy facilities list based on checkpoint metrics
  const facilitiesAvailable: ("Medical" | "Water" | "Food" | "Toilets")[] = ["Water", "Toilets"];
  if (cp.is_major_halt) {
    facilitiesAvailable.push("Food");
  }
  // Alternate medical checkpoints for realistic mapping
  if (cp.sequence_order % 2 === 1) {
    facilitiesAvailable.push("Medical");
  }

  return {
    id: `stop-${cp.id}`,
    name: cp.name,
    distanceFromStart: cp.distance_from_start,
    lat: cp.lat,
    lng: cp.lng,
    hasPalkhi,
    facilitiesAvailable,
  };
}

export function mapCheckpointsList(list: RouteCheckpointResponse[], currentPalkhiCheckpoint?: string): RouteStop[] {
  return list.map(cp => mapCheckpointToStop(cp, currentPalkhiCheckpoint));
}
