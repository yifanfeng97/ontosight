import { useVisualization } from "@/hooks/useVisualization";
import VisualizationRouter from "@/components/VisualizationRouter";
import LoadingSpinner from "@/components/LoadingSpinner";
import SearchPanel from "@/components/SearchPanel";
import ChatPanel from "@/components/ChatPanel";
import StatsPanel from "@/components/StatsPanel";
import MetaPanel from "@/components/MetaPanel";
import { ScrollArea } from "@/components/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Layout() {
  const { loading, error, meta, data } = useVisualization();

  // Determine which features are available based on meta
  const hasSearch = meta?.features?.search === true;
  const hasChat = meta?.features?.chat === true;
  const hasSidebar = hasSearch || hasChat;
  const vizType = meta?.type || "graph";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar: Stats + Schema */}
      <div className="w-[300px] border-r border-border bg-muted/30 flex flex-col">
        <div className="p-4 border-b border-border flex-shrink-0">
          <h1 className="text-xl font-bold text-primary">OntoSight</h1>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Top: Basic Statistics */}
            {data && meta && (
              <StatsPanel data={data} vizType={vizType} />
            )}

            {/* Bottom: Schema Definitions */}
            {meta && (
              <MetaPanel meta={meta} />
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex bg-background relative overflow-hidden">
          <LoadingSpinner loading={loading} tip="加载中...">
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
