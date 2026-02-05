import { Suspense, lazy, useEffect } from "react";
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

  useEffect(() => {
    const defaultMode = vizType === "hypergraph" || vizType === "graph" ? "graph" : "list";
    setViewMode(defaultMode as any);
  }, [vizType, setViewMode]);

  const handleTabChange = (tab: string) => {
    console.log("ViewRouter.TabChange", { tab, vizType });
    setViewMode(tab as any);
  };

  // Determine if we're in list/grid view mode (overlay mode)
  const isOverlayMode = ["nodes", "edges", "hyperedges", "items"].includes(viewMode || "");
  
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
    <div className="w-full h-full flex flex-col items-stretch overflow-hidden relative">
      {/* View Content - Fill remaining space with layered rendering */}
      <div className="flex-1 min-h-0 relative w-full">
        {/* Canvas Layer - Always present, with conditional blur effect for modern glass-morphism */}
        <div className={`absolute inset-0 transition-all duration-300 ${isOverlayMode ? 'blur-sm opacity-70' : 'blur-none opacity-100'}`}>
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
            {vizType === "graph" && <GraphView data={data} meta={meta} />}
            {vizType === "hypergraph" && <HypergraphView data={data} meta={meta} />}
            {vizType === "list" && <ListView data={data} meta={meta} />}
          </Suspense>
        </div>

        {/* Overlay Layer - Gallery appears on top with backdrop */}
        {isOverlayMode && (
          <div className="absolute inset-0 z-50">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                    <p className="text-sm text-muted-foreground">Loading gallery...</p>
                  </div>
                </div>
              }
            >
              {vizType === "graph" && (
                <>
                  {viewMode === "nodes" && (
                    <PaginatedGridView
                      entityType="node"
                      fetchFunction={(page, pageSize) => apiClient.getNodesPaginated(page, pageSize)}
                    />
                  )}
                  {viewMode === "edges" && (
                    <PaginatedGridView
                      entityType="edge"
                      fetchFunction={(page, pageSize) => apiClient.getEdgesPaginated(page, pageSize)}
                    />
                  )}
                </>
              )}

              {vizType === "hypergraph" && (
                <>
                  {viewMode === "nodes" && (
                    <PaginatedGridView
                      entityType="node"
                      fetchFunction={(page, pageSize) => apiClient.getNodesPaginated(page, pageSize)}
                    />
                  )}
                  {viewMode === "hyperedges" && (
                    <PaginatedGridView
                      entityType="hyperedge"
                      fetchFunction={(page, pageSize) => apiClient.getHyperedgesPaginated(page, pageSize)}
                    />
                  )}
                </>
              )}

              {vizType === "list" && (
                <>
                  {viewMode === "items" && (
                    <PaginatedGridView
                      entityType="item"
                      fetchFunction={(page, pageSize) => apiClient.getItemsPaginated(page, pageSize)}
                    />
                  )}
                </>
              )}
            </Suspense>
          </div>
        )}
      </div>

      {/* View Switcher - MOVED TO BOTTOM of DOM for highest stacking priority, z-[100] */}
      <div className="absolute top-4 right-[10vw] z-[100] flex justify-center pointer-events-auto">
        <div className="w-[60vw] flex justify-center">
          <FloatingNav
            vizType={vizType}
            activeView={viewMode}
            onViewChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
}
