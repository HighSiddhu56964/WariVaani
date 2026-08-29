import { useQuery } from "@tanstack/react-query";
import { palkhiService } from "../services/palkhiService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { parseApiError } from "../utils/apiError";

export function useCurrentPalkhis() {
  const query = useQuery({
    queryKey: QUERY_KEYS.palkhi,
    queryFn: () => palkhiService.getCurrentPalkhis(),
    refetchInterval: 5000, // Polling interval: 5 seconds
    staleTime: 4000,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? parseApiError(query.error).message : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
