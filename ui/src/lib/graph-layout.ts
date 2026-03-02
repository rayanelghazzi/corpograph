import type { Node, Edge } from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import type { GraphResponse } from "@/api/types";

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 60;

export function computeLayout(graphData: GraphResponse): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 100 });

  for (const node of graphData.nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of graphData.edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const nodes: Node[] = graphData.nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      id: node.id,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { ...node } as Record<string, unknown>,
      type: "entityNode",
    };
  });

  const edges: Edge[] = graphData.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label || (edge.ownership_pct != null ? `${edge.ownership_pct}%` : "?"),
    animated: edge.ownership_pct === null,
    style: edge.type === "control" ? { strokeDasharray: "5,5" } : undefined,
  }));

  return { nodes, edges };
}
