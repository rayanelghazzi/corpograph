import { useQuery } from "@tanstack/react-query";
import { listCases } from "@/api/cases";

export function useCases(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ["cases", filters],
    queryFn: () => listCases(filters),
  });
}
