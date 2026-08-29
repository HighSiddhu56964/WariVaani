import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { QUERY_KEYS } from "../constants/queryKeys";

export function useHealthCheck() {
  return useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: async () => {
      const response = await api.get("/health");
      return response.data;
    },
    retry: false, // Do not retry if offline
    refetchInterval: 15000, // Check every 15 seconds
    staleTime: 10000,
  });
}
