import { Suspense, lazy, useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVisualization } from "@/hooks/useVisualization";
import { apiClient } from "@/services/api";

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
    <div className="w-full h-full flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full flex flex-col">
        {/* Tab Headers */}
        <TabsList className="w-full shrink-0 border-b border-border rounded-none bg-muted/50 px-4">
          {vizType === "graph" && (
            <>
              <TabsTrigger value="graph">Graph View</TabsTrigger>
              <TabsTrigger value="nodes">Node List</TabsTrigger>
              <TabsTrigger value="edges">Edge List</TabsTrigger>
            </>
          )}
          {vizType === "hypergraph" && (
            <>
              <TabsTrigger value="graph">Hypergraph View</TabsTrigger>
              <TabsTrigger value="nodes">Node List</TabsTrigger>
              <TabsTrigger value="hyperedges">Hyperedge List</TabsTrigger>
            </>
          )}
          {vizType === "list" && (
            <>
              <TabsTrigger value="list">Sample View</TabsTrigger>
              <TabsTrigger value="items">All Items</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            }
          >
            {vizType === "graph" && (
              <>
                <TabsContent value="graph" className="h-full border-0 p-0">
                  <GraphView data={data} meta={meta} />
                </TabsContent>
                <TabsContent value="nodes" className="h-full border-0 p-0">
                  <UnifiedListView
                    title="All Nodes"
                    type="node"
                    fetchFunction={(page, pageSize) => apiClient.getNodesPaginated(page, pageSize)}
                  />
                </TabsContent>
                <TabsContent value="edges" className="h-full border-0 p-0">
                  <UnifiedListView
                    title="All Edges"
                    type="edge"
                    fetchFunction={(page, pageSize) => apiClient.getEdgesPaginated(page, pageSize)}
                  />
                </TabsContent>
              </>
            )}

            {vizType === "hypergraph" && (
              <>
                <TabsContent value="graph" className="h-full border-0 p-0">
                  <HypergraphView data={data} meta={meta} />
                </TabsContent>
                <TabsContent value="nodes" className="h-full border-0 p-0">
                  <UnifiedListView
                    title="All Nodes"
                    type="node"
                    fetchFunction={(page, pageSize) => apiClient.getNodesPaginated(page, pageSize)}
                  />
                </TabsContent>
                <TabsContent value="hyperedges" className="h-full border-0 p-0">
                  <UnifiedListView
                    title="All Hyperedges"
                    type="hyperedge"
                    fetchFunction={(page, pageSize) => apiClient.getHyperedgesPaginated(page, pageSize)}
                  />
                </TabsContent>
              </>
            )}

            {vizType === "list" && (
              <>
                <TabsContent value="list" className="h-full border-0 p-0">
                  <ListView data={data} meta={meta} />
                </TabsContent>
                <TabsContent value="items" className="h-full border-0 p-0">
                  <UnifiedListView
                    title="All Items"
                    type="item"
                    fetchFunction={(page, pageSize) => apiClient.getItemsPaginated(page, pageSize)}
                  />
                </TabsContent>
              </>
            )}
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
