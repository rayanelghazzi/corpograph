import { useQuery } from "@tanstack/react-query";
import { getCase } from "@/api/cases";

export function useCase(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCase(caseId),
    enabled: !!caseId,
  });
}

export function useCaseWithPolling(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCase(caseId),
    enabled: !!caseId,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.active_job ? 2000 : false;
    },
  });
}
