import { useMemo, useEffect, useState } from "react";
import { useVisualization } from "@/hooks/useVisualization";
import { X, Loader2 } from "lucide-react";
import ItemCard from "../views/components/ItemCard";

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

  const getItemDetails = (itemId: string) => {
    return detailsCache.get(itemId);
  };

  if (viewedHistory.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin pt-1">
        <div className="space-y-3 px-1 py-0">
          {viewedHistory.map((item, index) => {
            const itemDetails = getItemDetails(item.id);

            return (
              <div key={item.id} className="group relative">
                <ItemCard
                  id={item.id}
                  label={itemDetails?.data?.label || itemDetails?.label || itemDetails?.id || "Loading..."}
                  type={item.type as any}
                  metadata={itemDetails}
                  isSelected={false}
                  maxMetadata={-1}
                  shouldTruncate={false}
                  showTypeBadge={true}
                  className="bg-white/40 border-white/40 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 rounded-[1.5rem]"
                >
                  {detailLoading && !itemDetails && (
                    <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Loading...
                    </div>
                  )}
                </ItemCard>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
