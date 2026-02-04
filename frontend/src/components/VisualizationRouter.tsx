import { Suspense, lazy, useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVisualization } from "@/hooks/useVisualization";

const GraphView = lazy(() => import("@/components/views/GraphView"));
const ListView = lazy(() => import("@/components/views/ListView"));
const AllItemsListView = lazy(() => import("@/components/views/AllItemsListView"));
const HypergraphView = lazy(() => import("@/components/views/HypergraphView"));
const NodeListView = lazy(() => import("@/components/views/NodeListView"));
const EdgeListView = lazy(() => import("@/components/views/EdgeListView"));
const HyperedgeListView = lazy(() => import("@/components/views/HyperedgeListView"));

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
              <TabsTrigger value="graph">图视图</TabsTrigger>
              <TabsTrigger value="nodes">节点列表</TabsTrigger>
              <TabsTrigger value="edges">边列表</TabsTrigger>
            </>
          )}
          {vizType === "hypergraph" && (
            <>
              <TabsTrigger value="graph">超图视图</TabsTrigger>
              <TabsTrigger value="nodes">节点列表</TabsTrigger>
              <TabsTrigger value="hyperedges">超边列表</TabsTrigger>
            </>
          )}
          {vizType === "list" && (
            <>
              <TabsTrigger value="list">样本视图</TabsTrigger>
              <TabsTrigger value="items">所有项目</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">加载中...</div>
              </div>
            }
          >
            {vizType === "graph" && (
              <>
                <TabsContent value="graph" className="h-full border-0 p-0">
                  <GraphView data={data} meta={meta} />
                </TabsContent>
                <TabsContent value="nodes" className="h-full border-0 p-0">
                  <NodeListView data={data} meta={meta} />
                </TabsContent>
                <TabsContent value="edges" className="h-full border-0 p-0">
                  <EdgeListView data={data} meta={meta} />
                </TabsContent>
              </>
            )}

            {vizType === "hypergraph" && (
              <>
                <TabsContent value="graph" className="h-full border-0 p-0">
                  <HypergraphView data={data} meta={meta} />
                </TabsContent>
                <TabsContent value="nodes" className="h-full border-0 p-0">
                  <NodeListView data={data} meta={meta} />
                </TabsContent>
                <TabsContent value="hyperedges" className="h-full border-0 p-0">
                  <HyperedgeListView data={data} meta={meta} />
                </TabsContent>
              </>
            )}

            {vizType === "list" && (
              <>
                <TabsContent value="list" className="h-full border-0 p-0">
                  <ListView data={data} meta={meta} />
                </TabsContent>
                <TabsContent value="items" className="h-full border-0 p-0">
                  <AllItemsListView />
                </TabsContent>
              </>
            )}
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
