import { Suspense, lazy } from "react";
import { Empty } from "antd";
import "@/components/VisualizationRouter.css";

const GraphView = lazy(() => import("@/components/views/GraphView"));
const ListView = lazy(() => import("@/components/views/ListView"));
const HypergraphView = lazy(() => import("@/components/views/HypergraphView"));

interface VisualizationRouterProps {
  data: any;
  meta: any;
}

export default function VisualizationRouter({ data, meta }: VisualizationRouterProps) {
  // Determine view type from data structure
  let viewType: "graph" | "list" | "hypergraph" = "graph";

  if (data.nodes && data.edges) {
    viewType = data.hyperedges ? "hypergraph" : "graph";
  } else if (data.items) {
    viewType = "list";
  }

  return (
    <div className="visualization-router">
      <Suspense fallback={<div>Loading visualization...</div>}>
        {viewType === "graph" && <GraphView data={data} meta={meta} />}
        {viewType === "list" && <ListView data={data} meta={meta} />}
        {viewType === "hypergraph" && <HypergraphView />}
        {!data && <Empty description="No data to visualize" />}
      </Suspense>
    </div>
  );
}
