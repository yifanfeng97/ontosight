import { useVisualization } from "@/hooks/useVisualization";
import ViewRouter from "@/components/views/ViewRouter";
import StatsPanel from "@/components/panels/StatsPanel";
import DetailPanel from "@/components/panels/DetailPanel";
import FloatingTools from "@/components/layout/FloatingTools";
import Island from "@/components/core/Island";
import { RotateCcw, AlertCircle } from "lucide-react";

export default function MainLayout() {
  const { loading, error, meta, data, viewedHistory, triggerLayoutReset, setViewMode, viewMode, clearHistory } = useVisualization();

  // Determine which features are available based on meta
  const hasSearch = meta?.features?.search === true;
  const hasChat = meta?.features?.chat === true;
  const hasSidebar = hasSearch || hasChat;
  const vizType = meta?.type || "graph";
  const isHistorySelected = viewedHistory.length > 0;

  // 判断是否处于列表/网格视图模式（使用全局viewMode而非meta）
  const isGridViewMode = ["nodes", "edges", "hyperedges", "items"].includes(viewMode || "");

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Canvas Background with subtle grid pattern */}
      <div 
        className={`absolute inset-0 z-0 transition-opacity duration-300 ${isGridViewMode ? "opacity-20" : "opacity-100"}`}
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)/0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)/0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main ViewRouter - Full Screen Canvas */}
      <div 
        className={`absolute inset-0 z-0 transition-all duration-300`}
      >
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
      </div>

      {/* Floating Islands Layer - Always on top of canvas */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {/* Left Sidebar Island Container - Vertical Stack with relative width */}
        <div className="fixed left-6 top-6 bottom-6 flex flex-col gap-6 pointer-events-auto w-[22vw] min-w-[280px] max-w-[350px] z-40">
          {/* Stats Island - Top Left */}
          {meta?.stats && (
            <Island
              title="Statistics"
              position="custom"
              className="w-full"
            >
              <StatsPanel stats={meta.stats} />
            </Island>
          )}

          {/* Details Island - Bottom Left (when selected, scrollable) */}
          {isHistorySelected && (
            <Island
              title="Details"
              position="custom"
              showClose
              onClose={clearHistory}
              className="w-full flex-1 min-h-0 overflow-y-auto"
            >
              <DetailPanel />
            </Island>
          )}

          {/* Spacer when no details */}
          {!isHistorySelected && <div className="flex-1" />}
        </div>
      </div>

      {/* Reset Button - Absolute positioning above all layers */}
      {data && (
        <button
          onClick={() => triggerLayoutReset()}
          className="fixed top-4 right-4 z-40 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
          title="Reset view layout and fetch fresh data"
        >
          <RotateCcw className={`w-4 h-4 hover:rotate-180 transition-transform duration-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      )}

      {/* Floating Toolbar (Search + Chat) */}
      <FloatingTools hasSearch={hasSearch} hasChat={hasChat} />
    </div>
  );
}
