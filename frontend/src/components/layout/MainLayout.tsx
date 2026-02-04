import { useVisualization } from "@/hooks/useVisualization";
import ViewRouter from "@/components/views/ViewRouter";
import StatsPanel from "@/components/panels/StatsPanel";
import DetailPanel from "@/components/panels/DetailPanel";
import FloatingTools from "@/components/layout/FloatingTools";
import { RotateCcw, AlertCircle } from "lucide-react";

export default function MainLayout() {
  const { loading, error, meta, data, viewedHistory, triggerLayoutReset } = useVisualization();

  // Determine which features are available based on meta
  const hasSearch = meta?.features?.search === true;
  const hasChat = meta?.features?.chat === true;
  const hasSidebar = hasSearch || hasChat;
  const vizType = meta?.type || "graph";
  const isHistorySelected = viewedHistory.length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar: Stats + Details */}
      <div className="w-[300px] border-r border-border bg-muted/30 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-border flex-shrink-0">
          <h1 className="text-xl font-bold text-primary">OntoSight</h1>
        </div>

        {/* Top: Basic Statistics */}
        <div className="flex-shrink-0 overflow-y-auto max-h-[40%]">
          {meta?.stats && (
            <div className="p-4">
              <StatsPanel stats={meta.stats} />
            </div>
          )}
        </div>

        {/* Bottom: Detail Panel (when selected) */}
        {isHistorySelected && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <DetailPanel />
          </div>
        )}
      </div>

      {/* Main Canvas Area - Full Screen */}
      <div className="flex-1 relative overflow-hidden bg-background">
        {/* Reset Button */}
        {data && (
          <button
            onClick={() => triggerLayoutReset()}
            className="absolute top-4 right-4 z-10 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            title="Reset view layout and fetch fresh data"
          >
            <RotateCcw className={`w-4 h-4 hover:rotate-180 transition-transform duration-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 p-6 rounded-lg border border-destructive/50 bg-destructive/10">
              <div className="flex gap-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Error</h3>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - View Router */}
        {!loading && !error && data && <ViewRouter data={data} meta={meta} />}

        {/* Floating Toolbar (Search + Chat) */}
        <FloatingTools hasSearch={hasSearch} hasChat={hasChat} />
      </div>
    </div>
  );
}
