import { useQuery } from "@tanstack/react-query";
import { routeService } from "../services/routeService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { parseApiError } from "../utils/apiError";

export function useRoutesList() {
  const query = useQuery({
    queryKey: QUERY_KEYS.routes,
    queryFn: () => routeService.getRoutes(),
    staleTime: 300000, // Routes lists change infrequently (stale: 5m)
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? parseApiError(query.error).message : null,
    refetch: query.refetch,
  };
}

export function useRouteDetails(routeId: number, currentPalkhiCheckpoint?: string) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.routes, routeId, currentPalkhiCheckpoint],
    queryFn: () => routeService.getRouteDetails(routeId, currentPalkhiCheckpoint),
    enabled: !!routeId,
    staleTime: 30000, // Route halts and details cache duration: 30 seconds
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? parseApiError(query.error).message : null,
    refetch: query.refetch,
  };
}
