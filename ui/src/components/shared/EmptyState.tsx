import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  message: string;
  variant?: "warning" | "info";
}

export function EmptyState({ message, variant = "warning" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-orange-50 py-8 px-4">
      <AlertCircle
        className={`h-8 w-8 ${variant === "warning" ? "text-orange-500" : "text-blue-500"}`}
      />
      <p className="text-center text-sm text-orange-700">{message}</p>
    </div>
  );
}
