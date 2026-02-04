import { memo, useState, useEffect } from "react";
import ItemGallery from "./components/ItemGallery";
import { useVisualization } from "@/hooks/useVisualization";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginatedGridViewProps {
  type: "node" | "edge" | "hyperedge" | "item";
  fetchFunction: (page: number, pageSize: number) => Promise<any>;
}

/**
 * PaginatedGridView - displays paginated entity grid with unified UI
 * Supports nodes, edges, hyperedges, and items
 * 
 * Simplified compared to old UnifiedListView by leveraging EntityGrid component
 */
const PaginatedGridView = memo(function PaginatedGridView({
  type,
  fetchFunction,
}: PaginatedGridViewProps) {
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

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Grid of entities */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <ItemGallery
            items={items}
            itemType={type}
            loading={loading && items.length === 0}
            error={error}
            loadingMessage="Loading..."
            emptyMessage={`No ${type}s found`}
            selectedItems={selectedItems}
            onItemClick={(itemId) => selectItem(itemId, type)}
          />
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex-shrink-0 border-t border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadPage(Math.max(0, page - 1))}
            disabled={page === 0 || loading}
            className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => loadPage(page + 1)}
            disabled={!hasNextPage || loading}
            className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default PaginatedGridView;
