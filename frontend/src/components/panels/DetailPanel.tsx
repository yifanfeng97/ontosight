import { useMemo, useEffect, useState } from "react";
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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="space-y-4 px-2 py-0">
          {viewedHistory.map((item, index) => {
            const itemDetails = getItemDetails(item.id);

            return (
              <div key={item.id}>
                {/* Gradient divider line before each item (except first) */}
                {index > 0 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent mb-4" />
                )}

                <div
                  className="relative px-3 py-3 space-y-1.5 rounded-lg bg-white/5 border border-border/12 shadow-sm transition-all duration-200 hover:bg-white/8 hover:border-border/25 hover:translate-x-1 hover:shadow-md group"
                >
                  {/* Accent dot removed - now using border for definition */}
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Display label as title */}
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {itemDetails?.data?.label || itemDetails?.label || itemDetails?.id || "Unknown"}
                      </h4>
                      {/* Display type as small subtitle */}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getTypeLabel(item.type)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromHistory(item.id)}
                      className="shrink-0 p-1 rounded transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                      title="Remove from history"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {detailLoading && !itemDetails ? (
                    <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Loading details...
                    </div>
                  ) : itemDetails ? (
                    <div className="space-y-0.5 text-xs pt-2">
                      {/* Display raw data fields as key-value pairs */}
                      {itemDetails?.data?.raw ? (
                        // Display raw data fields
                        Object.entries(itemDetails.data.raw)
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between gap-3 py-1 hover:bg-white/5 px-1 rounded transition-all duration-200">
                              <span className="text-muted-foreground font-medium shrink-0 min-w-fit">{key}:</span>
                              <span className="font-medium text-foreground text-right break-words flex-1 text-right">
                                {typeof value === "object" ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))
                      ) : itemDetails?.data ? (
                        // Fallback: display data fields except label
                        Object.entries(itemDetails.data)
                          .filter(([key]) => key !== "label")
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between gap-3 py-1 hover:bg-white/5 px-1 rounded transition-all duration-200">
                              <span className="text-muted-foreground font-medium shrink-0 min-w-fit">{key}:</span>
                              <span className="font-medium text-foreground text-right break-words flex-1 text-right">
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
                            <div key={key} className="flex justify-between gap-3 py-1 hover:bg-white/5 px-1 rounded transition-all duration-200">
                              <span className="text-muted-foreground font-medium shrink-0 min-w-fit">{key}:</span>
                              <span className="font-medium text-foreground text-right break-words flex-1 text-right">
                                {String(value)}
                              </span>
                            </div>
                          ))
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-1">No details available</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
