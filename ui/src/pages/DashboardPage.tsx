import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import { useCases } from "@/hooks/use-cases";
import { deleteCase } from "@/api/cases";
import { formatDate } from "@/lib/format";

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useCases();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) return <LoadingOverlay />;

  const cases = data?.cases ?? [];
  const counts = data?.counts ?? { total: 0, in_review: 0, escalated: 0, approved: 0 };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCase(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Case deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete case");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/20 px-6 py-4">
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
        <div className="mb-6 grid grid-cols-4 gap-6">
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
                  <TableCell className="text-sm">
                    {c.current_phase >= 1 && c.current_phase <= 5
                      ? `Phase ${c.current_phase}`
                      : "Done"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(c.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/cases/${c.id}`)}
                      >
                        Review
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setDeleteTarget({
                            id: c.id,
                            name: c.corporation_name ?? c.id.slice(0, 8),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete case</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
              All associated documents, artifacts, and chat history will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
