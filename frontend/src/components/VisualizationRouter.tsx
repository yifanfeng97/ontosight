import { Suspense, lazy, useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription, Spinner } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import { useVisualization } from "@/hooks/useVisualization";
import { apiClient } from "@/services/api";
import FloatingViewSwitcher from "@/components/FloatingViewSwitcher";

const GraphView = lazy(() => import("@/components/views/GraphView"));
const ListView = lazy(() => import("@/components/views/ListView"));
const UnifiedListView = lazy(() => import("@/components/views/UnifiedListView"));
const HypergraphView = lazy(() => import("@/components/views/HypergraphView"));

interface VisualizationRouterProps {
  data: any;
  meta: any;
}

export default function VisualizationRouter({ data, meta }: VisualizationRouterProps) {
  // Get visualization type from meta
  const vizType = meta?.type;
  const { setViewMode, viewMode } = useVisualization();
  const [activeTab, setActiveTab] = useState("graph");

  useEffect(() => {
    const defaultTab = vizType === "hypergraph" || vizType === "graph" ? "graph" : "list";
    setActiveTab(defaultTab);
    setViewMode(defaultTab as any);
  }, [vizType, setViewMode]);

  const handleTabChange = (tab: string) => {
    console.log("VisualizationRouter.TabChange", { tab, vizType });
    setActiveTab(tab);
    setViewMode(tab as any);
  };
  
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
    <div className="w-full h-full relative overflow-hidden">
      {/* Floating View Switcher */}
      <FloatingViewSwitcher
        vizType={vizType}
        activeView={activeTab}
        onViewChange={handleTabChange}
      />

      {/* View Content */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="md" />
              <p className="text-sm text-muted-foreground">Loading view...</p>
            </div>
          </div>
        }
      >
        {vizType === "graph" && (
          <>
            {activeTab === "graph" && <GraphView data={data} meta={meta} />}
            {activeTab === "nodes" && (
              <UnifiedListView
                type="node"
                fetchFunction={(page, pageSize) => apiClient.getNodesPaginated(page, pageSize)}
              />
            )}
            {activeTab === "edges" && (
              <UnifiedListView
                type="edge"
                fetchFunction={(page, pageSize) => apiClient.getEdgesPaginated(page, pageSize)}
              />
            )}
          </>
        )}

        {vizType === "hypergraph" && (
          <>
            {activeTab === "graph" && <HypergraphView data={data} meta={meta} />}
            {activeTab === "nodes" && (
              <UnifiedListView
                type="node"
                fetchFunction={(page, pageSize) => apiClient.getNodesPaginated(page, pageSize)}
              />
            )}
            {activeTab === "hyperedges" && (
              <UnifiedListView
                type="hyperedge"
                fetchFunction={(page, pageSize) => apiClient.getHyperedgesPaginated(page, pageSize)}
              />
            )}
          </>
        )}

        {vizType === "list" && (
          <>
            {activeTab === "list" && <ListView data={data} meta={meta} />}
            {activeTab === "items" && (
              <UnifiedListView
                type="item"
                fetchFunction={(page, pageSize) => apiClient.getItemsPaginated(page, pageSize)}
              />
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}
