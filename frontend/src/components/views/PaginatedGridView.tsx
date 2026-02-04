import { memo, useState, useEffect } from "react";
import ItemGallery from "./components/ItemGallery";
import { useVisualization } from "@/hooks/useVisualization";
import { Island } from "@/components/core";

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
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      {/* Centered focused island gallery with stable fixed height - pagination integrated */}
      <Island
        position="custom"
        className="fixed inset-0 m-auto w-11/12 max-w-3xl z-30 flex flex-col backdrop-blur-md h-[650px] pointer-events-auto"
      >
        {/* Gallery content with safe padding - no title shown, top-aligned, stops event propagation */}
        <div 
          className="flex-1 overflow-auto p-4 flex flex-col items-start"
          onClick={(e) => e.stopPropagation()}
        >
          <ItemGallery
            items={items}
            itemType={type}
            loading={loading && items.length === 0}
            error={error}
            loadingMessage="Loading..."
            emptyMessage={`No ${type}s found`}
            selectedItems={selectedItems}
            onItemClick={(itemId) => selectItem(itemId, type)}
            gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max w-full"
          />
        </div>

        {/* Pagination integrated inside island at bottom */}
        {totalPages > 1 && (
          <div 
            className="flex items-center justify-center gap-3 px-4 py-3 border-t border-border/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            <button
              onClick={() => loadPage(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                page > 0 && !loading
                  ? "hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  : "text-muted-foreground/40 cursor-not-allowed"
              }`}
              title="Previous page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Info */}
            <div className="text-sm text-muted-foreground font-medium px-2 min-w-[100px] text-center">
              <span className="text-foreground font-semibold">{page + 1}</span>
              <span className="mx-1">/</span>
              <span>{totalPages}</span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => loadPage(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                page < totalPages - 1 && !loading
                  ? "hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  : "text-muted-foreground/40 cursor-not-allowed"
              }`}
              title="Next page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </Island>
    </div>
  );
});

export default PaginatedGridView;
