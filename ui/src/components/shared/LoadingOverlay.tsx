import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  phase?: number;
}

export function LoadingOverlay({ phase }: LoadingOverlayProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">
        {phase
          ? `Processing Phase ${phase}... This may take a minute.`
          : "Loading..."}
      </p>
    </div>
  );
}
