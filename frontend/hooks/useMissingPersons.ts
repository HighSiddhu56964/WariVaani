import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { missingPersonService } from "../services/missingPersonService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { parseApiError } from "../utils/apiError";
import { MissingPersonCreate } from "../types/api/missingPerson";

export function useMissingReports() {
  const query = useQuery({
    queryKey: QUERY_KEYS.missing,
    queryFn: () => missingPersonService.getMissingReports(),
    refetchInterval: 10000, // Polling interval: 10 seconds
    staleTime: 9000,
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

export function useMissingReport(ticketId: string) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.missing, ticketId],
    queryFn: () => missingPersonService.getMissingReportByTicket(ticketId),
    enabled: !!ticketId,
    staleTime: 5000,
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? parseApiError(query.error).message : null,
    refetch: query.refetch,
  };
}

export function useCreateMissingReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, source }: { data: MissingPersonCreate; source?: string }) =>
      missingPersonService.createMissingReport(data, source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.missing });
    },
  });
}

export function useUpdateMissingReportStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      status,
      source,
    }: {
      ticketId: string;
      status: "Missing" | "Found" | "In Progress";
      source?: string;
    }) => missingPersonService.updateMissingReportStatus(ticketId, status, source),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.missing });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.missing, variables.ticketId] });
    },
  });
}
