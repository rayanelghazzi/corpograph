import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RationaleDialogProps {
  action: "escalate" | "reject";
  onConfirm: (rationale: string) => void;
  onCancel: () => void;
}

export function RationaleDialog({ action, onConfirm, onCancel }: RationaleDialogProps) {
  const [rationale, setRationale] = useState("");

  const title = action === "escalate" ? "Escalate to Compliance" : "Reject Onboarding";

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {action === "reject" && (
            <p className="text-sm text-red-600 font-medium">This action cannot be undone.</p>
          )}
          <Textarea
            placeholder="Enter rationale..."
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            variant={action === "reject" ? "destructive" : "default"}
            disabled={!rationale.trim()}
            onClick={() => onConfirm(rationale.trim())}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
