import React, { useEffect, useState } from "react";
import { ItemCard } from "@/components/ui";
import { useVisualization } from "@/hooks/useVisualization";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NodeListViewProps {
  data?: any;
  meta?: any;
}

const NodeListView: React.FC<NodeListViewProps> = ({ meta }) => {
  const { fetchNodesList, selectedItems, currentPage, setCurrentPage, selectItem, deselectItem } = useVisualization();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const loadNodes = async () => {
      setListLoading(true);
      try {
        const result = await fetchNodesList(currentPage, 12);
        console.log("NodeListView.loadNodes", { page: currentPage, result });
        setItems(result.items || []);
        setTotal(result.total || 0);
        setHasNext(result.has_next || false);
      } catch (error) {
        console.error("Failed to load nodes:", error);
      } finally {
        setListLoading(false);
      }
    };

    loadNodes();
  }, [currentPage, fetchNodesList]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-muted/30 px-4 py-3">
        <h2 className="text-lg font-semibold">所有节点 ({total})</h2>
      </div>

      {/* Grid of cards */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {listLoading ? (
            <div className="col-span-full text-center text-muted-foreground py-8">加载中...</div>
          ) : items.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">没有节点</div>
          ) : (
            items.map((node) => {
              // Use internal id for selection (not displayed to user)
              const nodeId = node.id;
              const isHighlighted = node.highlighted === true;
              return (
                <ItemCard
                  key={nodeId}
                  id={nodeId}
                  label={node.label || "Unknown"}
                  type="node"
                  metadata={Object.fromEntries(
                    Object.entries(node).filter(
                      ([key]) => !["id", "label", "type", "highlighted"].includes(key)
                    )
                  )}
                  isSelected={selectedItems.has(nodeId)}
                  isHighlighted={isHighlighted}
                  onClick={() => {
                    selectItem(nodeId, "node");
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

export default NodeListView;
