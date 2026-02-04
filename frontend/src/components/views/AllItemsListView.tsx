import { memo, useState, useEffect } from "react";
import { ItemCard } from "@/components/ui";
import { useVisualization } from "@/hooks/useVisualization";
import { apiClient } from "@/services/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * AllItemsListView - displays paginated list of all items
 * Handles full dataset pagination and selection
 */
const AllItemsListView = memo(function AllItemsListView() {
  const { selectedItems, selectItem } = useVisualization();
  const [page, setPage] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);
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
      const result = await apiClient.getItemsPaginated(pageNum, pageSize);
      setAllItems(result.items || []);
      setTotal(result.total || 0);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load items:", err);
      setError("Failed to load items");
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

  if (loading && allItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  if (allItems.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>No items found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {allItems.map((item: any) => {
            const itemId = item.id;
            const itemData = item.data || item;
            const label = itemData.label || item.label || "Unknown";
            const itemMetadata = itemData.raw || itemData || item;
            const isHighlighted = item.highlighted === true;

            return (
              <ItemCard
                key={itemId}
                id={itemId}
                label={label}
                type="item"
                metadata={{ raw: itemMetadata }}
                isSelected={selectedItems.has(itemId)}
                isHighlighted={isHighlighted}
                onClick={() => selectItem(itemId, "item")}
              />
            );
          })}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="border-t bg-background p-3 flex items-center justify-between gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => loadPage(page - 1)}
          disabled={page === 0 || loading}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages} ({total} total)
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => loadPage(page + 1)}
          disabled={!hasNextPage || loading}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

export default AllItemsListView;
