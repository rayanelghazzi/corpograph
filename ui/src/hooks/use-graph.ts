import { useQuery } from "@tanstack/react-query";
import { getGraph } from "@/api/graph";

export function useGraph(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case", caseId, "graph"],
    queryFn: () => getGraph(caseId),
    enabled: !!caseId && enabled,
  });
}
