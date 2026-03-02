import { useQuery } from "@tanstack/react-query";
import { listIssues } from "@/api/issues";

export function useIssues(
  caseId: string,
  params?: { phase?: number; resolved?: boolean; severity?: string }
) {
  return useQuery({
    queryKey: ["case", caseId, "issues", params],
    queryFn: () => listIssues(caseId, params),
    enabled: !!caseId,
  });
}
