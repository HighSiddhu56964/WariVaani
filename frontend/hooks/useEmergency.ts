import { useQuery } from "@tanstack/react-query";
import { emergencyService } from "../services/emergencyService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { parseApiError } from "../utils/apiError";

export function useEmergencyContacts() {
  const query = useQuery({
    queryKey: QUERY_KEYS.emergency,
    queryFn: () => emergencyService.getEmergencyContacts(),
    refetchInterval: 60000, // Polling interval: 60 seconds
    staleTime: 55000,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? parseApiError(query.error).message : null,
    refetch: query.refetch,
  };
}
