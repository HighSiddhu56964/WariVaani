import { useQuery } from "@tanstack/react-query";
import { facilityService } from "../services/facilityService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { parseApiError } from "../utils/apiError";

export function useFacilities() {
  const query = useQuery({
    queryKey: QUERY_KEYS.facilities,
    queryFn: () => facilityService.getFacilities(),
    refetchInterval: 30000, // Polling interval: 30 seconds
    staleTime: 25000,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error ? parseApiError(query.error).message : null,
    refetch: query.refetch,
  };
}

export function useNearbyFacilities(lat: number | null, lng: number | null, radiusKm: number = 5.0, type?: string) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.facilities, "nearby", lat, lng, radiusKm, type],
    queryFn: () => {
      if (lat === null || lng === null) return [];
      return facilityService.getNearbyFacilities(lat, lng, radiusKm, type);
    },
    enabled: lat !== null && lng !== null,
    refetchInterval: 30000, // Polling interval: 30 seconds
    staleTime: 25000,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error ? parseApiError(query.error).message : null,
    refetch: query.refetch,
  };
}
