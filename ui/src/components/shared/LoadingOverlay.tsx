import { PHASE_LABELS } from "@/lib/constants";

interface LoadingOverlayProps {
  phase?: number;
}

export function LoadingOverlay({ phase }: LoadingOverlayProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-muted-foreground/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-foreground" />
      </div>
      <div className="text-center">
        {phase ? (
          <>
            <p className="font-medium text-foreground">
              Processing Phase {phase}: {PHASE_LABELS[phase]}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This may take a minute...
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Loading...</p>
        )}
      </div>
    </div>
  );
}
