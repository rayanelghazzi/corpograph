import { useNavigate } from "react-router-dom";
import { Upload, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-medium text-foreground">CorpGraph</h1>
        <p className="mt-2 text-muted-foreground">
          AI-Native Corporate Onboarding Orchestrator
        </p>
      </div>
      <div className="grid w-full max-w-xl grid-cols-2 gap-6">
        <Card
          className="cursor-pointer shadow-none hover:border-foreground/30 transition-colors"
          onClick={() => navigate("/submit")}
        >
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-6">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Submit Onboarding Packet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload documents and questionnaire
              </p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer shadow-none hover:border-foreground/30 transition-colors"
          onClick={() => navigate("/dashboard")}
        >
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-6">
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Analyst Dashboard</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Review and manage cases
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
