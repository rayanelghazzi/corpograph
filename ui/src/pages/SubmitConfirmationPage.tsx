import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubmitConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const caseId = (location.state as { caseId?: string })?.caseId;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500" />
      <h1 className="text-2xl font-medium">Onboarding Packet Submitted</h1>
      <p className="max-w-md text-muted-foreground">
        Your case has been submitted for review. No further action is required
        unless you are contacted by the compliance team.
      </p>
      {caseId && (
        <p className="text-sm text-muted-foreground">
          Case reference: <span className="font-mono">{caseId.slice(0, 8)}</span>
        </p>
      )}
      <Button variant="outline" onClick={() => navigate("/submit")}>
        Submit Another
      </Button>
    </div>
  );
}
