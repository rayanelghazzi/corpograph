import { useQuery } from "@tanstack/react-query";
import { listArtifacts, getArtifact } from "@/api/artifacts";

export function useArtifacts(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId, "artifacts"],
    queryFn: () => listArtifacts(caseId),
    enabled: !!caseId,
  });
}

export function useArtifact(caseId: string, code: string, enabled = true) {
  return useQuery({
    queryKey: ["case", caseId, "artifact", code],
    queryFn: () => getArtifact(caseId, code),
    enabled: !!caseId && !!code && enabled,
    staleTime: 60_000,
  });
}
