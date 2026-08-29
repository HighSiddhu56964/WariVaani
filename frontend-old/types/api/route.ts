export interface RouteCheckpointResponse {
  id: number;
  name: string;
  sequence_order: number;
  lat: number;
  lng: number;
  distance_from_start: number;
  halt_duration_hours: number;
  is_major_halt: boolean;
}

export interface RouteResponse {
  id: number;
  name: string;
  description: string;
  checkpoints?: RouteCheckpointResponse[];
  geometry_coords?: [number, number][];
}
