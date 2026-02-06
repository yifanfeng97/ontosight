import { memo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ItemGallery from "./components/ItemGallery";
import { useVisualization } from "@/hooks/useVisualization";
import { Island } from "@/components/core";
import { BACKDROP_BLUR_CONFIG } from "@/theme/visual-config";
import { cn } from "@/utils";

interface PaginatedGridViewProps {
  entityType: "node" | "edge" | "hyperedge";
  fetchFunction: (page: number, pageSize: number) => Promise<any>;
}

/**
 * Utility to pluralize entity type for UI display
 */
const pluralizeType = (
  type: "node" | "edge" | "hyperedge"
): string => {
  const pluralMap = {
    node: "nodes",
    edge: "edges",
    hyperedge: "hyperedges",
  };
  return pluralMap[type];
};

/**
 * PaginatedGridView - displays paginated entity grid with unified UI
 * Supports nodes, edges, and hyperedges
 * 
 * Simplified compared to old UnifiedListView by leveraging EntityGrid component
 */
const PaginatedGridView = memo(function PaginatedGridView({
  entityType,
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
      console.error(`Failed to load ${pluralizeType(entityType)}:`, err);
      setError(`Failed to load ${pluralizeType(entityType)}`);
    } finally {
      setLoading(false);
    }
  };

  // Load first page on mount
  useEffect(() => {
    loadPage(0);
  }, []);

  const handleBackdropClick = () => {
    const { setViewMode, meta } = useVisualization.getState();
    const vizType = meta?.type || "graph";
    setViewMode(vizType === "graph" ? "graph" : "hypergraph");
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center md:justify-end overflow-hidden md:pr-[10vw] relative"
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {/* Subtle backdrop blur - creates gentle perspective depth, but transparent to layers above */}
      <div 
        className="absolute inset-0 z-10 pointer-events-auto bg-white/1"
        onClick={handleBackdropClick}
      />

      {/* Island gallery with unified style and fixed dimensions to prevent jump but slightly more compact */}
      <Island
        position="custom"
        className="w-[90vw] md:w-[70vw] lg:w-[60vw] h-[80vh] md:h-[72vh] z-20 flex flex-col pointer-events-auto relative border-t border-l border-white/60 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.2)]"
        contentClassName="p-0 flex flex-col"
      >
        {/* Very subtle noise texture layer */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          }}
        />

        {/* Gallery content - overflow-auto ensures scrollability if screen is small */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden p-10 pb-24 flex flex-col items-start relative z-10 scrollbar-thin scroll-smooth"
          onClick={(e) => e.stopPropagation()}
        >
          <ItemGallery
            items={items}
            itemType={entityType}
            loading={loading && items.length === 0}
            error={error}
            loadingMessage="Loading..."
            emptyMessage={`No ${pluralizeType(entityType)} found`}
            selectedItems={selectedItems}
            onItemClick={(itemId) => selectItem(itemId, entityType)}
            showTypeBadge={false}
            gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max w-full"
            minHeight="min-h-full"
          />
        </div>

        {/* Floating pagination capsule - shifted slightly lower for tighter fit */}
        {totalPages > 1 && (
          <div 
            className={cn(
              "absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 p-1.5 rounded-full bg-white/70 border border-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.03] z-20 hover:shadow-[0_15px_40px_rgba(0,0,0,0.15)] transition-shadow duration-300",
              BACKDROP_BLUR_CONFIG.STRONG
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            <button
              onClick={() => loadPage(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                page > 0 && !loading
                  ? "hover:bg-white text-foreground cursor-pointer shadow-sm active:scale-95"
                  : "text-foreground/20 cursor-not-allowed"
              }`}
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Info */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-black/[0.03] rounded-full text-[12px] font-bold tracking-tight">
              <span className="text-foreground/80">{page + 1}</span>
              <span className="text-foreground/20 font-light select-none">/</span>
              <span className="text-foreground/40">{totalPages}</span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => loadPage(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                page < totalPages - 1 && !loading
                  ? "hover:bg-white text-foreground cursor-pointer shadow-sm active:scale-95"
                  : "text-foreground/20 cursor-not-allowed"
              }`}
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </Island>
    </div>
  );
});

export default PaginatedGridView;
