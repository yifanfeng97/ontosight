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
  console.log("[VisualizationRouter] Received data:", data);
  console.log("[VisualizationRouter] Data keys:", data ? Object.keys(data) : "null");
  
  // Determine view type from payload
  const payload = data?.payload;
  console.log("[VisualizationRouter] Payload:", payload);
  console.log("[VisualizationRouter] Payload type:", payload?.type);
  
  if (!payload) {
    console.warn("[VisualizationRouter] No payload found, showing empty");
    return <Empty description="No data to visualize" />;
  }

  const viewType = payload.type;
  const viewData = payload.data;
  
  console.log("[VisualizationRouter] View type:", viewType);
  console.log("[VisualizationRouter] View data:", viewData);

  return (
    <div className="visualization-router">
      <Suspense fallback={<div>Loading visualization...</div>}>
        {viewType === "graph" && <GraphView data={viewData} meta={meta} />}
        {viewType === "list" && <ListView data={viewData} meta={meta} />}
        {viewType === "hypergraph" && <HypergraphView data={viewData} meta={meta} />}
      </Suspense>
    </div>
  );
}
