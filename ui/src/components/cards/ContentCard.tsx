import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContentCardProps {
  title: string;
  subtitle?: string;
  variant?: "default" | "error" | "info";
  assistiveText?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function ContentCard({
  title,
  subtitle,
  variant = "default",
  assistiveText,
  action,
  children,
}: ContentCardProps) {
  return (
    <Card
      className={cn(
        "shadow-none",
        variant === "error" && "border-red-400 border-dashed",
        variant === "info" && "border-blue-300 border-l-4 bg-blue-50/50"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        {assistiveText && (
          <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
            💬 {assistiveText}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
