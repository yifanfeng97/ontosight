import { Suspense, lazy, useEffect, useState } from "react";
import { useVisualization } from "@/hooks/useVisualization";
import { apiClient } from "@/services/api";
import FloatingNav from "@/components/layout/FloatingNav";
import { AlertCircle } from "lucide-react";

const GraphView = lazy(() => import("./GraphView"));
const ListView = lazy(() => import("./ListView"));
const PaginatedGridView = lazy(() => import("./PaginatedGridView"));
const HypergraphView = lazy(() => import("./HypergraphView"));

interface ViewRouterProps {
  data: any;
  meta: any;
}

export default function ViewRouter({ data, meta }: ViewRouterProps) {
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
    console.log("ViewRouter.TabChange", { tab, vizType });
    setActiveTab(tab);
    setViewMode(tab as any);
  };
  
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-foreground">No data available</h3>
            <p className="text-sm text-muted-foreground">No data to visualize</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vizType) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div>
            <h3 className="font-semibold text-destructive">Invalid metadata</h3>
            <p className="text-sm text-destructive/80">Invalid visualization metadata</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Floating View Switcher */}
      <FloatingNav
        vizType={vizType}
        activeView={activeTab}
        onViewChange={handleTabChange}
      />

      {/* View Content */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground">Loading view...</p>
            </div>
          </div>
        }
      >
        {vizType === "graph" && (
          <>
            {activeTab === "graph" && <GraphView data={data} meta={meta} />}
            {activeTab === "nodes" && (
              <PaginatedGridView
                type="node"
                fetchFunction={(page, pageSize) => apiClient.getNodesPaginated(page, pageSize)}
              />
            )}
            {activeTab === "edges" && (
              <PaginatedGridView
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
              <PaginatedGridView
                type="node"
                fetchFunction={(page, pageSize) => apiClient.getNodesPaginated(page, pageSize)}
              />
            )}
            {activeTab === "hyperedges" && (
              <PaginatedGridView
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
              <PaginatedGridView
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
