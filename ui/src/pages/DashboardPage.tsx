import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import { useCases } from "@/hooks/use-cases";
import { formatDate, formatAccountType } from "@/lib/format";
import type { CaseStatus } from "@/api/types";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useCases();

  if (isLoading) return <LoadingOverlay />;

  const cases = data?.cases ?? [];
  const counts = data?.counts ?? { total: 0, in_review: 0, escalated: 0, approved: 0 };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">CorpGraph</h1>
            <p className="text-sm text-muted-foreground">
              AI-Native Corporate Onboarding Orchestrator
            </p>
          </div>
          <Button onClick={() => navigate("/submit")}>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-medium">Active Cases</h2>
          <p className="text-muted-foreground">Review and manage corporate onboarding cases</p>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="font-medium">Company Name</TableHead>
                <TableHead className="font-medium">Case ID</TableHead>
                <TableHead className="font-medium">Product Type</TableHead>
                <TableHead className="font-medium">Current Phase</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Last Updated</TableHead>
                <TableHead className="font-medium text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No cases yet. Submit an onboarding packet to get started.
                  </TableCell>
                </TableRow>
              )}
              {cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.corporation_name ?? "Unnamed Case"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {c.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="capitalize text-sm">—</TableCell>
                  <TableCell className="text-sm">Phase {c.current_phase}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(c.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/cases/${c.id}`)}
                    >
                      Review
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-6">
          {[
            { label: "Total Cases", value: counts.total },
            { label: "In Review", value: counts.in_review },
            { label: "Escalated", value: counts.escalated },
            { label: "Approved", value: counts.approved },
          ].map((counter) => (
            <Card key={counter.label} className="shadow-none">
              <CardContent className="pt-6">
                <p className="text-3xl font-medium">{counter.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{counter.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
