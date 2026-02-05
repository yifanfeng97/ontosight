import { useVisualization } from "@/hooks/useVisualization";
import ViewRouter from "@/components/views/ViewRouter";
import StatsPanel from "@/components/panels/StatsPanel";
import DetailPanel from "@/components/panels/DetailPanel";
import FloatingTools from "@/components/layout/FloatingTools";
import Island from "@/components/core/Island";
import { AlertCircle } from "lucide-react";

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
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50">
      {/* Canvas Background with subtle grid pattern */}
      <div 
        className={`absolute inset-0 z-0 transition-opacity duration-300 ${isGridViewMode ? "opacity-20" : "opacity-40"}`}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main ViewRouter - Full Screen Canvas */}
      <div 
        className={`absolute inset-0 z-0 transition-all duration-300`}
      >
        {/* White overlay for grid modes to keep it clean instead of grey */}
        {isGridViewMode && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-[5] pointer-events-none" />
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
      </div>

      {/* Floating Islands Layer - Always on top of everything including Grid Overlay, z-[90] for maximum interaction */}
      <div className="fixed inset-0 z-[90] pointer-events-none">
        {/* Left Sidebar Island Container - Vertical Stack with relative width */}
        <div className="fixed left-6 top-6 bottom-6 flex flex-col gap-6 pointer-events-auto w-[22vw] min-w-[280px] max-w-[350px]">
          {/* Stats Island - Top Left */}
          {meta?.stats && (
            <Island
              title="Statistics"
              position="custom"
              className="w-full group"
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
              className="w-full flex-1 min-h-0 group"
              contentClassName="overflow-y-auto"
            >
              <DetailPanel />
            </Island>
          )}

          {/* Spacer when no details */}
          {!isHistorySelected && <div className="flex-1" />}
        </div>
      </div>

      {/* Floating Toolbar (Search + Chat + Reset) - Absolute priority z-[110] */}
      <div className="relative z-[110]">
        <FloatingTools hasSearch={hasSearch} hasChat={hasChat} />
      </div>
    </div>
  );
}
