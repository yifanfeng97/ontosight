import React, { useEffect, useState } from "react";
import { ItemCard } from "@/components/ui";
import { useVisualization } from "@/hooks/useVisualization";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EdgeListViewProps {
  data?: any;
  meta?: any;
}

const EdgeListView: React.FC<EdgeListViewProps> = ({ meta }) => {
  const { fetchEdgesList, selectedItems, currentPage, setCurrentPage, selectItem, deselectItem } = useVisualization();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const loadEdges = async () => {
      setListLoading(true);
      try {
        const result = await fetchEdgesList(currentPage, 12);
        console.log("EdgeListView.loadEdges", { page: currentPage, result });
        setItems(result.items || []);
        setTotal(result.total || 0);
        setHasNext(result.has_next || false);
      } catch (error) {
        console.error("Failed to load edges:", error);
      } finally {
        setListLoading(false);
      }
    };

    loadEdges();
  }, [currentPage, fetchEdgesList]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-muted/30 px-4 py-3">
        <h2 className="text-lg font-semibold">所有边 ({total})</h2>
      </div>

      {/* Grid of cards */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {listLoading ? (
            <div className="col-span-full text-center text-muted-foreground py-8">加载中...</div>
          ) : items.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">没有边</div>
          ) : (
            items.map((edge) => {
              // Use internal id for selection (not displayed to user)
              const edgeId = edge.id;
              const isHighlighted = edge.highlighted === true;
              return (
                <ItemCard
                  key={edgeId}
                  id={edgeId}
                  label={edge.label || "Unknown Edge"}
                  type="edge"
                  metadata={Object.fromEntries(
                    Object.entries(edge).filter(
                      ([key]) => !["id", "label", "type", "highlighted"].includes(key)
                    )
                  )}
                  isSelected={selectedItems.has(edgeId)}
                  isHighlighted={isHighlighted}
                  onClick={() => {
                    selectItem(edgeId, "edge");
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex-shrink-0 border-t border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          第 {currentPage + 1} 页 (共 {Math.ceil(total / 12)} 页)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={!hasNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EdgeListView;
