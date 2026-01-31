import { Suspense, lazy } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const GraphView = lazy(() => import("@/components/views/GraphView"));
const ListView = lazy(() => import("@/components/views/ListView"));
const HypergraphView = lazy(() => import("@/components/views/HypergraphView"));

interface VisualizationRouterProps {
  data: any;
  meta: any;
}

export default function VisualizationRouter({ data, meta }: VisualizationRouterProps) {
  // Get visualization type from meta
  const vizType = meta?.type;
  
  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>No data to visualize</AlertDescription>
      </Alert>
    );
  }

  if (!vizType) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid metadata</AlertTitle>
        <AlertDescription>Invalid visualization metadata</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-foreground">Loading visualization...</div>
        </div>
      }>
        {vizType === "graph" && <GraphView data={data} meta={meta} />}
        {vizType === "list" && <ListView data={data} meta={meta} />}
        {vizType === "hypergraph" && <HypergraphView data={data} meta={meta} />}
      </Suspense>
    </div>
  );
}
