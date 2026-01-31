import { useVisualization } from "@/hooks/useVisualization";
import VisualizationRouter from "@/components/VisualizationRouter";
import LoadingSpinner from "@/components/LoadingSpinner";
import SearchPanel from "@/components/SearchPanel";
import ChatPanel from "@/components/ChatPanel";
import StatsPanel from "@/components/StatsPanel";
import DetailPanel from "@/components/DetailPanel";
import { ScrollArea } from "@/components/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Layout() {
  const { loading, error, meta, data, selectedItems, triggerLayoutReset } = useVisualization();

  // Determine which features are available based on meta
  const hasSearch = meta?.features?.search === true;
  const hasChat = meta?.features?.chat === true;
  const hasSidebar = hasSearch || hasChat;
  const vizType = meta?.type || "graph";
  const hasSelection = selectedItems.size > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar: Stats + Schema */}
      <div className="w-[300px] border-r border-border bg-muted/30 flex flex-col h-full">
        <div className="p-4 border-b border-border flex-shrink-0">
          <h1 className="text-xl font-bold text-primary">OntoSight</h1>
        </div>

        {/* Top: Basic Statistics */}
        <div className="flex-shrink-0">
          {meta?.stats && (
            <ScrollArea className="max-h-[40%]">
              <div className="p-4">
                <StatsPanel stats={meta.stats} />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Bottom: Detail Panel (when selected) */}
        {hasSelection && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <DetailPanel />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex bg-background relative overflow-hidden">
          {/* Reset Button */}
          {data && (
            <button
              onClick={triggerLayoutReset}
              className="absolute top-4 right-4 z-10 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
              title="Reset view layout"
            >
              <RotateCcw className="w-4 h-4 hover:rotate-180 transition-transform duration-300" />
            </button>
          )}
          <LoadingSpinner loading={loading} tip="Loading...">
            {error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Alert variant="destructive" className="w-96">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            {!error && data && <VisualizationRouter data={data} meta={meta} />}
          </LoadingSpinner>
        </div>
      </div>

      {/* Right Sidebar: Search + Chat (conditional) */}
      {hasSidebar && (
        <div className="w-[350px] border-l border-border bg-muted/30 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {hasSearch && <SearchPanel />}
              {hasChat && <ChatPanel />}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
