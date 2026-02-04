import { memo, useState, useEffect } from "react";
import { ItemCard } from "@/components/ui";
import { useVisualization } from "@/hooks/useVisualization";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UnifiedListViewProps {
  title?: string;
  type: "node" | "edge" | "hyperedge" | "item";
  fetchFunction: (page: number, pageSize: number) => Promise<any>;
}

/**
 * UnifiedListView - displays paginated list with unified UI
 * Supports nodes, edges, hyperedges, and items
 */
const UnifiedListView = memo(function UnifiedListView({
  title,
  type,
  fetchFunction,
}: UnifiedListViewProps) {
  const { selectedItems, selectItem } = useVisualization();
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages - 1;

  const loadPage = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFunction(pageNum, pageSize);
      setItems(result.items || []);
      setTotal(result.total || 0);
      setPage(pageNum);
    } catch (err) {
      console.error(`Failed to load ${type}s:`, err);
      setError(`Failed to load ${type}s`);
    } finally {
      setLoading(false);
    }
  };

  // Load first page on mount
  useEffect(() => {
    loadPage(0);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>No {type}s found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      {title && (
        <div className="flex-shrink-0 border-b border-border bg-muted/30 px-4 py-3">
          <h2 className="text-lg font-semibold">
            {title} ({total})
          </h2>
        </div>
      )}

      {/* Grid of cards */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {items.map((item: any) => {
            const itemId = item.id;
            const label = item.label || "Unknown";
            const isHighlighted = item.highlighted === true;

            return (
              <ItemCard
                key={itemId}
                id={itemId}
                label={label}
                type={type}
                metadata={item}
                isSelected={selectedItems.has(itemId)}
                isHighlighted={isHighlighted}
                onClick={() => selectItem(itemId, type)}
              />
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex-shrink-0 border-t border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPage(Math.max(0, page - 1))}
            disabled={page === 0 || loading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPage(page + 1)}
            disabled={!hasNextPage || loading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export default UnifiedListView;
