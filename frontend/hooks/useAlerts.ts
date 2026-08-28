import { useQuery } from "@tanstack/react-query";
import { alertService } from "../services/alertService";
import { QUERY_KEYS } from "../constants/queryKeys";

export function useAlerts() {
  const query = useQuery({
    queryKey: QUERY_KEYS.alerts,
    queryFn: () => alertService.getAlerts(),
    refetchInterval: 30000, // 30 seconds polling
    staleTime: 25000,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
