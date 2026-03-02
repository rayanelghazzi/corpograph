import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { computeLayout, NODE_WIDTH, NODE_HEIGHT } from "@/lib/graph-layout";
import type { GraphResponse, GraphNode } from "@/api/types";

const hasScreeningFlag = (status?: string | null) =>
  status === "potential_match" || status === "confirmed_match";

function EntityNode({ data }: { data: Record<string, unknown> }) {
  const node = data as unknown as GraphNode;
  const flagged = hasScreeningFlag(node.screening_status);

  let bg = "bg-purple-100 border-purple-400";
  if (flagged) bg = "bg-orange-100 border-orange-400";
  else if (node.is_subject) bg = "bg-amber-100 border-amber-400";
  else if (node.type === "individual") bg = "bg-blue-100 border-blue-400";
  else if (node.type === "corporation") bg = "bg-red-100 border-red-400";

  return (
    <div className={`rounded-lg border-2 px-3 py-2 text-center relative ${bg}`} style={{ width: NODE_WIDTH, minHeight: NODE_HEIGHT }}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      {flagged && (
        <div className="absolute -top-2 -right-2 rounded-full bg-orange-500 p-0.5">
          <AlertTriangle className="h-3 w-3 text-white" />
        </div>
      )}
      <p className="text-xs font-semibold truncate">{node.label}</p>
      <p className="text-[10px] capitalize text-muted-foreground">
        {node.type === "individual" ? "Person" : node.type}
      </p>
      {node.is_beneficial_owner && node.effective_ownership_pct != null && (
        <p className="text-[10px] font-medium">{node.effective_ownership_pct}%</p>
      )}
      {flagged && (
        <p className="text-[10px] font-medium text-orange-600">Screening Alert</p>
      )}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

export const graphNodeTypes = { entityNode: EntityNode };

interface GraphModalProps {
  graphData: GraphResponse;
  onClose: () => void;
}

export function GraphModal({ graphData, onClose }: GraphModalProps) {
  const { nodes, edges } = useMemo(() => computeLayout(graphData), [graphData]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ownership & Control Graph</DialogTitle>
          <p className="text-sm text-muted-foreground">Visual representation of ownership structure</p>
        </DialogHeader>
        <div className="flex-1 rounded-lg border bg-muted/30">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={graphNodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
            fitViewOptions={{ padding: 0.3 }}
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-200 border border-amber-400" /> Target Corporation</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-blue-200 border border-blue-400" /> Natural Person</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-200 border border-red-400" /> Corporate Entity</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-orange-200 border border-orange-400" /> Screening Alert</span>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
