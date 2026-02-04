import { useMemo, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useVisualization } from "@/hooks/useVisualization";
import { X, Loader2 } from "lucide-react";

export default function DetailPanel() {
  const { viewedHistory, removeFromHistory, clearHistory, fetchDetails, detailLoading } =
    useVisualization();
  const [detailsCache, setDetailsCache] = useState<Map<string, any>>(new Map());

  // Fetch details when viewed history changes
  useEffect(() => {
    viewedHistory.forEach((item) => {
      if (!detailsCache.has(item.id)) {
        fetchDetails(item.id)
          .then((details) => {
            setDetailsCache((prev) => new Map(prev).set(item.id, details));
          })
          .catch((error) => {
            console.error(`Failed to fetch details for ${item.id}:`, error);
          });
      }
    });
  }, [viewedHistory, fetchDetails, detailsCache]);

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      node: "Node",
      edge: "Edge",
      item: "Item",
      hyperedge: "Hyperedge",
    };
    return labels[type] || type;
  };

  const getItemDetails = (itemId: string) => {
    return detailsCache.get(itemId);
  };

  if (viewedHistory.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between shrink-0 px-3 py-2 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Details</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={clearHistory}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Clear all details</TooltipContent>
          </Tooltip>
        </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 p-3">
          {viewedHistory.map((item) => {
            const itemDetails = getItemDetails(item.id);

            return (
              <Card
                key={item.id}
                className="p-3 space-y-2 bg-card border border-border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Display label as title */}
                    <h4 className="font-semibold text-sm text-foreground">
                      {itemDetails?.data?.label || itemDetails?.label || itemDetails?.id || "Unknown"}
                    </h4>
                    {/* Display type as small subtitle */}
                    <p className="text-xs text-muted-foreground">
                      {getTypeLabel(item.type)}
                    </p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => removeFromHistory(item.id)}
                        className="shrink-0 p-1 hover:bg-muted rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Remove from history</TooltipContent>
                  </Tooltip>
                </div>

                {detailLoading && !itemDetails ? (
                  <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Loading details...
                  </div>
                ) : itemDetails ? (
                  <div className="space-y-1 text-xs border-t border-border pt-2 mt-2">
                    {/* Display raw data fields as key-value pairs */}
                    {itemDetails?.data?.raw ? (
                      // Display raw data fields
                      Object.entries(itemDetails.data.raw)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1">
                            <span className="text-muted-foreground font-medium">{key}:</span>
                            <span className="font-medium text-foreground text-right break-words">
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))
                    ) : itemDetails?.data ? (
                      // Fallback: display data fields except label
                      Object.entries(itemDetails.data)
                        .filter(([key]) => key !== "label")
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1">
                            <span className="text-muted-foreground font-medium">{key}:</span>
                            <span className="font-medium text-foreground text-right break-words">
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))
                    ) : (
                      // Final fallback: display top-level fields
                      Object.entries(itemDetails)
                        .filter(
                          ([key]) =>
                            ![
                              "id",
                              "label",
                              "type",
                              "linked_nodes",
                              "node_set",
                              "source",
                              "target",
                              "x",
                              "y",
                              "data",
                            ].includes(key)
                        )
                        .slice(0, 5)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1">
                            <span className="text-muted-foreground font-medium">{key}:</span>
                            <span className="font-medium text-foreground text-right break-words">
                              {String(value)}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-2">No details available</p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
