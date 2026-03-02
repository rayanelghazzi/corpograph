import type { ReactNode } from "react";
import type { CaseDetail } from "@/api/types";

interface CaseViewLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function CaseViewLayout({ children, sidebar }: CaseViewLayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
      <div className="w-[320px] shrink-0 overflow-y-auto border-l p-4">
        {sidebar}
      </div>
    </div>
  );
}
