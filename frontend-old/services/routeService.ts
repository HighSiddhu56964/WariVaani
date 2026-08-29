import api from "./api";
import { RouteResponse } from "../types/api/route";
import { mapCheckpointsList } from "./mappers/routeMapper";
import { RouteStop } from "../types";

export interface RouteDetailResult {
  id: number;
  name: string;
  description: string;
  stops: RouteStop[];
  geometryCoords: [number, number][];
}

export const routeService = {
  /**
   * Fetches list of all static Routes.
   */
  async getRoutes(): Promise<RouteResponse[]> {
    const response = await api.get<RouteResponse[]>("/routes");
    return response.data;
  },

  /**
   * Fetches route details including sequence halts and LineString geo paths.
   */
  async getRouteDetails(routeId: number, currentPalkhiCheckpoint?: string): Promise<RouteDetailResult> {
    const response = await api.get<RouteResponse>(`/routes/${routeId}`);
    const data = response.data;
    
    const stops = data.checkpoints 
      ? mapCheckpointsList(data.checkpoints, currentPalkhiCheckpoint) 
      : [];
      
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      stops,
      geometryCoords: data.geometry_coords || [],
    };
  },
};
